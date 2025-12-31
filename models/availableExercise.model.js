import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class AvailableExercise extends Model { }

    AvailableExercise.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            imageUrl: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'image_url',
            },
            videoUrl: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'video_url',
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'is_deleted',
            },
        },
        {
            sequelize,
            modelName: 'AvailableExercise',
            tableName: 'available_exercises',
            timestamps: true,
            underscored: true,
        }
    );

    return AvailableExercise;
};
