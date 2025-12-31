// export function generatePrompt(data) {
//   const {
//     fitnessLevel,
//     fitnessGoal,
//     durationCategory,
//     medicalConsiderations,
//     availableEquipment,
//     customGoal,
//     scheduledDate
//   } = data;

//   const durationDays = 35;
//   const durationWeeks = Math.ceil(durationDays / 7);
//   // const startDate = new Date().toISOString().split('T')[0];
//   const startDate = scheduledDate;
//   const endDate = new Date(startDate);
//   endDate.setDate(endDate.getDate() + durationDays - 1);
//   // console.log("startDate-----", startDate)

//   // console.log("enddate0-----", endDate)

//   const equipmentList = availableEquipment.length > 0
//     ? availableEquipment.join(', ')
//     : 'No Equipment';

//   const medicalNote = medicalConsiderations
//     ? `Avoid exercises that may worsen the condition: ${medicalConsiderations}.`
//     : '';

//   const durationMapping = {
//     'Quick': { min: 15, max: 30, description: 'Great for busy days' },
//     'Standard': { min: 30, max: 45, description: 'Perfect for steady progress' },
//     'Extended': { min: 45, max: 60, description: 'Build strength & skill' },
//     'Advanced': { min: 60, max: 90, description: 'Deep training time' }
//   };

//   const fitnessLevelDescriptions = {
//     'beginner': 'Less than 3 months of consistent training',
//     'intermediate': '3–18 months of structured experience',
//     'advanced': 'Over 18 months; confident with intensity & load'
//   };

//   const actualGoal = fitnessGoal === 'custom' ? customGoal : fitnessGoal;
//   const durationInfo = durationMapping[durationCategory] || durationMapping['Standard'];

//   return `
// You are an expert fitness coach AI. Your task is to generate a comprehensive, ${actualGoal} workout plan based on the user's profile.

// Generate a complete valid JSON response **only**. Do not include any explanation, markdown formatting, triple backticks, or comments.

// You must output a strict, valid JSON object with the following structure:

// Response Requirements:
// - Return a **valid JSON object** without \` \`\`\`json\` or \`\`\` markers.
// - Do not add any explanations or comments.
// - Ensure that the workouts are distributed so that **each scheduledDate is unique** within the total duration.
// - Each weekNumber appears once.
// - All workouts under the same week must be grouped together.
// - Each scheduledDate should be listed only once under the correct week.
// - Do not duplicate or spread the same date/workout across multiple week sections.
// - Generate exactly ${durationDays} workout objects in the "workouts" array.
// - Generate ${durationWeeks} week summary objects in "workoutWeekSummaries".
// - Each workout duration must be within ${durationInfo.min}-${durationInfo.max} minutes (${durationCategory} category).
// - Each workout must include 2 to 4 exercises.
// - Each exercise must include: name, equipment, orderIndex, and sets.
// - For strength exercises: include reps and weightKg.
// - For bodyweight: omit weightKg.
// - Ensure proper weekNumber (1–${durationWeeks}) based on scheduledDate.
// - Dates must follow "YYYY-MM-DD".
// - Use only the following equipment: ${equipmentList}.
// - Adjust difficulty to fitness level: ${fitnessLevel} (${fitnessLevelDescriptions[fitnessLevel]}).
// - Include varied and progressive exercises.
// - Include weekly summaries with focus of the week.
// - Calculate totalTime as the sum of all durations in HH:MM:SS.
// - IMPORTANT: Use startDate = ${startDate} and endDate = ${endDate.toISOString().slice(0, 10) } EXACTLY.



// User Profile:
// - Fitness Level: ${fitnessLevel} (${fitnessLevelDescriptions[fitnessLevel]})
// - Goal: ${actualGoal}
// - Duration Category: ${durationCategory} (${durationInfo.min}-${durationInfo.max} mins)
// - Days: ${durationDays}, Weeks: ${durationWeeks}
// - Medical: ${medicalConsiderations || 'None'}
// - Equipment: ${equipmentList}
// - ${medicalNote}

// Now respond with JSON like this:

