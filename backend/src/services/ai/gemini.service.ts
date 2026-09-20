import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({
  apiKey,
});

interface AIContext {
  user?: {
    fullName?: string | null;
    email?: string | null;
    role?: string | null;
    semester?: number | null;
    branch?: string | null;
  };

  notes?: Array<{
    title: string;
    description?: string | null;
    semester: number;
    branch: string;
    subject?: {
      name: string;
      code?: string | null;
    } | null;
  }>;

  pyqs?: Array<{
    title: string;
    semester: number;
    branch: string;
    year: number;
  }>;

  opportunities?: Array<{
    title: string;
    description: string;
    company?: string | null;
    location?: string | null;
    type: string;
    deadline?: Date | string | null;
  }>;
}

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isTemporaryGeminiError = (error: any): boolean => {
  const status = error?.status;
  const message = String(error?.message || "").toLowerCase();

  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes("high demand") ||
    message.includes("unavailable") ||
    message.includes("overloaded") ||
    message.includes("temporarily")
  );
};

async function generateWithModel(
  model: string,
  prompt: string
): Promise<string> {
  const maxAttempts = 3;

  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(
        `AI request: model=${model}, attempt=${attempt}/${maxAttempts}`
      );

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const text = response?.text?.trim();

      if (!text) {
        throw new Error(
          `Gemini returned an empty response from ${model}`
        );
      }

      console.log(
        `AI response generated using ${model}`
      );

      return text;
    } catch (error: any) {
      lastError = error;

      const status = error?.status;

      console.error(
        `Gemini error: model=${model}, attempt=${attempt}, status=${status}`
      );

      if (!isTemporaryGeminiError(error)) {
        throw error;
      }

      if (attempt < maxAttempts) {
        const baseDelay = 1000 * Math.pow(2, attempt - 1);
        const jitter = Math.floor(Math.random() * 500);
        const delay = baseDelay + jitter;

        console.warn(
          `Temporary Gemini error. Retrying in ${delay}ms...`
        );

        await sleep(delay);
      }
    }
  }

  throw lastError || new Error(
    `Gemini model ${model} failed`
  );
}

async function generateWithFallback(
  prompt: string
): Promise<string> {
  const models = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
  ];

  let lastError: any = null;

  for (const model of models) {
    try {
      return await generateWithModel(model, prompt);
    } catch (error: any) {
      lastError = error;

      console.error(
        `Model ${model} failed.`
      );

      /*
       * Do not fallback for permanent request/configuration
       * errors such as invalid API keys or malformed requests.
       */
      if (!isTemporaryGeminiError(error)) {
        throw error;
      }

      console.warn(
        `Trying fallback model after temporary failure: ${model}`
      );
    }
  }

  throw lastError || new Error(
    "All configured Gemini models failed"
  );
}

export async function generateAIResponse(
  message: string,
  context?: AIContext
): Promise<string> {
  const prompt = `
You are Elaris AI, an intelligent campus assistant.

Your job is to help students with:
- academics
- study planning
- subjects
- notes
- previous year questions
- internships
- jobs
- hackathons
- campus opportunities
- programming and technical concepts

IMPORTANT RULES:

1. Give clear and useful answers.
2. Personalize responses using the student's context when relevant.

3. RESOURCE ACCURACY:
When the student asks about notes, PYQs, internships,
jobs, hackathons, events, or other campus resources,
use ONLY the resources provided in the available campus data.

4. If a resource list is non-empty, explicitly mention
resources that are actually present.

5. Never invent resource titles, companies, subjects,
years, deadlines, or other campus information.

6. If the requested category contains no matching resources,
clearly say that no matching resource was found.

7. For general academic questions, answer using your
general knowledge.

8. Use simple formatting with headings or bullet points
when helpful.

STUDENT CONTEXT:
${JSON.stringify(context?.user ?? {}, null, 2)}

AVAILABLE CAMPUS NOTES:
${JSON.stringify(
  (context?.notes ?? []).map((note) => ({
    title: note.title,
    description: note.description,
    semester: note.semester,
    branch: note.branch,
    subject: note.subject?.name,
    subjectCode: note.subject?.code,
  })),
  null,
  2
)}

AVAILABLE PYQs:
${JSON.stringify(
  (context?.pyqs ?? []).map((pyq) => ({
    title: pyq.title,
    semester: pyq.semester,
    branch: pyq.branch,
    year: pyq.year,
  })),
  null,
  2
)}

AVAILABLE OPPORTUNITIES:
${JSON.stringify(
  (context?.opportunities ?? []).map((opportunity) => ({
    title: opportunity.title,
    description: opportunity.description,
    company: opportunity.company,
    location: opportunity.location,
    type: opportunity.type,
    deadline: opportunity.deadline,
  })),
  null,
  2
)}

STUDENT QUESTION:
${message}

Now answer the student's question as Elaris AI.
`;

  try {
    return await generateWithFallback(prompt);
  } catch (error: any) {
    console.error("=================================");
    console.error("GEMINI API ERROR");
    console.error("=================================");
    console.error(error?.message || error);
    console.error("=================================");

    throw error;
  }
}
