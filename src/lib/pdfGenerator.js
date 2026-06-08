import PDFDocument from "pdfkit";
import QRCode from "qrcode";

/**
 * Dynamically generates a high-quality Offer Letter PDF as a Buffer.
 * @param {object} student - Student user details
 * @param {object} internship - Enrolled internship details
 * @param {string} verificationId - Unique MongoDB ID for verification
 * @returns {Promise<Buffer>} - Generated PDF Buffer
 */
export async function generateOfferLetter(student, internship, verificationId) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Brand Colors
      const primaryColor = "#4f46e5"; // Indigo
      const darkColor = "#0f172a";    // Charcoal/Navy
      const mutedColor = "#475569";   // Slate Gray
      const lightBorder = "#e2e8f0";  // Light Gray

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kpinterns.com";
      const verifyUrl = `${siteUrl}/verify?id=${verificationId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 100 });

      // Letterhead/Header Decoration
      doc.rect(0, 0, 595.28, 15).fill(primaryColor);

      // Logo/Branding
      const logoStartX = 50;
      const logoY = 45;
      const lightBgColor = "#f8fafc";

      // Draw Kp circle badge
      doc.circle(logoStartX + 15, logoY + 10, 15).fill(darkColor);

      // Draw "Kp" text inside circle (vertically centered)
      doc.font("Helvetica-Bold").fontSize(14);
      const kpHeight = doc.currentLineHeight();
      doc.fillColor(lightBgColor)
        .text("Kp", logoStartX, logoY + 10 - (kpHeight / 2), { width: 30, align: "center" });

      // Draw "Interns" text next to the circle badge (vertically centered, no gap)
      doc.font("Helvetica-Bold").fontSize(22);
      const internsHeight = doc.currentLineHeight();
      doc.fillColor(primaryColor)
        .text("Interns", logoStartX + 30, logoY + 10 - (internsHeight / 2));

      doc.font("Helvetica")
        .fontSize(8)
        .fillColor(mutedColor)
        .text("Nurturing Talents, Building Future", 50, logoY + 30);

      // Header Meta Info (Right aligned)
      doc.font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(darkColor)
        .text("KP INTERNS PVT LTD", 380, 45, { align: "right", width: 165 });

      doc.font("Helvetica")
        .fontSize(8)
        .fillColor(mutedColor)
        .text("support@kpinterns.com\nwww.kpinterns.com", 380, 58, { align: "right", width: 165 });

      // Divider line
      doc.moveTo(50, 95).lineTo(545, 95).strokeColor(lightBorder).lineWidth(1).stroke();

      // Document Title
      doc.font("Helvetica-Bold")
        .fontSize(16)
        .fillColor(darkColor)
        .text("INTERNSHIP OFFER LETTER", 50, 115, { align: "center" });

      // Date & ID Meta Box
      const issueDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      doc.font("Helvetica")
        .fontSize(9)
        .fillColor(mutedColor)
        .text(`Date: ${issueDate}`, 50, 150);

      doc.font("Helvetica")
        .fontSize(9)
        .fillColor(mutedColor)
        .text(`Ref ID: ${verificationId}`, 380, 150, { align: "right", width: 165 });

      // Recipient Block
      doc.font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(darkColor)
        .text("TO WHOM IT MAY CONCERN,", 50, 180);

      doc.font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(darkColor)
        .text(`Candidate Name: ${student.fullName}`, 50, 205);

      doc.font("Helvetica")
        .fontSize(10)
        .fillColor(mutedColor)
        .text(`College/University: ${student.college || student.university || "N/A"}`, 50, 220);

      doc.font("Helvetica")
        .fontSize(10)
        .fillColor(mutedColor)
        .text(`Department & Degree: ${student.degree || "N/A"} - ${student.department || "N/A"}`, 50, 235);

      if (student.registrationNumber) {
        doc.text(`Reg/Enrollment No: ${student.registrationNumber}`, 50, 250);
      }

      // Letter Body
      const startY = 280;
      doc.font("Helvetica")
        .fontSize(10.5)
        .fillColor(darkColor)
        .text(`Dear ${student.fullName},`, 50, startY);

      const posTitle = internship.position || "Intern";
      const company = internship.company || "KpInterns";
      const domain = internship.domain || "Software Development";
      const duration = internship.duration || "1-month";
      const mode = internship.mode || "Hybrid";

      doc.font("Helvetica")
        .fontSize(10)
        .fillColor(darkColor)
        .text(
          `On behalf of KpInterns, we are pleased to offer you an internship opportunity as a `,
          50,
          startY + 25,
          { lineGap: 6, width: 495 }
        );

      doc.font("Helvetica-Bold")
        .text(`${posTitle} Intern `, { continued: true })
        .font("Helvetica")
        .text(`in the domain of `, { continued: true })
        .font("Helvetica-Bold")
        .text(`${domain}.`, { continued: false });

      const paragraph2 = 
        `This internship is scheduled to begin immediately upon enrollment, for a set duration of ${duration}. The operational mode of this engagement will be ${mode}. During this program, you will work under the mentorship of our industry-leading instructors and will be assigned live industry projects.`;

      doc.font("Helvetica")
        .text(paragraph2, 50, startY + 65, { lineGap: 6, width: 495 });

      const paragraph3 = 
        `Successful completion of all training modules, tasks, and code evaluations is a prerequisite for receiving the official KpInterns Internship Completion Certificate, which will be accompanied by a verifiable ID on our portal.`;

      doc.text(paragraph3, 50, startY + 130, { lineGap: 6, width: 495 });

      const paragraph4 = 
        `We are excited to have you join our training cohort. We believe this association will add substantial value to your academic and professional profile.`;

      doc.text(paragraph4, 50, startY + 195, { lineGap: 6, width: 495 });

      doc.text("Warm regards,", 50, startY + 245);

      // Signatures
      doc.font("Helvetica-Bold")
        .fontSize(10)
        .text("Managing Director", 50, startY + 295);

      doc.font("Helvetica")
        .fontSize(9.5)
        .fillColor(mutedColor)
        .text("KpInterns Group of Learning & Development", 50, startY + 308);

      // Stylized Script Text Signature
      doc.font("Courier-Oblique")
        .fontSize(16)
        .fillColor(primaryColor)
        .text("KpInterns Admin", 50, startY + 272);

      // Verification QR and Meta Box (Bottom Footer Area)
      const footerY = 690;
      doc.moveTo(50, footerY - 10).lineTo(545, footerY - 10).strokeColor(lightBorder).lineWidth(1).stroke();

      // Draw QR Code
      doc.image(qrCodeDataUrl, 50, footerY, { width: 65, height: 65 });

      // Verification Text Box
      doc.font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(darkColor)
        .text("DOCUMENT VERIFICATION", 125, footerY + 5);

      doc.font("Helvetica")
        .fontSize(7.5)
        .fillColor(mutedColor)
        .text(
          `This document is secure and carries an authentic registry record with KpInterns.\nScan the QR code or visit ${siteUrl}/verify and search the Ref ID below to verify:\nRef ID: ${verificationId}`,
          125,
          footerY + 16,
          { lineGap: 3, width: 350 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Dynamically generates a Landscape Certificate PDF as a Buffer.
 * @param {object} student - Student user details
 * @param {object} program - Course or Internship details
 * @param {string} type - "internship" or "course"
 * @param {string} verificationId - Unique MongoDB ID for verification
 * @returns {Promise<Buffer>} - Generated PDF Buffer
 */
export async function generateCertificate(student, program, type, verificationId) {
  return new Promise(async (resolve, reject) => {
    try {
      // Landscape A4: 841.89 x 595.28 points
      const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Brand Colors
      const primaryColor = "#4f46e5"; // Indigo
      const goldColor = "#d97706";    // Gold
      const darkColor = "#0f172a";    // Navy/Charcoal
      const mutedColor = "#475569";   // Slate Gray

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kpinterns.com";
      const verifyUrl = `${siteUrl}/verify?id=${verificationId}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 100 });

      // Draw Decorative Certificate Border
      // Outer Navy Border
      doc.rect(20, 20, 801.89, 555.28)
        .lineWidth(3.5)
        .strokeColor(darkColor)
        .stroke();

      // Inner Gold Border
      doc.rect(26, 26, 789.89, 543.28)
        .lineWidth(1.5)
        .strokeColor(goldColor)
        .stroke();

      // Logo/Branding Header
      const lightBgColor = "#f8fafc";
      doc.font("Helvetica-Bold").fontSize(22);
      const internsWidth = doc.widthOfString("Interns");
      const internsHeight = doc.currentLineHeight();
      const totalLogoWidth = 30 + internsWidth; // Circle (30) + No gap + Interns text width
      const logoStartX = (841.89 - totalLogoWidth) / 2;
      const logoY = 55;

      // Draw Kp circle badge
      doc.circle(logoStartX + 15, logoY + 10, 15).fill(darkColor);

      // Draw "Kp" text inside circle (vertically centered)
      doc.font("Helvetica-Bold").fontSize(14);
      const kpHeight = doc.currentLineHeight();
      doc.fillColor(lightBgColor)
        .text("Kp", logoStartX, logoY + 10 - (kpHeight / 2), { width: 30, align: "center" });

      // Draw "Interns" text (vertically centered, no gap)
      doc.font("Helvetica-Bold").fontSize(22);
      doc.fillColor(primaryColor)
        .text("Interns", logoStartX + 30, logoY + 10 - (internsHeight / 2));

      doc.font("Helvetica")
        .fontSize(8)
        .fillColor(mutedColor)
        .text("GROUP OF LEARNING & PROFESSIONAL DEVELOPMENT", 80, logoY + 32, {
          align: "center",
          width: 681.89,
          characterSpacing: 1.5
        });

      // Decorative center badge lines
      doc.moveTo(320, 95).lineTo(521.89, 95).strokeColor(goldColor).lineWidth(1).stroke();

      // Title of Certificate
      const titleText =
        type === "course"
          ? "CERTIFICATE OF COURSE COMPLETION"
          : "CERTIFICATE OF INTERNSHIP COMPLETION";

      doc.font("Helvetica-Bold")
        .fontSize(22)
        .fillColor(darkColor)
        .text(titleText, 80, 120, { align: "center", width: 681.89 });

      // Subtitle
      doc.font("Helvetica-Oblique")
        .fontSize(12.5)
        .fillColor(mutedColor)
        .text("This credential is proudly presented to", 80, 165, { align: "center", width: 681.89 });

      // Student Name
      doc.font("Helvetica-Bold")
        .fontSize(28)
        .fillColor(primaryColor)
        .text(student.fullName, 80, 200, { align: "center", width: 681.89 });

      // Gold under-line for student name
      doc.moveTo(250, 235).lineTo(591.89, 235).strokeColor(goldColor).lineWidth(1.5).stroke();

      // Body copy context
      const collegeText = student.college || student.university || "their university";
      const programName = program.title || program.position || "Specialized Training";
      const duration = program.duration || "1-month";

      let bodyText = "";
      if (type === "course") {
        bodyText = `for successfully enrolling, studying, and completing the specialized training course in ${programName} with exemplary performance and passing all academic assessments.`;
      } else {
        const domain = program.domain || "Technology";
        bodyText = `in recognition of their successful completion of the ${duration} professional internship program as a ${programName} Intern in the domain of ${domain}. They have successfully submitted all projects, met all deadlines, and verified their compliance with KpInterns standards.`;
      }

      doc.font("Helvetica")
        .fontSize(11.5)
        .fillColor(darkColor)
        .text(bodyText, 120, 260, {
          align: "center",
          width: 601.89,
          lineGap: 5
        });

      const issueDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      doc.font("Helvetica")
        .fontSize(10.5)
        .fillColor(mutedColor)
        .text(`Date of Issue: ${issueDate}`, 80, 350, { align: "center", width: 681.89 });

      // Verification QR Box (Bottom Left Side)
      const footerY = 440;
      doc.image(qrCodeDataUrl, 80, footerY, { width: 65, height: 65 });

      doc.font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(darkColor)
        .text("SECURE CREDENTIAL VERIFICATION", 155, footerY + 5);

      doc.font("Helvetica")
        .fontSize(8)
        .fillColor(mutedColor)
        .text(
          `This record has been officially registered with KpInterns.\nScan the QR code or verify at:\n${siteUrl}/verify\nCertificate ID: ${verificationId}`,
          155,
          footerY + 17,
          { lineGap: 2.5, width: 260 }
        );

      // Signatures Box (Bottom Right Side)
      doc.moveTo(550, footerY + 45).lineTo(730, footerY + 45).strokeColor(goldColor).lineWidth(1).stroke();

      doc.font("Courier-Oblique")
        .fontSize(14)
        .fillColor(primaryColor)
        .text("KpInterns Director", 550, footerY + 22, { align: "center", width: 180 });

      doc.font("Helvetica-Bold")
        .fontSize(9.5)
        .fillColor(darkColor)
        .text("Authorized Signatory", 550, footerY + 52, { align: "center", width: 180 });

      doc.font("Helvetica")
        .fontSize(8.5)
        .fillColor(mutedColor)
        .text("KpInterns Group", 550, footerY + 65, { align: "center", width: 180 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
