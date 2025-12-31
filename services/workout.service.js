import { db, sequelize } from "../config/database.js"
import statusCodes from '../utils/status.code.js';
import messages from '../utils/message.utils.js';
import { generatePrompt } from "../utils/generatePrompt.js";
import { getOpenAIResponse } from "../gemini/openAiClient.js";


const { User, FitnessProfile, WorkoutEquipment, AvailableExercise, WorkoutPlan, Workout, WorkoutWeekSummary, WorkoutExercise, Set } = db;


export const generateWorkoutService = async (userId, scheduledDate) => {
    const t = await sequelize.transaction(); // start transaction

    try {
        // 1. Lookup user & fitness profile (if needed)
        const user = await User.findByPk(userId, {
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
            transaction: t,
        });

        if (!user) {
            return {
                success: false,
                status: statusCodes.NOT_FOUND,
                message: messages?.USER_NOT_FOUND,
            };

        };

        // Check if profile exists
        const fitnessProfile = user?.FitnessProfile;

        if (!fitnessProfile) {
            return {
                success: false,
                status: statusCodes.NOT_FOUND,
                message: messages?.FITNESSPROFILE_NOT_FOUND,
            };
        }

        const promptBody = {
            fitnessLevel: fitnessProfile.fitnessLevel,
            fitnessGoal: fitnessProfile.fitnessGoal,
            durationCategory: fitnessProfile.durationCategory,
            customGoal: fitnessProfile.customGoal,
            medicalConsiderations: fitnessProfile.medicalConsiderations,
            availableEquipment: fitnessProfile.equipment.map(eq => eq.name), // adjust key if different
            scheduledDate: scheduledDate
        };

        const prompt = generatePrompt(promptBody)

        const result = await getOpenAIResponse(prompt);

        // 2. Create workout plan
        const {
            description, startDate, endDate, durationDays, durationWeeks, isActive, aiGenerated, workoutGoal, totalWorkouts, totalTime
        } = result.workoutPlan;

        const workoutPlan = await WorkoutPlan.create({
            userId,
            description,
            startDate,
            endDate,
            durationDays,
            durationWeeks,
            isActive,
            aiGenerated,
            workoutGoal,
            totalWorkouts,
            totalTime,
        }, { transaction: t });

        // 3. Create week summaries
        if (result.workoutWeekSummaries?.length) {
            const weekData = result.workoutWeekSummaries.map(w => ({
                workoutPlanId: workoutPlan.id,
                weekNumber: w.weekNumber,
                summary: w.summary,
                startDate: w.startDate,
                endDate: w.endDate
            }));
            await WorkoutWeekSummary.bulkCreate(weekData, { transaction: t });
        }

        // 4. Create workouts
        const workouts = result.workouts || [];
        const mappedWorkouts = workouts.map(w => ({
            workoutPlanId: workoutPlan.id,
            durationInMinutes: w.durationInMinutes,
            scheduledDate: w.scheduledDate,
            weekNumber: w.weekNumber,
            // type: 'Strength',  // or derive dynamically
            status: w.status,
            isRegenerated: w.isRegenerated
        }));
        const createdWorkouts = await Workout.bulkCreate(mappedWorkouts, {
            transaction: t, returning: true
        });

        const masterExerciseList = await AvailableExercise.findAll();

        // 5. Create exercises
        // Flatten all exercises with parent workout index
        const workoutExercises = [];
        workouts.forEach((w, wIdx) => {
            w.exercises.forEach(ex => {
                const matchedExercise = masterExerciseList.find(
                    (exercise) => exercise?.dataValues?.name === ex.name
                );

                workoutExercises.push({
                    workoutId: createdWorkouts[wIdx].id,
                    exerciseName: ex.name,
                    exerciseId: matchedExercise?.dataValues?.id || null,
                    equipment: ex.equipment,
                    orderIndex: ex.orderIndex
                });
            });
        });

        const createdExercises = await WorkoutExercise.bulkCreate(workoutExercises, {
            transaction: t, returning: true
        });

        // 6. Create sets
        const workoutSets = [];
        let exerciseGlobalIndex = 0;
        workouts.forEach(w => {
            w.exercises.forEach(ex => {
                ex.sets.forEach(s => {
                    workoutSets.push({
                        workoutExerciseId: createdExercises[exerciseGlobalIndex].id,
                        reps: s.reps,
                        weightKg: s.weightKg,
                        status: 'Scheduled'
                    });
                });
                exerciseGlobalIndex++;
            });
        });
        await Set.bulkCreate(workoutSets, { transaction: t });

        // 7. Commit transaction
        await t.commit();

        const updatedResult = { ...result, workoutPlanId: workoutPlan.id }

        return {
            success: true,
            status: statusCodes.CREATED,
            message: messages.WORKOUT_PLAN_GENERATED_SUCCESSFULLY,
            data: updatedResult
        };

    } catch (error) {
        await t.rollback();
        console.error("Error generating workout plan:", error);
        return {
            success: false,
            status: statusCodes.SERVER_ERROR,
            message: messages?.INTERNAL_SERVER_ERROR,

        };
    }
};

