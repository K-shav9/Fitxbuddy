import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class Workout extends Model { }

    Workout.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            workoutPlanId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            durationInMinutes: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            scheduledDate: {
                type: DataTypes.STRING, // Format: 'YYYY-MM-DD'
                allowNull: false,
            },
            weekNumber: {
                type: DataTypes.INTEGER,
                allowNull: false, // e.g., 1 to 6 (if 6-week plan)
            },
            type: {
                type: DataTypes.ENUM('Strength', 'Cardio', 'Flexibility', 'Custom'),
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM('Scheduled', 'Complete', 'Skipped'),
                defaultValue: 'Scheduled',
                allowNull: false,
            },
            isRegenerated: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            checkinId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            trackerId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            logNotes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            logMode: {
                type: DataTypes.ENUM('structured', 'quick'),
                allowNull: true,
            },
            logType: {
                type: DataTypes.ENUM('Strength', 'Cardio', 'Flexibility', 'Custom'),
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Workout',
            tableName: 'workouts',
            timestamps: true,
        }
    );

    return Workout;
};
