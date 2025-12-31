import messages from "../utils/message.utils.js";
import statusCodes from "../utils/status.code.js";
import { addOnboardUserService, editOnboardUserService, getAllEquipmentService, myProfileService } from "../services/user.service.js";

export const addOnboardUser = async (req, res) => {
    req.body.userId = req?.user?.id
    try {
        const result = await addOnboardUserService(req.body);

        if (!result.success) {
            return res.status(result.status).json({
                status: result.status,
                message: result.message,
            });
        }

        return res.status(result.status).json({
            status: result.status,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        console.error("Add Onboarding Error:", error);
        return res.status(statusCodes.ERROR).json({
            status: statusCodes.ERROR,
            message: messages.INTERNAL_SERVER_ERROR,
            error: error.message,
        });
    }
};


export const editOnboardUser = async (req, res) => {
    req.body.userId = req?.user?.id
    try {
        const result = await editOnboardUserService(req.body);

        if (!result.success) {
            return res.status(result.status).json({
                status: result.status,
                message: result.message,
            });
        }

        return res.status(result.status).json({
            status: result.status,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        console.error("Edit Onboarding Error:", error);
        return res.status(statusCodes.ERROR).json({
            status: statusCodes.ERROR,
            message: messages.INTERNAL_SERVER_ERROR,
            error: error.message,
        });
    }
};

export const myProfile = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(statusCodes.UNAUTHORIZED).json({
                status: statusCodes.UNAUTHORIZED,
                message: messages.UNAUTHORIZED_ACCESS || 'Unauthorized access',
            });
        }

        const result = await myProfileService({ userId });

        return res.status(result?.status).json({
            status: result?.status,
            message: result?.message,
            data: result?.data,
        });
    } catch (error) {
        console.error('Get My Profile controller error:', error);
        return res.status(statusCodes.ERROR).json({
            status: statusCodes.ERROR,
            message: messages.INTERNAL_SERVER_ERROR,
        });
    }
};


export const getAllEquipments = async (req, res) => {
    try {
        const result = await getAllEquipmentService();

        return res.status(result.status).json({
            status: result.status,
            message: result.message,
            data: result?.data,
        });
    } catch (error) {
        console.error('Get My Profile controller error:', error);
        return res.status(statusCodes.ERROR).json({
            status: statusCodes.ERROR,
            message: messages.INTERNAL_SERVER_ERROR,
        });
    }
}; 