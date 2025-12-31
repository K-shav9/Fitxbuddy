const ENV = process.env.NODE_ENV || 'development';

export const log = (text, variable) => {
    if (ENV === 'development') {
        console.log(`${text}------------`, variable);
    }
}


export const capitalize = (msg) => msg.charAt(0).toUpperCase() + msg.slice(1);

export const splitName = (fullName) => {
    if (typeof fullName !== 'string') {
        return {
            firstName: '',
            lastName: '',
        };
    }

    const trimmedName = fullName.trim();
    const nameParts = trimmedName.split(' ');

    const firstName = (nameParts[0] || '');
    const lastName = (nameParts.slice(1).join(' ') || '');

    return {
        firstName,
        lastName,
    };
};

// Check if it's a valid calendar date

export const validCalendarDate = (date) => {
    const parsedDate = new Date(date);
    const [year, month, day] = date.split('-').map(Number);
    if (
        isNaN(parsedDate.getTime()) ||
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() + 1 !== month ||
        parsedDate.getDate() !== day
    ) {
        return false;
    }
    return true;
}

export function extractJsonFromResponse(text) {
    try {
        // Handle cases where the model wraps the JSON in markdown ` ```json ... ``` ` or just returns a raw object.
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
        if (!jsonMatch) {
            console.error('JSON extraction error: No JSON object or markdown block found in the response.');
            return null;
        }

        // Use the first captured group that is not undefined.
        // Group 1 is for ```json ... ```, Group 2 is for a raw { ... }
        const jsonString = jsonMatch[1] || jsonMatch[2];

        if (!jsonString) {
            console.error('JSON extraction error: Captured JSON string is empty.');
            return null;
        }

        return JSON.parse(jsonString);
    } catch (err) {
        console.error('JSON parse error:', err.message);
        // Log the problematic text for debugging, but truncate it to avoid flooding logs.
        const truncatedText = text.length > 500 ? text.substring(0, 500) + '...' : text;
        console.error('Problematic text (truncated):', truncatedText);
        return null;
    }
}

