/**
 * Schema Builder Utility
 * Converts model definitions to Mongoose schemas
 */

import mongoose from "mongoose";

/**
 * Build a Mongoose schema from a model definition object
 * @param {object} modelDefinition - The model object with field definitions
 * @returns {mongoose.Schema}
 */
export function buildSchema(modelDefinition) {
  // Create a new schema with the model definition
  // Add timestamps automatically
  const schema = new mongoose.Schema(modelDefinition, {
    timestamps: true,
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
  return mongoose.model(modelName, schema);
}