// {
//   "workoutPlan": {
//     "description": "${actualGoal} workout plan for ${durationDays} days",
//     "startDate": "${startDate}",
//     "endDate": "${endDate.toISOString().slice(0, 10)}",
//     "durationDays": ${durationDays},
//     "durationWeeks": ${durationWeeks},
//     "isActive": true,
//     "aiGenerated": true,
//     "workoutGoal": "${actualGoal}",
//     "totalWorkouts": ${durationDays},
//     "totalTime": "Calculate based on all workout durations"
//   },
//   "workoutWeekSummaries": [
//     {
//       "weekNumber": 1,
//       "summary": "Week 1 focuses on...",
//       "startDate": "YYYY-MM-DD",
//       "endDate": "YYYY-MM-DD"
//     }
//   ],
//   "workouts": [
//     {
//       "durationInMinutes": "Should be within ${durationInfo.min}-${durationInfo.max} minutes range",
//       "scheduledDate": "YYYY-MM-DD",
//       "weekNumber": 1,
//       "status": "Scheduled",
//       "isRegenerated": false,
//       "exercises": [
//         {
//           "name": "Exercise Name",
//           "equipment": "Dumbbells",
//           "orderIndex": 1,
//           "sets": [
//             { "reps": 10, "weightKg": 20 },
//             { "reps": 8, "weightKg": 22 }
//           ]
//         }
//       ]
//     }
//   ]
// }
// `.trim();
// }


