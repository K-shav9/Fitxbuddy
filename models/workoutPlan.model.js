import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class WorkoutPlan extends Model { }

    WorkoutPlan.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            startDate: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            endDate: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            durationDays: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            durationWeeks: {
                type: DataTypes.INTEGER,
                allowNull: true,
              },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            aiGenerated: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            workoutGoal: {
                type: DataTypes.STRING, // Example: 'fat_loss', 'muscle_gain'
                allowNull: true,
            },
            totalWorkouts: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            totalTime: {
                type: DataTypes.STRING, // You can use hh:mm:ss format, or store as minutes
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'WorkoutPlan',
            tableName: 'workout_plans',
            timestamps: true,
        }
    );

    return WorkoutPlan;
};


// durationWeeks: Math.ceil(durationDays / 7)
