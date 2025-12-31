import messages from "../utils/message.utils.js";
import statusCodes from "../utils/status.code.js";
import { generateWorkoutService, getTodayWorkoutService, getWeekSummaryService, getWorkoutByDateService, regenerateWorkoutService } from "../services/workout.service.js";
import { validCalendarDate } from "../utils/common.js";

export const generateWorkout = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(statusCodes.UNAUTHORIZED).json({
                status: statusCodes.UNAUTHORIZED,
                message: messages.UNAUTHORIZED_ACCESS || 'Unauthorized access',
            });
        }

        const result = await generateWorkoutService(userId, req?.body?.scheduledDate);

        if (!result.success) {
            return res.status(result.status || statusCodes.BAD_REQUEST).json({
                status: result.status || statusCodes.BAD_REQUEST,
                message: "Please try again later",
            });
        }

        return res.status(result.status).json({
            status: result.status,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        console.error('Generate Workout Controller Error:', error);
        return res.status(statusCodes.ERROR).json({
            status: statusCodes.ERROR,
            message: messages.INTERNAL_SERVER_ERROR,
        });
    }
};

export const reGenerateWorkout = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(statusCodes.UNAUTHORIZED).json({
                status: statusCodes.UNAUTHORIZED,
                message: messages.UNAUTHORIZED_ACCESS || 'Unauthorized access',
            });
        }

        const result = await regenerateWorkoutService(userId, req?.body)

        if (!result.success) {
            return res.status(result.status || statusCodes.BAD_REQUEST).json({
                status: result.status || statusCodes.BAD_REQUEST,
                message: "Please try again later",
            });
        }

        return res.status(result.status).json({
            status: result.status,
            message: result.message,
            data: result.data,
        });
    } catch (error) {
        console.error('Generate Workout Controller Error:', error);
        return res.status(statusCodes.ERROR).json({
            status: statusCodes.ERROR,
            message: messages.INTERNAL_SERVER_ERROR,
        });
    }
};


export const getWorkoutWeekSummaries = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(statusCodes.UNAUTHORIZED).json({
                status: statusCodes.UNAUTHORIZED,
                message: messages.UNAUTHORIZED_ACCESS || 'Unauthorized access',
            });
        }

        const result = await getWeekSummaryService({ userId });

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


export const getTodaysWorkout = async (req, res) => {

    try {
        const userId = req.user?.id;
        const date = req?.query?.workoutDate

        if (!userId) {
            return res.status(statusCodes.UNAUTHORIZED).json({
                status: statusCodes.UNAUTHORIZED,
                message: messages.UNAUTHORIZED_ACCESS || 'Unauthorized access',
            });
        }

        if (!date) {
            return res.status(statusCodes?.BAD_REQUEST).json({
                status: statusCodes?.BAD_REQUEST,
                message: messages?.MISSING_WORKOUT_DATE,
            });
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(statusCodes?.BAD_REQUEST).json({
                status: statusCodes?.BAD_REQUEST,
                message: messages?.DATE_FORMAT_ERROR,
            });
        }

        const isDateValid = validCalendarDate(date)

        if (!isDateValid) {
            return res.status(statusCodes?.BAD_REQUEST).json({
                status: statusCodes?.BAD_REQUEST,
                message: messages?.VALID_DATE,
            });
        }


        const result = await getTodayWorkoutService(userId, date);

        if (!result.success) {
            return res.status(result.status).json({
                status: result.status,
                message: result.message,
            });
        }
        return res.status(result?.status).json({
            status: result?.status,
            message: result?.message,
            data: result?.data,
        });
    } catch (error) {
        console.error('Get today workout api error:', error);
        return res.status(statusCodes.ERROR).json({
            status: statusCodes.ERROR,
            message: messages.INTERNAL_SERVER_ERROR,
        });
    }
};

export const getWorkoutByDate = async (req, res) => {

    try {
        const userId = req.user?.id;
        const date = req?.query?.workoutDate

        if (!userId) {
            return res.status(statusCodes.UNAUTHORIZED).json({
                status: statusCodes.UNAUTHORIZED,
                message: messages.UNAUTHORIZED_ACCESS || 'Unauthorized access',
            });
        }

        if (!date) {
            return res.status(statusCodes?.BAD_REQUEST).json({
                status: statusCodes?.BAD_REQUEST,
                message: messages?.MISSING_WORKOUT_DATE,
            });
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(statusCodes?.BAD_REQUEST).json({
                status: statusCodes?.BAD_REQUEST,
                message: messages?.DATE_FORMAT_ERROR,
            });
        }

        // Check if it's a valid calendar date
        if (!validCalendarDate(date)) {
            return res.status(statusCodes?.BAD_REQUEST).json({
                status: statusCodes?.BAD_REQUEST,
                message: messages?.VALID_DATE,
            });
        }

        const result = await getWorkoutByDateService(userId, date);

        if (!result.success) {
            return res.status(result.status).json({
                status: result.status,
                message: result.message,
            });
        }

        return res.status(statusCodes.OK).json({
            status: result?.status,
            message: result?.message,
            data: result?.data,
        });
    } catch (error) {
        console.error('Get workout by date controller error:', error);
        return res.status(statusCodes.ERROR).json({
            status: statusCodes.ERROR,
            message: messages.INTERNAL_SERVER_ERROR,
        });
    }
};