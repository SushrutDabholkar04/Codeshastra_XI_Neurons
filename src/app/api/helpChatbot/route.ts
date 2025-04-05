import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config();

export async function POST(request: Request) {
    const {prompt} = await request.json();
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `You are a helpful chatbot for a website called Scanner. 
            This website provides features like:
            1. Real-time security alerts (object addition, removal, repositioning using camera input),
            2. Inventory management (tracking positions of objects in camera view),
            3. Space optimization (analyzing filled and empty spaces and giving optimization suggestions).
            Respond concisely and to the point. Avoid using any asterisks, bold text, or unnecessary formatting. 
            The user's question is: ${prompt}
            Answer clearly and directly.`,
        });
        console.log(response.text);
        return Response.json(
            {
                success: true,
                message: "Help Fetched", 
                helpAnswer: response.text,      
            },
            {
                status: 200
            } 
        )   
    } catch (error) {
        console.log(error);
        return Response.json(
            {
                success: false,
                message: "Error fetching help chatbot"
            },
            {
                status: 500
            }
        )
    }
}