import Joi from "joi";

const addOnBoardSchema = {
  body: Joi.object().keys({
    fullName: Joi.string()
      .min(2)
      .optional()
      .messages({
        'string.min': 'Full name must be at least 2 characters',
      }),

    dob: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .custom((value, helpers) => {
        const date = new Date(value);
        const now = new Date();
        if (isNaN(date.getTime())) {
          return helpers.message('Date of birth must be a valid date');
        }
        if (date >= now) {
          return helpers.message('Date of birth must be in the past');
        }
        return value;
      })
      .optional()
      .messages({
        'string.pattern.base': 'Date of birth must be in ISO format (YYYY-MM-DD)',
      }),


    gender: Joi.string()
      .valid('male', 'female', 'other')
      .optional()
      .allow(null, '')
      .messages({
        'any.only': 'Gender must be one of [male, female, other]',
        'string.base': 'Gender must be a string',
      }),

    height: Joi.number()
      .positive()
      .precision(2)
      .optional()
      .messages({
        'number.base': 'Height must be a number',
        'number.positive': 'Height must be a positive number',
      }),
    heightUnit: Joi.string()
      // .valid('cm', 'in')
      .optional()
      .messages({
        'any.only': 'Height unit must be one of [cm, in]',
        'string.base': 'Height unit must be a string',
      }),

    weight: Joi.number()
      .positive()
      .precision(2)
      .optional()
      .messages({
        'number.base': 'Weight must be a number',
        'number.positive': 'Weight must be a positive number',
      }),

    weightUnit: Joi.string()
      // .valid('kg', 'lb')
      .optional()
      .messages({
        'any.only': 'Weight unit must be one of [kg, lb]',
        'string.base': 'Weight unit must be a string',
      }),

    fitnessLevel: Joi.string()
      .valid('beginner', 'intermediate', 'advanced')
      .optional()
      .allow(null, '')
      .messages({
        'any.only': 'Invalid fitness level',
      }),

    fitnessGoal: Joi.string()
      .valid('buildStrength', 'weightLoss', 'buildEndurance', 'improveFlexibility', 'overallHealth', 'stressBusting', 'custom')
      .optional()
      .allow(null, '')
      .messages({
        'any.only': 'Invalid fitness goal',
      }),

    customGoal: Joi.string().min(3).optional().allow(null),

    durationCategory: Joi.string()
      .valid('quick', 'standard', 'extended', 'advanced')
      .optional()
      .messages({
        'any.only': 'Duration category must be one of [Quick, Standard, Extended, Advanced]',
        'string.base': 'Duration category must be a string',
      }),

    equipment: Joi.array()
      .items(Joi.string().required())
      .optional()
      .allow(null)
      .messages({
        'array.base': 'Equipment must be an array',
        'string.base': 'Each equipment item must be a string',
      }),

    medicalConsiderations: Joi.string()
      .max(1000)
      .optional()
      .allow(null, '')
      .messages({
        'string.max': 'Medical considerations too long',
      }),

    onBoardStep: Joi.number()
      .integer()
      .positive()
      .valid(1, 2, 3, 4, 5)
      .messages({
        'number.base': 'Onboarding step must be a number',
        'number.empty': 'Onboarding step is required',
        'number.integer': 'Onboarding step must be an integer',
        'number.positive': 'Onboarding step must be a positive number',
        'any.only': 'Onboarding step must be one of [1, 2, 3, 4, 5]',
      }),
    customEquipment: Joi.string()
      .min(2)
      .optional()
      .allow(null, '')
      .messages({
        'string.min': 'Custom equipment must be at least 2 characters long',
        'string.base': 'Custom equipment must be a string',
      }),
  }),
};



const updateOnBoardSchema = {
  body: Joi.object().keys({
    fullName: Joi.string()
      .min(2)
      .optional()
      .messages({
        'string.min': 'Full name must be at least 2 characters',
      }),

    fitnessLevel: Joi.string()
      .valid('beginner', 'intermediate', 'advanced')
      .optional()
      .allow(null, '')
      .messages({
        'any.only': 'Invalid fitness level',
      }),

    fitnessGoal: Joi.string()
      // .valid('buildStrength', 'weightLoss', 'buildEndurance', 'improveFlexibility', 'overallHealth', 'stressBusting')
      .optional()
      .allow(null, '')
      .messages({
        'any.only': 'Invalid fitness goal',
      }),

    durationCategory: Joi.string()
      .valid('quick', 'standard', 'extended', 'advanced')
      // .optional()
      // .allow(null, '')
      .messages({
        'any.only': 'Duration category must be one of [Quick, Standard, Extended, Advanced]',
        'string.base': 'Duration category must be a string',
      }),

    equipment: Joi.array()
      .items(Joi.string().required())
      .optional()
      .allow(null)
      .messages({
        'array.base': 'Equipment must be an array',
        'string.base': 'Each equipment item must be a string',
      }),

    medicalConsiderations: Joi.string()
      .max(1000)
      .optional()
      .allow(null, '')
      .messages({
        'string.max': 'Medical considerations too long',
      }),
    // onBoardStep: Joi.number()
    //   .integer()
    //   .positive()
    //   .required()
    //   .valid(1, 2, 3, 4, 5)
    //   .messages({
    //     'number.base': 'Onboarding step must be a number',
    //     'number.empty': 'Onboarding step is required',
    //     'number.integer': 'Onboarding step must be an integer',
    //     'number.positive': 'Onboarding step must be a positive number',
    //     'any.only': 'Onboarding step must be one of [1, 2, 3, 4]',
    //   }),
  }),
};


export {
  addOnBoardSchema,
  updateOnBoardSchema
};
