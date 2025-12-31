// user.service.js
import { db } from "../config/database.js";
import statusCodes from '../utils/status.code.js';
import messages from '../utils/message.utils.js';
import { splitName } from "../utils/common.js";

const { User, WorkoutEquipment, FitnessProfile, AvailableEquipment } = db;


export const addOnboardUserService = async ({
    userId,
    fullName,
    dob,
    gender,
    height,
    heightUnit,
    weight,
    weightUnit,
    fitnessLevel,
    fitnessGoal,
    customGoal,
    durationCategory,
    equipment,
    customEquipment,
    medicalConsiderations,
}) => {
    const user = await User.findByPk(userId);
    if (!user) {
        return {
            success: false,
            status: statusCodes.NOT_FOUND,
            message: messages.USER_NOT_FOUND,
        };
    }

    await user.update({ dob, gender });

    // Prepare equipment records (existing ones)
    let updatedEquipments = Array.isArray(equipment)
        ? equipment.map((name) => ({ name: name.trim(), isCustom: false }))
        : [];

    // Add customEquipment (ONLY for this user's profile, NOT globally)
    if (customEquipment && typeof customEquipment === 'string' && customEquipment.trim()) {

        const trimmedCustom = customEquipment.trim();

        // Check against global available equipment
        const equipmentExists = await AvailableEquipment.findOne({
            where: { name: trimmedCustom }
        });

        if (equipmentExists) {
            return {
                status: statusCodes.CONFLICT,
                message: messages.EQUIPMENT_ALREADY_EXIST,
            };
        }
        updatedEquipments.push({
            name: customEquipment.trim(),
            isCustom: true,
        });
    }

    // Update user name if changed
    if (fullName && fullName.trim() && fullName !== user.fullName) {
        const { firstName, lastName } = splitName(fullName);
        await user.update({ fullName, firstName, lastName });
    }

    // Update fitness profile
    const fitnessProfile = await FitnessProfile.findOne({ where: { userId: user.id } });
    if (!fitnessProfile) {
        return {
            success: false,
            status: statusCodes.NOT_FOUND,
            message: messages.FITNESS_PROFILE_NOT_FOUND,
        };
    }

    const updateFitnessProfile = await fitnessProfile.update({
        fitnessLevel,
        fitnessGoal,
        customGoal,
        durationCategory,
        medicalConsiderations,
        height,
        heightUnit,
        weight,
        weightUnit,
    });

    const {
        fullName: FullName,
        dob: DOB,
        gender: Gender,
    } = user?.dataValues || {};

    const {
        height: Height,
        heightUnit: HeightUnit,
        weight: Weight,
        weightUnit: WeightUnit,
        fitnessLevel: FitnessLevel,
        fitnessGoal: FitnessGoal,
        durationCategory: DurationCategory,
    } = fitnessProfile?.dataValues || {};


    if (
        FullName != null && FullName.trim() !== '' &&
        DOB != null && DOB !== '' &&
        Gender != null && Gender !== '' &&
        Height != null &&
        HeightUnit != null && HeightUnit !== '' &&
        Weight != null &&
        WeightUnit != null && WeightUnit !== '' &&
        FitnessLevel != null && FitnessLevel !== '' &&
        FitnessGoal != null && FitnessGoal !== '' &&
        DurationCategory != null && DurationCategory !== '' &&
        Array.isArray(equipment) && equipment.length > 0
    ) {
        await user.update({ isOnBoarded: true });
    }

    // Remove old equipment and insert new ones
    await WorkoutEquipment.destroy({ where: { fitnessProfileId: fitnessProfile.id } });

    if (updatedEquipments.length > 0) {
        const equipmentRecords = updatedEquipments.map(({ name, isCustom }) => ({
            fitnessProfileId: fitnessProfile.id,
            name,
            isCustom,
        }));

        await WorkoutEquipment.bulkCreate(equipmentRecords);
    }

    // Return user + profile + equipment
    const userWithFitnessProfile = await User.findByPk(user.id, {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt', 'isDeleted'] },
        include: {
            model: FitnessProfile,
            include: {
                model: WorkoutEquipment,
                as: 'equipment',
                attributes: {
                    exclude: ['createdAt', 'updatedAt', "fitnessProfileId"]
                },
            },
        },
    });
    return {
        success: true,
        status: statusCodes.OK,
        message: messages.FITNESSPROFILE_UPDATED_SUCCESSFULLY,
        data: userWithFitnessProfile,
    };
};


export const editOnboardUserService = async ({
    userId,
    fullName,
    fitnessLevel,
    fitnessGoal,
    durationCategory,
    equipment,
    medicalConsiderations,
}) => {

    const user = await User.findByPk(userId);

    if (!user) {
        return {
            success: false,
            status: statusCodes.NOT_FOUND,
            message: messages.USER_NOT_FOUND,
        };
    }

    if (fullName && fullName !== user.fullName) {
        const { firstName, lastName } = splitName(user.fullName);
        await user.update({ fullName, firstName, lastName });
    }

    const fitnessProfile = await FitnessProfile.findOne({ where: { userId: user.id } });

    if (!fitnessProfile) {
        return {
            success: false,
            status: statusCodes.NOT_FOUND,
            message: messages.FITNESS_PROFILE_NOT_FOUND,
        };
    }

    await fitnessProfile.update({
        where: { id: fitnessProfile?.id },
        fitnessLevel: fitnessLevel,
        fitnessGoal: fitnessGoal,
        durationCategory: durationCategory,
        medicalConsiderations: medicalConsiderations,
    });


    await WorkoutEquipment.destroy({ where: { fitnessProfileId: fitnessProfile.id } });

    if (Array.isArray(equipment) && equipment.length > 0) {
        const equipmentRecords = equipment.map((name) => ({
            fitnessProfileId: fitnessProfile.id,
            name,
        }));
        await WorkoutEquipment.bulkCreate(equipmentRecords);
    }

    const userWithFitnessProfile = await User.findByPk(user.id, {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt', 'isDeleted'] },
        include: {
            model: FitnessProfile,
            include: {
                model: WorkoutEquipment,
                as: 'equipment',
                attributes: { exclude: ['createdAt', 'updatedAt'] },
            },
        },
    });

    return {
        success: true,
        status: statusCodes.OK,
        message: messages.FITNESSPROFILE_UPDATED_SUCCESSFULLY,
        data: userWithFitnessProfile,
    };
};

export const myProfileService = async ({ userId }) => {
    const userWithFitnessProfile = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt', 'isDeleted'] },
        include: {
            model: FitnessProfile,
            // You can uncomment and adjust the below if you want to include Equipment data
            include: {
                model: WorkoutEquipment,
                as: 'equipment',
                attributes: { exclude: ['createdAt', 'updatedAt'] },
            },
        },
    });

    if (!userWithFitnessProfile) {
        return {
            success: false,
            status: statusCodes.NOT_FOUND,
            message: messages.USER_NOT_FOUND,
        };
    }

    return {
        success: true,
        status: statusCodes.OK,
        message: messages?.DETAILS_FETCHED, // update to appropriate fetch success message
        data: userWithFitnessProfile,
    };
};


export const getAllEquipmentService = async () => {
    const availableEquipments = await AvailableEquipment.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
    });

    const isEmpty = !availableEquipments || availableEquipments.length === 0;

    return {
        status: statusCodes.OK,
        message: isEmpty ? messages?.EQUIPMENTS_NOT_AVAILABLE : messages?.EQUIPMENTS_FETCHED_SUCCESSFULLY,
        data: isEmpty ? [] : availableEquipments,
    };
};