import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { UserModel, CourseModel, InternshipModel, CounterModel } from "@/models";
import { DEGREE_DEPARTMENT_MAP, normalizeDegree } from "./data/degreeDepartments.js";

export {
  getNextSequentialId,
  getSequentialNumber,
  getObjectIdFromSequentialNumber,
} from "./sequentialId";

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
 * Calculates the certification issue date (2 days after internship/course completion date).
 * If end date is not explicitly available, falls back to start date + duration + 2 days, or current date.
 */
function getCertificationDate(enrollment, program) {
  const rawEndDate = enrollment?.endDate || program?.endDate;
  if (rawEndDate) {
    const end = new Date(rawEndDate);
    if (!isNaN(end.getTime())) {
      const certDate = new Date(end);
      certDate.setDate(certDate.getDate() + 2);
      return certDate;
    }
  }

  const rawStartDate = enrollment?.startDate || program?.startDate;
  if (rawStartDate) {
    const start = new Date(rawStartDate);
    if (!isNaN(start.getTime())) {
      const duration = enrollment?.duration || program?.duration || "4 weeks";
      let days = 28;
      const dStr = String(duration).toLowerCase();
      if (dStr.includes("1 week") || dStr.includes("1-week")) days = 7;
      else if (dStr.includes("2 week") || dStr.includes("2-week")) days = 14;
      else if (dStr.includes("4 week") || dStr.includes("4-week")) days = 28;
      else if (dStr.includes("6 week") || dStr.includes("6-week")) days = 42;
      else if (dStr.includes("8 week") || dStr.includes("8-week")) days = 56;
      else if (dStr.includes("month")) {
        const num = parseInt(dStr, 10) || 1;
        days = num * 30;
      }
      const certDate = new Date(start);
      certDate.setDate(certDate.getDate() + days + 2);
      return certDate;
    }
  }

  return new Date();
}

/**
 * Resolves a public asset path case-insensitively across public/ and public/format/
 * Fixes missing logos (e.g. AICTE, MCA) on case-sensitive Linux production filesystems.
 */
function resolvePublicAsset(fileName) {
  if (!fileName) return null;
  const publicDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "public");
  const formatDir = path.join(publicDir, "format");

  const checkDirs = [publicDir, formatDir];
  const variations = [
    fileName,
    fileName.toLowerCase(),
    fileName.toUpperCase(),
    fileName.charAt(0).toUpperCase() + fileName.slice(1).toLowerCase(),
    fileName.charAt(0).toLowerCase() + fileName.slice(1),
  ];

  for (const dir of checkDirs) {
    for (const v of variations) {
      const p = path.join(dir, v);
      if (fs.existsSync(p)) return p;
    }
    try {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        const match = files.find((f) => f.toLowerCase() === fileName.toLowerCase());
        if (match) return path.join(dir, match);
      }
    } catch (_) {}
  }
  return null;
}

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

      let formattedVerificationId = enrollment?.offerLetterId;
      if (!formattedVerificationId) {
        const seqNum = await getSequentialNumber(verificationId);
        const startYear = enrollment?.startDate
          ? new Date(enrollment.startDate).getFullYear()
          : new Date().getFullYear();
        formattedVerificationId = `kpinterns/${startYear}/${seqNum}`;
      }

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
        .text("ACPSK TECHNOLOGY PVT LTD", logoX + 39, logoY + 29);

      // Draw Top Right Accreditation Badges (MSME & ISO) if available
      const drawTopBadge = (fileName, fallbackName, x, y, width, height) => {
        let badgePath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "format", fileName);
        if (!fs.existsSync(badgePath)) {
          badgePath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", fallbackName);
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
      // Offer letter generation date should be 2 days earlier from internship starting date
      const rawStartDate = enrollment?.startDate || internship?.startDate;
      let letterDate;
      if (rawStartDate) {
        const start = new Date(rawStartDate);
        if (!isNaN(start.getTime())) {
          start.setDate(start.getDate() - 2);
          letterDate = start;
        }
      }
      if (!letterDate) {
        const fallback = enrollment?.createdAt ? new Date(enrollment.createdAt) : new Date();
        fallback.setDate(fallback.getDate() - 2);
        letterDate = fallback;
      }
      const issueDate = formatDate(letterDate);

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
          col1: { label: "Position / Role", val: `${position}`, width: col1Width },
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

      const signaturePath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "kpsigns.png");
      if (fs.existsSync(signaturePath)) {
        doc.image(signaturePath, 35, footerY + 14, { fit: [120, 35] });
      }

      let moharPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "kpmohar.png");
      if (!fs.existsSync(moharPath)) {
        moharPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "format", "kpmohar.png");
      }
      if (fs.existsSync(moharPath)) {
        doc.image(moharPath, 110, footerY + 12, { fit: [65, 65] });
      }

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
      const accreditationDividerY = 735;
      const badgeY = 750;

      // Horizontal Line above footer accreditations
      doc.moveTo(40, accreditationDividerY).lineTo(555.28, accreditationDividerY).lineWidth(0.5).strokeColor(borderColor).stroke();

      const badges = [
        { fileName: "Aicte.png", fallbackName: "Aicte.png", width: 44, height: 44 },
        { fileName: "mca.png", fallbackName: "mca.png", width: 85, height: 34 },
        { fileName: "Iso.png", fallbackName: "Iso.png", width: 44, height: 44 },
        { fileName: "Msme.png", fallbackName: "Msme.png", width: 44, height: 44 },
        { fileName: "nip.png", fallbackName: "nip.png", width: 70, height: 38 }
      ];

      const existingBadges = badges
        .map(b => ({
          ...b,
          resolvedPath: resolvePublicAsset(b.fileName) || resolvePublicAsset(b.fallbackName)
        }))
        .filter(b => b.resolvedPath);

      const minX = 40;
      const maxX = 555.28;
      const totalBadgesWidth = existingBadges.reduce((sum, b) => sum + b.width, 0);
      const spacing = existingBadges.length > 1 ? (maxX - minX - totalBadgesWidth) / (existingBadges.length - 1) : 0;

      let startX = minX;
      const midY = 770;

      existingBadges.forEach(b => {
        const yCoord = midY - (b.height / 2);
        doc.image(b.resolvedPath, startX, yCoord, { fit: [b.width, b.height] });
        startX += b.width + spacing;
      });

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
 * Helper to determine if a student/program belongs to a technical branch (B.Tech, Diploma)
 * or a non-technical stream (BA, BSc, BCom, Education, Law, etc.)
 * Strictly based on all degrees and branches in the university dataset (universities.js).
 */
export function isTechnicalStream(student, program) {
  const normDegree = normalizeDegree(student?.degree || "");

  // 1. Direct Degree Match from canonical university degrees
  if (normDegree === "B.Tech" || normDegree === "Diploma") {
    return true;
  }
  if (["BA", "BSc", "BCom", "Education", "Law", "MCA", "BCA", "BBA"].includes(normDegree)) {
    return false;
  }

  // 2. Department / Branch dynamic set lookup from universitiesData
  const studentDept = (student?.department || student?.stream || "").toString().trim().toLowerCase();

  const techDepts = new Set([
    ...(DEGREE_DEPARTMENT_MAP["B.Tech"] || []),
    ...(DEGREE_DEPARTMENT_MAP["Diploma"] || [])
  ].map(d => d.toLowerCase()));

  const nonTechDepts = new Set([
    ...(DEGREE_DEPARTMENT_MAP["BA"] || []),
    ...(DEGREE_DEPARTMENT_MAP["BSc"] || []),
    ...(DEGREE_DEPARTMENT_MAP["BCom"] || []),
    ...(DEGREE_DEPARTMENT_MAP["Education"] || []),
    ...(DEGREE_DEPARTMENT_MAP["Law"] || []),
    ...(DEGREE_DEPARTMENT_MAP["MCA"] || []),
    ...(DEGREE_DEPARTMENT_MAP["BCA"] || []),
    ...(DEGREE_DEPARTMENT_MAP["BBA"] || [])
  ].map(d => d.toLowerCase()));

  if (studentDept) {
    if (techDepts.has(studentDept)) return true;
    if (nonTechDepts.has(studentDept)) return false;

    // Substring / partial matching
    for (const t of techDepts) {
      if (studentDept.includes(t) || t.includes(studentDept)) return true;
    }
    for (const nt of nonTechDepts) {
      if (studentDept.includes(nt) || nt.includes(studentDept)) return false;
    }
  }

  // 3. Program Domain / Title lookup from universitiesData
  const progDomain = (program?.domain || program?.title || "").toString().trim().toLowerCase();
  if (progDomain) {
    if (techDepts.has(progDomain)) return true;
    if (nonTechDepts.has(progDomain)) return false;

    for (const t of techDepts) {
      if (progDomain.includes(t) || t.includes(progDomain)) return true;
    }
    for (const nt of nonTechDepts) {
      if (progDomain.includes(nt) || nt.includes(progDomain)) return false;
    }
  }

  // Fallback: If not recognized as technical engineering branch, safely treat as non-technical
  return false;
}