export const regenerateWorkoutService = async (userId, body) => {
    const t = await sequelize.transaction(); // Start transaction

    const { workoutPlanId, scheduledDate } = body;

    try {
        // 1. Find the existing workout plan for the user
        const existingWorkoutPlan = await WorkoutPlan.findOne({
            where: { id: workoutPlanId, userId },
            transaction: t,
        });

        if (!existingWorkoutPlan) {
            return {
                success: false,
                status: statusCodes.NOT_FOUND,
                message: messages?.WORKOUTPLAN_NOT_FOUND,
            };
        }

        // Reconstruct the old workout plan from the database to provide context to the AI
        const oldWorkoutsData = await Workout.findAll({
            where: { workoutPlanId: existingWorkoutPlan.id },
            include: [
                {
                    model: WorkoutExercise,
                    as: 'exercises',
                    attributes: ['exerciseName', 'equipment', 'orderIndex'],
                    include: [{ model: Set, attributes: ['reps', 'weightKg'] }],
                },
            ],
            attributes: ['durationInMinutes', 'scheduledDate', 'weekNumber', 'status', 'isRegenerated'],
            order: [['scheduledDate', 'ASC']],
            transaction: t,
        });

        const oldWeekSummariesData = await WorkoutWeekSummary.findAll({
            where: { workoutPlanId: existingWorkoutPlan.id },
            attributes: ['weekNumber', 'summary', 'startDate', 'endDate'],
            order: [['weekNumber', 'ASC']],
            transaction: t,
        });

        // Map DB objects to the JSON structure the AI expects
        const previousWorkoutPlan = {
            workoutPlan: existingWorkoutPlan?.toJSON() || {},

            workoutWeekSummaries: Array.isArray(oldWeekSummariesData)
                ? oldWeekSummariesData.map(s => s.toJSON())
                : [],

            workouts: Array.isArray(oldWorkoutsData)
                ? oldWorkoutsData.map(w => {
                    const workoutData = w.toJSON();

                    return {
                        durationInMinutes: workoutData.durationInMinutes,
                        scheduledDate: workoutData.scheduledDate,
                        weekNumber: workoutData.weekNumber,
                        status: workoutData.status,
                        isRegenerated: workoutData.isRegenerated,

                        exercises: Array.isArray(workoutData.exercises)
                            ? workoutData.exercises.map(ex => ({
                                name: ex.exerciseName,
                                equipment: ex.equipment,
                                orderIndex: ex.orderIndex,
                                sets: Array.isArray(ex.sets)
                                    ? ex.sets.map(set => ({
                                        reps: set.reps,
                                        weightKg: set.weightKg,
                                    }))
                                    : [],
                            }))
                            : [],
                    };
                })
                : [],
        };


        // 2. Lookup user & fitness profile to generate new prompt
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt', 'isDeleted'] },
            include: {
                model: FitnessProfile,
                include: {
                    model: WorkoutEquipment,
                    as: 'equipment',
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                },
            },
            transaction: t,
        });

        if (!user) {
            return {
                success: false,
                status: statusCodes.NOT_FOUND,
                message: messages?.USER_NOT_FOUND,
            };
        }

        if (!user.FitnessProfile) {
            return {
                success: false,
                status: statusCodes.NOT_FOUND,
                message: messages?.FITNESSPROFILE_NOT_FOUND,
            };
        }

        const fitnessProfile = user.FitnessProfile;
        const promptBody = {
            fitnessLevel: fitnessProfile.fitnessLevel,
            fitnessGoal: fitnessProfile.fitnessGoal,
            durationCategory: fitnessProfile.durationCategory,
            medicalConsiderations: fitnessProfile.medicalConsiderations,
            availableEquipment: fitnessProfile.equipment.map(eq => eq.name),
            scheduledDate: scheduledDate, // Use the provided scheduledDate for the new plan's start
            isRegenerating: true,
            previousWorkoutPlan: previousWorkoutPlan,
        };

        const prompt = generatePrompt(promptBody);

        const result = await getOpenAIResponse(prompt);

        // 3. Delete existing associated data for the old plan
        // Order of deletion matters due to foreign key constraints
        // Delete Sets first, then WorkoutExercises, then Workouts, then WorkoutWeekSummaries
        const existingWorkouts = await Workout.findAll({
            where: { workoutPlanId: existingWorkoutPlan.id },
            attributes: ['id'],
            transaction: t,
        });
        const existingWorkoutIds = existingWorkouts.map(w => w.id);

        if (existingWorkoutIds.length > 0) {
            const existingWorkoutExercises = await WorkoutExercise.findAll({
                where: { workoutId: existingWorkoutIds },
                attributes: ['id'],
                transaction: t,
            });
            const existingWorkoutExerciseIds = existingWorkoutExercises.map(we => we.id);

            if (existingWorkoutExerciseIds.length > 0) {
                await Set.destroy({ where: { workoutExerciseId: existingWorkoutExerciseIds }, transaction: t });
            }
            await WorkoutExercise.destroy({ where: { workoutId: existingWorkoutIds }, transaction: t });
            await Workout.destroy({ where: { workoutPlanId: existingWorkoutPlan.id }, transaction: t });
        }
        await WorkoutWeekSummary.destroy({ where: { workoutPlanId: existingWorkoutPlan.id }, transaction: t });

        // 4. Update the existing workout plan with new details
        const {
            description, startDate, endDate, durationDays, durationWeeks, isActive, aiGenerated, workoutGoal, totalWorkouts, totalTime
        } = result.workoutPlan;

        await existingWorkoutPlan.update({
            description,
            startDate,
            endDate,
            durationDays,
            durationWeeks,
            isActive, // Keep as true, or set based on AI response if applicable
            aiGenerated: true, // Always true for AI-generated plans
            workoutGoal,
            totalWorkouts,
            totalTime,
        }, { transaction: t });

        // 5. Create new week summaries, workouts, exercises, and sets (same logic as generateWorkoutService)
        if (result.workoutWeekSummaries?.length) {
            const weekData = result.workoutWeekSummaries.map(w => ({
                workoutPlanId: existingWorkoutPlan.id, // Associate with the existing plan
                weekNumber: w.weekNumber, summary: w.summary, startDate: w.startDate, endDate: w.endDate
            }));
            await WorkoutWeekSummary.bulkCreate(weekData, { transaction: t });
        }

        // Re-use the logic from generateWorkoutService for creating workouts, exercises, and sets
        // This part is identical to steps 4, 5, and 6 in generateWorkoutService
        const workouts = result.workouts || [];
        const mappedWorkouts = workouts.map(w => ({
            workoutPlanId: existingWorkoutPlan.id, // Associate with the existing plan
            durationInMinutes: w.durationInMinutes, scheduledDate: w.scheduledDate, weekNumber: w.weekNumber,
            status: w.status, isRegenerated: true // Mark as regenerated
        }));
        const createdWorkouts = await Workout.bulkCreate(mappedWorkouts, { transaction: t, returning: true });

        const masterExerciseList = await AvailableExercise.findAll({ transaction: t }); // Fetch within transaction

        const workoutExercises = [];
        workouts.forEach((w, wIdx) => {
            w.exercises.forEach(ex => {
                const matchedExercise = masterExerciseList.find(
                    (exercise) => exercise?.dataValues?.name === ex.name
                );
                workoutExercises.push({
                    workoutId: createdWorkouts[wIdx].id, exerciseName: ex.name,
                    exerciseId: matchedExercise?.dataValues?.id || null, // Use null if not found
                    equipment: ex.equipment, orderIndex: ex.orderIndex
                });
            });
        });
        const createdExercises = await WorkoutExercise.bulkCreate(workoutExercises, { transaction: t, returning: true });

        const workoutSets = [];
        let exerciseGlobalIndex = 0;
        workouts.forEach(w => {
            w.exercises.forEach(ex => {
                ex.sets.forEach(s => {
                    workoutSets.push({
                        workoutExerciseId: createdExercises[exerciseGlobalIndex].id,
                        reps: s.reps, weightKg: s.weightKg, status: 'Scheduled'
                    });
                });
                exerciseGlobalIndex++;
            });
        });
        await Set.bulkCreate(workoutSets, { transaction: t });

        // 6. Commit transaction
        await t.commit();

        return {
            success: true,
            status: statusCodes.OK, // Use OK for update/regeneration
            message: messages.WORKOUT_PLAN_REGENERATED_SUCCESSFULLY, // Re-use message or create a new one
            data: result
        };

    } catch (error) {
        await t.rollback();
        console.error("Error regenerating workout plan:", error);
        return {
            success: false,
            status: statusCodes.SERVER_ERROR,
            message: messages?.INTERNAL_SERVER_ERROR,
        };
    }
};

