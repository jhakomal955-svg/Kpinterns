/**
 * Models Index
 * Central export file for all models
 */

const UserModel = require("./UserModel");
const AdminModel = require("./AdminModel");
const ContactModel = require("./Contact");
const CourseModel = require("./Course");
const InternshipModel = require("./Internship");

module.exports = {
  UserModel,
  AdminModel,
  ContactModel,
  CourseModel,
  InternshipModel,
};