/**
 * Generates an exact-fit Portrait Certificate PDF for non-technical programs (BA, BSc, BCom, Education, Law, etc.).
 * Redesigned to match the standardized institutional certificate specification.
 * @param {object} student - Student profile details
 * @param {object} program - Completed program or internship specifics
 * @param {string} type - Identifier ("internship" or "course")
 * @param {string} verificationId - Unique registry reference token
 * @returns {Promise<Buffer>} - Generated Portrait Certificate PDF Buffer
 */
export async function generateNonTechnicalCertificate(student, program, type, verificationId) {
  return new Promise(async (resolve, reject) => {
    try {
      // Create A4 Portrait Document (595.28 x 841.89 points) with zero margin initially
      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Brand Palette Colors
      const primaryColor = "#1e40af";   // Deep Royal Blue
      const primaryDark = "#1e3a8a";    // Navy Blue
      const accentGold = "#d97706";     // Warm Gold
      const darkColor = "#0f172a";      // Deep Slate
      const textColor = "#1e293b";      // Slate 800
      const mutedColor = "#475569";     // Slate 600
      const lightBorder = "#cbd5e1";    // Slate 300
      const tableBorder = "#334155";    // Dark Slate Table Border

      const isCourse = type === "course";

      // Look up student's enrollment details for the program
      const enrollment = type === "internship"
        ? student.ActiveInternship?.find(
          (i) => (i.internship?._id || i.internship)?.toString() === (program._id || program)?.toString()
        )
        : student.ActiveCources?.find(
          (c) => (c.course?._id || c.course)?.toString() === (program._id || program)?.toString()
        );

      let formattedVerificationId = enrollment?.certificateId;
      if (!formattedVerificationId) {
        const seqNum = await getSequentialNumber(verificationId);
        const startYear = enrollment?.startDate
          ? new Date(enrollment.startDate).getFullYear()
          : new Date().getFullYear();
        formattedVerificationId = `kpinterns/${startYear}/${seqNum}`;
      }

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kpinterns.com";
      const verifyUrl = `${siteUrl}/verify?id=${formattedVerificationId}`;

      // Generate QR Code Data URL
      const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
        margin: 1,
        width: 100,
        color: { dark: "#0f172a", light: "#ffffff" }
      });

      // Normalize student and program variables
      const studentName = (student.fullName || "N/A").toUpperCase();
      const parentName = student.parentName || "N/A";
      const rollNumber = student.rollNumber || "";
      const registrationNumber = student.registrationNumber || "N/A";
      const institutionName = student.college || student.university || "N/A";
      const domain = program.domain || program.title || (isCourse ? "Course Domain" : "Internship Domain");
      const majorStr = student.department || student.stream || program.domain || program.title || "General";

      const rawScore = (enrollment?.testScore !== undefined && enrollment?.testScore !== null)
        ? enrollment.testScore
        : (enrollment?.finalScore || student.finalScore || "85");
      const gradingScore = typeof rawScore === "number" ? rawScore : parseInt(rawScore, 10) || 85;

      // Determine Performance Rating
      let ratingText = "Outstanding";
      if (gradingScore >= 85) {
        ratingText = "Outstanding";
      } else if (gradingScore >= 70) {
        ratingText = "Good";
      } else if (gradingScore >= 50) {
        ratingText = "Satisfactory";
      } else {
        ratingText = "Needs Improvement";
      }

      // Total Hours Completed (Standard 120 Hours for certificates)
      const totalHours = enrollment?.totalHours || program?.totalHours || "120 Hours";

      const startDateStr = formatDate(enrollment?.startDate || program.startDate);
      const endDateStr = formatDate(enrollment?.endDate || program.endDate);
      const issueDateStr = formatDate(getCertificationDate(enrollment, program));

      const startYear = enrollment?.startDate
        ? new Date(enrollment.startDate).getFullYear()
        : new Date().getFullYear();
      const sessionStr = student.session || `${startYear}-${startYear + 3}`;

      // Dynamic task / project description for assessment paragraph
      const projectTaskDesc = enrollment?.projectTitle || program?.projectTitle || program?.title || domain || "assigned project tasks";

      // --- 1. Top Decorative Header Bars ---
      doc.rect(0, 0, 595.28, 14).fill(primaryColor);
      doc.rect(0, 14, 595.28, 4).fill(accentGold);

      // --- 2. Corporate Branding Section (Top Header) ---
      const logoX = 35;
      const logoY = 28;
      doc.circle(logoX + 18, logoY + 18, 18).fill(darkColor);
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#ffffff")
        .text("Kp", logoX + 6, logoY + 10, { width: 24, align: "center" });

      doc.font("Helvetica-Bold").fontSize(22).fillColor(primaryColor)
        .text("Interns", logoX + 40, logoY + 6);

      doc.font("Helvetica").fontSize(8.5).fillColor(mutedColor)
        .text("ACPSKTECHNOLOGY PVT LTD", logoX + 41, logoY + 28);

      // Contact details (Top-Right)
      const contactText = "Saraswati Nagar, Matsyagandha Road,\nPolice Line, Saharsa, Bihar - 852201\nMob: +91 9204312848 | Email: info@kpinterns.com\nWeb: www.kpinterns.com";
      doc.font("Helvetica").fontSize(8).fillColor(mutedColor)
        .text(contactText, 300, 26, { align: "right", width: 260.28, lineGap: 2.5 });

      // Header Separator Line
      doc.moveTo(35, 86).lineTo(560.28, 86).lineWidth(1).strokeColor(lightBorder).stroke();

      // --- 3. Certificate Title & Proclamation ---
      doc.font("Times-BoldItalic").fontSize(24).fillColor(primaryDark)
        .text("Certificate of Completion", 35, 100, { align: "center", width: 525.28 });

      doc.font("Helvetica").fontSize(10).fillColor(mutedColor)
        .text("This is to certify that", 35, 126, { align: "center", width: 525.28 });

      doc.font("Helvetica-Bold").fontSize(15).fillColor(darkColor)
        .text(studentName, 35, 140, { align: "center", width: 525.28 });

      doc.font("Helvetica").fontSize(9.5).fillColor(mutedColor)
        .text("S/o or D/o", 35, 160, { align: "center", width: 525.28 });

      doc.font("Helvetica-Bold").fontSize(12).fillColor(darkColor)
        .text(parentName, 35, 173, { align: "center", width: 525.28 });

      const rollStr = rollNumber && rollNumber !== "N/A" ? ` (Roll No. ${rollNumber})` : "";
      doc.font("Helvetica").fontSize(9.5).fillColor(textColor)
        .text(`bearing University Registration/Enrolment No. ${registrationNumber}${rollStr}`, 35, 191, { align: "center", width: 525.28 });

      doc.font("Helvetica").fontSize(9).fillColor(mutedColor)
        .text("of", 35, 206, { align: "center", width: 525.28 });

      doc.font("Helvetica-Bold").fontSize(12).fillColor(darkColor)
        .text(`${institutionName},`, 35, 217, { align: "center", width: 525.28 });

      doc.font("Helvetica").fontSize(9.5).fillColor(textColor)
        .text(`Session ${sessionStr}, with Major in ${majorStr}`, 35, 234, { align: "center", width: 525.28 });

      const orgCompletionText = isCourse
        ? "has successfully completed his/her course with our organisation."
        : "has successfully completed his/her internship with our organisation.";
      doc.font("Helvetica").fontSize(9.5).fillColor(textColor)
        .text(orgCompletionText, 35, 250, { align: "center", width: 525.28 });

      // --- 4. Duration & Total Hours Lines (Direct Text, No Table) ---
      const detailsX = 40;
      const durationLabel = isCourse ? "Course Duration: " : "Internship Duration: ";
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(darkColor)
        .text(durationLabel, detailsX, 274, { continued: true });
      doc.font("Helvetica").fillColor(textColor)
        .text(`From ${startDateStr} to ${endDateStr}`);

      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(darkColor)
        .text("Total Hours Completed: ", detailsX, 290, { continued: true });
      doc.font("Helvetica").fillColor(textColor)
        .text(totalHours);

      // --- 5. Internship Performance Assessment Heading & Paragraph ---
      const perfTitle = isCourse ? "Course Performance Assessment" : "Internship Performance Assessment";
      doc.font("Helvetica-Bold").fontSize(11).fillColor(darkColor)
        .text(perfTitle, detailsX, 318);

      const introText = `During the ${isCourse ? "course" : "internship"}, the student worked on ${projectTaskDesc}. Based on our observation and mentorship, we assess the student's performance as follows:`;
      doc.font("Helvetica").fontSize(8.5).fillColor("#334155")
        .text(introText, detailsX, 334, { width: 515.28, lineGap: 2 });

      // --- 6. Performance Assessment Table ---
      const tableX = 40;
      const tableY = 364;
      const col1W = 36;
      const col2W = 245;
      const col3W = 234.28;
      const tableTotalW = col1W + col2W + col3W; // 515.28

      const headerH = 25;
      const rowH = 20.5;

      // Header Row
      doc.rect(tableX, tableY, tableTotalW, headerH).strokeColor(tableBorder).lineWidth(0.75).stroke();
      doc.moveTo(tableX + col1W, tableY).lineTo(tableX + col1W, tableY + headerH).stroke();
      doc.moveTo(tableX + col1W + col2W, tableY).lineTo(tableX + col1W + col2W, tableY + headerH).stroke();

      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(darkColor)
        .text("S.No.", tableX, tableY + 8, { width: col1W, align: "center" });
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(darkColor)
        .text("Assessment Criteria", tableX + col1W, tableY + 8, { width: col2W, align: "center" });
      doc.font("Helvetica-Bold").fontSize(8).fillColor(darkColor)
        .text("Rating [Outstanding / Good / Satisfactory / Needs Improvement]", tableX + col1W + col2W, tableY + 5, { width: col3W, align: "center" });

      // Table Criteria Rows
      const criteriaList = [
        "Technical Knowledge & Application",
        "Quality of Work & Task Completion",
        "Initiative & Problem-Solving Ability",
        "Communication & Interpersonal Skills",
        "Punctuality, Discipline &Professional Conduct"
      ];

      criteriaList.forEach((criteria, idx) => {
        const curY = tableY + headerH + (idx * rowH);

        doc.rect(tableX, curY, tableTotalW, rowH).strokeColor(tableBorder).lineWidth(0.75).stroke();
        doc.moveTo(tableX + col1W, curY).lineTo(tableX + col1W, curY + rowH).stroke();
        doc.moveTo(tableX + col1W + col2W, curY).lineTo(tableX + col1W + col2W, curY + rowH).stroke();

        // Col 1: S.No.
        doc.font("Helvetica").fontSize(8.5).fillColor(darkColor)
          .text(`${idx + 1}.`, tableX, curY + 6, { width: col1W, align: "center" });

        // Col 2: Assessment Criteria
        doc.font("Helvetica").fontSize(8.5).fillColor(textColor)
          .text(criteria, tableX + col1W + 10, curY + 6, { width: col2W - 15, align: "left" });

        // Col 3: Evaluated Rating
        doc.font("Helvetica-Bold").fontSize(8.5).fillColor(darkColor)
          .text(ratingText, tableX + col1W + col2W, curY + 6, { width: col3W, align: "center" });
      });

      // --- 7. Supervisor's Remarks ---
      const remarksY = tableY + headerH + (criteriaList.length * rowH) + 14;
      doc.font("Helvetica-Bold").fontSize(10.5).fillColor(darkColor)
        .text("Supervisor's Remarks:", detailsX, remarksY);

      doc.font("Helvetica").fontSize(8.5).fillColor("#334155")
        .text("The intern demonstrated good learning, active participation, and professional conduct throughout the internship.", detailsX, remarksY + 16, { width: 515.28 });

      // --- 8. Verification QR & Authorized Signatory ---
      // Fix signature line position (Prabhash Kumar position is kept as preferred)
      const sigX = 365;
      const sigY = remarksY + 86;

      // Bring QR code and verification text down to align horizontally in one line with Prabhash Kumar
      const qrSize = 60;
      const qrY = sigY - 14;
      doc.image(qrCodeDataUrl, detailsX, qrY, { width: qrSize, height: qrSize });

      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(darkColor)
        .text(`Certificate Number: ${formattedVerificationId}`, detailsX + 70, sigY + 2);
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(darkColor)
        .text(`Date of Certification: ${issueDateStr}`, detailsX + 70, sigY + 16);
      doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor)
        .text(`Online Certificate Verification Available on: ${siteUrl.replace(/^https?:\/\//, "")}/verify`, detailsX + 70, sigY + 30, { width: 230 });

      // Signature line & Stamp
      const sigPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "kpsigns.png");
      if (fs.existsSync(sigPath)) {
        doc.image(sigPath, sigX + 20, sigY - 26, { fit: [130, 40] });
      }

      let moharPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "kpmohar.png");
      if (!fs.existsSync(moharPath)) {
        moharPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "format", "kpmohar.png");
      }
      if (fs.existsSync(moharPath)) {
        doc.image(moharPath, sigX + 95, sigY - 34, { fit: [68, 68] });
      }

      doc.moveTo(sigX, sigY).lineTo(545, sigY).lineWidth(1.25).strokeColor(darkColor).stroke();
      doc.font("Helvetica-Bold").fontSize(10).fillColor(darkColor)
        .text("Prabhash Kumar", sigX, sigY + 6, { align: "center", width: 180 });
      doc.font("Helvetica").fontSize(8.5).fillColor(mutedColor)
        .text("Founder & CEO", sigX, sigY + 18, { align: "center", width: 180 });
      doc.font("Helvetica-Bold").fontSize(8).fillColor(primaryColor)
        .text("KPINTERNS (ACPSKTECHNOLOGY PVT LTD)", sigX, sigY + 29, { align: "center", width: 180 });

      // --- 9. Accreditation Tagline, Line & Bottom Logos ---
      const taglineY = 724;
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(textColor)
        .text("An AICTE Approved and ISO Certified Platform", 35, taglineY, { align: "center", width: 525.28 });

      // Bottom Horizontal Separator Line
      const lineY = 744;
      doc.moveTo(35, lineY).lineTo(560.28, lineY).lineWidth(0.75).strokeColor(lightBorder).stroke();

      // Badges directly below line at the bottom
      const badges = [
        { file: "Aicte.png", width: 44, height: 44 },
        { file: "mca.png", width: 85, height: 34 },
        { file: "iso.png", width: 44, height: 44 },
        { file: "msme.png", width: 44, height: 44 },
        { file: "nip.png", width: 70, height: 38 }
      ];

      const existingBadges = badges
        .map((b) => ({ ...b, resolvedPath: resolvePublicAsset(b.file) }))
        .filter((b) => b.resolvedPath);

      const minX = 40;
      const maxX = 555.28;
      const totalBadgesWidth = existingBadges.reduce((sum, b) => sum + b.width, 0);
      const spacing = existingBadges.length > 1 ? (maxX - minX - totalBadgesWidth) / (existingBadges.length - 1) : 0;

      let startX = minX;
      const midY = 776;

      existingBadges.forEach((b) => {
        const yCoord = midY - (b.height / 2);
        doc.image(b.resolvedPath, startX, yCoord, { fit: [b.width, b.height] });
        startX += b.width + spacing;
      });

      // Bottom Decorative Accent Bars
      doc.rect(0, 822, 595.28, 4).fill(accentGold);
      doc.rect(0, 826, 595.28, 15.89).fill(primaryColor);

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
 * @returns {Promise<Buffer>} - Generated Certificate PDF Buffer
 */