export const getWeekSummaryService = async ({ userId }) => {
    try {
        const userWithWorkoutWeekSummary = await User.findByPk(userId, {
            attributes: ['id', 'fullName', 'email'],
            include: [
                {
                    model: WorkoutPlan,
                    attributes: ['id', 'durationWeeks'],
                    include: [
                        {
                            model: WorkoutWeekSummary,
                            as: 'weekSummaries',
                            attributes: { exclude: ['createdAt', 'updatedAt'] },
                        },
                    ],
                },
            ],
        });

        if (
            !userWithWorkoutWeekSummary?.WorkoutPlan ||
            !userWithWorkoutWeekSummary.WorkoutPlan.weekSummaries?.length
        ) {
            return {
                success: false,
                status: statusCodes.NOT_FOUND,
                message: messages?.NO_WEEK_SUMMARY_FOUND,
                data: null,
            };
        }


        return {
            success: true,
            status: statusCodes.OK,
            message: messages?.WEEK_SUMMARY_FETCHED,
            data: userWithWorkoutWeekSummary,
        };

    } catch (error) {
        console.error("Error in getWeekSummaryService:", error);

        return {
            success: false,
            status: statusCodes.INTERNAL_SERVER_ERROR,
            message: messages?.INTERNAL_SERVER_ERROR,
            data: null,
        };
    }
};


