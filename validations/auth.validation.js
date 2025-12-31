import Joi from "joi";

const signupJoiSchema = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(6)
      .max(30)
      .pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w]).*$/)
      .message(
        "Password must include a number, lowercase and uppercase letter, and a special character!"
      )
      .required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Confirm Password must match the password",
      }),
    userType: Joi.string()
      .valid("superAdmin", "admin", "doctor", "patient")
      .optional(),
  }),
};


const loginJoiSchema = {
  body: Joi.object().keys({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': "Email is required",
        'string.email': "Email must be valid",
        'any.required': "Email is required"
      }),
    password: Joi.string()
      .required()
      .messages({
        'string.empty': "Password is required",
        'any.required': "Password is required",
      }),
  }),
};

const addOnBoardSchema = {
  body: Joi.object().keys({
    fullName: Joi.string()
      .min(2)
      .optional()
      .messages({
        'string.min': 'Full name must be at least 2 characters',
      }),

    dob: Joi.date()
      .iso()
      .less('now')
      .optional()
      .messages({
        'date.base': 'Date of birth must be a valid date',
        'date.isoDate': 'Date of birth must be in ISO format (YYYY-MM-DD)',
        'date.less': 'Date of birth must be in the past',
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

    weight: Joi.number()
      .positive()
      .precision(2)
      .optional()
      .messages({
        'number.base': 'Weight must be a number',
        'number.positive': 'Weight must be a positive number',
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

    customGoal: Joi.string()
      .min(2)
      .when('fitnessGoal', {
        is: 'custom',
        then: Joi.required().messages({
          'any.required': 'Custom goal is required when fitness goal is set to custom',
          'string.min': 'Custom goal must be at least 2 characters long',
          'string.base': 'Custom goal must be a string',
        }),
        otherwise: Joi.forbidden().messages({
          'any.unknown': 'Custom goal is only allowed when fitness goal is set to custom',
        }),
      }),

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
      .valid('buildStrength', 'weightLoss', 'buildEndurance', 'improveFlexibility', 'overallHealth', 'stressBusting')
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

const socialLoginJoiSchema = {
  body: Joi.object().keys({
    authProvider: Joi.string().valid("android", "ios", "app").required(),
    accessToken: Joi.string().when("authProvider", {
      is: "ios",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    id: Joi.string(),
    email: Joi.string().email().lowercase(),
    name: Joi.string(),
    firstName: Joi.string().allow('').when("authProvider", {
      is: "ios",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    lastName: Joi.string().allow('').when("authProvider", {
      is: "ios",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),
};


const forgetPasswordJoiSchema = {
  body: Joi.object().keys({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),
  }),
};


const resetPasswordSchema = {
  query: Joi.object({
    token: Joi.string().required().messages({
      "string.empty": "Reset token is required",
      "any.required": "Reset token is required",
    }),
  }),
  body: Joi.object({
    newPassword: Joi.string()
      .min(6)
      .max(30)
      .pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w]).*$/)
      .required()
      .messages({
        "string.pattern.base":
          "Password must include a number, lowercase and uppercase letter, and a special character!",
        "string.min": "Password must be at least 6 characters long",
        "string.max": "Password must be at most 30 characters long",
        "string.empty": "Password is required",
      }),

    // confirmPassword: Joi.string()
    //   .valid(Joi.ref("newPassword"))
    //   .required()
    //   .messages({
    //     "any.only": "Confirm Password must match the password",
    //     "string.empty": "Confirm Password is required",
    //   }),
  }),
};

export {
  signupJoiSchema,
  loginJoiSchema,
  socialLoginJoiSchema,
  forgetPasswordJoiSchema,
  resetPasswordSchema,
  addOnBoardSchema,
  updateOnBoardSchema
};
