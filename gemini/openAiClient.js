import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const openAi = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function getOpenAIResponse(prompt) {
    try {
        const completion = await openAi.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a expert fitness coach." },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
        });

        const responseText = completion.choices[0].message.content;

        const data = JSON.parse(responseText);

        return data;
    } catch (error) {
        console.error("OpenAI API error:", error);
        throw error;
    }
}
