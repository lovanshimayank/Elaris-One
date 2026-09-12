import fs from "fs";
import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({ apiKey });

export type FileModerationStatus = "SAFE" | "UNSAFE" | "REVIEW";

export interface FileModerationResult {
  status: FileModerationStatus;
  score: number;
  reasons: string[];
  categories: string[];
  summary: string;
}

const MODEL = "gemini-3.6-flash";

const fallbackResult = (
  reason = "AI file moderation service is temporarily unavailable."
): FileModerationResult => ({
  status: "REVIEW",
  score: 0.5,
  reasons: [reason],
  categories: ["AI_SERVICE_UNAVAILABLE"],
  summary:
    "The uploaded file could not be automatically verified and requires human review.",
});

const parseResult = (text: string): FileModerationResult => {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  if (!["SAFE", "UNSAFE", "REVIEW"].includes(parsed.status)) {
    throw new Error("Invalid file moderation status");
  }

  if (
    typeof parsed.score !== "number" ||
    parsed.score < 0 ||
    parsed.score > 1
  ) {
    throw new Error("Invalid file moderation score");
  }

  return {
    status: parsed.status,
    score: parsed.score,
    reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
    categories: Array.isArray(parsed.categories)
      ? parsed.categories
      : [],
    summary:
      typeof parsed.summary === "string"
        ? parsed.summary
        : "File moderation completed.",
  };
};

export const moderateUploadedFile = async (
  filePath: string,
  mimeType: string
): Promise<FileModerationResult> => {
  if (!fs.existsSync(filePath)) {
    throw new Error("Uploaded file could not be found for moderation");
  }

  if (
    mimeType !== "application/pdf" &&
    mimeType !== "image/png" &&
    mimeType !== "image/jpeg" &&
    mimeType !== "image/jpg"
  ) {
    return fallbackResult("Unsupported file type for AI content inspection.");
  }

  let uploadedFile: any = null;

  try {
    console.log("========== FILE CONTENT MODERATION ==========");
    console.log("File:", filePath);
    console.log("MIME:", mimeType);

    uploadedFile = await ai.files.upload({
      file: filePath,
      config: {
        mimeType,
      },
    });

    console.log("Gemini file uploaded:", uploadedFile.name);

    const prompt = `
You are the visual and document safety moderator for Elaris-One,
a college campus platform.

Inspect the ACTUAL CONTENT of the uploaded file, not just its filename.

The file may be:
- an academic PDF
- a scanned academic PDF
- a question paper
- lecture notes
- a college document
- an image containing academic/campus information

Your most important task is to detect content that must NOT be published
on a college platform.

STRICTLY CHECK FOR:

1. Explicit sexual content
2. Visible nudity or sexually explicit imagery
3. Sexual solicitation or pornographic material
4. Sexual exploitation
5. Graphic sexual material embedded inside a PDF
6. Graphic or unnecessary violence
7. Hate symbols or hateful imagery
8. Malware/phishing/scam content represented visually
9. Extremely inappropriate non-academic material
10. Suspicious content clearly unrelated to a college platform

IMPORTANT ACADEMIC RULES:

- Do NOT flag normal academic diagrams.
- Do NOT flag anatomy/medical educational diagrams merely because they
  contain human anatomy.
- Do NOT flag mathematics, programming, engineering, networking,
  cybersecurity or operating-system content merely because the topic
  can be technical or security-related.
- Do NOT flag ordinary photographs of people.
- Do NOT flag normal college documents.
- Do NOT flag a document simply because it contains a person's name.
- Educational content should only be marked UNSAFE when the actual
  material clearly crosses the safety boundary.

DECISION:

SAFE:
The actual file content is appropriate for Elaris-One.

UNSAFE:
The actual file clearly contains explicit sexual/nudity content,
sexual exploitation, graphic inappropriate material, or another
clearly prohibited category.

REVIEW:
The file is ambiguous, difficult to inspect, corrupted, or requires
human verification.

IMPORTANT:
If explicit sexual or nudity content is clearly visible anywhere in
the file, classify it as UNSAFE even if the filename or surrounding
text looks academic.

Return ONLY valid JSON:

{
  "status": "SAFE",
  "score": 0.98,
  "reasons": [],
  "categories": [],
  "summary": "The actual file content appears appropriate for Elaris-One."
}

Possible categories include:
"Nudity",
"Explicit Sexual Content",
"Sexual Exploitation",
"Graphic Violence",
"Hate",
"Malicious Content",
"Spam",
"Non-Academic Content",
"Other"

Do not include markdown.
`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: createUserContent([
        createPartFromUri(
          uploadedFile.uri,
          uploadedFile.mimeType || mimeType
        ),
        prompt,
      ]),
    });

    const text = response.text?.trim();

    if (!text) {
      throw new Error("Gemini returned an empty file moderation response");
    }

    const result = parseResult(text);

    console.log("File Moderation Result:", result);

    return result;
  } catch (error: any) {
    console.error(
      "File moderation error:",
      error?.message || error
    );

    return fallbackResult(
      error?.message || "File moderation failed."
    );
  } finally {
    if (uploadedFile?.name) {
      try {
        await ai.files.delete({
          name: uploadedFile.name,
        });

        console.log(
          "Temporary Gemini file deleted:",
          uploadedFile.name
        );
      } catch (deleteError: any) {
        console.warn(
          "Could not delete temporary Gemini file:",
          deleteError?.message || deleteError
        );
      }
    }
  }
};
