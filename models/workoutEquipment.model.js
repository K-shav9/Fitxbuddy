import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class workoutEquipment extends Model { }

    workoutEquipment.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            fitnessProfileId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            isCustom: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            sequelize,
            modelName: 'workoutEquipment',
            tableName: 'workout_equipment',
            timestamps: true,
        }
    );

    return workoutEquipment;
};
