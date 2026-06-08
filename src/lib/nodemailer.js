import nodemailer from "nodemailer";

// Create transporter dynamically based on environment variables
const getTransporter = () => {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.EMAIL_PORT || "587");
  const secure = process.env.EMAIL_SECURE === "true";
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

/**
 * Sends a registration verification OTP to the target email
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<{success: boolean, mocked?: boolean}>}
 */
export async function sendOtpEmail(email, otp) {
  // Always log the OTP to the console as a reliable development fallback
  console.log("\n" + "━".repeat(50));
  console.log(`🔑 REGISTRATION VERIFICATION OTP FOR: ${email}`);
  console.log(`👉 CODE: ${otp}`);
  console.log("━".repeat(50) + "\n");

  const transporter = getTransporter();

  if (!transporter) {
    console.warn("⚠️ SMTP credentials (EMAIL_USER / EMAIL_PASS) not configured in .env.local.");
    console.warn("⚠️ Using Mock Console-log verification fallback.");
    return { success: true, mocked: true };
  }

  const sender = process.env.EMAIL_USER;
  const mailOptions = {
    from: `"KpInterns Registration" <${sender}>`,
    to: email,
    subject: "Email Verification Code - KpInterns",
    html: `
      <div style="font-family: 'Poppins', Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px; font-family: 'Poppins', Helvetica, Arial, sans-serif;">
          <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; vertical-align: middle;">
            <span style="background-color: #0f172a; color: #f8fafc; border-radius: 50%; width: 32px; height: 32px; display: inline-block; font-size: 16px; line-height: 32px; font-weight: 800; text-align: center; margin-right: 0px; vertical-align: middle;">Kp</span><span style="color: #4f46e5; vertical-align: middle;">Interns</span>
          </span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; text-align: center;">Verify Your Email Address</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
          Thank you for starting your registration on KpInterns. To complete your account creation, please verify your email address by entering the following 6-digit verification code:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #2563eb; background-color: #eff6ff; padding: 12px 24px; border-radius: 12px; border: 1px solid #bfdbfe; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 13px; line-height: 1.5; color: #64748b; text-align: center; margin-bottom: 24px;">
          This code is only valid for <strong>10 minutes</strong>. If you did not request this verification, please ignore this email.
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
          This is an automatically generated system email. Please do not reply.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending email through Nodemailer:", error);
    throw new Error(`SMTP Mailer failed to send message: ${error.message}`);
  }
}

/**
 * Sends a forgot password reset OTP to the user/admin
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} otp - 6-digit OTP code
 * @param {string} role - "User" or "Admin" role
 * @returns {Promise<{success: boolean, mocked?: boolean}>}
 */
export async function sendForgotPasswordOtpEmail(email, name, otp, role = "User") {
  // Always log the OTP to the console as a reliable development fallback
  console.log("\n" + "━".repeat(50));
  console.log(`🔑 FORGOT PASSWORD OTP FOR ${role.toUpperCase()}: ${email}`);
  console.log(`👉 CODE: ${otp}`);
  console.log("━".repeat(50) + "\n");

  const transporter = getTransporter();

  if (!transporter) {
    console.warn("⚠️ SMTP credentials not configured. Using Mock Console-log verification fallback.");
    return { success: true, mocked: true };
  }

  const sender = process.env.EMAIL_USER;
  const mailOptions = {
    from: `"KpInterns Security" <${sender}>`,
    to: email,
    subject: "Reset Your Password - KpInterns",
    html: `
      <div style="font-family: 'Poppins', Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px; font-family: 'Poppins', Helvetica, Arial, sans-serif;">
          <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; vertical-align: middle;">
            <span style="background-color: #0f172a; color: #f8fafc; border-radius: 50%; width: 32px; height: 32px; display: inline-block; font-size: 16px; line-height: 32px; font-weight: 800; text-align: center; margin-right: 0px; vertical-align: middle;">Kp</span><span style="color: #4f46e5; vertical-align: middle;">Interns</span>
          </span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; text-align: center;">Reset Your Password</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 8px;">Hello ${name || 'User'},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
          We received a request to reset the password for your ${role} account. Please use the following 6-digit One-Time Password (OTP) to complete your password reset:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #dc2626; background-color: #fef2f2; padding: 12px 24px; border-radius: 12px; border: 1px solid #fca5a5; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 13px; line-height: 1.5; color: #64748b; text-align: center; margin-bottom: 24px;">
          This OTP code is valid for <strong>10 minutes</strong>. If you did not request this, please secure your account immediately.
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
          This is an automatically generated system email. Please do not reply.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending forgot-password email:", error);
    throw new Error(`SMTP Mailer failed to send forgot-password message: ${error.message}`);
  }
}

/**
 * Sends a welcome allotment email with transaction details and payment receipt
 * @param {string} email - Recipient email address
 * @param {string} userName - Recipient name
 * @param {object} details - Receipt details
 * @returns {Promise<{success: boolean, mocked?: boolean}>}
 */
