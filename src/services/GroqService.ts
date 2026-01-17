import axios from 'axios';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface ParsedScheduleItem {
  code: string;
  name: string;
  day: string;
  time: string;
  room: string;
  teacher: string;
}

export class GroqService {
  private static instance: GroqService;

  private constructor() {}

  public static getInstance(): GroqService {
    if (!GroqService.instance) {
      GroqService.instance = new GroqService();
    }
    return GroqService.instance;
  }

  public async parseTimetableImage(base64Image: string): Promise<ParsedScheduleItem[]> {
    if (!GROQ_API_KEY) throw new Error("Groq API Key is missing");

    const prompt = `
      Analyze this academic timetable image. Extract the course details into a JSON array.
      For each class found, extract:
      - code (e.g., CS-101)
      - name (Subject Name)
      - day (Mon, Tue, Wed, Thu, Fri)
      - time (e.g., 10:00 AM - 11:00 AM)
      - room (e.g., Room 304)
      - teacher (Faculty Name if visible, else "TBA")

      Return ONLY the raw JSON array. Do not include markdown formatting like \`\`\`json.
      Example format: [{"code": "CS-101", "name": "Intro to AI", "day": "Mon", "time": "10:00 AM", "room": "304", "teacher": "Dr. Smith"}]
    `;

    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: "llama-3.2-11b-vision-preview", // Vision capable model
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: base64Image } }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 1024,
        },
        {
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const content = response.data.choices[0].message.content;
      console.log("Groq Raw Response:", content);

      // Clean up response if it contains markdown
      const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Groq API Error:", error);
      throw new Error("Failed to parse timetable image. Ensure the image is clear.");
    }
  }
}
