import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({
  apiKey,
});

export type ModerationStatus =
  | "SAFE"
  | "UNSAFE"
  | "REVIEW";

export type ContentType =
  | "NOTE"
  | "PYQ"
  | "OPPORTUNITY"
  | "GENERAL";

export interface ModerationResult {
  status: ModerationStatus;
  score: number;
  reasons: string[];
  categories: string[];
  summary: string;
}

interface ModerationInput {
  content: string;
  contentType?: ContentType;
  title?: string;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error: any): boolean => {
  const message =
    error?.message ||
    error?.error?.message ||
    String(error);

  return (
    message.includes("503") ||
    message.includes("UNAVAILABLE") ||
    message.includes("429") ||
    message.toLowerCase().includes("high demand") ||
    message.toLowerCase().includes("rate limit") ||
    message.toLowerCase().includes("temporarily")
  );
};

const reviewFallback = (
  reason = "AI moderation service is temporarily unavailable."
): ModerationResult => ({
  status: "REVIEW",
  score: 0.5,
  reasons: [reason],
  categories: ["AI_SERVICE_UNAVAILABLE"],
  summary:
    "The content could not be automatically verified and requires human review.",
});

/**
 * AI-powered content moderation for Elaris-One.
 *
 * This service ONLY analyzes content.
 * It does not create database records,
 * upload files, or modify existing resources.
 */
export const moderateContent = async ({
  content,
  contentType = "GENERAL",
  title = "",
}: ModerationInput): Promise<ModerationResult> => {
  if (!content || !content.trim()) {
    throw new Error("Content is required for moderation");
  }

  const prompt = `
You are the AI content safety and quality moderator for Elaris-One,
a college campus platform used by students and faculty.

Analyze the supplied content before it is published on the platform.

CONTENT TYPE:
${contentType}

TITLE:
${title || "Not provided"}

CONTENT:
${content}

Check for the following:

1. Explicit sexual content
2. Sexual exploitation or sexual solicitation
3. Hate speech or hateful content
4. Harassment, bullying, or threats
5. Graphic or unnecessary violence
6. Illegal activities or instructions facilitating illegal activity
7. Dangerous instructions that could seriously harm someone
8. Malware, phishing, scams, credential theft, or suspicious links
9. Spam or obvious promotional abuse
10. Personally sensitive information that should not be publicly exposed
11. Content unrelated to the selected Elaris-One category
12. Misleading or obviously suspicious academic/campus content

IMPORTANT:

- Academic content such as programming, mathematics, engineering,
  cybersecurity education, networking, operating systems, etc. is
  NOT unsafe merely because it discusses technical or security topics.
- Educational discussion of harmful topics is allowed when it is
  clearly academic and not providing harmful real-world instructions.
- Do not flag ordinary student information such as a name, college,
  branch, semester, or subject as unsafe by itself.
- Be conservative with UNSAFE.
- Use REVIEW when the content is questionable or requires human
  verification.
- Do not invent problems that are not present.

DECISION RULES:

SAFE:
Content appears appropriate for a college campus platform.

UNSAFE:
Content clearly violates safety rules or contains clearly harmful,
explicit, illegal, malicious, or seriously inappropriate material.

REVIEW:
Content is ambiguous, suspicious, incomplete, or requires a human
moderator to make the final decision.

Return ONLY valid JSON in exactly this structure:

{
  "status": "SAFE",
  "score": 0.95,
  "reasons": [],
  "categories": [],
  "summary": "Content appears appropriate for Elaris-One."
}

Rules for the JSON:

- status must be exactly SAFE, UNSAFE, or REVIEW.
- score must be a number between 0 and 1.
- reasons must be an array of short strings.
- categories must be an array of short category names.
- summary must be a short explanation.
- Do not include markdown.
- Do not include code fences.
`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      const text = response.text?.trim();

      if (!text) {
        throw new Error(
          "Gemini returned an empty moderation response"
        );
      }

      let parsed: ModerationResult;

      try {
        parsed = JSON.parse(text);
      } catch {
        console.error(
          "Invalid moderation JSON:",
          text
        );

        throw new Error(
          "Gemini returned invalid moderation JSON"
        );
      }

      if (
        !["SAFE", "UNSAFE", "REVIEW"].includes(
          parsed.status
        )
      ) {
        throw new Error(
          "Invalid moderation status"
        );
      }

      if (
        typeof parsed.score !== "number" ||
        parsed.score < 0 ||
        parsed.score > 1
      ) {
        throw new Error(
          "Invalid moderation score"
        );
      }

      if (!Array.isArray(parsed.reasons)) {
        parsed.reasons = [];
      }

      if (!Array.isArray(parsed.categories)) {
        parsed.categories = [];
      }

      if (typeof parsed.summary !== "string") {
        parsed.summary =
          "Content moderation completed.";
      }

      return parsed;
    } catch (error: any) {
      console.error(
        `Moderation attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
        error?.message || error
      );

      const retryable = isRetryableError(error);

      if (
        retryable &&
        attempt < MAX_RETRIES
      ) {
        console.log(
          `Retrying moderation in ${RETRY_DELAY_MS}ms...`
        );

        await sleep(RETRY_DELAY_MS);

        continue;
      }

      if (retryable) {
        console.warn(
          "Gemini unavailable after retries. Returning REVIEW."
        );

        return reviewFallback();
      }

      throw error;
    }
  }

  return reviewFallback();
};