export function generatePrompt(data) {
  const {
    fitnessLevel,
    fitnessGoal,
    durationCategory,
    medicalConsiderations,
    availableEquipment,
    customGoal,
    scheduledDate,
    // New fields for handling regeneration context
    isRegenerating = false,
    regenerationReason = 'User was not satisfied with the previous plan and requested a different one.',
    previousWorkoutPlan = null
  } = data;

  const durationDays = 14;
  const durationWeeks = Math.ceil(durationDays / 7);
  const startDate = scheduledDate;
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays - 1);
  const finalEndDate = endDate.toISOString().slice(0, 10);

  const equipmentList = availableEquipment && availableEquipment.length > 0
    ? availableEquipment.join(', ')
    : 'No Equipment';

  const medicalNote = medicalConsiderations
    ? `Important: Avoid exercises that may worsen the following condition(s): ${medicalConsiderations}.`
    : '';

  const durationMapping = {
    'Quick': { min: 15, max: 30 },
    'Standard': { min: 30, max: 45 },
    'Extended': { min: 45, max: 60 },
    'Advanced': { min: 60, max: 90 }
  };

  const fitnessLevelDescriptions = {
    'beginner': 'Less than 3 months of consistent training',
    'intermediate': '3–18 months of structured experience',
    'advanced': 'Over 18 months; confident with intensity & load'
  };

  const actualGoal = fitnessGoal === 'custom' ? customGoal : fitnessGoal;
  const durationInfo = durationMapping[durationCategory] || durationMapping['Standard'];

  // --- Dynamic Sections for the Prompt ---

  // 1. Regeneration Context (only added if regenerating)
  const regenerationContext = isRegenerating && previousWorkoutPlan
    ? `
**Regeneration Context:**
This is a request to **regenerate** a workout plan. The user was not satisfied with the previous plan provided below.
- **Reason for Regeneration:** ${regenerationReason}
- **Objective:** Create a new, improved ${durationDays}-day plan. It is crucial that you **DO NOT** repeat the exercises or structure from the previous plan. Introduce significant variety and different exercises.
- **Previous (Unsatisfactory) Plan to Avoid:**
\`\`\`json
${JSON.stringify(previousWorkoutPlan, null, 2)}
\`\`\`
`
    : '';

  // 2. Mandatory Exercises based on Goal
  const goalExerciseMapping = {
    'buildStrength': 'Must include compound lifts like Squats, Deadlifts (if equipment allows), Bench Press, and Overhead Press.',
    'weightLoss': 'Must include a mix of strength training and high-intensity bodyweight exercises like Burpees, High Knees, and Jumping Jacks to maximize calorie burn.',
    'buildEndurance': 'Focus on higher repetitions (15-20 reps) and shorter rest periods. Include exercises like Running (if applicable), Jump Rope, and circuit-style training.',
    'improveFlexibility': 'Must include dynamic stretches in warm-ups and dedicated static stretching exercises like Hamstring Stretches and Quad Stretches at the end of workouts.',
    'overallHealth': 'Provide a balanced mix of strength, cardio, and flexibility exercises throughout the week.',
    'stressBusting': 'Incorporate mindful movements and suggest focusing on breathing during exercises. Yoga-inspired movements can be included.',
    'custom': `The user has a custom goal: "${customGoal}". Tailor the exercises specifically to support this goal.`
  };
  const goalSpecificGuidance = goalExerciseMapping[fitnessGoal] || goalExerciseMapping['overallHealth'];

  // --- Constructing the Final Prompt ---

  return `
You are an expert fitness AI. Your task is to generate a comprehensive, personalized workout plan.
The response must be a single, valid JSON object and nothing else. Do not include any explanations, comments, or markdown formatting like \`\`\`json.

**ABSOLUTELY CRITICAL: Your entire response MUST be a single, syntactically correct JSON object. Do not output any text, explanation, or markdown before or after the JSON. The JSON must be complete and not truncated. Incomplete JSON will cause a system failure.**

${regenerationContext}

**User Profile:**
- **Fitness Level:** ${fitnessLevel} (${fitnessLevelDescriptions[fitnessLevel]})
- **Primary Goal:** ${actualGoal}
- **Workout Duration Category:** ${durationCategory} (${durationInfo.min}-${durationInfo.max} minutes per session)
- **Plan Duration:** ${durationDays} days, starting on ${startDate}.
- **Available Equipment:** ${equipmentList}
- **Medical Considerations:** ${medicalConsiderations || 'None'}
- ${medicalNote}

**Workout Generation Rules:**
1.  **Goal-Specific Exercises:** The plan must be tailored to the user's goal. ${goalSpecificGuidance}
2.  **Progressive Overload:** Gradually increase the difficulty over the ${durationWeeks} weeks, either by increasing weight, reps, or exercise complexity.
3.  **Variety:** Use a variety of exercises to keep the user engaged and target different muscle groups. Avoid making every day the same.
4.  **Daily Workouts:** Generate exactly ${durationDays} workout objects, one for each day of the plan. There are no rest days in the generated array.

**JSON Output Requirements:**
1.  **Root Object:** The root must be a JSON object with three keys: "workoutPlan", "workoutWeekSummaries", and "workouts".
2.  **workoutPlan Object:**
    -   \`startDate\` must be "${startDate}".
    -   \`endDate\` must be "${finalEndDate}".
    -   Must contain exactly the keys: "description", "startDate", "endDate", "durationDays", "durationWeeks", "isActive", "aiGenerated", "workoutGoal", "totalWorkouts", "totalTime".
    -   \`totalTime\` must be the sum of all \`durationInMinutes\` values, formatted as "HH:MM:SS".
3.  **workoutWeekSummaries Array:**
    -   Must contain **exactly ${durationWeeks}** summary objects.
    -   Each object must have a unique \`weekNumber\` from 1 to ${durationWeeks}.
4.  **workouts Array:**
    -   Must contain **exactly ${durationDays}** workout objects.
    -   Each workout must have a **unique \`scheduledDate\`** from "${startDate}" to "${finalEndDate}".
    -   \`durationInMinutes\` must be a number between ${durationInfo.min} and ${durationInfo.max}.
    -   Each workout must contain an \`exercises\` array with 2 to 4 exercise objects.
5.  **exercises Array (within each workout):**
    -   Each exercise object must use equipment from the **Available Equipment** list only.
6.  **sets Array (within each exercise):**
    -    This is a critical instruction. Each object in the \`sets\` array must **ONLY** contain the following keys:
        -   \`reps\` (number): This is mandatory for all exercises.
        -   \`weightKg\` (number): Include this **only** for strength exercises using equipment. **Omit this key entirely** for bodyweight exercises.
    -   **DO NOT** include a "duration" or "time" key inside the set objects.

**Final Check before responding:**
Before you provide the final JSON, mentally verify the following:
- Is the entire output a single, valid JSON object with no extra text or markdown?
- Does the 'workouts' array contain exactly ${durationDays} items?
- Does the 'workoutWeekSummaries' array contain exactly ${durationWeeks} items?
- Is every 'scheduledDate' unique and in 'YYYY-MM-DD' format?
- Does every object in the 'sets' array for bodyweight exercises have the 'weightKg' key completely omitted?
- Is the JSON complete, with all brackets and braces properly closed?


**Example JSON Structure:**
{
  "workoutPlan": {
    "description": "...",
    "startDate": "${startDate}",
    "endDate": "${finalEndDate}",
    "durationDays": ${durationDays},
    "durationWeeks": ${durationWeeks},
    "isActive": true,
    "aiGenerated": true,
    "workoutGoal": "${actualGoal}",
    "totalWorkouts": ${durationDays},
    "totalTime": "HH:MM:SS"
  },
  "workoutWeekSummaries": [
    {
      "weekNumber": 1,
      "summary": "Week 1: Focus on mastering form and building a consistent routine.",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD"
    }
  ],
  "workouts": [
    {
      "durationInMinutes": ${durationInfo.min},
      "scheduledDate": "${startDate}",
      "weekNumber": 1,
      "status": "Scheduled",
      "exercises": [
        {
          "name": "Dumbbell Squats",
          "equipment": "Dumbbells",
          "orderIndex": 1,
          "sets": [
            { "reps": 12, "weightKg": 10 }
          ]
        },
        {
          "name": "Push-ups",
          "equipment": "Bodyweight",
          "orderIndex": 2,
          "sets": [
            { "reps": 10 }
          ]
        }
      ]
    }
  ]
}
`.trim();
}

