import { body, param, validationResult } from 'express-validator'

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    })
  }
  next()
}

// Post validation rules
export const validatePost = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be between 1-200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  body('author')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Author must be less than 100 characters'),
  body('slug')
    .optional()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  handleValidationErrors
]

// Sermon validation rules
export const validateSermon = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be between 1-200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  body('pastor')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Pastor name must be less than 100 characters'),
  body('summary')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Summary must be less than 500 characters'),
  body('slug')
    .optional()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  handleValidationErrors
]

// Priest validation rules
export const validatePriest = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be between 1-100 characters'),
  body('role')
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Role must be less than 100 characters'),
  body('email')
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),
  body('phone')
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .isMobilePhone()
    .withMessage('Must be a valid phone number'),
  body('order')
    .optional({ checkFalsy: true, nullable: true })
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  handleValidationErrors
]

// Gallery item validation rules
export const validateGalleryItem = [
  body('url')
    .trim()
    .isURL()
    .withMessage('URL is required and must be valid'),
  body('event')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Event name must be less than 100 characters'),
  handleValidationErrors
]

// ID parameter validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
]

// Home content validation
export const validateHomeContent = [
  body('heroTitle')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Hero title must be less than 200 characters'),
  body('heroSubtitle')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Hero subtitle must be less than 500 characters'),
  handleValidationErrors
]

// About content validation
export const validateAboutContent = [
  body('history')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('History must be less than 5000 characters'),
  body('mission')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Mission must be less than 2000 characters'),
  handleValidationErrors
]

// Contact content validation
export const validateContactContent = [
  body('address')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Address must be less than 300 characters'),
  body('phone')
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .isMobilePhone()
    .withMessage('Must be a valid phone number'),
  body('email')
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),
  handleValidationErrors
]