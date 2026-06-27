import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, CourseModel, InternshipModel } from "@/models";

/**
 * Retrieves the sequential index (1-based) of a given course/internship subdocument ID.
 * @param {string} subdocumentId - MongoDB ObjectId of the course/internship enrollment
 * @returns {Promise<number>} - 1-based chronological index
 */
export async function getSequentialNumber(subdocumentId) {
  try {
    await connectDB();
    createModel("Course", CourseModel);
    createModel("Internship", InternshipModel);
    const User = createModel("User", UserModel);

    // Retrieve only the ObjectIds of active internships and courses
    const users = await User.find({}, { "ActiveInternship._id": 1, "ActiveCources._id": 1 });

    const allIds = [];
    for (const user of users) {
      if (user.ActiveInternship) {
        for (const item of user.ActiveInternship) {
          if (item._id) {
            allIds.push(item._id.toString());
          }
        }
      }
      if (user.ActiveCources) {
        for (const item of user.ActiveCources) {
          if (item._id) {
            allIds.push(item._id.toString());
          }
        }
      }
    }

    // Sort alphabetically so they are ordered chronologically by creation time
    allIds.sort();

    const idx = allIds.indexOf(subdocumentId.toString());
    return idx !== -1 ? idx + 1 : 1;
  } catch (error) {
    console.error("Error getting sequential number:", error);
    return 1;
  }
}

/**
 * Resolves a 1-based sequential index back to its corresponding MongoDB ObjectId.
 * @param {string|number} seqNum - 1-based chronological index
 * @returns {Promise<string|null>} - MongoDB ObjectId of the subdocument, or null
 */
export async function getObjectIdFromSequentialNumber(seqNum) {
  try {
    await connectDB();
    createModel("Course", CourseModel);
    createModel("Internship", InternshipModel);
    const User = createModel("User", UserModel);

    const users = await User.find({}, { "ActiveInternship._id": 1, "ActiveCources._id": 1 });

    const allIds = [];
    for (const user of users) {
      if (user.ActiveInternship) {
        for (const item of user.ActiveInternship) {
          if (item._id) {
            allIds.push(item._id.toString());
          }
        }
      }
      if (user.ActiveCources) {
        for (const item of user.ActiveCources) {
          if (item._id) {
            allIds.push(item._id.toString());
          }
        }
      }
    }

    allIds.sort();

    const targetIdx = parseInt(seqNum, 10) - 1;
    if (targetIdx >= 0 && targetIdx < allIds.length) {
      return allIds[targetIdx];
    }
    return null;
  } catch (error) {
    console.error("Error getting ObjectId from sequential number:", error);
    return null;
  }
}

/**
 * Helper to safely format Date objects or strings into DD-MM-YYYY format
 */
