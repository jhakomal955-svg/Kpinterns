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
              startDate: new Date(),
            });
            await user.save();
          }
        } else if (type === "internship") {
          const isAlreadyEnrolled = (user.ActiveInternship || []).some(
            (i) => (i.internship?._id || i.internship).toString() === itemId
          );
          if (!isAlreadyEnrolled) {
            const Attendance = createModel("Attendance", AttendanceModel);
            const newAtt = new Attendance({
              user: user._id,
              internship: itemId,
              records: [],
            });
            await newAtt.save();

            user.ActiveInternship = user.ActiveInternship || [];
            user.ActiveInternship.push({
              internship: itemId,
              internshipStatus: "Active",
              progress: 0,
              paymentStatus: true,
              paymentDate: new Date(),
              paymentId,
              amount: price,
              startDate: new Date(),
              attendance: newAtt._id,
            });
            await user.save();
          }
        }

        // Trigger background receipt and notification job asynchronously
        const targetUserId = user._id;
        after(async () => {
          try {
            let receiptPdfBuffer = await generatePaymentReceipt(user.toObject(), {
              purchaseType: type,
              title,
              amount: price,
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
                  { $set: { "ActiveInternship.$.paymentreceipt": receiptCloudinaryUrl } }
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