export async function generateCertificate(student, program, type, verificationId) {
  // If program is for a non-technical stream (BA, BSc, BCom, Education, Law), generate the portrait certificate format
  if (!isTechnicalStream(student, program)) {
    return generateNonTechnicalCertificate(student, program, type, verificationId);
  }

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

      let formattedVerificationId = enrollment?.certificateId;
      if (!formattedVerificationId) {
        const seqNum = await getSequentialNumber(verificationId);
        const startYear = enrollment?.startDate
          ? new Date(enrollment.startDate).getFullYear()
          : new Date().getFullYear();
        formattedVerificationId = `kpinterns/${startYear}/${seqNum}`;
      }

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
      const mode = enrollment?.mode || program?.mode || "Offline";

      const attendanceMetric = enrollment?.attendanceRate || student.attendanceRate || "100%";
      const gradingScore = (enrollment?.testScore !== undefined && enrollment?.testScore !== null)
        ? enrollment.testScore
        : (enrollment?.finalScore || student.finalScore || "85");

      const startDateStr = formatDate(enrollment?.startDate || program.startDate);
      const endDateStr = formatDate(enrollment?.endDate || program.endDate);
      const issueDateStr = formatDate(getCertificationDate(enrollment, program));

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
      const logoX = 40;
      const logoY = 45;
      doc.circle(logoX + 18, logoY + 18, 18).fill(darkColor);
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#ffffff")
        .text("Kp", logoX + 6, logoY + 11, { width: 24, align: "center" });

      // Draw Logo Text
      doc.font("Helvetica-Bold").fontSize(22).fillColor(primaryColor)
        .text("Interns", logoX + 38, logoY + 7);

      doc.font("Helvetica").fontSize(8.5).fillColor(mutedColor)
        .text("ACPSK TECHNOLOGY PVT LTD", logoX + 39, logoY + 29);

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
        certProse = `Registration No. ${registrationNumber} S/O, D/O ${student.parentName || "N/A"} bearing Roll No. ${rollNumber} at ${institutionName} has successfully completed the professional certification course in ${programTitle} under the ${program.domain || "Specialized"} Domain (${program.difficultyLevel || "Advanced"} Level) from ${startDateStr} to ${endDateStr} of duration ${durationRange}. The student has successfully completed all academic modules, assignments, and assessments.`;
        closingProse = "We appreciate their dedication throughout the program and wish them the best for future opportunities.";
      } else {
        certProse = `Registration No. ${registrationNumber} S/o, D/o ${student.parentName || "N/A"} bearing Roll No. ${rollNumber} at ${institutionName} has successfully completed an internship training in ${programTitle} (${mode} Mode) from ${startDateStr} to ${endDateStr}, for a duration of ${durationRange}. The student maintained ${attendanceMetric} attendance and secured ${gradingScore}% score in the final assessment.`;
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
          `Verify online registry at: ${siteUrl.replace('https://', '')}/verify\nCertificate ID: ${formattedVerificationId}\nDate of Certification: ${issueDateStr}`,
          qrX + 65,
          qrY + 16,
          { lineGap: 2.5, width: 250 }
        );

      // Authorized Signatory Signature Line (Bottom-Right)
      const sigX = 550;
      const sigY = footerY + 25;

      // Paste signature image
      const signaturePath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "kpsigns.png");
      if (fs.existsSync(signaturePath)) {
        // Center it above the line
        doc.image(signaturePath, sigX + 40, sigY - 28, { fit: [150, 50] });
      }

      // Paste Mohar (Stamp) image overlapping signature & line
      let moharPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "kpmohar.png");
      if (!fs.existsSync(moharPath)) {
        moharPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "format", "kpmohar.png");
      }
      if (fs.existsSync(moharPath)) {
        doc.image(moharPath, sigX + 110, sigY - 38, { fit: [80, 80] });
      }

      doc.moveTo(sigX, sigY).lineTo(750, sigY).lineWidth(1.25).strokeColor(darkColor).stroke();

      const signatoryName = "Founder & CEO\nKpInterns";
      doc.font("Helvetica-Bold").fontSize(10.5).fillColor(darkColor)
        .text(signatoryName, sigX, sigY + 8, { align: "center", width: 200 });

      // --- 6. Footer Accreditations Row ---
      const bottomBadgeY = 518;

      doc.moveTo(60, bottomBadgeY - 12).lineTo(781.89, bottomBadgeY - 12).lineWidth(0.5).strokeColor(borderColor).stroke();

      const badges = [
        { fileName: "Aicte.png", fallbackName: "Aicte.png", width: 44, height: 44 },
        { fileName: "mca.png", fallbackName: "mca.png", width: 85, height: 34 },
        { fileName: "Iso.png", fallbackName: "Iso.png", width: 44, height: 44 },
        { fileName: "Msme.png", fallbackName: "Msme.png", width: 44, height: 44 },
        { fileName: "nip.png", fallbackName: "nip.png", width: 70, height: 38 }
      ];

      const existingBadges = badges
        .map(b => ({
          ...b,
          resolvedPath: resolvePublicAsset(b.fileName) || resolvePublicAsset(b.fallbackName)
        }))
        .filter(b => b.resolvedPath);

      const minX = 60;
      const maxX = 781.89;
      const totalBadgesWidth = existingBadges.reduce((sum, b) => sum + b.width, 0);
      const spacing = existingBadges.length > 1 ? (maxX - minX - totalBadgesWidth) / (existingBadges.length - 1) : 0;

      let startX = minX;
      const midY = bottomBadgeY + 20;

      existingBadges.forEach(b => {
        const yCoord = midY - (b.height / 2);
        doc.image(b.resolvedPath, startX, yCoord, { fit: [b.width, b.height] });
        startX += b.width + spacing;
      });

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
        originalAmount,
        couponCode,
        discountAmount,
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
      const primaryColor = "#4f46e5";
      const accentColor = "#d97706";
      const darkColor = "#0f172a";
      const mutedColor = "#475569";
      const lightBg = "#f8fafc";
      const borderColor = "#e2e8f0";
      const successGreen = "#16a34a";

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
        .text("ACPSK TECHNOLOGY PVT LTD", 79, 68);

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
      const colW = 245;
      const col1X = 40;
      const col2X = 310;

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
      drawRow("Name", student.fullName || "N/A", col1X, boxTop + 34);
      drawRow("Email", student.email || "N/A", col1X, boxTop + 56);
      drawRow("Phone", student.phone || "N/A", col1X, boxTop + 78);
      drawRow("Reg. No.", student.registrationNumber || "N/A", col1X, boxTop + 100);
      drawRow("College", student.college || "N/A", col1X, boxTop + 122);
      drawRow("Degree", `${student.degree || ""}`, col1X, boxTop + 144);

      const rightBoxH = 165;
      drawSectionBox(col2X, boxTop, colW, rightBoxH, "  PURCHASE DETAILS");
      drawRow("Program", title, col2X, boxTop + 34);
      drawRow("Type", purchaseType === "course" ? "Online Course" : "Internship", col2X, boxTop + 56);
      drawRow("Pay. ID", paymentId, col2X, boxTop + 78);
      drawRow("Order ID", orderId, col2X, boxTop + 100);
      drawRow("Date", issueDate, col2X, boxTop + 122);
      drawRow("Coupon", couponCode ? `${couponCode} (Applied)` : "None", col2X, boxTop + 144);

      // ── 6. Amount summary strip ───────────────────────────────────────────────
      const hasCoupon = Boolean(couponCode || (discountAmount && Number(discountAmount) > 0));
      const resolvedOriginal = originalAmount !== undefined && originalAmount !== null
        ? Number(originalAmount)
        : (hasCoupon ? Number(amount) + Number(discountAmount || 0) : Number(amount));
      const resolvedDiscount = discountAmount !== undefined && discountAmount !== null
        ? Number(discountAmount)
        : (hasCoupon ? Math.max(0, resolvedOriginal - Number(amount)) : 0);

      const stripHeight = hasCoupon ? 82 : 56;
      const amountY = boxTop + leftBoxH + 16;
      doc.rect(40, amountY, 515.28, stripHeight).fill(darkColor);

      if (hasCoupon) {
        // Line 1: Original Fee
        doc.font("Helvetica").fontSize(10).fillColor("rgba(255,255,255,0.7)")
          .text("Original Program Fee", 60, amountY + 12);
        doc.font("Helvetica-Bold").fontSize(10).fillColor("#ffffff")
          .text(`Rs. ${resolvedOriginal.toLocaleString("en-IN")}`, 60, amountY + 12, { align: "right", width: 495.28 });

        // Line 2: Coupon Discount
        const couponLabel = couponCode ? `Coupon Applied (${couponCode})` : "Coupon Discount";
        doc.font("Helvetica").fontSize(10).fillColor("#34d399")
          .text(`- ${couponLabel}`, 60, amountY + 30);
        doc.font("Helvetica-Bold").fontSize(10).fillColor("#34d399")
          .text(`- Rs. ${resolvedDiscount.toLocaleString("en-IN")}`, 60, amountY + 30, { align: "right", width: 495.28 });

        // Divider
        doc.moveTo(60, amountY + 48).lineTo(535.28, amountY + 48)
          .lineWidth(0.5).strokeColor("rgba(255,255,255,0.2)").stroke();

        // Line 3: Net Amount Received
        doc.font("Helvetica-Bold").fontSize(12).fillColor(accentColor)
          .text("TOTAL AMOUNT RECEIVED", 60, amountY + 56);
        doc.font("Helvetica-Bold").fontSize(16).fillColor("#ffffff")
          .text(`Rs. ${Number(amount).toLocaleString("en-IN")}`, 60, amountY + 54, { align: "right", width: 495.28 });
      } else {
        // Line 1: Program Fee
        doc.font("Helvetica").fontSize(11).fillColor("rgba(255,255,255,0.7)")
          .text("Program Fee", 60, amountY + 12);
        doc.font("Helvetica-Bold").fontSize(11).fillColor("#ffffff")
          .text(`Rs. ${Number(amount).toLocaleString("en-IN")}`, 60, amountY + 12, { align: "right", width: 495.28 });

        // Divider
        doc.moveTo(60, amountY + 28).lineTo(535.28, amountY + 28)
          .lineWidth(0.5).strokeColor("rgba(255,255,255,0.2)").stroke();

        // Line 2: Total Amount Received
        doc.font("Helvetica-Bold").fontSize(12).fillColor(accentColor)
          .text("TOTAL AMOUNT RECEIVED", 60, amountY + 34);
        doc.font("Helvetica-Bold").fontSize(16).fillColor("#ffffff")
          .text(`Rs. ${Number(amount).toLocaleString("en-IN")}`, 60, amountY + 32, { align: "right", width: 495.28 });
      }

      // ── 7. What happens next box ──────────────────────────────────────────────
      const nextY = amountY + stripHeight + 16;
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
      const badges = [
        { fileName: "Aicte.png", fallbackName: "Aicte.png", width: 44, height: 44 },
        { fileName: "mca.png", fallbackName: "mca.png", width: 85, height: 34 },
        { fileName: "Iso.png", fallbackName: "Iso.png", width: 44, height: 44 },
        { fileName: "Msme.png", fallbackName: "Msme.png", width: 44, height: 44 },
        { fileName: "nip.png", fallbackName: "nip.png", width: 70, height: 38 }
      ];

      const existingBadges = badges
        .map(b => ({
          ...b,
          resolvedPath: resolvePublicAsset(b.fileName) || resolvePublicAsset(b.fallbackName)
        }))
        .filter(b => b.resolvedPath);

      const minX = 40;
      const maxX = 555.28;
      const totalBadgesWidth = existingBadges.reduce((sum, b) => sum + b.width, 0);
      const spacing = existingBadges.length > 1 ? (maxX - minX - totalBadgesWidth) / (existingBadges.length - 1) : 0;

      let startX = minX;
      const midY = badgesY + 20;

      existingBadges.forEach(b => {
        const yCoord = midY - (b.height / 2);
        doc.image(b.resolvedPath, startX, yCoord, { fit: [b.width, b.height] });
        startX += b.width + spacing;
      });

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
 * Local helper to generate consecutive days starting from a date.
 */
