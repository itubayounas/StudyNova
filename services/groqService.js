// services/groqService.js

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL        = "meta-llama/llama-4-scout-17b-16e-instruct"; // best free Groq model

// ─── Base function — all features use this ───────────────────────
async function callGroq(systemPrompt, userPrompt) {
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key is missing. Check your .env file.");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model:       MODEL,
      temperature: 0.4,
      max_tokens:  2000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt   },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Groq API call failed");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ─── 1. CHAT ─────────────────────────────────────────────────────
// Send the document text + user question → get an answer
export async function chatWithDocument(documentText, userQuestion, chatHistory = []) {
  const systemPrompt = `
You are a helpful AI study tutor.
The student has uploaded a document. Use ONLY the document content to answer questions.
Be clear, concise and friendly.
If the answer is not in the document, say so honestly.

DOCUMENT CONTENT:
${documentText.slice(0, 6000)}
  `.trim();

  // Build conversation history for context
  const messages = [
    { role: "system", content: systemPrompt },
    ...chatHistory.slice(-6), // last 6 messages for context window
    { role: "user", content: userQuestion },
  ];

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model:       MODEL,
      temperature: 0.5,
      max_tokens:  1000,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Chat failed");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ─── 2. QUIZ ─────────────────────────────────────────────────────
// Send document text → get 8 MCQ questions as JSON array
export async function generateQuiz(documentText) {
  const systemPrompt = `
You are a quiz generator.
Generate exactly 8 multiple choice questions from the document.
Return ONLY a valid JSON array. No explanation, no markdown, no extra text.

Format:
[
  {
    "question": "...",
    "options": ["option A", "option B", "option C", "option D"],
    "answer": 0
  }
]

"answer" is the index (0-3) of the correct option.
  `.trim();

  const userPrompt = `
Generate 8 quiz questions from this document:

${documentText.slice(0, 6000)}
  `.trim();

  const raw = await callGroq(systemPrompt, userPrompt);

  // Strip markdown code fences if Groq adds them
  const clean = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) throw new Error("Not an array");
    return parsed;
  } catch {
    throw new Error("Quiz generation failed — invalid response format. Try again.");
  }
}

// ─── 3. FLASHCARDS ───────────────────────────────────────────────
// Send document text → get 10 flashcards as JSON array
export async function generateFlashcards(documentText) {
  const systemPrompt = `
You are a flashcard generator.
Generate exactly 10 flashcards from the document.
Return ONLY a valid JSON array. No explanation, no markdown, no extra text.

Format:
[
  {
    "front": "question or term",
    "back": "answer or definition"
  }
]
  `.trim();

  const userPrompt = `
Generate 10 flashcards from this document:

${documentText.slice(0, 6000)}
  `.trim();

  const raw = await callGroq(systemPrompt, userPrompt);

  const clean = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) throw new Error("Not an array");
    return parsed;
  } catch {
    throw new Error("Flashcard generation failed — invalid response format. Try again.");
  }
}