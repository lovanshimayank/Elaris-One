import { body } from "express-validator";

export const createNoteValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 200 })
    .withMessage("Title must be under 200 characters"),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description must be under 2000 characters"),

  body("subjectId")
    .trim()
    .notEmpty()
    .withMessage("Subject is required"),

  body("semester")
    .notEmpty()
    .withMessage("Semester is required")
    .isInt({ min: 1, max: 12 })
    .withMessage("Semester must be a number between 1 and 12"),

  body("branch")
    .trim()
    .notEmpty()
    .withMessage("Branch is required"),

  body("pdfUrl")
    .trim()
    .notEmpty()
    .withMessage("A PDF file/URL is required")
    .isString()
    .withMessage("pdfUrl must be a string"),
];

export const updateNoteValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 200 })
    .withMessage("Title must be under 200 characters"),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description must be under 2000 characters"),

  body("subjectId")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Subject cannot be empty"),

  body("semester")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("Semester must be a number between 1 and 12"),

  body("branch")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Branch cannot be empty"),

  body("pdfUrl")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("pdfUrl cannot be empty"),
];
