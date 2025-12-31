// import { db } from "./config/database.js"
// const masterExerciseList = await db.AvailableExercise.findAll();
// console.log("exerciseLsit-------", masterExerciseList)

import { log } from "./utils/common.js";
// import { generatePrompt } from "./utils/generatePrompt.js";

// masterExerciseList.forEach((exercise) => {
//     if (exercise?.dataValues?.name === "Burpees") {
//         console.log("exercise-------", exercise);
//     }
// });


// console.log("OPENAI_API_KEY-------", process.env.OPENAI_API_KEY)

// const promptBody = {
//     fitnessLevel: "Beginner",
//     fitnessGoal: "Fat Loss",
//     durationCategory: "extended",
//     customGoal: "Lose 5kg before vacation",
//     medicalConsiderations: "None",
//     availableEquipment: ["Dumbbells", "Resistance Bands", "Yoga Mat"],
//     scheduledDate: "2025-07-03"
// };

// log("promptbody", promptBody);
// const prompt = generatePrompt(promptBody)
// log(promptBody);



let a = 56;
let b = 30;

log("a", a);
log("b", b);