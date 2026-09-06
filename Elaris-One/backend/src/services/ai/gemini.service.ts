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

export async function generateAIResponse(
  message: string,
  context?: AIContext
): Promise<string> {
  try {
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
   When the student asks about notes, PYQs, internships, jobs,
   hackathons, events, or other campus resources, use ONLY the
   resources provided in AVAILABLE CAMPUS NOTES, AVAILABLE PYQs,
   and AVAILABLE OPPORTUNITIES.

4. If a resource list is non-empty, explicitly mention the resources
   that are actually present.

5. Never say "there are no resources" when the corresponding
   campus data contains resources.

6. If the requested category contains no matching resources,
   clearly say that no matching resource was found.

7. Do not invent resource titles, companies, subjects, years,
   deadlines, or other campus information.
8. Use simple formatting with headings or bullet points when helpful.

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

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    return text;
  } catch (error: any) {
    console.error("=================================");
    console.error("GEMINI API ERROR");
    console.error("=================================");
    console.error(error?.message || error);
    console.error("=================================");

    throw error;
  }
}