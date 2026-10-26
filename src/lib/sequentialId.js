import mongoose from "mongoose";
import connectDB from "./mongodb.js";
import { createModel } from "./utils/schemaBuilder.js";
import { UserModel, CourseModel, InternshipModel, CounterModel } from "../models/index.js";

/**
 * Atomically generates or retrieves the unique sequence ID for an enrollment subdocument.
 * Format: kpinterns/YYYY/NUMBER
 */
export async function getNextSequentialId(year = new Date().getFullYear(), subdocumentId = null) {
  try {
    await connectDB();
    const User = createModel("User", UserModel);
    const Counter = createModel("Counter", CounterModel);

    // 1. If subdocumentId is provided, check if an ID was already stored on this enrollment
    if (subdocumentId && mongoose.Types.ObjectId.isValid(subdocumentId)) {
      const targetId = new mongoose.Types.ObjectId(subdocumentId);
      const existingUser = await User.findOne({
        $or: [
          { "ActiveInternship._id": targetId },
          { "ActiveCources._id": targetId }
        ]
      }).lean();

      if (existingUser) {
        const item = (existingUser.ActiveInternship || []).find(i => i._id?.toString() === subdocumentId.toString())
          || (existingUser.ActiveCources || []).find(c => c._id?.toString() === subdocumentId.toString());

        if (item?.certificateId && item.certificateId.startsWith("kpinterns/")) {
          return item.certificateId;
        }
        if (item?.offerLetterId && item.offerLetterId.startsWith("kpinterns/")) {
          return item.offerLetterId;
        }
      }
    }

    // 2. Atomically increment the global counter
    const counterDoc = await Counter.findOneAndUpdate(
      { _id: "global_seq" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const seqNum = counterDoc.seq;
    return `kpinterns/${year}/${seqNum}`;
  } catch (error) {
    console.error("Error generating next sequential ID:", error);
    const fallbackSeq = Date.now().toString().slice(-6);
    return `kpinterns/${year}/${fallbackSeq}`;
  }
}

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

    if (!subdocumentId || !mongoose.Types.ObjectId.isValid(subdocumentId)) {
      return 1;
    }

    const targetId = new mongoose.Types.ObjectId(subdocumentId);

    // 1. Check if user subdocument already has a stored certificateId or offerLetterId
    const userWithSubdoc = await User.findOne({
      $or: [
        { "ActiveInternship._id": targetId },
        { "ActiveCources._id": targetId }
      ]
    }).lean();

    if (userWithSubdoc) {
      const item = (userWithSubdoc.ActiveInternship || []).find(i => i._id?.toString() === subdocumentId.toString())
        || (userWithSubdoc.ActiveCources || []).find(c => c._id?.toString() === subdocumentId.toString());

      const storedId = item?.certificateId || item?.offerLetterId;
      if (storedId) {
        const match = storedId.match(/\/(\d+)$/);
        if (match) {
          return parseInt(match[1], 10);
        }
      }
    }

    // 2. Fallback: query chronological position sorted by timestamp & ObjectId
    const allUsers = await User.find({
      $or: [
        { "ActiveInternship.0": { $exists: true } },
        { "ActiveCources.0": { $exists: true } }
      ]
    }).lean();

    const allSubdocs = [];
    for (const u of allUsers) {
      for (const i of u.ActiveInternship || []) {
        if (i._id) allSubdocs.push(i._id);
      }
      for (const c of u.ActiveCources || []) {
        if (c._id) allSubdocs.push(c._id);
      }
    }

    allSubdocs.sort((a, b) => {
      const tA = a.getTimestamp ? a.getTimestamp().getTime() : 0;
      const tB = b.getTimestamp ? b.getTimestamp().getTime() : 0;
      if (tA !== tB) return tA - tB;
      return a.toString().localeCompare(b.toString());
    });

    const targetStr = subdocumentId.toString();
    const idx = allSubdocs.findIndex(id => id.toString() === targetStr);
    return idx !== -1 ? idx + 1 : allSubdocs.length + 1;
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

    const cleanSeq = seqNum?.toString().trim();
    if (!cleanSeq) return null;

    // 1. Search directly in stored certificateId or offerLetterId
    const seqRegex = new RegExp(`/${cleanSeq}$`);
    const directUser = await User.findOne({
      $or: [
        { "ActiveInternship.certificateId": seqRegex },
        { "ActiveInternship.offerLetterId": seqRegex },
        { "ActiveCources.certificateId": seqRegex }
      ]
    }).lean();

    if (directUser) {
      const item = (directUser.ActiveInternship || []).find(
        i => (i.certificateId && seqRegex.test(i.certificateId)) || (i.offerLetterId && seqRegex.test(i.offerLetterId))
      ) || (directUser.ActiveCources || []).find(
        c => c.certificateId && seqRegex.test(c.certificateId)
      );

      if (item && item._id) {
        return item._id.toString();
      }
    }

    // 2. Chronological fallback by index
    const targetIdx = parseInt(cleanSeq, 10) - 1;
    if (isNaN(targetIdx) || targetIdx < 0) return null;

    const allUsers = await User.find({
      $or: [
        { "ActiveInternship.0": { $exists: true } },
        { "ActiveCources.0": { $exists: true } }
      ]
    }).lean();

    const allSubdocs = [];
    for (const u of allUsers) {
      for (const i of u.ActiveInternship || []) {
        if (i._id) allSubdocs.push(i._id);
      }
      for (const c of u.ActiveCources || []) {
        if (c._id) allSubdocs.push(c._id);
      }
    }

    allSubdocs.sort((a, b) => {
      const tA = a.getTimestamp ? a.getTimestamp().getTime() : 0;
      const tB = b.getTimestamp ? b.getTimestamp().getTime() : 0;
      if (tA !== tB) return tA - tB;
      return a.toString().localeCompare(b.toString());
    });

    if (targetIdx < allSubdocs.length) {
      return allSubdocs[targetIdx].toString();
    }

    return null;
  } catch (error) {
    console.error("Error getting ObjectId from sequential number:", error);
    return null;
  }
}
