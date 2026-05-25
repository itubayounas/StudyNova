import * as FileSystem from "expo-file-system/legacy";

const GROQ_API_KEY   = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ─── File type → mime type map ────────────────────────────────────
const MIME_TYPES = {
  pdf:  "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc:  "application/msword",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt:  "application/vnd.ms-powerpoint",
  txt:  "text/plain",
  md:   "text/plain",
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  png:  "image/png",
  webp: "image/webp",
  gif:  "image/gif",
  bmp:  "image/bmp",
};

// ─── Main entry ───────────────────────────────────────────────────
export async function extractTextFromFile(fileUri, fileName, mimeType) {
  const ext = fileName.split(".").pop().toLowerCase();

  // TXT — read directly, fastest, no API needed
  if (ext === "txt" || ext === "md") {
    return await parseTxt(fileUri);
  }

  // DOCUMENTS — Gemini handles PDF, DOCX, PPTX natively
  const docExts = ["pdf", "docx", "doc", "pptx", "ppt"];
  if (docExts.includes(ext)) {
    const mime = MIME_TYPES[ext] || "application/octet-stream";
    return await parseViaGemini(fileUri, mime);
  }

  // IMAGES — Groq Vision (already working perfectly)
  const imageExts = ["jpg", "jpeg", "png", "webp", "gif", "bmp"];
  if (
    imageExts.includes(ext) ||
    (mimeType && mimeType.startsWith("image/"))
  ) {
    return await parseViaGroqVision(fileUri);
  }

  // Last resort — try plain text
  try {
    return await parseTxt(fileUri);
  } catch {
    throw new Error(
      `Unsupported file type: .${ext}\n` +
      `Supported: PDF, DOCX, PPTX, TXT, JPG, PNG`
    );
  }
}

// ─── TXT — direct read ────────────────────────────────────────────
async function parseTxt(uri) {
  const text = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  if (!text.trim()) throw new Error("The file appears to be empty.");
  return text.trim();
}

// ─── GEMINI — handles PDF, DOCX, PPTX natively ───────────────────
// Gemini's inline_data accepts any document format as base64
// No conversion needed — Gemini reads the raw file directly
async function parseViaGemini(uri, mimeType) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key missing.\n" +
      "Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.\n" +
      "Get a free key at: aistudio.google.com/apikey"
    );
  }

  // Check file
  let fileInfo;
  try {
    fileInfo = await FileSystem.getInfoAsync(uri);
  } catch (e) {
    throw new Error("Cannot access file: " + e.message);
  }

  if (!fileInfo.exists) {
    throw new Error("File not found. Please try uploading again.");
  }
  if (fileInfo.size === 0) {
    throw new Error("File is empty.");
  }
  if (fileInfo.size > 20 * 1024 * 1024) {
    throw new Error(
      "File too large (max 20MB).\n" +
      "Try a smaller file or paste the text directly."
    );
  }

  // Read as base64
  let base64;
  try {
    base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (e) {
    throw new Error("Could not read file: " + e.message);
  }

  if (!base64 || base64.length === 0) {
    throw new Error("File could not be read. Try another file.");
  }

  // Call Gemini API with inline base64 document
  let response;
  try {
    response = await fetch(GEMINI_URL, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                // Gemini accepts any document format inline as base64
                inline_data: {
                  mime_type: mimeType,
                  data:      base64,
                },
              },
              {
                text:
                  "Extract ALL text from this document exactly as it appears. " +
                  "Include all headings, paragraphs, bullet points, " +
                  "tables, and numbered lists. " +
                  "Preserve the structure as much as possible. " +
                  "Output the raw extracted text only — no commentary, " +
                  "no explanations, no markdown formatting.",
              },
            ],
          },
        ],
        generationConfig: {
          temperature:     0.1,  // low temp = accurate extraction
          maxOutputTokens: 8192,
        },
      }),
    });
  } catch (e) {
    throw new Error(
      "Network error calling Gemini API.\n" +
      "Check your internet connection.\n" + e.message
    );
  }

  if (!response.ok) {
    let errMsg = "Unknown error";
    try {
      const err = await response.json();
      errMsg =
        err.error?.message ||
        err.error?.status  ||
        JSON.stringify(err);
    } catch {}
    throw new Error("Gemini API error: " + errMsg);
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error("Invalid response from Gemini API.");
  }

  // Gemini response structure
  const extracted =
    data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!extracted || !extracted.trim()) {
    throw new Error(
      "No text found in this file.\n" +
      "Make sure the file contains readable text."
    );
  }

  return extracted.trim();
}

// ─── GROQ VISION — images only ────────────────────────────────────
async function parseViaGroqVision(uri) {
  if (!GROQ_API_KEY) {
    throw new Error(
      "Groq API key missing.\n" +
      "Check your .env file has EXPO_PUBLIC_GROQ_API_KEY set."
    );
  }

  let fileInfo;
  try {
    fileInfo = await FileSystem.getInfoAsync(uri);
  } catch (e) {
    throw new Error("Cannot access file: " + e.message);
  }

  if (!fileInfo.exists) throw new Error("File not found.");
  if (fileInfo.size === 0) throw new Error("File is empty.");
  if (fileInfo.size > 4 * 1024 * 1024) {
    throw new Error("Image too large (max 4MB). Try a smaller image.");
  }

  let base64;
  try {
    base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (e) {
    throw new Error("Could not read image: " + e.message);
  }

  let response;
  try {
    response = await fetch(GROQ_URL, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:      "meta-llama/llama-4-scout-17b-16e-instruct",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [
              {
                type:      "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                },
              },
              {
                type: "text",
                text:
                  "Extract ALL text from this image exactly as it appears. " +
                  "Include all headings, paragraphs, bullet points, tables. " +
                  "Output raw text only — no commentary.",
              },
            ],
          },
        ],
      }),
    });
  } catch (e) {
    throw new Error("Network error: " + e.message);
  }

  if (!response.ok) {
    let errMsg = "Unknown error";
    try {
      const err = await response.json();
      errMsg = err.error?.message || JSON.stringify(err);
    } catch {}
    throw new Error("Groq Vision error: " + errMsg);
  }

  const data      = await response.json();
  const extracted = data.choices?.[0]?.message?.content;

  if (!extracted?.trim()) {
    throw new Error("No text found in this image.");
  }

  return extracted.trim();
}