export const getTodayWorkoutService = async (userId, scheduledDate) => {
    try {
        const userWithTodaysWorkout = await User.findByPk(userId, {
            attributes: ['id', 'fullName', 'email'],
            include: [
                {
                    model: WorkoutPlan,
                    attributes: ['id', 'durationWeeks', 'totalWorkouts', 'workoutGoal'],
                    include: [
                        {
                            model: Workout,
                            as: 'workout',
                            where: { scheduledDate: scheduledDate },
                            required: true, // ensures only if workouts exist
                            attributes: [
                                "id", "workoutPlanId", "durationInMinutes", "scheduledDate", "weekNumber", "type", "status"
                            ],
                            include: [
                                {
                                    model: WorkoutExercise,
                                    as: 'exercises',
                                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                                    include: [
                                        {
                                            model: AvailableExercise,
                                            as: "aboutExercise",
                                            attributes: { exclude: ['createdAt', 'updatedAt', 'isDeleted'] },
                                        },
                                        {
                                            model: Set,
                                            attributes: { exclude: ['createdAt', 'updatedAt'] },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        // If no user or no workout plan or no matching workout found
        if (
            !userWithTodaysWorkout ||
            !userWithTodaysWorkout.WorkoutPlan ||
            !userWithTodaysWorkout.WorkoutPlan.workout ||
            userWithTodaysWorkout.WorkoutPlan.workout.length === 0
        ) {
            return {
                success: false,
                status: statusCodes.NOT_FOUND,
                message: messages?.NO_WORK_OUT_FOUND,
                data: null,
            };
        }

        const plan = userWithTodaysWorkout?.WorkoutPlan?.dataValues;
        const planId = plan?.id;

        let completedCount = 0;
        if (planId && plan.totalWorkouts) {
            completedCount = await Workout.count({
                where: {
                    workoutPlanId: planId,
                    status: 'Complete',
                },
            });
        }

        const progress = plan?.totalWorkouts
            ? Math.round((completedCount / plan.totalWorkouts) * 100)
            : 0;

        const data = userWithTodaysWorkout.toJSON();
        if (data.WorkoutPlan) {
            data.WorkoutPlan.progress = progress;
        }

        return {
            success: true,
            status: statusCodes.OK,
            message: messages?.TODAY_WORKOUT_FETCHED,
            data: data,
        };
    } catch (error) {
        console.error("Error in getTodayWorkoutService:", error);
        return {
            success: false,
            status: statusCodes.INTERNAL_SERVER_ERROR,
            message: messages?.INTERNAL_SERVER_ERROR,
            data: null,
        };
    }
};

export const getWorkoutByDateService = async (userId, scheduledDate) => {
    try {
        const userWithTodaysWorkout = await User.findByPk(userId, {
            attributes: ['id', 'fullName', 'email'],
            include: [
                {
                    model: WorkoutPlan,
                    attributes: ['id', 'durationWeeks', 'totalWorkouts', 'workoutGoal'],
                    include: [
                        {
                            model: Workout,
                            as: 'workout',
                            where: { scheduledDate: scheduledDate },
                            required: true, // ensures only if workouts exist
                            attributes: [
                                "id", "workoutPlanId", "durationInMinutes", "scheduledDate", "weekNumber", "type", "status"
                            ],
                            include: [
                                {
                                    model: WorkoutExercise,
                                    as: 'exercises',
                                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                                    include: [
                                        {
                                            model: AvailableExercise,
                                            as: "aboutExercise",
                                            attributes: { exclude: ['createdAt', 'updatedAt', 'isDeleted'] },
                                        },
                                        {
                                            model: Set,
                                            attributes: { exclude: ['createdAt', 'updatedAt'] },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        // If no user or no workout plan or no matching workout found
        if (
            !userWithTodaysWorkout ||
            !userWithTodaysWorkout.WorkoutPlan ||
            !userWithTodaysWorkout.WorkoutPlan.workout ||
            userWithTodaysWorkout.WorkoutPlan.workout.length === 0
        ) {
            return {
                success: false,
                status: statusCodes.NOT_FOUND,
                message: messages?.NO_WORK_OUT_FOUND,
                data: null,
            };
        }

        return {
            success: true,
            status: statusCodes.OK,
            message: messages?.TODAY_WORKOUT_FETCHED,
            data: userWithTodaysWorkout,
        };
    } catch (error) {
        console.error("Error in getWorkoutByDateService:", error);
        return {
            success: false,
            status: statusCodes.INTERNAL_SERVER_ERROR,
            message: messages?.INTERNAL_SERVER_ERROR,
            data: null,
        };
    }
};
