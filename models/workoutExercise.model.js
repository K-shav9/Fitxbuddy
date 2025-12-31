import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class WorkoutExercise extends Model { }

    WorkoutExercise.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            workoutId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            exerciseName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            exerciseId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            equipment: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            orderIndex: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'WorkoutExercise',
            tableName: 'workout_exercises',
            timestamps: true,
            underscored: true,
        }
    );

    return WorkoutExercise;
};
