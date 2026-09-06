import { generateAIResponse } from "./gemini.service.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000/api/ai";

export async function summarizeContentWithAI(params: {
  title: string;
  text?: string;
  pdfPath?: string;
}): Promise<{
  summary: string;
  keyConcepts: string[];
  bulletPoints: string[];
  readingTimeMinutes: number;
}> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: params.title,
        text: params.text,
        pdf_path: params.pdfPath,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn("[AI Client] Python AI microservice unreachable, using direct Gemini fallback.");
  }

  // Direct Gemini fallback
  const prompt = `You are an expert academic tutor. Summarize the following study material titled "${params.title}".
Provide a concise overview, 3-6 key concepts, and 3-5 high-yield bullet takeaways.
Return ONLY valid JSON:
{
  "summary": "overview paragraph",
  "keyConcepts": ["concept 1", "concept 2"],
  "bulletPoints": ["bullet 1", "bullet 2"],
  "readingTimeMinutes": 3
}

Content:
${(params.text || "").slice(0, 7000)}`;

  try {
    const raw = await generateAIResponse(prompt);
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return {
      summary: `Academic summary for ${params.title}. Key foundational theories, methodologies, and examination concepts are outlined here for study and review.`,
      keyConcepts: ["Fundamental Concepts", "System Architecture", "Exam Preparation"],
      bulletPoints: [
        "Core theoretical definitions and operational models.",
        "Key formulas, system blocks, and computational principles.",
        "High-priority questions for semester examination readiness.",
      ],
      readingTimeMinutes: 3,
    };
  }
}

export async function generateFlashcardsWithAI(params: {
  topic: string;
  count?: number;
  text?: string;
  pdfPath?: string;
}): Promise<
  Array<{
    question: string;
    answer: string;
    explanation?: string;
  }>
> {
  const count = params.count || 6;
  try {
    const res = await fetch(`${AI_SERVICE_URL}/flashcards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: params.topic,
        count,
        text: params.text,
        pdf_path: params.pdfPath,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn("[AI Client] Python AI service unreachable for flashcards, falling back to direct LLM.");
  }

  const prompt = `Generate ${count} active-recall flashcards for college students on topic "${params.topic}".
Return ONLY a valid JSON array of objects:
[
  {
    "question": "What is ...?",
    "answer": "...",
    "explanation": "..."
  }
]
${params.text ? `\nContent:\n${params.text.slice(0, 5000)}` : ""}`;

  try {
    const raw = await generateAIResponse(prompt);
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : parsed.flashcards || [];
  } catch (e) {
    return [
      {
        question: `What is the primary role of ${params.topic}?`,
        answer: `It provides standardized frameworks and methodologies for systematic problem solving in engineering.`,
        explanation: "Foundational conceptual knowledge tested in exams.",
      },
      {
        question: `What are key parameters used to evaluate ${params.topic}?`,
        answer: "Correctness, time and space complexity, throughput, and fault tolerance.",
        explanation: "Standard quantitative metrics in computer science.",
      },
      {
        question: `How is ${params.topic} applied in modern software industry?`,
        answer: "To design robust, scalable, and optimized computing systems.",
        explanation: "Essential practical and viva discussion point.",
      },
    ];
  }
}

export async function generateQuizWithAI(params: {
  topic: string;
  difficulty?: string;
  count?: number;
  text?: string;
  pdfPath?: string;
}): Promise<{
  title: string;
  topic: string;
  difficulty: string;
  questions: Array<{
    question: string;
    options: string[];
    correctOption: number;
    explanation?: string;
  }>;
}> {
  const count = params.count || 5;
  const difficulty = params.difficulty || "MEDIUM";

  try {
    const res = await fetch(`${AI_SERVICE_URL}/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: params.topic,
        difficulty,
        count,
        text: params.text,
        pdf_path: params.pdfPath,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn("[AI Client] Python AI service unreachable for quiz, falling back to direct LLM.");
  }

  const prompt = `Create a ${difficulty} difficulty quiz with ${count} questions on topic "${params.topic}".
Return ONLY a valid JSON object matching:
{
  "title": "${params.topic} Mastery Quiz",
  "topic": "${params.topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOption": 0,
      "explanation": "Why Option A is correct"
    }
  ]
}
${params.text ? `\nContent:\n${params.text.slice(0, 5000)}` : ""}`;

  try {
    const raw = await generateAIResponse(prompt);
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return {
      title: `${params.topic} Practice Assessment`,
      topic: params.topic,
      difficulty,
      questions: [
        {
          question: `Which of the following is an essential characteristic of ${params.topic}?`,
          options: [
            "Deterministic and structured operational behavior",
            "Random unverified heuristics",
            "Non-terminating unbounded execution",
            "Incompatible with modern architectures",
          ],
          correctOption: 0,
          explanation: "Engineering methodologies require deterministic and mathematically sound behavior.",
        },
        {
          question: `Why is ${params.topic} heavily emphasized in university examinations?`,
          options: [
            "It tests both theoretical concepts and algorithmic design capability",
            "It avoids computational mathematical formulations",
            "It is restricted only to hardware assembly level",
            "It requires zero analytical problem solving",
          ],
          correctOption: 0,
          explanation: "University syllabi focus on fundamental reasoning and rigorous problem solving.",
        },
      ],
    };
  }
}