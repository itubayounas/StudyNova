import { View, Text, TouchableOpacity, ScrollView, Animated } from "react-native";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const QUESTIONS = [
  {
    id: 1,
    question: "What is photosynthesis?",
    options: ["A process of respiration", "Converting sunlight to energy", "Cell division", "Protein synthesis"],
    answer: 1,
  },
  {
    id: 2,
    question: "Which is the powerhouse of the cell?",
    options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
    answer: 2,
  },
  {
    id: 3,
    question: "Plants absorb which gas to photosynthesize?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    answer: 2,
  },
];

const LABELS = ["A", "B", "C", "D"];

const Option = ({ text, index, selected, submitted, isCorrect, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 70, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  // Work out colors based on state
  let border = "#2e3354";
  let bg = "#242840";
  let textCol = "#9ca3af";
  let labelBg = "#1a1d2e";
  let labelText = "#4b5563";

  if (!submitted && selected) {
    border = "#6366f1"; bg = "#1e1b4b"; textCol = "#c7d2fe"; labelBg = "#6366f1"; labelText = "#fff";
  }
  if (submitted && isCorrect) {
    border = "#22c55e"; bg = "#0f1f14"; textCol = "#86efac"; labelBg = "#22c55e"; labelText = "#fff";
  }
  if (submitted && selected && !isCorrect) {
    border = "#ef4444"; bg = "#1f0f10"; textCol = "#fca5a5"; labelBg = "#ef4444"; labelText = "#fff";
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={press} disabled={submitted} activeOpacity={0.8}
        style={{
          flexDirection: "row", alignItems: "center", gap: 11,
          backgroundColor: bg, borderWidth: 1.5, borderColor: border,
          borderRadius: 12, padding: 12, marginBottom: 8,
        }}
      >
        <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: labelBg, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: labelText, fontSize: 12, fontWeight: "700" }}>{LABELS[index]}</Text>
        </View>
        <Text style={{ color: textCol, fontSize: 14, flex: 1, lineHeight: 20 }}>{text}</Text>
        {submitted && isCorrect && <Ionicons name="checkmark-circle" size={18} color="#22c55e" />}
        {submitted && selected && !isCorrect && <Ionicons name="close-circle" size={18} color="#ef4444" />}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function QuizScreen() {
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const score = QUESTIONS.filter((q) => selected[q.id] === q.answer).length;
  const answered = Object.keys(selected).length;
  const allAnswered = answered === QUESTIONS.length;

  const reset = () => { setSelected({}); setSubmitted(false); };

  return (
    <Animated.View style={{ flex: 1, opacity: fade, backgroundColor: "#1a1d2e" }}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 50 }}>

        {/* Header */}
        <View style={{ marginTop: 10, marginBottom: 22 }}>
          <Text style={{ color: "#818cf8", fontSize: 12, fontWeight: "700", letterSpacing: 2 }}>QUIZ MODE</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
            <Text style={{ color: "#eef2ff", fontSize: 27, fontWeight: "800" }}>Test Yourself</Text>

            {/* Score badge — only shows after submit */}
            {submitted && (
              <View style={{
                backgroundColor: score >= 2 ? "#0f1f14" : "#1f0f10",
                borderWidth: 1.5, borderColor: score >= 2 ? "#22c55e" : "#ef4444",
                borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, alignItems: "center",
              }}>
                <Text style={{ color: score >= 2 ? "#86efac" : "#fca5a5", fontSize: 22, fontWeight: "800" }}>
                  {score}/{QUESTIONS.length}
                </Text>
                <Text style={{ color: "#4b5563", fontSize: 10, marginTop: 1 }}>
                  {score === QUESTIONS.length ? "Perfect!" : score >= 2 ? "Good job" : "Keep going"}
                </Text>
              </View>
            )}
          </View>

          {/* Progress bar */}
          <View style={{ marginTop: 16, backgroundColor: "#2e3354", borderRadius: 4, height: 5 }}>
            <View style={{
              height: 5, borderRadius: 4,
              width: `${(answered / QUESTIONS.length) * 100}%`,
              backgroundColor: submitted ? (score >= 2 ? "#22c55e" : "#f59e0b") : "#6366f1",
            }} />
          </View>
          <Text style={{ color: "#4b5563", fontSize: 12, marginTop: 7 }}>
            {submitted
              ? `${score} correct · ${QUESTIONS.length - score} incorrect`
              : `${answered} of ${QUESTIONS.length} answered`}
          </Text>
        </View>

        {/* Questions */}
        {QUESTIONS.map((q, qi) => (
          <View key={q.id} style={{
            backgroundColor: "#242840", borderWidth: 1, borderColor: "#2e3354",
            borderRadius: 18, padding: 17, marginBottom: 14,
          }}>
            {/* Question number + text */}
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 13 }}>
              <View style={{
                backgroundColor: "#1e1b4b", width: 26, height: 26,
                borderRadius: 7, alignItems: "center", justifyContent: "center", marginTop: 1,
              }}>
                <Text style={{ color: "#818cf8", fontSize: 12, fontWeight: "700" }}>{qi + 1}</Text>
              </View>
              <Text style={{ color: "#e0e7ff", fontSize: 15, fontWeight: "600", flex: 1, lineHeight: 22 }}>
                {q.question}
              </Text>
            </View>

            {q.options.map((opt, oi) => (
              <Option
                key={oi} text={opt} index={oi}
                selected={selected[q.id] === oi}
                submitted={submitted}
                isCorrect={oi === q.answer}
                onPress={() => setSelected((p) => ({ ...p, [q.id]: oi }))}
              />
            ))}
          </View>
        ))}

        {/* Submit / Reset */}
        <TouchableOpacity
          onPress={submitted ? reset : () => allAnswered && setSubmitted(true)}
          activeOpacity={0.85} style={{ borderRadius: 14, overflow: "hidden", marginTop: 4 }}
        >
          <LinearGradient
            colors={
              submitted ? ["#2e3354", "#2e3354"]
              : allAnswered ? ["#6366f1", "#4f46e5"]
              : ["#242840", "#242840"]
            }
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 15, gap: 8 }}
          >
            <Ionicons
              name={submitted ? "refresh-outline" : "checkmark-done-outline"}
              size={20} color={!submitted && allAnswered ? "#fff" : "#4b5563"}
            />
            <Text style={{ fontWeight: "700", fontSize: 15, color: !submitted && allAnswered ? "#fff" : "#4b5563" }}>
              {submitted ? "Try Again" : "Submit Quiz"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </Animated.View>
  );
}