export async function sendAllotmentAndPaymentSlipEmail(email, userName, details) {
  const {
    purchaseType, // "course" or "internship"
    title,        // Title of course or internship
    amount,       // Amount paid (number)
    paymentId,    // Razorpay payment ID
    orderId,      // Razorpay order ID
    date,         // Date object
    isNewRegistration // Boolean - triggers registration welcome reward message
  } = details;

  const formattedDate = date ? new Date(date).toLocaleString() : new Date().toLocaleString();

  // Always log the receipt to the console as fallback
  console.log("\n" + "━".repeat(50));
  console.log(`🧾 EMAIL ALLOTMENT & RECEIPT FOR: ${email}`);
  console.log(`📦 ITEM: ${title} (${purchaseType})`);
  console.log(`💰 AMOUNT: ₹${amount}`);
  console.log(`💳 PAYMENT ID: ${paymentId}`);
  console.log("━".repeat(50) + "\n");

  const transporter = getTransporter();

  if (!transporter) {
    console.warn("⚠️ SMTP credentials not configured. Using Mock Console-log verification fallback.");
    return { success: true, mocked: true };
  }

  const sender = process.env.EMAIL_USER;

  // Render Welcome Reward if this is a new registration
  const rewardSection = isNewRegistration 
    ? `
      <div style="background-color: #f0fdf4; border: 1px dashed #4ade80; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <span style="font-size: 28px;">🎁</span>
        <h3 style="font-size: 16px; font-weight: 700; color: #15803d; margin: 8px 0 4px 0;">Special Onboarding Welcome Reward!</h3>
        <p style="font-size: 14px; color: #166534; margin: 0; line-height: 1.5;">
          You have been credited with a free <strong>1-Month Placement Preparation & Resume Building Course</strong> worth <strong>₹4,999</strong>! You can access it directly from your student dashboard.
        </p>
      </div>
      `
    : "";

  // Render Item Information block
  const onboardingInfo = purchaseType === "course"
    ? `
      <p style="font-size: 15px; line-height: 1.6; color: #475569;">
        Congratulations on enrolling in the specialized course <strong>${title}</strong>! You can now access your coursework, modules, and learning guides.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.2);">
          Start Learning Now
        </a>
      </div>
      `
    : `
      <p style="font-size: 15px; line-height: 1.6; color: #475569;">
        Welcome to the team! You are officially allotted the internship role in <strong>${title}</strong>. Your internship coordinates, supervisor contact, and work plan will be sent shortly.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.2);">
          Go to Student Dashboard
        </a>
      </div>
      `;

  // Render complete itemized payment receipt
  const receiptTable = `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Receipt & Allotment Details</h3>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b;">Customer Name</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0f172a;">${userName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b;">Allotted Program</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0f172a;">${title} (${purchaseType === 'course' ? 'Specialized Course' : 'Internship Program'})</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b;">Payment Date</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0f172a;">${formattedDate}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b;">Razorpay Payment ID</td>
          <td style="padding: 10px 0; text-align: right; font-mono: true; font-weight: 600; color: #0f172a; font-size: 13px;">${paymentId || 'N/A'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b;">Razorpay Order ID</td>
          <td style="padding: 10px 0; text-align: right; font-mono: true; font-weight: 600; color: #0f172a; font-size: 13px;">${orderId || 'N/A'}</td>
        </tr>
        <tr style="font-size: 16px;">
          <td style="padding: 16px 0 0 0; font-weight: 700; color: #0f172a;">Total Amount Paid</td>
          <td style="padding: 16px 0 0 0; text-align: right; font-weight: 800; color: #2563eb;">₹${amount}</td>
        </tr>
      </table>
    </div>
  `;

  const mailOptions = {
    from: `"KpInterns Onboarding" <${sender}>`,
    to: email,
    subject: isNewRegistration ? "Welcome to KpInterns! Onboarding & Allotment Details" : `Enrollment Confirmed: ${title}`,
    html: `
      <div style="font-family: 'Poppins', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px; font-family: 'Poppins', Helvetica, Arial, sans-serif;">
          <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; vertical-align: middle;">
            <span style="background-color: #0f172a; color: #f8fafc; border-radius: 50%; width: 32px; height: 32px; display: inline-block; font-size: 16px; line-height: 32px; font-weight: 800; text-align: center; margin-right: 0px; vertical-align: middle;">Kp</span><span style="color: #4f46e5; vertical-align: middle;">Interns</span>
          </span>
        </div>
        <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin-top: 0; text-align: center;">Onboarding & Registration Confirmed</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 8px;">Dear ${userName},</p>
        
        ${onboardingInfo}
        ${rewardSection}
        ${receiptTable}
        
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          If you have any questions or require support regarding your payments or programs, please contact our support team at <a href="mailto:support@kpinterns.com" style="color: #2563eb; text-decoration: underline;">support@kpinterns.com</a>.
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
          This is an automatically generated system receipt. Please save this email for your records.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending allotment receipt email:", error);
    throw new Error(`SMTP Mailer failed to send allotment message: ${error.message}`);
  }
}

/**
 * Sends the generated internship offer letter PDF to the user's email
 * @param {string} email - Recipient email address
 * @param {string} userName - Recipient name
 * @param {string} programTitle - Name of internship
 * @param {Buffer} pdfBuffer - Generated PDF buffer
 * @returns {Promise<{success: boolean, mocked?: boolean}>}
 */
export async function sendOfferLetterEmail(email, userName, programTitle, pdfBuffer) {
  console.log(`✉️ SENDING OFFER LETTER EMAIL TO: ${email} for ${programTitle}`);

  const transporter = getTransporter();

  if (!transporter) {
    console.warn("⚠️ SMTP credentials not configured. Using Mock console fallback for Offer Letter.");
    return { success: true, mocked: true };
  }

  const sender = process.env.EMAIL_USER;
  const mailOptions = {
    from: `"KpInterns Onboarding" <${sender}>`,
    to: email,
    subject: `Internship Offer Letter: ${programTitle} - KpInterns`,
    html: `
      <div style="font-family: 'Poppins', Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px; font-family: 'Poppins', Helvetica, Arial, sans-serif;">
          <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; vertical-align: middle;">
            <span style="background-color: #0f172a; color: #f8fafc; border-radius: 50%; width: 32px; height: 32px; display: inline-block; font-size: 16px; line-height: 32px; font-weight: 800; text-align: center; margin-right: 0px; vertical-align: middle;">Kp</span><span style="color: #4f46e5; vertical-align: middle;">Interns</span>
          </span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0;">Internship Offer Letter</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 16px;">Dear ${userName},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 16px;">
          We are pleased to attach your official <strong>Internship Offer Letter</strong> for the <strong>${programTitle}</strong> program. 
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
          Please review the attached PDF document for the internship terms, duration, and details. Your offer letter has also been uploaded and is accessible at any time under your student profile dashboard.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://kpinterns.com'}/profile" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37,99,235,0.2);">
            View Student Dashboard
          </a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
          This is an automatically generated email. Please do not reply directly.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `${programTitle.replace(/[^a-zA-Z0-9]/g, "_")}_Offer_Letter.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending Offer Letter email:", error);
    throw new Error(`SMTP Mailer failed to send offer letter: ${error.message}`);
  }
}

/**
 * Sends the generated completion certificate PDF to the user's email
 * @param {string} email - Recipient email address
 * @param {string} userName - Recipient name
 * @param {string} programTitle - Name of course or internship
 * @param {string} type - "internship" or "course"
 * @param {Buffer} pdfBuffer - Generated PDF buffer
 * @returns {Promise<{success: boolean, mocked?: boolean}>}
 */
export async function sendCertificateEmail(email, userName, programTitle, type, pdfBuffer) {
  console.log(`✉️ SENDING CERTIFICATE EMAIL TO: ${email} for ${programTitle}`);

  const transporter = getTransporter();

  if (!transporter) {
    console.warn("⚠️ SMTP credentials not configured. Using Mock console fallback for Certificate.");
    return { success: true, mocked: true };
  }

  const isCourse = type === "course";
  const docTypeLabel = isCourse ? "Course Completion Certificate" : "Internship Completion Certificate";

  const sender = process.env.EMAIL_USER;
  const mailOptions = {
    from: `"KpInterns Education" <${sender}>`,
    to: email,
    subject: `Certificate of Completion: ${programTitle} - KpInterns`,
    html: `
      <div style="font-family: 'Poppins', Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px; font-family: 'Poppins', Helvetica, Arial, sans-serif;">
          <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; vertical-align: middle;">
            <span style="background-color: #0f172a; color: #f8fafc; border-radius: 50%; width: 32px; height: 32px; display: inline-block; font-size: 16px; line-height: 32px; font-weight: 800; text-align: center; margin-right: 0px; vertical-align: middle;">Kp</span><span style="color: #4f46e5; vertical-align: middle;">Interns</span>
          </span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; color: #16a34a; margin-top: 0; text-align: center;">🏆 Congratulations! 🏆</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-top: 16px; margin-bottom: 16px;">Dear ${userName},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 16px;">
          Congratulations! You have successfully completed the <strong>${programTitle}</strong> ${isCourse ? "course" : "internship program"}.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
          We are proud to attach your verified <strong>${docTypeLabel}</strong> to this email. You can also view, share, or verify this credential at any time using your student dashboard or the KpInterns verification portal.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://kpinterns.com'}/profile" style="background-color: #16a34a; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 4px 6px -1px rgba(22,163,74,0.2);">
            Access Your Certificates
          </a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
          This is an automatically generated email. Please do not reply directly.
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `${programTitle.replace(/[^a-zA-Z0-9]/g, "_")}_Certificate.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending Certificate email:", error);
    throw new Error(`SMTP Mailer failed to send certificate: ${error.message}`);
  }
}

