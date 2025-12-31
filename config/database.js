import dotenv from "dotenv";
const envPath = `config/.env.${process.env.NODE_ENV || 'local'}`;
dotenv.config({ path: envPath });
import { Sequelize, DataTypes } from 'sequelize';
import AppError from '../utils/errorHandler.js';
import UserModel from '../models/user.model.js';
import fitnessProfileModel from "../models/fitnessProfile.model.js";
import workoutEquipmentModel from "../models/workoutEquipment.model.js";
import passwordResetTokenModel from "../models/passwordResetToken.model.js";
import availableEquipmentModel from "../models/availableEquipment.model.js";
import setModel from "../models/set.model.js";
import workoutModel from "../models/workout.model.js";
import workoutExerciseModel from "../models/workoutExercise.model.js";
import workoutPlanModel from "../models/workoutPlan.model.js";
import workoutWeekSummaryModel from "../models/workoutWeekSummary.model.js";
import availableExerciseModel from "../models/availableExercise.model.js";


// Load .env variables
const {
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  POOL_MAX = 5,
  POOL_MIN = 0,
  POOL_ACQUIRE = 30000,
  POOL_IDLE = 10000,
} = process.env;

// console.log("Database Connection Details:-------");

// console.log("Host:", DB_HOST);
// console.log("Port:", DB_PORT);
// console.log("Username:", DB_USERNAME);
// console.log("Password:", DB_PASSWORD);
// console.log("Database Name:", DB_NAME);



// Validate ENV vars
if (!DB_HOST || !DB_PORT || !DB_USERNAME || !DB_PASSWORD || !DB_NAME) {
  // throw new AppError('❌ Missing necessary database environment variables.', 400);
  console.log('❌ Missing necessary database environment variables.');

}

// Setup Sequelize
const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'postgres', // changed here
  logging: false,
  pool: {
    max: parseInt(POOL_MAX),
    min: parseInt(POOL_MIN),
    acquire: parseInt(POOL_ACQUIRE),
    idle: parseInt(POOL_IDLE),
  },
});

// Init Models
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = UserModel(sequelize, DataTypes);
db.FitnessProfile = fitnessProfileModel(sequelize, DataTypes);
db.WorkoutEquipment = workoutEquipmentModel(sequelize, DataTypes);
db.PasswordResetToken = passwordResetTokenModel(sequelize, DataTypes);
db.AvailableEquipment = availableEquipmentModel(sequelize, DataTypes);
db.AvailableExercise = availableExerciseModel(sequelize, DataTypes);
db.Set = setModel(sequelize, DataTypes);
db.Workout = workoutModel(sequelize, DataTypes);
db.WorkoutExercise = workoutExerciseModel(sequelize, DataTypes);
db.WorkoutPlan = workoutPlanModel(sequelize, DataTypes);
db.WorkoutWeekSummary = workoutWeekSummaryModel(sequelize, DataTypes);



// Define associations here if needed
// Example:
db.User.hasOne(db.FitnessProfile, { foreignKey: 'userId' });
db.FitnessProfile.belongsTo(db.User, { foreignKey: 'userId' });

db.FitnessProfile.hasMany(db.WorkoutEquipment, {
  foreignKey: 'fitnessProfileId', onDelete: 'CASCADE', as: 'equipment'
});
db.WorkoutEquipment.belongsTo(db.FitnessProfile, { foreignKey: 'fitnessProfileId' });

db.User.hasOne(db.WorkoutPlan, { foreignKey: 'userId' });
db.WorkoutPlan.belongsTo(db.User, { foreignKey: 'userId' });

db.WorkoutPlan.hasMany(db.Workout, { foreignKey: 'workoutPlanId', as: 'workout' });
db.Workout.belongsTo(db.WorkoutPlan, { foreignKey: 'workoutPlanId' });

db.WorkoutPlan.hasMany(db.WorkoutWeekSummary, { foreignKey: 'workoutPlanId', as: 'weekSummaries' });
db.WorkoutWeekSummary.belongsTo(db.WorkoutPlan, { foreignKey: 'workoutPlanId' });

db.Workout.hasMany(db.WorkoutExercise, { foreignKey: 'workoutId', as: 'exercises' });
db.WorkoutExercise.belongsTo(db.Workout, { foreignKey: 'workoutId' });

db.WorkoutExercise.hasMany(db.Set, { foreignKey: 'workoutExerciseId' });
db.Set.belongsTo(db.WorkoutExercise, { foreignKey: 'workoutExerciseId' });


db.AvailableExercise.hasMany(db.WorkoutExercise, { foreignKey: 'exerciseId' });
db.WorkoutExercise.belongsTo(db.AvailableExercise, { foreignKey: 'exerciseId', as: 'aboutExercise', });

/**
 * Connect to the database and sync models
 */
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected Successfully!');
    await sequelize.sync({ alter: true });
    console.log('✅ Database Synced Successfully.');
  } catch (error) {
    console.error('❌ SQL Connection Error:', error);
    process.exit(1);
  }
};

connectToDatabase()

export { sequelize, db };
