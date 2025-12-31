import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default genAI;


// Steps to use genAi for getting response by passing prompt

// let prompt;
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
// const result = await model.generateContent(prompt);
// const response = await result.response;
// const text = response.text();
// const parsedData = extractJsonFromResponse(text);
