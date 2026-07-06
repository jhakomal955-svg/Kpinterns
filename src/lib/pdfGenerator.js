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
      
      // Details Columns
      const col1X = 60;
      const col2X = 310;
      const col1Width = 230;
      const col2Width = 220;

      // Define grid items to render dynamically
      const gridRows = [
        {
          col1: { label: "Candidate Name", val: studentName, width: col1Width },
          col2: { label: "Roll Number", val: rollNumber, width: col2Width }
        },
        {
          col1: { label: "Institution", val: collegeName, width: col1Width },
          col2: { label: "Registration No", val: regNumber, width: col2Width }
        },
        {
          col1: { label: "Position / Role", val: `${position} Intern`, width: col1Width },
          col2: { label: "Domain / Tech", val: domain, width: col2Width }
        },
        {
          col1: { label: "Start Date", val: startDate, width: col1Width },
          col2: { label: "End Date", val: endDate, width: col2Width }
        },
        {
          col1: { label: "Internship Mode", val: mode, width: col1Width },
          col2: { label: "Supervisor", val: supervisor, width: col2Width }
        }
      ];

      // Measure row heights to determine dynamic well height
      let tempY = boxY + 15;
      const rowMetrics = [];
      const targetRowSpacing = 25; // standard spacing between rows

      gridRows.forEach((row) => {
        doc.font("Helvetica-Bold").fontSize(9.5);
        
        // Col 1 measurement
        const l1Width = doc.widthOfString(`${row.col1.label}: `);
        const v1Width = row.col1.width - l1Width;
        const h1 = doc.heightOfString(row.col1.val, { width: v1Width });

        // Col 2 measurement
        const l2Width = doc.widthOfString(`${row.col2.label}: `);
        const v2Width = row.col2.width - l2Width;
        const h2 = doc.heightOfString(row.col2.val, { width: v2Width });

        const rowHeight = Math.max(h1, h2);
        // If text wraps, rowHeight will be larger than a single line (~11pt)
        // Space next row by at least 25pt, or rowHeight + padding
        const spacing = Math.max(targetRowSpacing, rowHeight + 13);
        
        rowMetrics.push({
          rowHeight,
          spacing,
          l1Width,
          v1Width,
          l2Width,
          v2Width
        });
        tempY += spacing;
      });

      // Calculate final box bottom and height
      const lastRowIdx = gridRows.length - 1;
      const lastRowSpacing = rowMetrics[lastRowIdx].spacing;
      const lastRowHeight = rowMetrics[lastRowIdx].rowHeight;
      const boxBottomY = (tempY - lastRowSpacing) + lastRowHeight + 15;
      const boxHeight = boxBottomY - boxY;

      // Draw background well
      doc.rect(40, boxY, 515.28, boxHeight).fill(wellColor);
      doc.rect(40, boxY, 515.28, boxHeight).lineWidth(1).strokeColor(borderColor).stroke();

      // Draw text rows inside the well
      let drawY = boxY + 15;
      gridRows.forEach((row, idx) => {
        const { l1Width, v1Width, l2Width, v2Width, spacing } = rowMetrics[idx];

        // Draw Col 1
        doc.font("Helvetica-Bold").fontSize(9.5).fillColor(mutedColor).text(`${row.col1.label}: `, col1X, drawY);
        doc.font("Helvetica-Bold").fontSize(9.5).fillColor(darkColor).text(row.col1.val, col1X + l1Width, drawY, { width: v1Width });

        // Draw Col 2
        doc.font("Helvetica-Bold").fontSize(9.5).fillColor(mutedColor).text(`${row.col2.label}: `, col2X, drawY);
        doc.font("Helvetica-Bold").fontSize(9.5).fillColor(darkColor).text(row.col2.val, col2X + l2Width, drawY, { width: v2Width });

        drawY += spacing;
      });

      // --- 8. Closing Block ---
      const closingBlockY = boxY + boxHeight + 20;
      doc.font("Helvetica").fontSize(10).fillColor(darkColor)
        .text(
          "We look forward to a mutually beneficial association and are confident that this internship will be a valuable milestone in your professional growth. We wish you the very best for a successful tenure with us.",
          40,
          closingBlockY,
          { width: 515.28, lineGap: 4, align: "justify" }
        );

      const closingBlockHeight = doc.font("Helvetica").fontSize(10).heightOfString(
        "We look forward to a mutually beneficial association and are confident that this internship will be a valuable milestone in your professional growth. We wish you the very best for a successful tenure with us.",
        { width: 515.28, lineGap: 4 }
      );

      // Footer Divider Y
      const footerDividerY = closingBlockY + closingBlockHeight + 25;
      doc.moveTo(40, footerDividerY).lineTo(555.28, footerDividerY).lineWidth(1).strokeColor(borderColor).stroke();

      // --- 9. Signatures & Secure Verification Footer ---
      const footerY = footerDividerY + 15;
      
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
      const accreditationDividerY = footerY + 85 + 25;
      const badgeY = accreditationDividerY + 15;
      
      // Horizontal Line above footer accreditations
      doc.moveTo(40, accreditationDividerY).lineTo(555.28, accreditationDividerY).lineWidth(0.5).strokeColor(borderColor).stroke();

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
        certProse = `Registration No. ${registrationNumber} S/O, D/O of ${student.parentName || "N/A"} bearing Roll No. ${rollNumber} at ${institutionName} has successfully completed the professional certification course in ${programTitle} under the ${program.domain || "Specialized"} Domain (${program.difficultyLevel || "Advanced"} Level) from ${startDateStr} to ${endDateStr} of duration ${durationRange}. The student has successfully completed all academic modules, assignments, and assessments.`;
        closingProse = "We appreciate their dedication throughout the program and wish them the best for future opportunities.";
      } else {
        certProse = `Registration No. ${registrationNumber} S/o, D/o of ${student.parentName || "N/A"} bearing Roll No. ${rollNumber} at ${institutionName} has successfully completed an internship training in ${programTitle} from ${startDateStr} to ${endDateStr} , for a duration of ${durationRange}. The student maintained ${attendanceMetric} attendance and secured ${gradingScore}% score in the final assessment.`;
        closingProse = "We appreciate their sincere participation and wish them the best for future opportunities.";
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
      
      // Paste signature image
      const signaturePath = path.join(process.cwd(), "public", "kpsigns.png");
      if (fs.existsSync(signaturePath)) {
        // Center it above the line
        doc.image(signaturePath, sigX + 40, sigY - 28, { fit: [150, 50] });
      }

      doc.moveTo(sigX, sigY).lineTo(750, sigY).lineWidth(1.25).strokeColor(darkColor).stroke();
      
      const signatoryName = "Founder & CEO\nKpInterns";
      doc.font("Helvetica-Bold").fontSize(10.5).fillColor(darkColor)
        .text(signatoryName, sigX, sigY + 8, { align: "center", width: 200 });

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

      // drawBottomBadge("aicte.png", "aicte.png", 280, bottomBadgeY, 32, 32);
      drawBottomBadge("aicte.png", "aicte.png", 345, bottomBadgeY + 4, 48, 24);
      drawBottomBadge("msme.png", "msme.png", 425, bottomBadgeY, 32, 32);
      // drawBottomBadge("msme.png", "msme.png", 485, bottomBadgeY, 40, 34);

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

/**
 * Local helper to generate 20 consecutive days starting from a date.
 */
function getWeekdays(startDate, count = 20) {
  const dates = [];
  let current = new Date(startDate);
  if (isNaN(current.getTime())) {
    current = new Date();
  }
  while (dates.length < count) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Generates the multi-page Attendance Sheet (Annexure-2) and Daily Log Book (Annexure-3) PDF.
 */
export async function generateAttendanceCertificate(student, internship, verificationId, percentage) {
  return new Promise(async (resolve, reject) => {
    try {
      // Create A4 Portrait Document (595.28 x 841.89 points)
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const enrollment = student.ActiveInternship?.find(
        (i) => (i.internship?._id || i.internship)?.toString() === (internship._id || internship)?.toString()
      );

      const userAssignments = enrollment?.assignments || [];

      // Calculate 20 weekdays
      const rawStart = enrollment?.startDate || new Date();
      const weekdays = getWeekdays(rawStart, 20);

      // Distribute statuses
      const statuses = Array(20).fill("Present");
      const presentCount = Math.round(20 * (percentage / 100));
      const absentCount = 20 - presentCount;
      if (absentCount > 0) {
        const step = Math.floor(20 / (absentCount + 1)) || 1;
        for (let a = 1; a <= absentCount; a++) {
          const idx = (a * step) % 20;
          statuses[idx] = "Absent";
        }
      }

      // Draw helper function for student details
      const drawStudentDetailsBlock = (doc, titleText, pageNumStr) => {
        doc.font("Helvetica-Bold").fontSize(12).fillColor("#1e3a8a").text(titleText, 40, 45, { align: "center", width: 515 });
        doc.moveTo(40, 62).lineTo(555, 62).lineWidth(1.5).strokeColor("#3b82f6").stroke();

        doc.font("Helvetica-Bold").fontSize(10).fillColor("#1e293b").text("STUDENT DETAILS:-", 40, 75);

        const details = [
          { label: "NAME:", value: student.fullName || "N/A" },
          { label: "UNIVERSITY ROLL NO. :", value: student.rollNumber || "N/A" },
          { label: "COLLEGE NAME:", value: student.college || "N/A" },
          { label: "PHONE:", value: student.phone || "N/A" },
          { label: "FATHER'S NAME:", value: student.parentName || "N/A" },
          { label: "PROGRAMME / SEMESTER:", value: `${student.degree || "N/A"} / ${student.semester || "N/A"}` },
          { label: "DOMAIN:", value: internship.domain || "N/A" },
          { label: "MODE OF INTERNSHIP:", value: internship.mode || "N/A" },
          { label: "START DATE:", value: formatDate(enrollment?.startDate || rawStart) },
          { label: "END DATE:", value: formatDate(enrollment?.endDate) }
        ];

        let currentY = 92;
        details.forEach((field) => {
          doc.font("Helvetica-Bold").fontSize(8).fillColor("#475569").text(field.label, 45, currentY, { width: 160 });
          doc.font("Helvetica").fontSize(8).fillColor("#0f172a").text(field.value, 210, currentY, { width: 330 });
          doc.moveTo(210, currentY + 9).lineTo(550, currentY + 9).lineWidth(0.5).strokeColor("#cbd5e1").stroke();
          currentY += 13;
        });

        // Page number
        doc.font("Helvetica").fontSize(8).fillColor("#64748b").text(pageNumStr, 520, 800, { align: "right" });
      };

      // Helper to draw attendance table headers
      const drawAttendanceHeader = (y) => {
        const columns = [
          { title: "Day", width: 55 },
          { title: "Date", width: 120 },
          { title: "P/A", width: 80 },
          { title: "Signature", width: 260 }
        ];
        doc.rect(40, y, 515, 20).fill("#f1f5f9");
        let currentX = 40;
        columns.forEach(col => {
          doc.font("Helvetica-Bold").fontSize(8).fillColor("#334155").text(col.title, currentX, y + 5, { width: col.width, align: "center" });
          doc.rect(currentX, y, col.width, 20).lineWidth(0.5).strokeColor("#94a3b8").stroke();
          currentX += col.width;
        });
      };

      // Helper to draw attendance row
      const drawAttendanceRow = (y, dayNum, dateStr, status, isHighlight = false) => {
        const columns = [
          { width: 55, val: dayNum.toString() },
          { width: 120, val: dateStr },
          { width: 80, val: status === "Present" ? "P" : "A" },
          { width: 260, val: status === "Present" ? "Verified" : "-" }
        ];
        if (isHighlight) {
          doc.rect(40, y, 515, 18).fill("#f8fafc");
        }
        let currentX = 40;
        columns.forEach((col, index) => {
          doc.font(index === 2 && status === "Present" ? "Helvetica-Bold" : "Helvetica")
            .fontSize(8)
            .fillColor(index === 2 ? (status === "Present" ? "#10b981" : "#ef4444") : "#0f172a")
            .text(col.val, currentX, y + 5, { width: col.width, align: "center" });
          doc.rect(currentX, y, col.width, 18).lineWidth(0.5).strokeColor("#cbd5e1").stroke();
          currentX += col.width;
        });
      };

      // Helper to draw activity table headers
      const drawActivityHeader = (y) => {
        const columns = [
          { title: "Day", width: 40 },
          { title: "Date", width: 80 },
          { title: "Task / Activity", width: 235 },
          { title: "completed", width: 60 },
          { title: "Marks", width: 50 },
          { title: "Sign.", width: 50 }
        ];
        doc.rect(40, y, 515, 20).fill("#f1f5f9");
        let currentX = 40;
        columns.forEach(col => {
          doc.font("Helvetica-Bold").fontSize(8).fillColor("#334155").text(col.title, currentX, y + 5, { width: col.width, align: "center" });
          doc.rect(currentX, y, col.width, 20).lineWidth(0.5).strokeColor("#94a3b8").stroke();
          currentX += col.width;
        });
      };

      // Helper to draw activity row
      const drawActivityRow = (y, dayNum, dateStr, taskText, completedVal, marksVal, isHighlight = false) => {
        const columns = [
          { width: 40, val: dayNum.toString(), align: "center" },
          { width: 80, val: dateStr, align: "center" },
          { width: 235, val: taskText, align: "left" },
          { width: 60, val: completedVal, align: "center" },
          { width: 50, val: marksVal, align: "center" },
          { width: 50, val: completedVal === "Yes" ? "Sd/-" : "-", align: "center" }
        ];
        if (isHighlight) {
          doc.rect(40, y, 515, 22).fill("#f8fafc");
        }
        let currentX = 40;
        columns.forEach((col, index) => {
          doc.font("Helvetica")
            .fontSize(7.5)
            .fillColor("#0f172a");

          if (index === 2) {
            doc.text(col.val, currentX + 5, y + 4, { width: col.width - 10, align: "left", lineGap: 1 });
          } else {
            doc.text(col.val, currentX, y + 6, { width: col.width, align: "center" });
          }

          doc.rect(currentX, y, col.width, 22).lineWidth(0.5).strokeColor("#cbd5e1").stroke();
          currentX += col.width;
        });
      };

      const modules = internship.content || [];

      // ==========================================
      // PAGE 1: Annexure-2. Attendance Sheet (Part 1, Days 1-7)
      // ==========================================
      drawStudentDetailsBlock(doc, "Annexure-2. ATTENDANCE SHEET", "8");

      doc.font("Helvetica-Bold").fontSize(10).fillColor("#1e293b").text("DAY-WISE ATTENDANCE", 40, 245);
      
      let tableY = 265;
      drawAttendanceHeader(tableY);
      tableY += 20;

      for (let day = 1; day <= 7; day++) {
        const date = weekdays[day - 1];
        const status = statuses[day - 1];
        drawAttendanceRow(tableY, day, formatDate(date), status, day % 2 === 0);
        tableY += 18;
      }

      // ==========================================
      // PAGE 2: Annexure-2. Attendance Sheet (Part 2, Days 8-20)
      // ==========================================
      doc.addPage({ size: "A4", margin: 40 });
      
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#1e293b").text("DAY-WISE ATTENDANCE (Continued)", 40, 45);
      
      tableY = 65;
      drawAttendanceHeader(tableY);
      tableY += 20;

      for (let day = 8; day <= 19; day++) {
        const date = weekdays[day - 1];
        const status = statuses[day - 1];
        drawAttendanceRow(tableY, day, formatDate(date), status, day % 2 === 0);
        tableY += 18;
      }

      // Final evaluation section
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#1e293b").text("Final evaluation:-", 40, tableY + 20);
      tableY += 40;

      const date20 = weekdays[19];
      const status20 = statuses[19];
      drawAttendanceRow(tableY, 20, formatDate(date20), status20, true);

      doc.font("Helvetica").fontSize(8).fillColor("#64748b").text("9", 520, 800, { align: "right" });

      // ==========================================
      // PAGE 3: Annexure-3. Daily Log Book / Daily Activity (Part 1, Days 1-7)
      // ==========================================
      doc.addPage({ size: "A4", margin: 40 });
      drawStudentDetailsBlock(doc, "Annexure-3- DAILY LOG BOOK / DAILY ACTIVITY", "10");

      doc.font("Helvetica-Bold").fontSize(10).fillColor("#1e293b").text("ACTIVITIES", 40, 245);

      tableY = 265;
      drawActivityHeader(tableY);
      tableY += 20;

      for (let day = 1; day <= 7; day++) {
        const date = weekdays[day - 1];
        const status = statuses[day - 1];
        
        let taskText = `Study module: ${modules[day - 1]?.title || "Practical Session on " + (internship.domain || "Internship")}`;
        let completedVal = "Yes";
        let marksVal = "9/10";

        const modItem = modules[day - 1];
        if (modItem) {
          const submittedAssignment = userAssignments.find(a => a.moduleId === modItem._id.toString());
          if (modItem.assignmentTitle) {
            taskText = `Assignment: ${modItem.assignmentTitle}`;
            if (submittedAssignment) {
              completedVal = "Yes";
              marksVal = submittedAssignment.status === "Graded" ? `${submittedAssignment.marks}/10` : "8/10";
            } else {
              completedVal = "No";
              marksVal = "0/10";
            }
          }
        }

        if (status === "Absent") {
          completedVal = "No";
          marksVal = "0/10";
          taskText = `Absent - Revision Work`;
        }

        drawActivityRow(tableY, day, formatDate(date), taskText, completedVal, marksVal, day % 2 === 0);
        tableY += 22;
      }

      // ==========================================
      // PAGE 4: Annexure-3. Daily Log Book / Daily Activity (Part 2, Days 8-20)
      // ==========================================
      doc.addPage({ size: "A4", margin: 40 });
      
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#1e293b").text("ACTIVITIES (Continued)", 40, 45);

      tableY = 65;
      drawActivityHeader(tableY);
      tableY += 20;

      for (let day = 8; day <= 19; day++) {
        const date = weekdays[day - 1];
        const status = statuses[day - 1];

        let taskText = `Study module: ${modules[day - 1]?.title || "Practical Session on " + (internship.domain || "Internship")}`;
        let completedVal = "Yes";
        let marksVal = "9/10";

        const modItem = modules[day - 1];
        if (modItem) {
          const submittedAssignment = userAssignments.find(a => a.moduleId === modItem._id.toString());
          if (modItem.assignmentTitle) {
            taskText = `Assignment: ${modItem.assignmentTitle}`;
            if (submittedAssignment) {
              completedVal = "Yes";
              marksVal = submittedAssignment.status === "Graded" ? `${submittedAssignment.marks}/10` : "8/10";
            } else {
              completedVal = "No";
              marksVal = "0/10";
            }
          }
        }

        if (status === "Absent") {
          completedVal = "No";
          marksVal = "0/10";
          taskText = `Absent - Revision Work`;
        }

        drawActivityRow(tableY, day, formatDate(date), taskText, completedVal, marksVal, day % 2 === 0);
        tableY += 22;
      }

      // Final Evaluation
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#1e293b").text("Final Evaluation", 40, tableY + 20);
      tableY += 40;

      const date20Activity = weekdays[19];
      const status20Activity = statuses[19];
      let taskText20 = "Final assessment & evaluation test submission";
      let completedVal20 = "Yes";
      let marksVal20 = "9/10";
      
      const modItem20 = modules[19];
      if (modItem20) {
        const submittedAssignment = userAssignments.find(a => a.moduleId === modItem20._id.toString());
        if (modItem20.assignmentTitle) {
          taskText20 = `Final Assignment: ${modItem20.assignmentTitle}`;
          if (submittedAssignment) {
            completedVal20 = "Yes";
            marksVal20 = submittedAssignment.status === "Graded" ? `${submittedAssignment.marks}/10` : "8/10";
          } else {
            completedVal20 = "No";
            marksVal20 = "0/10";
          }
        }
      }

      if (status20Activity === "Absent") {
        completedVal20 = "No";
        marksVal20 = "0/10";
        taskText20 = "Absent - Missed Final Assessment";
      }

      drawActivityRow(tableY, 20, formatDate(date20Activity), taskText20, completedVal20, marksVal20, true);

      // Signature line at bottom
      tableY += 45;
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#1e293b").text("KpInterns Evaluation Committee", 370, tableY);
      doc.font("Helvetica").fontSize(8).fillColor("#475569").text("Authorized Digital Sd/- Signature", 370, tableY + 12);

      doc.font("Helvetica").fontSize(8).fillColor("#64748b").text("11", 520, 800, { align: "right" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}