function getWeekdays(startDate, count) {
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

      // Brand Palette Colors
      const primaryColor = "#4f46e5";   // Modern Indigo/Violet
      const accentColor = "#d97706";    // Gold Accent
      const darkColor = "#0f172a";      // Deep Slate
      const mutedColor = "#475569";     // Muted Slate Gray
      const borderColor = "#e2e8f0";    // Border line color
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const enrollment = student.ActiveInternship?.find(
        (i) => (i.internship?._id || i.internship)?.toString() === (internship._id || internship)?.toString()
      );

      const userAssignments = enrollment?.assignments || [];

      // Calculate consecutive calendar days between start and end date (fallback to 20 if no end date)
      const rawStart = enrollment?.startDate || new Date();
      const rawEnd = enrollment?.endDate;
      let count = 20;
      if (rawEnd) {
        const s = new Date(rawStart);
        const e = new Date(rawEnd);
        s.setHours(0, 0, 0, 0);
        e.setHours(0, 0, 0, 0);
        const diffTime = e.getTime() - s.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (diffDays > 0) {
          count = diffDays;
        }
      }
      const weekdays = getWeekdays(rawStart, count);

      // Distribute statuses dynamically across total duration
      const statuses = Array(count).fill("Present");
      const presentCount = Math.round(count * (percentage / 100));
      const absentCount = count - presentCount;
      if (absentCount > 0) {
        const step = Math.floor(count / (absentCount + 1)) || 1;
        for (let a = 1; a <= absentCount; a++) {
          const idx = (a * step) % count;
          statuses[idx] = "Absent";
        }
      }

      const defaultCheckIn = "10:00 AM";
      const defaultCheckOut = "04:00 PM";
      const dailyHours = 6.0;
      const totalDurationHours = 120.0;

      const drawHeader = (titleText) => {
        // --- 1. Top Decorative Brand Accent Bars ---
        doc.rect(0, 0, 595.28, 15).fill(primaryColor);
        doc.rect(0, 15, 595.28, 4).fill(accentColor);

        // --- 2. Corporate Header / Logo Block ---
        const logoX = 40;
        const logoY = 45;
        doc.circle(logoX + 18, logoY + 18, 18).fill(darkColor);
        doc.font("Helvetica-Bold").fontSize(14).fillColor("#ffffff")
          .text("Kp", logoX + 6, logoY + 11, { width: 24, align: "center" });

        // Draw Logo Text
        doc.font("Helvetica-Bold").fontSize(22).fillColor(primaryColor)
          .text("Interns", logoX + 38, logoY + 7);

        doc.font("Helvetica").fontSize(8.5).fillColor(mutedColor)
          .text("ACPSK TECHNOLOGY PVT LTD", logoX + 39, logoY + 29);

        // Top Right Section: Corporate Contact Details
        const contactX = 300;
        const contactY = 40;
        const contactWidth = 255.28;
        const contactText = "Mob: +91 9204312848   |   Email: info@kpinterns.com\nAddress: Saraswati Nagar, Matsyagandha Road,\nPolice Line, Saharsa, Bihar - 852201";

        doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor)
          .text(contactText, contactX, contactY, { align: "right", width: contactWidth, lineGap: 3 });

        // Elegant Separator Line
        doc.moveTo(40, 95).lineTo(555.28, 95).lineWidth(1).strokeColor(borderColor).stroke();

        if (titleText) {
          doc.font("Helvetica-Bold").fontSize(11).fillColor("#1e3a8a").text(titleText, 40, 110, { align: "center", width: 515 });
        }
      };

      // Draw helper function for student details
      const drawStudentDetailsBlock = (doc, titleText, pageNumStr) => {
        drawHeader(titleText);

        doc.moveTo(40, 125).lineTo(555, 125).lineWidth(1.25).strokeColor("#3b82f6").stroke();

        doc.font("Helvetica-Bold").fontSize(9).fillColor("#1e293b").text("STUDENT DETAILS:-", 40, 135);

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

        let currentY = 150;
        details.forEach((field) => {
          doc.font("Helvetica-Bold").fontSize(8).fillColor("#475569").text(field.label, 45, currentY, { width: 160 });
          doc.font("Helvetica").fontSize(8).fillColor("#0f172a").text(field.value, 210, currentY, { width: 330 });
          doc.moveTo(210, currentY + 9).lineTo(550, currentY + 9).lineWidth(0.5).strokeColor("#cbd5e1").stroke();
          currentY += 13;
        });

        doc.y = currentY;
      };

      // Helper to draw attendance table headers with Check In, Check Out, and Duration
      const drawAttendanceHeader = (y) => {
        const columns = [
          { title: "Day", width: 35 },
          { title: "Date", width: 70 },
          { title: "P/A", width: 40 },
          { title: "Check In", width: 70 },
          { title: "Check Out", width: 70 },
          { title: "Duration", width: 60 },
          { title: "Signature", width: 170 }
        ];
        doc.rect(40, y, 515, 20).fill("#f1f5f9");
        let currentX = 40;
        columns.forEach(col => {
          doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#334155").text(col.title, currentX, y + 6, { width: col.width, align: "center" });
          doc.rect(currentX, y, col.width, 20).lineWidth(0.5).strokeColor("#94a3b8").stroke();
          currentX += col.width;
        });
      };

      // Helper to draw attendance row with Check In, Check Out, and Duration
      const drawAttendanceRow = (y, dayNum, dateStr, status, isHighlight = false) => {
        const instName = internship.supervisorName || (internship.instructor?.[0]?.id?.name || internship.instructor?.[0]?.name) || "Prabhash Kumar";
        const isPresent = status === "Present";
        const columns = [
          { width: 35, val: dayNum.toString() },
          { width: 70, val: dateStr },
          { width: 40, val: isPresent ? "P" : "A" },
          { width: 70, val: isPresent ? defaultCheckIn : "-" },
          { width: 70, val: isPresent ? defaultCheckOut : "-" },
          { width: 60, val: isPresent ? `${dailyHours.toFixed(1)} Hrs` : "0.0 Hrs" },
          { width: 170, val: isPresent ? instName : "-" }
        ];
        if (isHighlight) {
          doc.rect(40, y, 515, 18).fill("#f8fafc");
        }
        let currentX = 40;
        columns.forEach((col, index) => {
          doc.font(index === 2 && isPresent ? "Helvetica-Bold" : "Helvetica")
            .fontSize(7.5)
            .fillColor(index === 2 ? (isPresent ? "#10b981" : "#ef4444") : "#0f172a")
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
        let signText = "-";
        if (completedVal === "Yes") {
          const instName = internship.supervisorName || (internship.instructor?.[0]?.id?.name || internship.instructor?.[0]?.name) || "Prabhash Kumar";
          const parts = instName.trim().split(/\s+/);
          if (parts.length > 1) {
            signText = `${parts[0]}\n${parts.slice(1).join(" ")}`;
          } else {
            signText = instName;
          }
        }

        const columns = [
          { width: 40, val: dayNum.toString(), align: "center" },
          { width: 80, val: dateStr, align: "center" },
          { width: 235, val: taskText, align: "left" },
          { width: 60, val: completedVal, align: "center" },
          { width: 50, val: marksVal, align: "center" },
          { width: 50, val: signText, align: "center" }
        ];
        if (isHighlight) {
          doc.rect(40, y, 515, 22).fill("#f8fafc");
        }
        let currentX = 40;
        columns.forEach((col, index) => {
          doc.font("Helvetica")
            .fontSize(index === 5 && col.val !== "-" ? 6.5 : 7.5)
            .fillColor("#0f172a");

          if (index === 2) {
            doc.text(col.val, currentX + 5, y + 4, { width: col.width - 10, align: "left", lineGap: 1 });
          } else if (index === 5) {
            const hasNewLine = col.val.includes("\n");
            doc.text(col.val, currentX, y + (hasNewLine ? 3 : 7), { width: col.width, align: "center", lineGap: 0 });
          } else {
            doc.text(col.val, currentX, y + 6, { width: col.width, align: "center" });
          }

          doc.rect(currentX, y, col.width, 22).lineWidth(0.5).strokeColor("#cbd5e1").stroke();
          currentX += col.width;
        });
      };

      const modules = internship.content || [];
      let pageCounter = 8;

      const drawFooter = (pageNum) => {
        const oldBottomMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;

        // 1. Accent separator line
        doc.moveTo(40, 735).lineTo(555.28, 735).lineWidth(0.5).strokeColor(borderColor).stroke();

        // 2. Page number (just above the line)
        doc.font("Helvetica").fontSize(8).fillColor("#64748b").text(pageNum.toString(), 520, 720, { align: "right" });

        // 3. Accreditation Badges row (Aicte, Mca, Iso, Msme, Nip) centered
        const badges = [
          { fileName: "Aicte.png", fallbackName: "Aicte.png", width: 44, height: 44 },
          { fileName: "mca.png", fallbackName: "mca.png", width: 85, height: 34 },
          { fileName: "Iso.png", fallbackName: "Iso.png", width: 44, height: 44 },
          { fileName: "Msme.png", fallbackName: "Msme.png", width: 44, height: 44 },
          { fileName: "nip.png", fallbackName: "nip.png", width: 70, height: 38 }
        ];

        const existingBadges = badges
          .map(b => ({
            ...b,
            resolvedPath: resolvePublicAsset(b.fileName) || resolvePublicAsset(b.fallbackName)
          }))
          .filter(b => b.resolvedPath);

        const minX = 40;
        const maxX = 555.28;
        const totalBadgesWidth = existingBadges.reduce((sum, b) => sum + b.width, 0);
        const spacing = existingBadges.length > 1 ? (maxX - minX - totalBadgesWidth) / (existingBadges.length - 1) : 0;

        let startX = minX;
        const midY = 770;

        existingBadges.forEach(b => {
          const yCoord = midY - (b.height / 2);
          doc.image(b.resolvedPath, startX, yCoord, { fit: [b.width, b.height] });
          startX += b.width + spacing;
        });

        // 4. Bottom contact/accent banner
        doc.rect(0, 806, 595.28, 4).fill(accentColor);
        doc.rect(0, 810, 595.28, 31.89).fill(darkColor);
        doc.font("Helvetica").fontSize(8.5).fillColor("#ffffff")
          .text("KpInterns | India's leading Internship and Course Platform | info@kpinterns.com", 0, 821, { align: "center", width: 595.28 });

        doc.page.margins.bottom = oldBottomMargin;
      };

      // ==========================================
      // Annexure-2. Attendance Sheet (Part 1, Days 1 to count-1)
      // ==========================================
      drawStudentDetailsBlock(doc, "ATTENDANCE SHEET", pageCounter);

      doc.font("Helvetica-Bold").fontSize(10).fillColor("#1e293b").text("DAY-WISE ATTENDANCE", 40, 280);

      let tableY = 300;
      drawAttendanceHeader(tableY);
      tableY += 20;

      for (let day = 1; day <= count - 1; day++) {
        // If drawing row exceeds page limit, break page
        if (tableY + 18 > 715) {
          drawFooter(pageCounter++);
          doc.addPage({ size: "A4", margin: 40 });
          drawHeader("DAY-WISE ATTENDANCE (Continued)");
          tableY = 120;
          drawAttendanceHeader(tableY);
          tableY += 20;
        }

        const date = weekdays[day - 1];
        const status = statuses[day - 1];
        drawAttendanceRow(tableY, day, formatDate(date), status, day % 2 === 0);
        tableY += 18;
      }

      // Check if Final evaluation and signature fits on the current page, else break page
      if (tableY + 105 > 720) {
        drawFooter(pageCounter++);
        doc.addPage({ size: "A4", margin: 40 });
        drawHeader("DAY-WISE ATTENDANCE (Continued)");
        tableY = 120;
      }

      doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#1e293b").text("Final evaluation:-", 40, tableY + 14);
      tableY += 28;

      const dateLast = weekdays[count - 1];
      const statusLast = statuses[count - 1];
      drawAttendanceRow(tableY, count, formatDate(dateLast), statusLast, true);

      // Total Duration Summary Row for Attendance Sheet
      tableY += 20;
      doc.rect(40, tableY, 515, 18).fill("#f1f5f9");
      doc.rect(40, tableY, 515, 18).lineWidth(0.75).strokeColor("#3b82f6").stroke();

      doc.font("Helvetica-Bold").fontSize(8).fillColor("#1e3a8a")
        .text(`Total Days: ${count}`, 48, tableY + 5)
        .text(`Present Days: ${presentCount}`, 145, tableY + 5)
        .text(`Total Duration Completed: ${totalDurationHours.toFixed(1)} Hours`, 270, tableY + 5, { align: "right", width: 275 });

      // Render Founder & CEO Signature Block
      tableY += 24;
      const signaturePath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "kpsigns.png");
      if (fs.existsSync(signaturePath)) {
        doc.image(signaturePath, 385, tableY, { fit: [120, 32] });
      }
      let moharPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "kpmohar.png");
      if (!fs.existsSync(moharPath)) {
        moharPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "format", "kpmohar.png");
      }
      if (fs.existsSync(moharPath)) {
        doc.image(moharPath, 445, tableY - 10, { fit: [60, 60] });
      }
      tableY += 28;
      doc.moveTo(370, tableY).lineTo(520, tableY).lineWidth(1).strokeColor("#1e293b").stroke();
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#1e293b").text("Founder & CEO", 370, tableY + 4, { align: "center", width: 150 });
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#1e293b").text("KpInterns", 370, tableY + 14, { align: "center", width: 150 });

      drawFooter(pageCounter++);

      // ==========================================
      // Annexure-3. Daily Log Book / Daily Activity (Part 2, Days 1 to count-1)
      // ==========================================
      doc.addPage({ size: "A4", margin: 40 });
      drawStudentDetailsBlock(doc, "DAILY LOG BOOK / DAILY ACTIVITY", pageCounter);

      doc.font("Helvetica-Bold").fontSize(10).fillColor("#1e293b").text("ACTIVITIES", 40, 280);

      tableY = 300;
      drawActivityHeader(tableY);
      tableY += 20;

      for (let day = 1; day <= count - 1; day++) {
        // If drawing row exceeds page limit, break page
        if (tableY + 20 > 715) {
          drawFooter(pageCounter++);
          doc.addPage({ size: "A4", margin: 40 });
          drawHeader("ACTIVITIES (Continued)");
          tableY = 120;
          drawActivityHeader(tableY);
          tableY += 20;
        }

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
        tableY += 20;
      }

      // Check if Final Evaluation and Signatures fit on current page, else break page
      if (tableY + 110 > 720) {
        drawFooter(pageCounter++);
        doc.addPage({ size: "A4", margin: 40 });
        drawHeader("ACTIVITIES (Continued)");
        tableY = 120;
      }

      doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#1e293b").text("Final Evaluation", 40, tableY + 14);
      tableY += 28;

      const dateLastActivity = weekdays[count - 1];
      const statusLastActivity = statuses[count - 1];
      let taskTextLast = "Final assessment & evaluation test submission";
      let completedValLast = "Yes";
      let marksValLast = "9/10";

      const modItemLast = modules[count - 1];
      if (modItemLast) {
        const submittedAssignment = userAssignments.find(a => a.moduleId === modItemLast._id.toString());
        if (modItemLast.assignmentTitle) {
          taskTextLast = `Final Assignment: ${modItemLast.assignmentTitle}`;
          if (submittedAssignment) {
            completedValLast = "Yes";
            marksValLast = submittedAssignment.status === "Graded" ? `${submittedAssignment.marks}/10` : "8/10";
          } else {
            completedValLast = "No";
            marksValLast = "0/10";
          }
        }
      }

      if (statusLastActivity === "Absent") {
        completedValLast = "No";
        marksValLast = "0/10";
        taskTextLast = "Absent - Missed Final Assessment";
      }

      drawActivityRow(tableY, count, formatDate(dateLastActivity), taskTextLast, completedValLast, marksValLast, true);

      // Total Duration Summary Row for Log Book
      tableY += 22;
      doc.rect(40, tableY, 515, 18).fill("#f1f5f9");
      doc.rect(40, tableY, 515, 18).lineWidth(0.75).strokeColor("#3b82f6").stroke();

      doc.font("Helvetica-Bold").fontSize(8).fillColor("#1e3a8a")
        .text(`Total Activities: ${count}`, 48, tableY + 5)
        .text(`Completed: ${count - absentCount}`, 155, tableY + 5)
        .text(`Total Duration Logged: ${totalDurationHours.toFixed(1)} Hours`, 270, tableY + 5, { align: "right", width: 275 });

      // Signature line at bottom
      tableY += 24;
      if (fs.existsSync(signaturePath)) {
        doc.image(signaturePath, 385, tableY, { fit: [120, 32] });
      }
      moharPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "kpmohar.png");
      if (!fs.existsSync(moharPath)) {
        moharPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "format", "kpmohar.png");
      }
      if (fs.existsSync(moharPath)) {
        doc.image(moharPath, 445, tableY - 10, { fit: [60, 60] });
      }
      tableY += 28;
      doc.moveTo(370, tableY).lineTo(520, tableY).lineWidth(1).strokeColor("#1e293b").stroke();
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#1e293b").text("Founder & CEO", 370, tableY + 4, { align: "center", width: 150 });
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#1e293b").text("KpInterns", 370, tableY + 14, { align: "center", width: 150 });

      drawFooter(pageCounter++);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates a multi-page PDF document containing filtered student details sequentially
 * with Offer Letter matching top header and bottom footer (accreditations & corporate branding).
 * @param {Array} users - Filtered array of user objects
 * @param {Object} activeFilters - Summary object of applied filters
 * @returns {Promise<Buffer>}
 */
