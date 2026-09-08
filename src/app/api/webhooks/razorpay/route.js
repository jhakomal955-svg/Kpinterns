import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, CourseModel, InternshipModel, AttendanceModel, AdminModel, PartnerStudentModel, LeadModel } from "@/models";
import crypto from "crypto";
import { after } from "next/server";
import { sendAllotmentAndPaymentSlipEmail } from "@/lib/nodemailer";
import { checkAndAutomateDocuments } from "@/lib/documentAutomation";
import { generatePaymentReceipt } from "@/lib/pdfGenerator";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const razorpaySignature = request.headers.get("x-razorpay-signature");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      if (!razorpaySignature) {
        return Response.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
      }

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        console.error("❌ Razorpay Webhook signature verification failed!");
        return Response.json({ error: "Invalid signature verification" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment.captured or order.paid events
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity || payload.payload?.order?.entity;

      if (!paymentEntity) {
        return Response.json({ status: "ignored", message: "No payment entity found" }, { status: 200 });
      }

      const paymentId = paymentEntity.id;
      const orderId = paymentEntity.order_id;
      const notes = paymentEntity.notes || {};

      const { userId, type, itemId, email, registrationNumber } = notes;

      await connectDB();
      const User = createModel("User", UserModel);
      let user = null;

      if (userId) {
        user = await User.findById(userId);
      }
      if (!user && (email || registrationNumber)) {
        user = await User.findOne({
          $or: [
            { email: email?.trim().toLowerCase() },
            { registrationNumber: registrationNumber?.trim() },
          ],
        });
      }

      if (!user) {
        console.warn(`⚠️ Webhook received for unlinked user payment. Order ID: ${orderId}, Payment ID: ${paymentId}`);
        return Response.json({ status: "success", message: "Webhook processed (User pending)" }, { status: 200 });
      }

      // If user & item details are present, verify enrollment idempotently
      if (type && itemId) {
        let price = paymentEntity.amount ? paymentEntity.amount / 100 : 0;
        let title = notes.title || (type === "course" ? "Course Access" : "Internship Program");
        let originalAmount = notes.originalAmount ? Number(notes.originalAmount) : price;
        let couponCode = notes.couponCode || null;
        let discountAmount = notes.discountAmount ? Number(notes.discountAmount) : 0;

        if (type === "course") {
          const isAlreadyEnrolled = (user.ActiveCources || []).some(
            (c) => (c.course?._id || c.course).toString() === itemId
          );
          if (!isAlreadyEnrolled) {
            user.ActiveCources = user.ActiveCources || [];
            user.ActiveCources.push({
              course: itemId,
              courseStatus: "Active",
              progress: 0,
              paymentStatus: true,
              paymentDate: new Date(),
              paymentId,
              amount: price,
              originalAmount,
              couponCode,
              discountAmount,
              startDate: new Date(),
            });
            await user.save();
              } else if (type === "internship") {
          const existingEnrollment = (user.ActiveInternship || []).find(
            (i) => (i.internship?._id || i.internship).toString() === itemId
          );
          if (!existingEnrollment) {
            let startDate = user.internshipStartDate ? new Date(user.internshipStartDate) : new Date();
            if (user.college) {
              const Admin = createModel("Admin", AdminModel);
              const escapedCollege = user.college.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
              const collegeAdmin = await Admin.findOne({
                role: "College Admin",
                verified: true,
                CollegeName: { $regex: new RegExp("^" + escapedCollege + "$", "i") }
              });
              if (collegeAdmin && collegeAdmin.internshipStartDate) {
                startDate = new Date(collegeAdmin.internshipStartDate);
              }
            }

            const Internship = createModel("Internship", InternshipModel);
            const intDoc = await Internship.findById(itemId);
            const duration = intDoc?.duration || "2 Weeks";
            const calculateEndDateHelper = (sDate, durStr) => {
              const date = new Date(sDate);
              switch (durStr) {
                case "1-week":
                case "1 Week":
                  date.setDate(date.getDate() + 7);
                  break;
                case "2-weeks":
                case "2 Weeks":
                  date.setDate(date.getDate() + 14);
                  break;
                case "4-week":
                case "4-weeks":
                case "4 Weeks":
                  date.setDate(date.getDate() + 28);
                  break;
                case "6-weeks":
                case "6 Weeks":
                  date.setDate(date.getDate() + 42);
                  break;
                case "8-weeks":
                case "8 Weeks":
                  date.setDate(date.getDate() + 56);
                  break;
                case "12-weeks":
                case "12 Weeks":
                  date.setDate(date.getDate() + 84);
                  break;
                case "1-month":
                  date.setMonth(date.getMonth() + 1);
                  break;
                case "3-months":
                  date.setMonth(date.getMonth() + 3);
                  break;
                case "6-months":
                  date.setMonth(date.getMonth() + 6);
                  break;
                case "1-year":
                  date.setFullYear(date.getFullYear() + 1);
                  break;
                default:
                  date.setDate(date.getDate() + 14);
              }
              return date;
            };

            const endDate = calculateEndDateHelper(startDate, duration);

            const Attendance = createModel("Attendance", AttendanceModel);
            const newAtt = new Attendance({
              user: user._id,
              internship: itemId,
              records: [],
            });
            await newAtt.save();

            user.internshipStartDate = startDate;
            user.ActiveInternship = user.ActiveInternship || [];
            user.ActiveInternship.push({
              internship: itemId,
              internshipStatus: "Active",
              progress: 0,
              paymentStatus: true,
              paymentDate: new Date(),
              paymentId,
              amount: price,
              originalAmount,
              couponCode,
              discountAmount,
              startDate: startDate,
              endDate: endDate,
              attendance: newAtt._id,
            });
            await user.save();
          } else if (!existingEnrollment.amount || existingEnrollment.amount === 0) {
            existingEnrollment.amount = price;
            existingEnrollment.paymentStatus = true;
            existingEnrollment.paymentDate = new Date();
            existingEnrollment.paymentId = paymentId;
            if (originalAmount) existingEnrollment.originalAmount = originalAmount;
            user.markModified("ActiveInternship");
            await user.save();
          }
        }     }

        // Trigger background receipt and notification job asynchronously
        const targetUserId = user._id;
        after(async () => {
          try {
            let receiptPdfBuffer = await generatePaymentReceipt(user.toObject(), {
              purchaseType: type,
              title,
              amount: price,
              originalAmount,
              couponCode,
              discountAmount,
              paymentId,
              orderId: orderId || "N/A",
              date: new Date(),
            });

            if (receiptPdfBuffer) {
              const filename = `receipt_webhook_${targetUserId}_${Date.now()}`;
              const uploadResult = await uploadBufferToCloudinary(receiptPdfBuffer, {
                public_id: filename,
                folder: "kpinterns/receipts",
                resource_type: "auto",
              });
              const receiptCloudinaryUrl = uploadResult.secure_url;

              if (type === "internship") {
                await User.updateOne(
                  { _id: targetUserId, "ActiveInternship.internship": itemId },
                  {
                    $set: {
                      "ActiveInternship.$.paymentreceipt": receiptCloudinaryUrl,
                      "ActiveInternship.$.amount": price,
                      "ActiveInternship.$.paymentId": paymentId,
                      "ActiveInternship.$.paymentDate": new Date(),
                    }
                  }
                );
              } else if (type === "course") {
                await User.updateOne(
                  { _id: targetUserId, "ActiveCources.course": itemId },
                  { $set: { "ActiveCources.$.paymentreceipt": receiptCloudinaryUrl } }
                );
              }
            }

            await sendAllotmentAndPaymentSlipEmail(user.email, user.fullName, {
              purchaseType: type,
              title,
              amount: price,
              originalAmount,
              couponCode,
              discountAmount,
              paymentId,
              orderId: orderId || "N/A",
              date: new Date(),
              isNewRegistration: false,
              receiptPdfBuffer,
            });

            await checkAndAutomateDocuments(targetUserId.toString());
          } catch (bgErr) {
            console.error("❌ Error in webhook background processing:", bgErr);
          }
        });
      }
    }

    return Response.json({ status: "success", event }, { status: 200 });
  } catch (error) {
    console.error("❌ Error processing Razorpay Webhook:", error);
    return Response.json({ error: "Webhook processing failed", details: error.message }, { status: 500 });
  }
}
