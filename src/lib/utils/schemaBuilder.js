/**
 * Schema Builder Utility
 * Converts model definitions to Mongoose schemas
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * Build a Mongoose schema from a model definition object
 * @param {object} modelDefinition - The model object with field definitions
 * @returns {mongoose.Schema}
 */
export function buildSchema(modelDefinition) {
  // Create a new schema with the model definition
  // Add timestamps automatically and disable versionKey to prevent VersionErrors on concurrent updates
  const schema = new mongoose.Schema(modelDefinition, {
    timestamps: true,
    versionKey: false,
  });

  return schema;
}

/**
 * Create a Mongoose model from a model definition
 * @param {string} modelName - Name of the model
 * @param {object} modelDefinition - The model object with field definitions
 * @returns {mongoose.Model}
 */
export function createModel(modelName, modelDefinition) {
  // Check if model already exists to avoid overwriting
  if (mongoose.models[modelName]) {
    // In Next.js development mode, hot-reloading keeps the compiled Mongoose models cached in memory.
    // To ensure any schema changes made during development are immediately recognized, we delete the cached model.
    if (process.env.NODE_ENV === "development") {
      delete mongoose.models[modelName];
    } else {
      return mongoose.models[modelName];
    }
  }

  const schema = buildSchema(modelDefinition);

  // Attach pre-save password hashing hook to User and Admin models
  if (modelName === "User" || modelName === "Admin") {
    schema.pre("save", async function() {
      if (!this.isModified("password")) return;
      // Do not re-hash if password is already a bcrypt hash
      if (
        typeof this.password === "string" &&
        (this.password.startsWith("$2a$") ||
          this.password.startsWith("$2b$") ||
          this.password.startsWith("$2y$"))
      ) {
        return;
      }
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    });
  }

  return mongoose.model(modelName, schema);
}
