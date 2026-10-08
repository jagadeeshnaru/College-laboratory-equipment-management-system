const { body, validationResult } = require('express-validator');

// Helper to check validation results
const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  };
};

// Equipment Validation Rules
const equipmentValidationRules = [
  body('name').trim().notEmpty().withMessage('Equipment name is required'),
  body('category_id').isInt({ min: 1 }).withMessage('Valid Category ID is required'),
  body('lab_id').isInt({ min: 1 }).withMessage('Valid Laboratory ID is required'),
  body('status')
    .optional()
    .isIn(['Available', 'In Use', 'Under Maintenance', 'Damaged'])
    .withMessage('Status must be Available, In Use, Under Maintenance, or Damaged')
];

// Allocation Validation Rules
const allocationValidationRules = [
  body('equipment_id').isInt({ min: 1 }).withMessage('Valid Equipment ID is required'),
  body('allocated_to_name').trim().notEmpty().withMessage('Allocated To Name is required'),
  body('from_date').trim().notEmpty().withMessage('From Date is required'),
  body('to_date').trim().notEmpty().withMessage('To Date is required')
];

// Damage Report Validation Rules
const damageReportValidationRules = [
  body('equipment_id').isInt({ min: 1 }).withMessage('Valid Equipment ID is required'),
  body('issue_description').trim().notEmpty().withMessage('Issue description is required'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Priority must be Low, Medium, High, or Critical')
];

// Maintenance Update Validation Rules
const maintenanceUpdateValidationRules = [
  body('status')
    .optional()
    .isIn(['Under Maintenance', 'In Progress', 'Resolved', 'Cancelled'])
    .withMessage('Invalid maintenance status')
];

module.exports = {
  validate,
  equipmentValidationRules,
  allocationValidationRules,
  damageReportValidationRules,
  maintenanceUpdateValidationRules
};
