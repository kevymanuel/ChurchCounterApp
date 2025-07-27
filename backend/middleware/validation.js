const { body, param, validationResult } = require('express-validator');

// Validation middleware to check for errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Validation rules for auditorium capacity
const validateAuditoriumCapacity = [
  body('capacity')
    .isInt({ min: 1, max: 100000 })
    .withMessage('Capacity must be a number between 1 and 100,000')
    .trim()
    .escape(),
  handleValidationErrors
];

// Validation rules for section creation
const validateSectionCreation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Section name must be between 1 and 100 characters')
    .trim()
    .escape()
    .custom((value) => {
      // Explicitly check for disallowed characters
      const disallowedChars = /[+*\/\\|{}[\]()<>"':;,.!@#$%^&?=]/;
      if (disallowedChars.test(value)) {
        throw new Error('Section name contains invalid characters. Only letters, numbers, spaces, hyphens (-), and underscores (_) are allowed.');
      }
      return true;
    })
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Section name can only contain letters, numbers, spaces, hyphens (-), and underscores (_). Special characters like +, *, /, etc. are not allowed.'),
  handleValidationErrors
];

// Validation rules for section ID parameter
const validateSectionId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Section ID must be a positive integer'),
  handleValidationErrors
];

// Validation rules for file uploads
const validateFileUpload = [
  body()
    .custom((value, { req }) => {
      if (!req.files || req.files.length === 0) {
        throw new Error('At least one file is required');
      }
      
      if (req.files.length > 3) {
        throw new Error('Maximum 3 files allowed per section');
      }
      
      // Check file types
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      for (const file of req.files) {
        if (!allowedTypes.includes(file.mimetype)) {
          throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        }
        
        if (file.size > maxSize) {
          throw new Error(`File too large. Maximum size: 5MB`);
        }
      }
      
      return true;
    }),
  handleValidationErrors
];

module.exports = {
  validateAuditoriumCapacity,
  validateSectionCreation,
  validateSectionId,
  validateFileUpload,
  handleValidationErrors
}; 