import {
  View, Text, TouchableOpacity, ScrollView,
  Animated, ActivityIndicator, Alert,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { Ionicons }       from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useDocument }    from "../context/DocumentContext";
import { generateQuiz }   from "../services/groqService";

const LABELS = ["A", "B", "C", "D"];

// ─── Single Option ────────────────────────────────────────────────
const Option = ({ text, index, selected, submitted, isCorrect, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 70,  useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 100, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  // Colors based on state
  let border    = "#2e3354";
  let bg        = "#1e2235";
  let textCol   = "#9ca3af";
  let labelBg   = "#1a1d2e";
  let labelText = "#4b5563";

  if (!submitted && selected) {
    border    = "#6366f1"; bg      = "#1e1b4b";
    textCol   = "#c7d2fe"; labelBg = "#6366f1"; labelText = "#fff";
  }
  if (submitted && isCorrect) {
    border    = "#22c55e"; bg      = "#0f1f14";
    textCol   = "#86efac"; labelBg = "#22c55e"; labelText = "#fff";
  }
  if (submitted && selected && !isCorrect) {
    border    = "#ef4444"; bg      = "#1f0f10";
    textCol   = "#fca5a5"; labelBg = "#ef4444"; labelText = "#fff";
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={press}
        disabled={submitted}
        activeOpacity={0.8}
        style={{
          flexDirection: "row", alignItems: "center", gap: 11,
          backgroundColor: bg,
          borderWidth: 1.5, borderColor: border,
          borderRadius: 12, padding: 12, marginBottom: 9,
        }}
      >
        {/* Letter label */}
        <View style={{
          width: 30, height: 30, borderRadius: 9,
          backgroundColor: labelBg,
          alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Text style={{ color: labelText, fontSize: 13, fontWeight: "700" }}>
            {LABELS[index]}
          </Text>
        </View>

        {/* Option text */}
        <Text style={{
          color: textCol, fontSize: 14,
          flex: 1, lineHeight: 21,
        }}>
          {text}
        </Text>

        {/* Result icon */}
        {submitted && isCorrect && (
          <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
        )}
        {submitted && selected && !isCorrect && (
          <Ionicons name="close-circle" size={20} color="#ef4444" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────
export default function QuizScreen() {
  const {
    documentText, hasDocument, fileName,
    generatedQuiz, setGeneratedQuiz,
  } = useDocument();

  const [selected,   setSelected]   = useState({});
  const [submitted,  setSubmitted]  = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error,      setError]      = useState("");

  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1, duration: 500, useNativeDriver: true,
    }).start();
  }, []);

  // Auto-generate when screen opens and doc is ready
  useEffect(() => {
    if (hasDocument && generatedQuiz.length === 0 && !generating) {
      handleGenerate();
    }
  }, [hasDocument]);

  // ─── Generate quiz from Groq ────────────────────────────────
  async function handleGenerate() {
    if (!hasDocument) return;
    try {
      setGenerating(true);
      setError("");
      setSelected({});
      setSubmitted(false);

      const questions = await generateQuiz(documentText);

      // Validate that each question has required fields
      const valid = questions.filter(
        (q) =>
          q.question &&
          Array.isArray(q.options) &&
          q.options.length >= 2 &&
          typeof q.answer === "number"
      );

      if (valid.length === 0) {
        throw new Error("No valid questions were generated. Try again.");
      }

      setGeneratedQuiz(valid);
    } catch (err) {
      setError(err.message);
      Alert.alert("Quiz generation failed", err.message);
    } finally {
      setGenerating(false);
    }
  }

  const questions  = generatedQuiz;
  const answered   = Object.keys(selected).length;
  const allAnswered = answered === questions.length && questions.length > 0;
  const score      = questions.filter((q, i) => selected[i] === q.answer).length;

  // ─── No document state ──────────────────────────────────────
  if (!hasDocument) {
    return (
      <View style={{
        flex: 1, backgroundColor: "#1a1d2e",
        justifyContent: "center", alignItems: "center", padding: 30,
      }}>
        <View style={{
          width: 80, height: 80, borderRadius: 24,
          backgroundColor: "#242840",
          alignItems: "center", justifyContent: "center", marginBottom: 20,
        }}>
          <Ionicons name="help-circle-outline" size={44} color="#2e3354" />
        </View>
        <Text style={{
          color: "#eef2ff", fontSize: 20,
          fontWeight: "800", textAlign: "center",
        }}>
          No Document Loaded
        </Text>
        <Text style={{
          color: "#6b7280", fontSize: 14,
          textAlign: "center", marginTop: 10, lineHeight: 22,
        }}>
          Go to the Upload tab, paste or upload your study material,
          then come back to generate a quiz.
        </Text>
      </View>
    );
  }

  // ─── Generating state ────────────────────────────────────────
  if (generating) {
    return (
      <View style={{
        flex: 1, backgroundColor: "#1a1d2e",
        justifyContent: "center", alignItems: "center", padding: 30,
      }}>
        <LinearGradient
          colors={["#6366f1", "#4f46e5"]}
          style={{
            width: 80, height: 80, borderRadius: 24,
            alignItems: "center", justifyContent: "center", marginBottom: 20,
          }}
        >
          <ActivityIndicator color="#fff" size="large" />
        </LinearGradient>
        <Text style={{ color: "#eef2ff", fontSize: 20, fontWeight: "800" }}>
          Generating Quiz
        </Text>
        <Text style={{
          color: "#6b7280", fontSize: 14,
          marginTop: 8, textAlign: "center", lineHeight: 22,
        }}>
          AI is reading "{fileName}"{"\n"}and creating questions for you...
        </Text>
      </View>
    );
  }

  // ─── Error state ─────────────────────────────────────────────
  if (error && questions.length === 0) {
    return (
      <View style={{
        flex: 1, backgroundColor: "#1a1d2e",
        justifyContent: "center", alignItems: "center", padding: 30,
      }}>
        <Ionicons name="alert-circle-outline" size={54} color="#ef4444" style={{ marginBottom: 16 }} />
        <Text style={{ color: "#eef2ff", fontSize: 18, fontWeight: "800", textAlign: "center" }}>
          Generation Failed
        </Text>
        <Text style={{
          color: "#6b7280", fontSize: 14,
          textAlign: "center", marginTop: 10, lineHeight: 22,
        }}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={handleGenerate}
          style={{
            marginTop: 24, backgroundColor: "#6366f1",
            borderRadius: 12, paddingHorizontal: 28, paddingVertical: 13,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Empty (no questions yet) ────────────────────────────────
  if (questions.length === 0) return null;

  return (
    <Animated.View style={{ flex: 1, opacity: fade, backgroundColor: "#1a1d2e" }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={{ marginTop: 10, marginBottom: 20 }}>
          <Text style={{
            color: "#818cf8", fontSize: 12,
            fontWeight: "700", letterSpacing: 2,
          }}>
            QUIZ MODE
          </Text>

          <View style={{
            flexDirection: "row", alignItems: "center",
            justifyContent: "space-between", marginTop: 6,
          }}>
            <Text style={{ color: "#eef2ff", fontSize: 26, fontWeight: "800" }}>
              Test Yourself
            </Text>

            {/* Score badge */}
            {submitted && (
              <View style={{
                backgroundColor:
                  score >= questions.length / 2 ? "#0f1f14" : "#1f0f10",
                borderWidth: 1.5,
                borderColor:
                  score >= questions.length / 2 ? "#22c55e" : "#ef4444",
                borderRadius: 12,
                paddingHorizontal: 14, paddingVertical: 8,
                alignItems: "center",
              }}>
                <Text style={{
                  fontSize: 22, fontWeight: "800",
                  color:
                    score >= questions.length / 2 ? "#86efac" : "#fca5a5",
                }}>
                  {score}/{questions.length}
                </Text>
                <Text style={{ color: "#4b5563", fontSize: 10, marginTop: 1 }}>
                  {score === questions.length
                    ? "Perfect! 🎉"
                    : score >= questions.length / 2
                    ? "Good job!"
                    : "Keep going!"}
                </Text>
              </View>
            )}
          </View>

          {/* Source file chip */}
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 6,
            backgroundColor: "#1e1b4b", borderRadius: 8,
            paddingHorizontal: 10, paddingVertical: 5,
            alignSelf: "flex-start", marginTop: 10,
          }}>
            <Ionicons name="document-text-outline" size={13} color="#818cf8" />
            <Text style={{
              color: "#818cf8", fontSize: 12, fontWeight: "600",
            }}>
              {fileName}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={{
            marginTop: 14, backgroundColor: "#2e3354",
            borderRadius: 4, height: 5,
          }}>
            <View style={{
              height: 5, borderRadius: 4,
              width: `${(answered / questions.length) * 100}%`,
              backgroundColor: submitted
                ? score >= questions.length / 2 ? "#22c55e" : "#f59e0b"
                : "#6366f1",
            }} />
          </View>
          <Text style={{ color: "#4b5563", fontSize: 12, marginTop: 6 }}>
            {submitted
              ? `${score} correct · ${questions.length - score} incorrect`
              : `${answered} of ${questions.length} answered`}
          </Text>
        </View>

        {/* ── Questions ─────────────────────────────────────── */}
        {questions.map((q, qi) => (
          <View
            key={qi}
            style={{
              backgroundColor: "#242840",
              borderWidth: 1, borderColor: "#2e3354",
              borderRadius: 18, padding: 16, marginBottom: 16,
            }}
          >
            {/* Question number + text */}
            <View style={{
              flexDirection: "row", alignItems: "flex-start",
              gap: 10, marginBottom: 14,
            }}>
              <View style={{
                backgroundColor: "#1e1b4b",
                width: 28, height: 28, borderRadius: 8,
                alignItems: "center", justifyContent: "center",
                marginTop: 1, flexShrink: 0,
              }}>
                <Text style={{
                  color: "#818cf8", fontSize: 13, fontWeight: "700",
                }}>
                  {qi + 1}
                </Text>
              </View>
              <Text style={{
                color: "#eef2ff", fontSize: 15,
                fontWeight: "600", flex: 1, lineHeight: 23,
              }}>
                {q.question}
              </Text>
            </View>

            {/* Options */}
            {Array.isArray(q.options) && q.options.map((opt, oi) => (
              <Option
                key={oi}
                text={opt}
                index={oi}
                selected={selected[qi] === oi}
                submitted={submitted}
                isCorrect={oi === q.answer}
                onPress={() => {
                  if (!submitted) {
                    setSelected((prev) => ({ ...prev, [qi]: oi }));
                  }
                }}
              />
            ))}
          </View>
        ))}

        {/* ── Submit Button ─────────────────────────────────── */}
        <TouchableOpacity
          onPress={
            submitted
              ? () => { setSelected({}); setSubmitted(false); }
              : () => { if (allAnswered) setSubmitted(true); }
          }
          activeOpacity={0.85}
          style={{ borderRadius: 14, overflow: "hidden", marginBottom: 12 }}
        >
          <LinearGradient
            colors={
              submitted
                ? ["#2e3354", "#2e3354"]
                : allAnswered
                ? ["#6366f1", "#4f46e5"]
                : ["#242840", "#242840"]
            }
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{
              flexDirection: "row", alignItems: "center",
              justifyContent: "center", paddingVertical: 15, gap: 8,
            }}
          >
            <Ionicons
              name={submitted ? "refresh-outline" : "checkmark-done-outline"}
              size={20}
              color={
                submitted ? "#9ca3af" :
                allAnswered ? "#fff" : "#4b5563"
              }
            />
            <Text style={{
              fontWeight: "700", fontSize: 15,
              color:
                submitted ? "#9ca3af" :
                allAnswered ? "#fff" : "#4b5563",
            }}>
              {submitted ? "Try Again" : "Submit Quiz"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Regenerate Button ─────────────────────────────── */}
        <TouchableOpacity
          onPress={handleGenerate}
          activeOpacity={0.85}
          style={{
            borderRadius: 14,
            borderWidth: 1, borderColor: "#6366f1",
            flexDirection: "row", alignItems: "center",
            justifyContent: "center",
            paddingVertical: 13, gap: 8,
          }}
        >
          <Ionicons name="sparkles-outline" size={18} color="#818cf8" />
          <Text style={{ color: "#818cf8", fontWeight: "700", fontSize: 14 }}>
            Generate New Quiz
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </Animated.View>
  );
}