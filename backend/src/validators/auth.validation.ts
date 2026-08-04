import { body } from "express-validator";

export const registerValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),

  body("enrollmentNumber")
    .trim()
    .notEmpty()
    .withMessage("Enrollment number is required"),

  body("email")
    .isEmail()
    .withMessage("Invalid email"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters"),
];

export const loginValidation = [
  body("enrollmentNumber")
    .trim()
    .notEmpty()
    .withMessage("Enrollment number is required"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];