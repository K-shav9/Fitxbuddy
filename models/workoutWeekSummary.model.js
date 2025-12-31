import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class workoutWeekSummary extends Model { }

    workoutWeekSummary.init(
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
            weekNumber: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            summary: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'WorkoutWeekSummary',
            tableName: 'workout_week_summaries',
            timestamps: true, // createdAt, updatedAt
            underscored: true, // maps camelCase fields to snake_case DB columns
        }
    );

    return workoutWeekSummary;
};
