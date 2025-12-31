import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
    class FitnessProfile extends Model {
        // static associate(models) {
        // }
    }
    FitnessProfile.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            // userId: {
            //     type: DataTypes.INTEGER,
            //     allowNull: true,
            // },
            fitnessLevel: {
                type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
                allowNull: true,
            },
            fitnessGoal: {
                type: DataTypes.ENUM('buildStrength', 'weightLoss', 'buildEndurance', 'improveFlexibility', 'overallHealth', 'stressBusting', 'custom'),
                allowNull: true,
            },
            customGoal: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            durationCategory: {
                type: DataTypes.ENUM('quick', 'standard', 'extended', 'advanced'),
                allowNull: true,
            },
            medicalConsiderations: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            height: {
                type: DataTypes.FLOAT, 
                allowNull: true,
            },
            heightUnit: {
                type: DataTypes.ENUM('ft','cm', 'in'),
                allowNull: true,
                defaultValue: 'cm',
            },
            weight: {
                type: DataTypes.FLOAT, // or DECIMAL(5,2)
                allowNull: true,
            },
            weightUnit: {
                type: DataTypes.ENUM('kg', 'lb'),
                allowNull: true,
                defaultValue: 'kg',
            },
        },
        {
            sequelize,
            modelName: 'FitnessProfile',
            tableName: 'fitness_profile',
            timestamps: true, 
        }
    );

    return FitnessProfile;
};
