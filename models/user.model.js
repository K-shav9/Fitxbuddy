import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class User extends Model {
        static associate(models) {
            // Define associations here, if any
        }
    }

    User.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            fullName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            socialId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            authProvider: {
                type: DataTypes.ENUM('android', 'ios', 'app'),
                allowNull: false,
                defaultValue: 'app',
            },
            dob: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            age: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            gender: {
                type: DataTypes.ENUM('male', 'female', 'other'),
                allowNull: true,
            },
            profileImage: {
                type: DataTypes.STRING,
                defaultValue: null,
            },
            userType: {
                type: DataTypes.ENUM('admin', 'user'),
                allowNull: true,
                defaultValue: 'user',
            },
            onBoardStep: {
                type: DataTypes.INTEGER,
                defaultValue: 1,
                allowNull: false,
            },
            isOnBoarded: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            status: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true,
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: false,
            },
            deletedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'users',
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['email'],
                },
            ],
        }
    );

    return User;
};
