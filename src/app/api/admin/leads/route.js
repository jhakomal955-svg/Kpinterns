/**
 * Admin & Employee Lead Management API Route
 * GET - List paginated leads with status filtering and search
 * POST - Manually create a lead from admin dashboard
 */

import connectDB from "@/lib/mongodb";
import { createModel } from "@/lib/utils/schemaBuilder";
import { LeadModel, UserModel } from "@/models";
import { verifyAuth } from "@/lib/jwt";

export async function GET(request) {
  try {
    await connectDB();

    // Authenticate Admin and Employee roles
    const auth = verifyAuth(request, ["Admin", "Employee"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const skip = (page - 1) * limit;

    const Lead = createModel("Lead", LeadModel);
    const User = createModel("User", UserModel);

    // Auto-purge any converted leads or leads belonging to already registered users
    const registeredUsers = await User.find({}).select("email phone").lean();
    const registeredEmails = registeredUsers.map((u) => u.email?.trim().toLowerCase()).filter(Boolean);
    const registeredPhones = registeredUsers.map((u) => u.phone?.trim()).filter(Boolean);

    const purgeConditions = [{ status: "Converted" }];
    if (registeredEmails.length > 0) purgeConditions.push({ email: { $in: registeredEmails } });
    if (registeredPhones.length > 0) purgeConditions.push({ phone: { $in: registeredPhones } });

    await Lead.deleteMany({ $or: purgeConditions });

    // Build filter query
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { college: searchRegex },
        { university: searchRegex },
        { internshipDomain: searchRegex },
      ];
    }

    // Fetch leads and stats in parallel
    const [leads, totalCount, statsRaw] = await Promise.all([
      Lead.find(filter)
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(filter),
      Lead.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format stats map
    const statsMap = {
      total: 0,
      New: 0,
      Contacted: 0,
      "Follow-up": 0,
      Converted: 0,
      Lost: 0,
    };

    statsRaw.forEach((item) => {
      if (item._id && statsMap.hasOwnProperty(item._id)) {
        statsMap[item._id] = item.count;
      }
      statsMap.total += item.count;
    });

    return Response.json(
      {
        success: true,
        data: leads,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit) || 1,
        },
        stats: statsMap,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin leads:", error);
    return Response.json(
      { error: "Failed to fetch leads", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const auth = verifyAuth(request, ["Admin", "Employee"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const data = await request.json();
    const Lead = createModel("Lead", LeadModel);

    const newLead = await Lead.create({
      ...data,
      source: data.source || "Manual Entry",
    });

    return Response.json(
      {
        success: true,
        message: "Lead created successfully",
        data: newLead,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating manual lead:", error);
    return Response.json(
      { error: "Failed to create lead", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const auth = verifyAuth(request, ["Admin", "Employee"]);
    if (!auth.authenticated) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "cleanup-junk") {
      const Lead = createModel("Lead", LeadModel);

      // Junk lead criteria:
      // 1. Both email AND phone are missing/empty
      // OR
      // 2. Name is shorter than 3 characters AND both contact methods (email/phone) are missing/empty
      const junkFilter = {
        $or: [
          {
            $and: [
              { $or: [{ email: { $exists: false } }, { email: null }, { email: "" }] },
              { $or: [{ phone: { $exists: false } }, { phone: null }, { phone: "" }] },
            ],
          },
          {
            $and: [
              {
                $or: [
                  { fullName: { $exists: false } },
                  { fullName: null },
                  { fullName: "" },
                  { $expr: { $lt: [{ $strLenCP: { $ifNull: ["$fullName", ""] } }, 3] } },
                ],
              },
              { $or: [{ email: { $exists: false } }, { email: null }, { email: "" }] },
              { $or: [{ phone: { $exists: false } }, { phone: null }, { phone: "" }] },
            ],
          },
        ],
      };

      const result = await Lead.deleteMany(junkFilter);

      return Response.json(
        {
          success: true,
          message: `Successfully cleaned up ${result.deletedCount} junk leads`,
          deletedCount: result.deletedCount,
        },
        { status: 200 }
      );
    }

    return Response.json(
      { error: "Invalid delete action provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error during junk lead cleanup:", error);
    return Response.json(
      { error: "Failed to delete junk leads", details: error.message },
      { status: 500 }
    );
  }
}
