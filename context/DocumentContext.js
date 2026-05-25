import React, { createContext, useContext, useState } from "react";

const DocumentContext = createContext(null);

export function DocumentProvider({ children }) {

  // ── Raw text extracted from uploaded file or pasted by user ──
  const [documentText, setDocumentText] = useState("");

  // ── File metadata ─────────────────────────────────────────────
  const [fileName,   setFileName]   = useState("");
  const [fileSize,   setFileSize]   = useState(0);
  const [uploadedAt, setUploadedAt] = useState(null);

  // ── AI generated content ──────────────────────────────────────
  // Stored here so switching tabs doesn't re-call Groq every time
  const [generatedQuiz,       setGeneratedQuiz]       = useState([]);
  const [generatedFlashcards, setGeneratedFlashcards] = useState([]);
  const [generatedNotes,      setGeneratedNotes]      = useState("");

  // ── Loading states ────────────────────────────────────────────
  const [isGeneratingQuiz,       setIsGeneratingQuiz]       = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  // ── saveDocument ──────────────────────────────────────────────
  // Called from UploadScreen when user taps "Save Notes"
  // Stores the text + metadata and clears old AI content
  function saveDocument(text, name, size) {
    setDocumentText(text);
    setFileName(name   || "Untitled document");
    setFileSize(size   || 0);
    setUploadedAt(new Date());

    // Clear previously generated content so new doc gets fresh results
    setGeneratedQuiz([]);
    setGeneratedFlashcards([]);
    setGeneratedNotes("");
  }

  // ── clearDocument ─────────────────────────────────────────────
  // Called on logout or when user wants to start fresh
  function clearDocument() {
    setDocumentText("");
    setFileName("");
    setFileSize(0);
    setUploadedAt(null);
    setGeneratedQuiz([]);
    setGeneratedFlashcards([]);
    setGeneratedNotes("");
  }

  // ── Computed helpers ──────────────────────────────────────────
  const wordCount   = documentText.trim()
    ? documentText.trim().split(/\s+/).length
    : 0;

  // hasDocument — used in every screen to check if text is loaded
  // ChatScreen  → blocks sending if false
  // QuizScreen  → shows "no document" screen if false
  // FlashcardScreen → shows "no document" screen if false
  const hasDocument = documentText.trim().length > 0;

  return (
    <DocumentContext.Provider value={{
      // ── Document data ────────────────────────────────────────
      documentText,
      setDocumentText,
      fileName,
      fileSize,
      uploadedAt,
      wordCount,
      hasDocument,

      // ── Actions ──────────────────────────────────────────────
      saveDocument,
      clearDocument,

      // ── AI generated content ─────────────────────────────────
      generatedNotes,
      setGeneratedNotes,
      generatedQuiz,
      setGeneratedQuiz,
      generatedFlashcards,
      setGeneratedFlashcards,

      // ── Loading states ────────────────────────────────────────
      isGeneratingQuiz,
      setIsGeneratingQuiz,
      isGeneratingFlashcards,
      setIsGeneratingFlashcards,
    }}>
      {children}
    </DocumentContext.Provider>
  );
}

// ── Custom hook ───────────────────────────────────────────────────
// Use this in every screen instead of useContext(DocumentContext)
// Usage: const { documentText, hasDocument, saveDocument } = useDocument();
export const useDocument = () => useContext(DocumentContext);