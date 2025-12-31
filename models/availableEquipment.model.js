import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class availableEquipment extends Model { }

    availableEquipment.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'AvailableEquipment',
            tableName: 'available_equipments',
            timestamps: true,
        }
    );

    return availableEquipment;
};
