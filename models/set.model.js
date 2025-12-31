import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class Set extends Model { }

    Set.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            workoutExerciseId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            reps: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            weightKg: {
                type: DataTypes.INTEGER,
                allowNull: true,
                field: 'weight_kg',
            },
            status: {
                type: DataTypes.ENUM('Scheduled', 'Complete'),
                defaultValue: 'Scheduled',
            },
        },
        {
            sequelize,
            modelName: 'Set',
            tableName: 'sets',
            timestamps: true,
            underscored: true,
        }
    );

    return Set;
};