const formatDate = (d) => {
  if (!d) return "N/A";
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Dynamically generates an exact-fit Offer/Acceptance Letter PDF using your JPEG template.
 * @param {object} student - Student user details
 * @param {object} internship - Enrolled internship details
 * @param {string} verificationId - Unique MongoDB ID for verification
 * @returns {Promise<Buffer>} - Generated PDF Buffer payload
 */
export async function generateOfferLetter(student, internship, verificationId) {
  return new Promise(async (resolve, reject) => {
    try {
      // Create A4 Document (595.28 x 841.89 points) with zero margin initially
      // to allow absolute vector coordinates and border accents.
      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Brand Palette Colors
      const primaryColor = "#4f46e5";   // Modern Indigo/Violet
      const accentColor = "#d97706";    // Gold Accent
      const darkColor = "#0f172a";      // Deep Slate
      const mutedColor = "#475569";     // Muted Slate Gray
      const wellColor = "#f8fafc";      // Very Light Indigo-Gray
      const borderColor = "#e2e8f0";    // Border line color

      const enrollment = student.ActiveInternship?.find(
        (i) => (i.internship?._id || i.internship)?.toString() === (internship._id || internship)?.toString()
      );

      const seqNum = await getSequentialNumber(verificationId);
      const startYear = enrollment?.startDate 
        ? new Date(enrollment.startDate).getFullYear() 
        : new Date().getFullYear();
      const formattedVerificationId = `kpinterns/${startYear}/${seqNum}`;

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kpinterns.com";
      const verifyUrl = `${siteUrl}/verify?id=${formattedVerificationId}`;
      
      // Generate secure verification QR Code Data URL
      const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { 
        margin: 1, 
        width: 120,
        color: { dark: "#0f172a", light: "#ffffff" }
      });

      // --- 1. Top Decorative Brand Accent Bars ---
      doc.rect(0, 0, 595.28, 15).fill(primaryColor);
      doc.rect(0, 15, 595.28, 4).fill(accentColor);

      // --- 2. Corporate Header / Logo Block ---
      // Draw Stylized Kp Circle Logo
      const logoX = 40;
      const logoY = 45;
      doc.circle(logoX + 18, logoY + 18, 18).fill(darkColor);
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#ffffff")
        .text("Kp", logoX + 6, logoY + 11, { width: 24, align: "center" });

      // Draw Logo Text
      doc.font("Helvetica-Bold").fontSize(22).fillColor(primaryColor)
        .text("Interns", logoX + 38, logoY + 7);
      
      doc.font("Helvetica").fontSize(8.5).fillColor(mutedColor)
        .text("www.kpinterns.com", logoX + 39, logoY + 29);

      // Draw Top Right Accreditation Badges (MSME & ISO) if available
      const drawTopBadge = (fileName, fallbackName, x, y, width, height) => {
        let badgePath = path.join(process.cwd(), "public", "format", fileName);
        if (!fs.existsSync(badgePath)) {
          badgePath = path.join(process.cwd(), "public", fallbackName);
        }
        if (fs.existsSync(badgePath)) {
          doc.image(badgePath, x, y, { fit: [width, height] });
        }
      };

      // Top Right Section: Corporate Contact Details
      const contactX = 300;
      const contactY = 40;
      const contactWidth = 255.28;
      // We can output a unified, beautiful multi-line right-aligned block:
      const contactText = "Mob: +91 9204312848   |   Email: info@kpinterns.com\nAddress: Saraswati Nagar, Matsyagandha Road,\nPolice Line, Saharsa, Bihar - 852201";
      
      doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor)
        .text(contactText, contactX, contactY, { align: "right", width: contactWidth, lineGap: 3 });

      // Elegant Separator Line
      doc.moveTo(40, 95).lineTo(555.28, 95).lineWidth(1).strokeColor(borderColor).stroke();

      // --- 3. Letter Metadata Block ---
      const issueDate = formatDate(new Date());
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(darkColor)
        .text(`Date: ${issueDate}`, 40, 112);

      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(darkColor)
        .text(`Ref no: ${formattedVerificationId}`, 300, 112, { align: "right", width: 255.28 });

      // --- 4. Title ---
      doc.font("Helvetica-Bold").fontSize(18).fillColor(darkColor)
        .text("INTERNSHIP ACCEPTANCE LETTER", 40, 145, { align: "center", width: 515.28 });

      // --- 5. Candidate Welcome & Salutation ---
      const studentName = student.fullName || "N/A";
      const rollNumber = student.rollNumber || "N/A";
      const collegeName = student.college || student.university || "N/A";
      const regNumber = student.registrationNumber || "N/A";

      doc.font("Helvetica-Bold").fontSize(11).fillColor(darkColor)
        .text(`Dear ${studentName},`, 40, 185);

      const position = internship.position || "Intern";
      const semester = student.semester ? `${student.semester} Semester` : "N/A";
      const domain = internship.domain || "Technology";
      const mode = enrollment?.mode || internship.mode || "Hybrid";
      const startDate = formatDate(enrollment?.startDate);
      const endDate = formatDate(enrollment?.endDate);
      const supervisor = internship.supervisorName || internship.instructor?.[0]?.id?.name || "Kp Admin";

      // --- 6. Letter Body ---
      doc.font("Helvetica").fontSize(10).fillColor(darkColor)
        .text(
          "We are pleased to accept your request for an internship at KpInterns. Congratulations on your acceptance! During this internship, you will have the opportunity to work on industry-level projects, enhance your technical skills, and gain hands-on professional experience under the guidance of our mentors.",
          40,
          205,
          { width: 515.28, lineGap: 4, align: "justify" }
        );

      doc.text(
        "This offer is subject to your acceptance of our terms and conditions, including maintaining academic integrity, code confidentiality, and adhering to the timeline and requirements specified below. Please find the details of your internship program outlined below:",
        40,
        258,
        { width: 515.28, lineGap: 4, align: "justify" }
      );

      // --- 7. Styled Information Well (Dashboard Grid) ---
      const boxY = 315;
      const boxHeight = 150;
      
      // Draw background well
      doc.rect(40, boxY, 515.28, boxHeight).fill(wellColor);
      doc.rect(40, boxY, 515.28, boxHeight).lineWidth(1).strokeColor(borderColor).stroke();

      // Details Columns
      const col1X = 60;
      const col2X = 310;
      
      // Row offsets
      const textRowY = (index) => boxY + 15 + (index * 25);

      const drawGridItem = (label, val, x, y, valWidth = 220) => {
        doc.font("Helvetica-Bold").fontSize(9.5).fillColor(mutedColor).text(`${label}: `, x, y);
        const labelWidth = doc.widthOfString(`${label}: `);
        doc.font("Helvetica-Bold").fontSize(9.5).fillColor(darkColor).text(val, x + labelWidth, y, { width: valWidth - labelWidth });
      };

      // Row 1
      drawGridItem("Candidate Name", studentName, col1X, textRowY(0));
      drawGridItem("Roll Number", rollNumber, col2X, textRowY(0));

      // Row 2
      drawGridItem("Institution", collegeName, col1X, textRowY(1), 230);
      drawGridItem("Registration No", regNumber, col2X, textRowY(1));

      // Row 3
      drawGridItem("Position / Role", `${position} Intern`, col1X, textRowY(2));
      drawGridItem("Domain / Tech", domain, col2X, textRowY(2));

      // Row 4
      drawGridItem("Start Date", startDate, col1X, textRowY(3));
      drawGridItem("End Date", endDate, col2X, textRowY(3));

      // Row 5
      drawGridItem("Internship Mode", mode, col1X, textRowY(4));
      drawGridItem("Supervisor", supervisor, col2X, textRowY(4));

      // --- 8. Closing Block ---
      doc.font("Helvetica").fontSize(10).fillColor(darkColor)
        .text(
          "We look forward to a mutually beneficial association and are confident that this internship will be a valuable milestone in your professional growth. We wish you the very best for a successful tenure with us.",
          40,
          485,
          { width: 515.28, lineGap: 4, align: "justify" }
        );

      // Footer Divider
      doc.moveTo(40, 560).lineTo(555.28, 560).lineWidth(1).strokeColor(borderColor).stroke();

      // --- 9. Signatures & Secure Verification Footer ---
      const footerY = 575;
      
      // Signature Section
      doc.font("Helvetica-Bold").fontSize(10).fillColor(darkColor)
        .text("Sincerely,", 40, footerY);
      
      doc.font("Helvetica-Bold").fontSize(10).fillColor(primaryColor)
        .text("Prabhash Kumar", 40, footerY + 45);
      
      doc.font("Helvetica").fontSize(9).fillColor(mutedColor)
        .text("Founder & Ceo\nKpinterns", 40, footerY + 58, { lineGap: 2 });

      // Verification Container Box
      const vBoxX = 330;
      const vBoxY = footerY;
      const vBoxWidth = 225;
      const vBoxHeight = 85;

      doc.rect(vBoxX, vBoxY, vBoxWidth, vBoxHeight).fill(wellColor);
      doc.rect(vBoxX, vBoxY, vBoxWidth, vBoxHeight).lineWidth(1).strokeColor(borderColor).stroke();

      // QR Code
      doc.image(qrCodeDataUrl, vBoxX + 10, vBoxY + 12, { width: 60, height: 60 });

      // Verification Text
      doc.font("Helvetica-Bold").fontSize(8).fillColor(darkColor)
        .text("SECURE VERIFICATION", vBoxX + 80, vBoxY + 12);
      
      doc.font("Helvetica").fontSize(7).fillColor(mutedColor)
        .text(
          `This document carries an authentic record with KpInterns.\n\nScan QR or verify Ref ID at:\n${siteUrl.replace('https://', '')}/verify`,
          vBoxX + 80,
          vBoxY + 25,
          { width: 135, lineGap: 1.5 }
        );

      // --- 10. Footer Accreditation Badges Row ---
      const badgeY = 705;
      
      // Horizontal Line above footer accreditations
      doc.moveTo(40, badgeY - 15).lineTo(555.28, badgeY - 15).lineWidth(0.5).strokeColor(borderColor).stroke();

      const drawAccreditationBadge = (fileName, fallbackName, x, y, width, height) => {
        let badgePath = path.join(process.cwd(), "public", "format", fileName);
        if (!fs.existsSync(badgePath)) {
          badgePath = path.join(process.cwd(), "public", fallbackName);
        }
        if (fs.existsSync(badgePath)) {
          doc.image(badgePath, x, y, { fit: [width, height] });
        }
      };

      //drawAccreditationBadge("aicte.png", "aicte.png", 90, badgeY, 40, 40);
      drawAccreditationBadge("aicte.png", "aicte.png", 185, badgeY + 4, 65, 32);
      // drawAccreditationBadge("Mca.png", "Mca.png", 185, badgeY + 4, 65, 32);
      // drawAccreditationBadge("iso.png", "iso.png", 305, badgeY, 40, 40);
      drawAccreditationBadge("msme.png", "msme.png", 305, badgeY, 40, 40);
      //drawAccreditationBadge("msme.png", "msme.png", 410, badgeY, 55, 47);

      // --- 11. Bottom Decorative Contact Banner ---
      doc.rect(0, 806, 595.28, 4).fill(accentColor);
      doc.rect(0, 810, 595.28, 31.89).fill(darkColor);

      doc.font("Helvetica").fontSize(8.5).fillColor("#ffffff")
        .text("KpInterns | India's leading Internship and Course Platform | info@kpinterns.com", 0, 821, { align: "center", width: 595.28 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Dynamically generates a Landscape Certificate PDF mapping text over your template.
 * @param {object} student - Student profile details
 * @param {object} program - Completed program or course specifics
 * @param {string} type - Evaluation profile identifier ("internship" or "course")
 * @param {string} verificationId - Unique registry reference token 
 * @returns {Promise<Buffer>} - Generated Landscape Certificate PDF Buffer
 */
export async function generateCertificate(student, program, type, verificationId) {
  return new Promise(async (resolve, reject) => {
    try {
      // Create A4 Landscape Document (841.89 x 595.28 points) with zero margin initially
      // to draw absolute vector frames, borders, and margins programmatically.
      const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Brand Palette Colors
      const primaryColor = "#4f46e5";   // Modern Indigo/Violet
      const accentColor = "#d97706";    // Gold Accent
      const darkColor = "#0f172a";      // Deep Slate
      const mutedColor = "#475569";     // Muted Slate Gray
      const frameBgColor = "#ffffff";   // White certificate background
      const borderColor = "#e2e8f0";    // Light border color

      // Look up student's enrollment details for the program
      const enrollment = type === "internship"
        ? student.ActiveInternship?.find(
            (i) => (i.internship?._id || i.internship)?.toString() === (program._id || program)?.toString()
          )
        : student.ActiveCources?.find(
            (c) => (c.course?._id || c.course)?.toString() === (program._id || program)?.toString()
          );

      const seqNum = await getSequentialNumber(verificationId);
      const startYear = enrollment?.startDate 
        ? new Date(enrollment.startDate).getFullYear() 
        : new Date().getFullYear();
      const formattedVerificationId = `kpinterns/${startYear}/${seqNum}`;

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kpinterns.com";
      const verifyUrl = `${siteUrl}/verify?id=${formattedVerificationId}`;
      
      // Generate QR Code Data URL
      const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { 
        margin: 1, 
        width: 120,
        color: { dark: "#0f172a", light: "#ffffff" }
      });

      // Normalize structured variables to safe string defaults
      const studentName = student.fullName || "N/A";
      const rollNumber = student.rollNumber || "N/A";
      const registrationNumber = student.registrationNumber || "N/A";
      const institutionName = student.college || student.university || "N/A";
      const programTitle = program.title || program.position || "Specialized Training";
      const durationRange = enrollment?.duration || program.duration || "4 weeks";
      
      const attendanceMetric = enrollment?.attendanceRate || student.attendanceRate || "100%";
      const gradingScore = (enrollment?.testScore !== undefined && enrollment?.testScore !== null)
        ? enrollment.testScore
        : (enrollment?.finalScore || student.finalScore || "85");

      const startDateStr = formatDate(enrollment?.startDate || program.startDate);
      const endDateStr = formatDate(enrollment?.endDate || program.endDate);
      const issueDateStr = formatDate(new Date());

      // --- 1. Elegant Double Border and Corner Brackets ---
      // Outer Rectangle border
      doc.rect(20, 20, 801.89, 555.28).fill(frameBgColor);
      doc.rect(20, 20, 801.89, 555.28).lineWidth(4).strokeColor(primaryColor).stroke();

      // Inner Rectangle border
      doc.rect(30, 30, 781.89, 535.28).lineWidth(1.5).strokeColor(accentColor).stroke();

      // Geometric Corner Brackets
      const drawCornerBracket = (x, y, xDir, yDir) => {
        const len = 25;
        const offset = 8;
        
        // Draw decorative corner shapes
        doc.moveTo(x, y + (yDir * offset)).lineTo(x, y + (yDir * len)).lineWidth(3).strokeColor(accentColor).stroke();
        doc.moveTo(x + (xDir * offset), y).lineTo(x + (xDir * len), y).lineWidth(3).strokeColor(accentColor).stroke();
      };

      // Top-Left, Top-Right, Bottom-Left, Bottom-Right
      drawCornerBracket(30, 30, 1, 1);
      drawCornerBracket(811.89, 30, -1, 1);
      drawCornerBracket(30, 565.28, 1, -1);
      drawCornerBracket(811.89, 565.28, -1, -1);

      // --- 2. Header Branding Section ---
      // Company Logo (Top-Left)
      const logoLeftX = 60;
      const logoLeftY = 45;
      doc.circle(logoLeftX + 15, logoLeftY + 15, 15).fill(darkColor);
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#ffffff")
        .text("Kp", logoLeftX + 5, logoLeftY + 9, { width: 20, align: "center" });

      doc.font("Helvetica-Bold").fontSize(20).fillColor(primaryColor)
        .text("Interns", logoLeftX + 32, logoLeftY + 4);
      
      doc.font("Helvetica").fontSize(8).fillColor(mutedColor)
        .text("www.kpinterns.com", logoLeftX + 33, logoLeftY + 24);

      // MSME Accreditation Logo (Top-Right)
      const msmeRightX = 725;
      const msmeRightY = 40;
      let msmePath = path.join(process.cwd(), "public", "msme.png");
      if (fs.existsSync(msmePath)) {
        doc.image(msmePath, msmeRightX, msmeRightY, { fit: [55, 47] });
      }

      // --- 3. Certificate Title Block ---
      doc.font("Times-Bold").fontSize(26).fillColor(accentColor)
        .text("CERTIFICATE OF COMPLETION", 80, 115, { align: "center", width: 681.89 });

      // Decorative Diamond Divider
      const dividerY = 150;
      doc.moveTo(270, dividerY).lineTo(395, dividerY).lineWidth(0.75).strokeColor(accentColor).stroke();
      doc.moveTo(445, dividerY).lineTo(570, dividerY).lineWidth(0.75).strokeColor(accentColor).stroke();
      
      // Draw center diamond polygon
      doc.polygon([415, dividerY], [420, dividerY - 4], [425, dividerY], [420, dividerY + 4]).fill(accentColor);

      // --- 4. Main Certificate Text Structure ---
      doc.font("Helvetica-Bold").fontSize(13).fillColor(mutedColor)
        .text("This is to certify that", 80, 168, { align: "center", width: 681.89 });

      doc.font("Helvetica-Bold").fontSize(28).fillColor(primaryColor)
        .text(studentName, 80, 190, { align: "center", width: 681.89 });

      // Decorative name underline
      doc.moveTo(220, 226).lineTo(621.89, 226).lineWidth(1.25).strokeColor(borderColor).stroke();

      let certProse = "";
      let closingProse = "";

      if (type === "course") {
        certProse = `Registration no. ${registrationNumber} s/o, d/o of ${student.parentName || "N/A"} bearing Roll no ${rollNumber} of ${institutionName} has successfully completed the professional certification course in ${programTitle} under the ${program.domain || "Specialized"} Domain (${program.difficultyLevel || "Advanced"} Level) from ${startDateStr} to ${endDateStr} of duration ${durationRange}. The student has successfully completed all academic modules, assignments, and assessments.`;
        closingProse = "We appreciate his/her dedication throughout the program and wish them the best for future opportunities.";
      } else {
        certProse = `Registration no. ${registrationNumber} s/o, d/o of ${student.parentName || "N/A"} bearing Roll no ${rollNumber} of ${institutionName} has successfully completed internship training in ${programTitle} from ${startDateStr} to ${endDateStr} of ${durationRange}, The student maintained ${attendanceMetric} percent attendance and secured ${gradingScore} percentage marks in the final assessment.`;
        closingProse = "We appreciate his/her sincere participation and wish for their best for future opportunities.";
      }

      doc.font("Helvetica-Bold").fontSize(13).fillColor(darkColor)
        .text(certProse, 90, 236, { align: "center", width: 661.89, lineGap: 4 });

      const closingY = doc.y + 8;

      doc.font("Helvetica-Bold").fontSize(13).fillColor(primaryColor)
        .text(closingProse, 90, closingY, { align: "center", width: 661.89, lineGap: 4 });

      // --- 5. Signatures & Secure Verification Footer ---
      // Dynamically position footer below the prose text, clamped between 410 and 455
      const footerY = Math.min(455, Math.max(410, doc.y + 18));

      // Verification QR and ID Container (Bottom-Left)
      const qrX = 75;
      const qrY = footerY;
      doc.image(qrCodeDataUrl, qrX, qrY, { width: 55, height: 55 });

      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(darkColor)
        .text("SECURE VERIFICATION", qrX + 65, qrY + 4);

      doc.font("Helvetica").fontSize(7).fillColor(mutedColor)
        .text(
          `Verify online registry at: ${siteUrl.replace('https://', '')}/verify\nCertificate ID: ${formattedVerificationId}\nDate of Certificate: ${issueDateStr}`,
          qrX + 65,
          qrY + 16,
          { lineGap: 2.5, width: 250 }
        );

      // Authorized Signatory Signature Line (Bottom-Right)
      const sigX = 550;
      const sigY = footerY + 25;
      
      doc.moveTo(sigX, sigY).lineTo(750, sigY).lineWidth(1.25).strokeColor(darkColor).stroke();
      
      const signatoryName = program.instructor?.[0]?.id?.name || "Kp Admin";
      doc.font("Helvetica-Bold").fontSize(10.5).fillColor(primaryColor)
        .text(signatoryName, sigX, sigY + 8, { align: "center", width: 200 });

      doc.font("Helvetica").fontSize(8.5).fillColor(mutedColor)
        .text("Authorized Signatory\nKpInterns Certification Registry", sigX, sigY + 22, { align: "center", width: 200, lineGap: 2 });

      // --- 6. Footer Accreditations Row ---
      const bottomBadgeY = 518;
      
      doc.moveTo(60, bottomBadgeY - 12).lineTo(781.89, bottomBadgeY - 12).lineWidth(0.5).strokeColor(borderColor).stroke();

      const drawBottomBadge = (fileName, fallbackName, x, y, width, height) => {
        let badgePath = path.join(process.cwd(), "public", "format", fileName);
        if (!fs.existsSync(badgePath)) {
          badgePath = path.join(process.cwd(), "public", fallbackName);
        }
        if (fs.existsSync(badgePath)) {
          doc.image(badgePath, x, y, { fit: [width, height] });
        }
      };

      drawBottomBadge("aicte.png", "aicte.png", 280, bottomBadgeY, 32, 32);
      drawBottomBadge("Mca.png", "Mca.png", 345, bottomBadgeY + 4, 48, 24);
      drawBottomBadge("iso.png", "iso.png", 425, bottomBadgeY, 32, 32);
      drawBottomBadge("msme.png", "msme.png", 485, bottomBadgeY, 40, 34);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generates a professional Payment Receipt PDF for internship/course purchases.
 * @param {object} student  - User document (fullName, email, phone, registrationNumber, college, degree, department)
 * @param {object} details  - { purchaseType, title, amount, paymentId, orderId, date, receiptNumber }
 * @returns {Promise<Buffer>} - Generated PDF as a Buffer
 */
export async function generatePaymentReceipt(student, details) {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        purchaseType = "internship",
        title = "Program",
        amount = 0,
        paymentId = "N/A",
        orderId = "N/A",
        date = new Date(),
        receiptNumber,
      } = details;

      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // ── Brand palette ──────────────────────────────────────────────────────────
      const primaryColor  = "#4f46e5";
      const accentColor   = "#d97706";
      const darkColor     = "#0f172a";
      const mutedColor    = "#475569";
      const lightBg       = "#f8fafc";
      const borderColor   = "#e2e8f0";
      const successGreen  = "#16a34a";

      const receiptNo = receiptNumber || `KPI-${Date.now().toString().slice(-8)}`;
      const issueDate = formatDate(date);
      const issueTime = new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

      // ── 1. Top brand bar ─────────────────────────────────────────────────────
      doc.rect(0, 0, 595.28, 14).fill(primaryColor);
      doc.rect(0, 14, 595.28, 4).fill(accentColor);

      // ── 2. Header (Logo + Contact) ────────────────────────────────────────────
      doc.circle(58, 57, 18).fill(darkColor);
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#ffffff")
        .text("Kp", 46, 50, { width: 24, align: "center" });
      doc.font("Helvetica-Bold").fontSize(22).fillColor(primaryColor)
        .text("Interns", 78, 46);
      doc.font("Helvetica").fontSize(8).fillColor(mutedColor)
        .text("www.kpinterns.com", 79, 68);

      doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor)
        .text(
          "Mob: +91 9204312848   |   info@kpinterns.com\nSaraswati Nagar, Matsyagandha Road, Police Line\nSaharsa, Bihar \u2013 852201",
          300, 40,
          { align: "right", width: 255.28, lineGap: 3 }
        );

      doc.moveTo(40, 96).lineTo(555.28, 96).lineWidth(1).strokeColor(borderColor).stroke();

      // ── 3. PAYMENT RECEIPT title block ───────────────────────────────────────
      doc.rect(40, 108, 515.28, 52).fill(primaryColor);
      doc.font("Helvetica-Bold").fontSize(20).fillColor("#ffffff")
        .text("PAYMENT RECEIPT", 40, 118, { align: "center", width: 515.28 });
      doc.font("Helvetica").fontSize(9).fillColor("rgba(255,255,255,0.8)")
        .text(
          `Receipt No: ${receiptNo}     |     Date: ${issueDate}  ${issueTime}`,
          40, 142, { align: "center", width: 515.28 }
        );

      // ── 4. Status badge ──────────────────────────────────────────────────────
      doc.roundedRect(40, 175, 110, 24, 12).fill(successGreen);
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff")
        .text("PAYMENT SUCCESSFUL", 40, 182, { width: 110, align: "center" });

      // ── 5. Two-column: Student Info / Purchase Info ───────────────────────────
      const boxTop = 215;
      const colW   = 245;
      const col1X  = 40;
      const col2X  = 310;

      const drawSectionBox = (x, y, w, h, title) => {
        doc.rect(x, y, w, h).fill(lightBg);
        doc.rect(x, y, w, h).lineWidth(0.8).strokeColor(borderColor).stroke();
        doc.rect(x, y, w, 24).fill("#e0e7ff");
        doc.font("Helvetica-Bold").fontSize(9.5).fillColor(primaryColor)
          .text(title, x + 10, y + 7);
      };

      const drawRow = (label, value, x, y) => {
        doc.font("Helvetica-Bold").fontSize(8.5).fillColor(mutedColor)
          .text(label, x + 10, y, { width: 75 });
        doc.font("Helvetica").fontSize(8.5).fillColor(darkColor)
          .text(value || "N/A", x + 88, y, { width: 150 });
      };

      const leftBoxH = 165;
      drawSectionBox(col1X, boxTop, colW, leftBoxH, "  STUDENT DETAILS");
      drawRow("Name",      student.fullName || "N/A",            col1X, boxTop + 34);
      drawRow("Email",     student.email    || "N/A",            col1X, boxTop + 56);
      drawRow("Phone",     student.phone    || "N/A",            col1X, boxTop + 78);
      drawRow("Reg. No.",  student.registrationNumber || "N/A",  col1X, boxTop + 100);
      drawRow("College",   student.college  || "N/A",            col1X, boxTop + 122);
      drawRow("Degree",    `${student.degree || ""}`,            col1X, boxTop + 144);

      const rightBoxH = 165;
      drawSectionBox(col2X, boxTop, colW, rightBoxH, "  PURCHASE DETAILS");
      drawRow("Program",   title,                                                      col2X, boxTop + 34);
      drawRow("Type",      purchaseType === "course" ? "Online Course" : "Internship", col2X, boxTop + 56);
      drawRow("Pay. ID",   paymentId,                                                  col2X, boxTop + 78);
      drawRow("Order ID",  orderId,                                                    col2X, boxTop + 100);
      drawRow("Date",      issueDate,                                                  col2X, boxTop + 122);
      drawRow("Status",    "Confirmed & Paid",                                         col2X, boxTop + 144);

      // ── 6. Amount summary strip ───────────────────────────────────────────────
      const amountY = boxTop + leftBoxH + 18;
      doc.rect(40, amountY, 515.28, 60).fill(darkColor);

      doc.font("Helvetica").fontSize(11).fillColor("rgba(255,255,255,0.7)")
        .text("Registration Fee", 60, amountY + 14);
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#ffffff")
        .text(`Rs. ${amount}`, 60, amountY + 14, { align: "right", width: 495.28 });

      doc.moveTo(60, amountY + 34).lineTo(535.28, amountY + 34)
        .lineWidth(0.5).strokeColor("rgba(255,255,255,0.2)").stroke();

      doc.font("Helvetica-Bold").fontSize(13).fillColor(accentColor)
        .text("TOTAL PAID", 60, amountY + 40);
      doc.font("Helvetica-Bold").fontSize(18).fillColor("#ffffff")
        .text(`Rs. ${amount}`, 60, amountY + 38, { align: "right", width: 495.28 });

      // ── 7. What happens next box ──────────────────────────────────────────────
      const nextY = amountY + 80;
      doc.rect(40, nextY, 515.28, 90).fill(lightBg);
      doc.rect(40, nextY, 515.28, 90).lineWidth(0.8).strokeColor(borderColor).stroke();
      doc.font("Helvetica-Bold").fontSize(10).fillColor(primaryColor)
        .text("What Happens Next?", 55, nextY + 12);

      const steps = purchaseType === "course"
        ? [
            "Your course enrollment is now active in the Student Dashboard.",
            "Access all modules and learning materials immediately.",
            "A Completion Certificate is issued after finishing all modules.",
          ]
        : [
            "Your internship registration is confirmed and active.",
            "Your Internship Offer Letter will be emailed within 24 hours.",
            "Log in to your dashboard to track attendance and progress.",
          ];

      steps.forEach((step, i) => {
        doc.circle(62, nextY + 36 + (i * 20), 4).fill(primaryColor);
        doc.font("Helvetica").fontSize(9).fillColor(darkColor)
          .text(step, 72, nextY + 31 + (i * 20), { width: 460 });
      });

      // ── 8. Footer note ────────────────────────────────────────────────────────
      const footerY = nextY + 105;
      doc.moveTo(40, footerY).lineTo(555.28, footerY).lineWidth(0.8).strokeColor(borderColor).stroke();
      doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor)
        .text(
          `This is a computer-generated receipt and requires no physical signature.\nFor queries: support@kpinterns.com  |  Receipt ID: ${receiptNo}  |  KpInterns Acpsk Technology Pvt. Ltd.`,
          40, footerY + 10,
          { align: "center", width: 515.28, lineGap: 3 }
        );

      // ── 9. Accreditation badges ───────────────────────────────────────────────
      const badgesY = footerY + 48;
      const drawBadge = (fn, x, y, w, h) => {
        let p = path.join(process.cwd(), "public", "format", fn);
        if (!fs.existsSync(p)) p = path.join(process.cwd(), "public", fn);
        if (fs.existsSync(p)) doc.image(p, x, y, { fit: [w, h] });
      };
      drawBadge("aicte.png",  90,  badgesY, 40, 40);
      drawBadge("Mca.png",   185,  badgesY + 4, 65, 32);
      drawBadge("iso.png",   305,  badgesY, 40, 40);
      drawBadge("msme.png",  410,  badgesY, 55, 47);

      // ── 10. Bottom accent bar ─────────────────────────────────────────────────
      doc.rect(0, 806, 595.28, 4).fill(accentColor);
      doc.rect(0, 810, 595.28, 31.89).fill(darkColor);
      doc.font("Helvetica").fontSize(8.5).fillColor("#ffffff")
        .text(
          "KpInterns | India\u2019s leading Internship & Course Platform | info@kpinterns.com",
          0, 821, { align: "center", width: 595.28 }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}