export async function generateFilteredUsersPDF(users = [], activeFilters = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 0, bufferPages: true });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      // Brand Palette Colors (Matches Offer Letter)
      const primaryColor = "#4f46e5";   // Indigo/Violet
      const accentColor = "#d97706";    // Gold Accent
      const darkColor = "#0f172a";      // Deep Slate
      const mutedColor = "#475569";     // Muted Slate Gray
      const wellColor = "#f8fafc";      // Very Light Gray
      const borderColor = "#cbd5e1";    // Border line color

      // Helper function to draw Offer Letter Header on any page
      const drawHeader = () => {
        // 1. Top Decorative Brand Accent Bars
        doc.rect(0, 0, 595.28, 12).fill(primaryColor);
        doc.rect(0, 12, 595.28, 3).fill(accentColor);

        // 2. Corporate Header / Logo Block
        const logoX = 35;
        const logoY = 25;
        doc.circle(logoX + 15, logoY + 15, 15).fill(darkColor);
        doc.font("Helvetica-Bold").fontSize(12).fillColor("#ffffff")
          .text("Kp", logoX + 5, logoY + 9, { width: 20, align: "center" });

        doc.font("Helvetica-Bold").fontSize(18).fillColor(primaryColor)
          .text("Interns", logoX + 32, logoY + 4);

        doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor)
          .text("ACPSK TECHNOLOGY PVT LTD", logoX + 33, logoY + 23);

        // Top Right Contact Info
        const contactX = 300;
        const contactY = 22;
        const contactWidth = 260.28;
        const contactText = "Mob: +91 9204312848   |   Email: info@kpinterns.com\nAddress: Saraswati Nagar, Matsyagandha Road,\nPolice Line, Saharsa, Bihar - 852201";

        doc.font("Helvetica").fontSize(7).fillColor(mutedColor)
          .text(contactText, contactX, contactY, { align: "right", width: contactWidth, lineGap: 2 });

        // Header Line Separator
        doc.moveTo(35, 68).lineTo(560.28, 68).lineWidth(0.75).strokeColor(borderColor).stroke();
      };

      // Helper function to draw Offer Letter Footer on any page
      const drawFooter = (pageNum, totalPages) => {
        const accreditationDividerY = 785;
        const badgeY = 794;

        doc.moveTo(35, accreditationDividerY).lineTo(560.28, accreditationDividerY).lineWidth(0.5).strokeColor(borderColor).stroke();

        const badges = [
          { fileName: "Aicte.png", fallbackName: "Aicte.png", width: 38, height: 38 },
          { fileName: "mca.png", fallbackName: "mca.png", width: 75, height: 30 },
          { fileName: "Iso.png", fallbackName: "Iso.png", width: 38, height: 38 },
          { fileName: "Msme.png", fallbackName: "Msme.png", width: 38, height: 38 },
          { fileName: "nip.png", fallbackName: "nip.png", width: 60, height: 32 }
        ];

        let curBadgeX = 40;
        badges.forEach((b) => {
          const badgePath = resolvePublicAsset(b.fileName) || resolvePublicAsset(b.fallbackName);
          if (badgePath) {
            doc.image(badgePath, curBadgeX, badgeY, { fit: [b.width, b.height] });
          }
          curBadgeX += b.width + 35;
        });

        // Page Number
        doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor)
          .text(`Page ${pageNum} of ${totalPages}`, 35, 830, { align: "right", width: 525.28 });
      };

      // Initial page header
      drawHeader();

      let currentY = 78;

      // Report Header Section
      doc.font("Helvetica-Bold").fontSize(14).fillColor(darkColor)
        .text("STUDENT DIRECTORY REPORT", 35, currentY, { align: "center", width: 525.28 });

      currentY += 18;

      // Date & Filter Summary Box
      const reportDate = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      // Format Filter Summary
      const activeFilterPairs = [];
      if (activeFilters.university) activeFilterPairs.push(`University: ${activeFilters.university}`);
      if (activeFilters.college) activeFilterPairs.push(`College: ${activeFilters.college}`);
      if (activeFilters.department) activeFilterPairs.push(`Dept: ${activeFilters.department}`);
      if (activeFilters.degree) activeFilterPairs.push(`Degree: ${activeFilters.degree}`);
      if (activeFilters.session) activeFilterPairs.push(`Session: ${activeFilters.session}`);
      if (activeFilters.searchQuery) activeFilterPairs.push(`Search: "${activeFilters.searchQuery}"`);
      if (activeFilters.creator) activeFilterPairs.push(`Created By: ${activeFilters.creator}`);

      const filterSummaryStr = activeFilterPairs.length > 0
        ? activeFilterPairs.join("  |  ")
        : "All Registered Students";

      doc.rect(35, currentY, 525.28, 30).fill(wellColor);
      doc.rect(35, currentY, 525.28, 30).lineWidth(0.5).strokeColor(borderColor).stroke();

      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(primaryColor)
        .text(`Total Filtered Students: ${users.length}`, 45, currentY + 5);

      doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor)
        .text(`Generated On: ${reportDate}`, 300, currentY + 5, { align: "right", width: 250 });

      doc.font("Helvetica-Oblique").fontSize(7.5).fillColor(darkColor)
        .text(`Active Filters: ${filterSummaryStr}`, 45, currentY + 17, { width: 505.28, lineBreak: false, ellipsis: true });

      currentY += 38;

      if (users.length === 0) {
        doc.font("Helvetica").fontSize(11).fillColor(mutedColor)
          .text("No student profiles found matching the current filter criteria.", 35, currentY + 30, { align: "center", width: 525.28 });
      }

      // Render Each Student Card sequentially
      users.forEach((user, idx) => {
        const cardHeight = 116;
        const pageMaxY = 770;

        // Page Break Check
        if (currentY + cardHeight > pageMaxY) {
          doc.addPage();
          drawHeader();
          currentY = 78;
        }

        const cardY = currentY;

        // Card Container Box
        doc.rect(35, cardY, 525.28, cardHeight).fill("#ffffff");
        doc.rect(35, cardY, 525.28, cardHeight).lineWidth(0.75).strokeColor(borderColor).stroke();

        // Card Header Bar inside box
        doc.rect(35, cardY, 525.28, 18).fill(wellColor);
        doc.moveTo(35, cardY + 18).lineTo(560.28, cardY + 18).lineWidth(0.5).strokeColor(borderColor).stroke();

        // Sequence badge & Student Name
        doc.font("Helvetica-Bold").fontSize(9.5).fillColor(primaryColor)
          .text(`#${idx + 1}.  ${user.fullName || "N/A"}`, 42, cardY + 4);

        // Gender / Reg No tag on top right
        const topTag = user.gender ? `${user.gender}` : "";
        doc.font("Helvetica-Bold").fontSize(8.5).fillColor(darkColor)
          .text(topTag, 400, cardY + 4, { align: "right", width: 152 });

        // Data Rows inside Card
        let rowY = cardY + 22;

        // Row 1: University & College
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(mutedColor).text("University: ", 45, rowY);
        doc.font("Helvetica").fontSize(7.5).fillColor(darkColor).text(user.university || "N/A", 95, rowY, { width: 175, lineBreak: false, ellipsis: true });

        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(mutedColor).text("College / Inst: ", 275, rowY);
        doc.font("Helvetica").fontSize(7.5).fillColor(darkColor).text(user.college || "N/A", 345, rowY, { width: 210, lineBreak: false, ellipsis: true });

        rowY += 14;

        // Row 2: Reg No / Roll No & Department / Degree
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(mutedColor).text("Reg No / Roll: ", 45, rowY);
        const regRoll = `${user.registrationNumber || "N/A"} ${user.rollNumber ? `(${user.rollNumber})` : ""}`;
        doc.font("Helvetica").fontSize(7.5).fillColor(darkColor).text(regRoll, 110, rowY, { width: 160, lineBreak: false, ellipsis: true });

        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(mutedColor).text("Dept & Degree: ", 275, rowY);
        const deptDeg = `${user.department || "N/A"} - ${user.degree || "N/A"}`;
        doc.font("Helvetica").fontSize(7.5).fillColor(darkColor).text(deptDeg, 345, rowY, { width: 210, lineBreak: false, ellipsis: true });

        rowY += 14;

        // Row 3: Session / Semester & Contact (Email & Phone)
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(mutedColor).text("Session / Sem: ", 45, rowY);
        const sessSem = `${user.session || "N/A"} ${user.semester ? `(Sem: ${user.semester})` : ""}`;
        doc.font("Helvetica").fontSize(7.5).fillColor(darkColor).text(sessSem, 115, rowY, { width: 155, lineBreak: false, ellipsis: true });

        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(mutedColor).text("Email & Phone: ", 275, rowY);
        const contact = `${user.email || "N/A"} | ${user.phone || "N/A"}`;
        doc.font("Helvetica").fontSize(7.5).fillColor(darkColor).text(contact, 345, rowY, { width: 210, lineBreak: false, ellipsis: true });

        rowY += 14;

        // Row 4: Enrolled Internships / Courses
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(mutedColor).text("Enrolments: ", 45, rowY);
        const internshipsList = (user.ActiveInternship || [])
          .map((i) => i.internship?.title || i.title || "Internship")
          .join(", ");
        const coursesList = (user.ActiveCources || [])
          .map((c) => c.course?.title || c.title || "Course")
          .join(", ");
        const enrollments = [internshipsList, coursesList].filter(Boolean).join(" | ") || "Self Registered / None";

        doc.font("Helvetica").fontSize(7.5).fillColor(darkColor).text(enrollments, 105, rowY, { width: 445, lineBreak: false, ellipsis: true });

        rowY += 14;

        // Row 5: Created By / Account Creator
        doc.font("Helvetica-Bold").fontSize(7.5).fillColor(mutedColor).text("Created By: ", 45, rowY);
        const creatorName = user.creatorInfo?.name
          ? `${user.creatorInfo.name} (${user.creatorInfo.role || "Admin"})`
          : (user.createdBy || "Self Registered");
        doc.font("Helvetica").fontSize(7.5).fillColor(primaryColor).text(creatorName, 100, rowY, { width: 450, lineBreak: false, ellipsis: true });

        rowY += 14;

        // Row 6: Generated Document Links (Clickable PDF Hyperlinks)
        const generatedDocs = [];
        (user.ActiveInternship || []).forEach((i) => {
          if (i?.offerLetterUrl && typeof i.offerLetterUrl === "string" && i.offerLetterUrl.trim()) {
            generatedDocs.push({
              label: `Offer Letter (${i.offerLetterId || "Link"})`,
              url: i.offerLetterUrl.trim(),
              type: "offer",
            });
          }
          if (i?.certificationUrl && typeof i.certificationUrl === "string" && i.certificationUrl.trim()) {
            generatedDocs.push({
              label: `Certificate (${i.certificateId || "Link"})`,
              url: i.certificationUrl.trim(),
              type: "cert",
            });
          }
        });

        (user.ActiveCources || []).forEach((c) => {
          if (c?.certificateUrl && typeof c.certificateUrl === "string" && c.certificateUrl.trim()) {
            generatedDocs.push({
              label: `Course Cert (${c.certificateId || "Link"})`,
              url: c.certificateUrl.trim(),
              type: "cert",
            });
          }
        });

        if (generatedDocs.length > 0) {
          doc.font("Helvetica-Bold").fontSize(7.5).fillColor(mutedColor)
            .text("Documents: ", 45, rowY, { continued: true });

          generatedDocs.forEach((docItem, dIdx) => {
            const isLast = dIdx === generatedDocs.length - 1;
            const linkColor = docItem.type === "cert" ? "#059669" : "#2563eb";
            const linkUrl = docItem.url;

            doc.font("Helvetica-Bold").fontSize(7.5).fillColor(linkColor)
              .text(docItem.label, {
                link: linkUrl,
                underline: true,
                continued: !isLast,
              });

            if (!isLast) {
              doc.font("Helvetica").fontSize(7.5).fillColor(mutedColor)
                .text("   |   ", {
                  link: null,
                  underline: false,
                  continued: true,
                });
            }
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(7.5).fillColor(mutedColor)
            .text("Documents: ", 45, rowY, { continued: true });
          doc.font("Helvetica-Oblique").fontSize(7.5).fillColor(mutedColor)
            .text("Pending / Not Generated Yet", { continued: false });
        }

        currentY += cardHeight + 8;
      });

      // Draw footer on all buffered pages
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        drawFooter(i + 1, range.count);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}