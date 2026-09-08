import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, CourseModel, InternshipModel } from "@/models";
import mongoose from "mongoose";
import { getObjectIdFromSequentialNumber, getSequentialNumber } from "@/lib/pdfGenerator";

export const maxDuration = 60; // 1 minute execution limit

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const query = url.searchParams.get("query");

    if (!query) {
      return Response.json(
        { success: false, error: "Search query is required" },
        { status: 400 }
      );
    }

    // Ensure models are initialized in Mongoose context
    createModel("Course", CourseModel);
    createModel("Internship", InternshipModel);
    const User = createModel("User", UserModel);

    const trimmedQuery = query.trim();
    const queryRegex = new RegExp("^" + escapeRegExp(trimmedQuery) + "$", "i");
    let users = [];
    let isSpecificIdSearch = false;
    let targetSubdocId = null;

    // 1. First, search by explicit stored certificateId or offerLetterId
    const usersWithStoredId = await User.find({
      $or: [
        { "ActiveInternship.certificateId": queryRegex },
        { "ActiveInternship.offerLetterId": queryRegex },
        { "ActiveCources.certificateId": queryRegex }
      ]
    })
    .populate("ActiveCources.course")
    .populate("ActiveInternship.internship");

    if (usersWithStoredId && usersWithStoredId.length > 0) {
      users = usersWithStoredId;
      isSpecificIdSearch = true;
    }

    // 2. If no stored ID matched, check if query is in format: kpinterns/year/number (or numeric seqNo)
    if (users.length === 0) {
      const match = trimmedQuery.match(/^kpinterns\/\d{4}\/(\d+)$/i);
      if (match) {
        const seqNo = match[1];
        const objectId = await getObjectIdFromSequentialNumber(seqNo);
        if (objectId) {
          targetSubdocId = objectId;
          const user = await User.findOne({
            $or: [
              { "ActiveCources._id": objectId },
              { "ActiveInternship._id": objectId }
            ]
          })
          .populate("ActiveCources.course")
          .populate("ActiveInternship.internship");

          if (user) {
            users = [user];
            isSpecificIdSearch = true;
          }
        }
      }
    }

    // 3. Check if query is a valid MongoDB ObjectId directly
    if (users.length === 0 && mongoose.Types.ObjectId.isValid(trimmedQuery)) {
      targetSubdocId = trimmedQuery;
      const user = await User.findOne({
        $or: [
          { "ActiveCources._id": trimmedQuery },
          { "ActiveInternship._id": trimmedQuery }
        ]
      })
      .populate("ActiveCources.course")
      .populate("ActiveInternship.internship");

      if (user) {
        users = [user];
        isSpecificIdSearch = true;
      }
    }

    // 4. Fallback lookup by email, phone, or registration number
    if (users.length === 0) {
      users = await User.find({
        $or: [
          { email: queryRegex },
          { phone: trimmedQuery },
          { registrationNumber: queryRegex }
        ]
      })
      .populate("ActiveCources.course")
      .populate("ActiveInternship.internship");
    }

    if (!users || users.length === 0) {
      return Response.json(
        { success: false, error: "No records found matching your query." },
        { status: 404 }
      );
    }

    const certificates = [];

    for (const user of users) {
      // Extract from courses
      if (user.ActiveCources && user.ActiveCources.length > 0) {
        for (const c of user.ActiveCources) {
          if (c.certificateUrl) {
            let formattedId = c.certificateId;
            if (!formattedId) {
              const seqNum = await getSequentialNumber(c._id);
              const courseYear = c.startDate 
                ? new Date(c.startDate).getFullYear() 
                : c.paymentDate 
                  ? new Date(c.paymentDate).getFullYear() 
                  : new Date(user.createdAt).getFullYear();
              formattedId = `kpinterns/${courseYear}/${seqNum}`;
            }

            // Filter logic
            const matchesQueryId = formattedId.toLowerCase() === trimmedQuery.toLowerCase();
            const matchesSubdocId = targetSubdocId && c._id.toString() === targetSubdocId;

            if (!isSpecificIdSearch || matchesQueryId || matchesSubdocId) {
              certificates.push({
                certificateId: formattedId,
                holder: user.fullName,
                course: c.course?.title || "Specialized Course",
                type: "Course Completion Certificate",
                issuedDate: c.paymentDate
                  ? new Date(c.paymentDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                expiryDate: "Lifetime Validity",
                certificateUrl: c.certificateUrl,
              });
            }
          }
        }
      }

      // Extract from internships
      if (user.ActiveInternship && user.ActiveInternship.length > 0) {
        for (const i of user.ActiveInternship) {
          if (i.certificationUrl || i.offerLetterUrl) {
            const seqNum = await getSequentialNumber(i._id);
            const internshipYear = i.startDate 
              ? new Date(i.startDate).getFullYear() 
              : i.paymentDate 
                ? new Date(i.paymentDate).getFullYear() 
                : new Date(user.createdAt).getFullYear();
            const fallbackId = `kpinterns/${internshipYear}/${seqNum}`;

            const certFormattedId = i.certificateId || fallbackId;
            const offerFormattedId = i.offerLetterId || fallbackId;

            const matchesSubdocId = targetSubdocId && i._id.toString() === targetSubdocId;

            // 1. Internship Completion Certificate
            if (i.certificationUrl) {
              const matchesCertId = certFormattedId.toLowerCase() === trimmedQuery.toLowerCase();
              if (!isSpecificIdSearch || matchesCertId || matchesSubdocId) {
                certificates.push({
                  certificateId: certFormattedId,
                  holder: user.fullName,
                  course: i.internship?.title || `${i.position || 'Internship'} at ${i.company || 'KpInterns'}`,
                  type: "Internship Completion Certificate",
                  issuedDate: i.paymentDate
                    ? new Date(i.paymentDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }),
                  expiryDate: "Lifetime Validity",
                  certificateUrl: i.certificationUrl,
                });
              }
            }

            // 2. Internship Offer Letter
            if (i.offerLetterUrl) {
              const matchesOfferId = offerFormattedId.toLowerCase() === trimmedQuery.toLowerCase();
              if (!isSpecificIdSearch || matchesOfferId || matchesSubdocId) {
                certificates.push({
                  certificateId: offerFormattedId,
                  holder: user.fullName,
                  course: i.internship?.title || `${i.position || 'Internship'} at ${i.company || 'KpInterns'}`,
                  type: "Internship Offer Letter",
                  issuedDate: (() => {
                    if (i.startDate) {
                      const d = new Date(i.startDate);
                      if (!isNaN(d.getTime())) {
                        d.setDate(d.getDate() - 2);
                        return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
                      }
                    }
                    const fallback = i.paymentDate ? new Date(i.paymentDate) : new Date(user.createdAt);
                    fallback.setDate(fallback.getDate() - 2);
                    return fallback.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
                  })(),
                  expiryDate: "Active during internship",
                  certificateUrl: i.offerLetterUrl,
                });
              }
            }
          }
        }
      }
    }

    if (certificates.length === 0) {
      return Response.json(
        { success: false, error: "No matching certificates or offer letters found for this query." },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: certificates }, { status: 200 });
  } catch (error) {
    console.error("Certificate verification API error:", error);
    return Response.json(
      { success: false, error: "Failed to perform verification", details: error.message },
      { status: 500 }
    );
  }
}
