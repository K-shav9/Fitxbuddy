import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class PasswordResetToken extends Model { }

    PasswordResetToken.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            token: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'PasswordResetToken',
            tableName: 'password_reset_tokens',
            timestamps: true, // Set to false if you don't want createdAt/updatedAt
        }
    );

    return PasswordResetToken;
};
