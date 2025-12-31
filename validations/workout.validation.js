import Joi from "joi";

const getTodayWorkoutSchema = {
  query: Joi.object().keys({
    workoutDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
  })
  
};



export { getTodayWorkoutSchema };
