import {
  View, Text, TouchableOpacity, Animated,
  Dimensions, ActivityIndicator, Alert,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { Ionicons }              from "@expo/vector-icons";
import { LinearGradient }        from "expo-linear-gradient";
import { useDocument }           from "../context/DocumentContext";
import { generateFlashcards }    from "../services/groqService";

const { width } = Dimensions.get("window");

export default function FlashcardScreen() {
  const { documentText, hasDocument, fileName,
          generatedFlashcards, setGeneratedFlashcards } = useDocument();

  const [index,      setIndex]      = useState(0);
  const [flipped,    setFlipped]    = useState(false);
  const [known,      setKnown]      = useState(0);
  const [learning,   setLearning]   = useState(0);
  const [generating, setGenerating] = useState(false);

  const flipVal   = useRef(new Animated.Value(0)).current;
  const slideVal  = useRef(new Animated.Value(0)).current;
  const fadeVal   = useRef(new Animated.Value(1)).current;
  const mountFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(mountFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // Auto-generate when screen opens
  useEffect(() => {
    if (hasDocument && generatedFlashcards.length === 0 && !generating) {
      handleGenerate();
    }
  }, [hasDocument]);

  async function handleGenerate() {
    if (!hasDocument) return;
    try {
      setGenerating(true);
      setIndex(0);
      setFlipped(false);
      setKnown(0);
      setLearning(0);
      flipVal.setValue(0);
      const cards = await generateFlashcards(documentText);
      setGeneratedFlashcards(cards);
    } catch (err) {
      Alert.alert("Flashcard generation failed", err.message);
    } finally {
      setGenerating(false);
    }
  }

  const flip = () => {
    Animated.spring(flipVal, {
      toValue: flipped ? 0 : 1,
      tension: 55, friction: 8, useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const next = (didKnow) => {
    if (didKnow) setKnown((k) => k + 1);
    else         setLearning((l) => l + 1);

    const dir = didKnow ? 1 : -1;
    Animated.parallel([
      Animated.timing(slideVal, { toValue: dir * (width + 40), duration: 260, useNativeDriver: true }),
      Animated.timing(fadeVal,  { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      flipVal.setValue(0);
      setFlipped(false);
      setIndex((i) => (i + 1) % generatedFlashcards.length);
      slideVal.setValue(-dir * (width + 40));
      fadeVal.setValue(0);
      Animated.parallel([
        Animated.spring(slideVal, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
        Animated.timing(fadeVal,  { toValue: 1, duration: 260, useNativeDriver: true }),
      ]).start();
    });
  };

  const frontRot = flipVal.interpolate({ inputRange: [0, 1], outputRange: ["0deg",   "180deg"] });
  const backRot  = flipVal.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const total    = generatedFlashcards.length;
  const knownPct = total > 0 ? Math.round((known / total) * 100) : 0;

  // ── No document ───────────────────────────────────────────────
  if (!hasDocument) {
    return (
      <View style={{ flex: 1, backgroundColor: "#1a1d2e", justifyContent: "center", alignItems: "center", padding: 30 }}>
        <Ionicons name="layers-outline" size={58} color="#2e3354" style={{ marginBottom: 16 }} />
        <Text style={{ color: "#eef2ff", fontSize: 20, fontWeight: "800", textAlign: "center" }}>
          No Document Loaded
        </Text>
        <Text style={{ color: "#6b7280", fontSize: 14, textAlign: "center", marginTop: 10, lineHeight: 22 }}>
          Go to the Upload tab and paste or upload your study material. Come back here to generate flashcards.
        </Text>
      </View>
    );
  }

  // ── Generating ────────────────────────────────────────────────
  if (generating) {
    return (
      <View style={{ flex: 1, backgroundColor: "#1a1d2e", justifyContent: "center", alignItems: "center", padding: 30 }}>
        <LinearGradient
          colors={["#06b6d4", "#0891b2"]}
          style={{ width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 20 }}
        >
          <ActivityIndicator color="#fff" size="large" />
        </LinearGradient>
        <Text style={{ color: "#eef2ff", fontSize: 20, fontWeight: "800" }}>Creating Flashcards</Text>
        <Text style={{ color: "#6b7280", fontSize: 14, marginTop: 8, textAlign: "center" }}>
          AI is reading "{fileName}" and building your cards...
        </Text>
      </View>
    );
  }

  if (total === 0) return null;

  const card = generatedFlashcards[index];

  return (
    <Animated.View style={{ flex: 1, opacity: mountFade, backgroundColor: "#1a1d2e" }}>

      {/* Header */}
      <View style={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 12 }}>
        <Text style={{ color: "#818cf8", fontSize: 12, fontWeight: "700", letterSpacing: 2 }}>FLASHCARDS</Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
          <Text style={{ color: "#eef2ff", fontSize: 27, fontWeight: "800" }}>Flip & Learn</Text>
          <View style={{ flexDirection: "row", gap: 7 }}>
            <View style={{ backgroundColor: "#0f1f14", borderWidth: 1, borderColor: "#166534", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ color: "#86efac", fontSize: 12, fontWeight: "700" }}>{known} ✓</Text>
            </View>
            <View style={{ backgroundColor: "#1f0f10", borderWidth: 1, borderColor: "#7f1d1d", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ color: "#fca5a5", fontSize: 12, fontWeight: "700" }}>{learning} ↺</Text>
            </View>
          </View>
        </View>

        {/* Source chip */}
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 6,
          backgroundColor: "#0c2a35", borderRadius: 8,
          paddingHorizontal: 10, paddingVertical: 5,
          alignSelf: "flex-start", marginTop: 8,
        }}>
          <Ionicons name="document-text-outline" size={13} color="#06b6d4" />
          <Text style={{ color: "#06b6d4", fontSize: 12, fontWeight: "600" }}>{fileName}</Text>
        </View>

        {/* Progress bar */}
        <View style={{ backgroundColor: "#2e3354", borderRadius: 4, height: 5, marginTop: 12 }}>
          <View style={{ height: 5, borderRadius: 4, backgroundColor: "#22c55e", width: `${knownPct}%` }} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
          <Text style={{ color: "#4b5563", fontSize: 12 }}>Card {index + 1} of {total}</Text>
          <Text style={{ color: "#4b5563", fontSize: 12 }}>{knownPct}% mastered</Text>
        </View>
      </View>

      {/* Flip card */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 }}>
        <Animated.View style={{ width: "100%", transform: [{ translateX: slideVal }], opacity: fadeVal }}>

          {/* Front */}
          <Animated.View style={{
            transform: [{ rotateY: frontRot }],
            backfaceVisibility: "hidden",
            position: flipped ? "absolute" : "relative", width: "100%",
          }}>
            <TouchableOpacity onPress={flip} activeOpacity={0.9}>
              <View style={{
                backgroundColor: "#242840", borderRadius: 24, minHeight: 270,
                padding: 28, alignItems: "center", justifyContent: "center",
                borderWidth: 1.5, borderColor: "#3730a3",
              }}>
                <View style={{
                  backgroundColor: "#1e1b4b", borderWidth: 1, borderColor: "#3730a3",
                  borderRadius: 8, paddingHorizontal: 11, paddingVertical: 4, marginBottom: 22,
                }}>
                  <Text style={{ color: "#818cf8", fontSize: 11, fontWeight: "700", letterSpacing: 1 }}>
                    QUESTION
                  </Text>
                </View>
                <Text style={{ color: "#eef2ff", fontSize: 20, fontWeight: "700", textAlign: "center", lineHeight: 30 }}>
                  {card.front}
                </Text>
                <View style={{ marginTop: 28, flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Ionicons name="sync-outline" size={13} color="#6366f1" />
                  <Text style={{ color: "#6366f1", fontSize: 12, fontWeight: "600" }}>Tap to reveal answer</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Back */}
          <Animated.View style={{
            transform: [{ rotateY: backRot }],
            backfaceVisibility: "hidden",
            position: flipped ? "relative" : "absolute", width: "100%",
          }}>
            <TouchableOpacity onPress={flip} activeOpacity={0.9}>
              <View style={{
                backgroundColor: "#1a2e22", borderRadius: 24, minHeight: 270,
                padding: 28, alignItems: "center", justifyContent: "center",
                borderWidth: 1.5, borderColor: "#166534",
              }}>
                <View style={{
                  backgroundColor: "#0f1f14", borderWidth: 1, borderColor: "#166534",
                  borderRadius: 8, paddingHorizontal: 11, paddingVertical: 4, marginBottom: 22,
                }}>
                  <Text style={{ color: "#86efac", fontSize: 11, fontWeight: "700", letterSpacing: 1 }}>ANSWER</Text>
                </View>
                <Text style={{ color: "#d1fae5", fontSize: 17, fontWeight: "600", textAlign: "center", lineHeight: 28 }}>
                  {card.back}
                </Text>
                <View style={{ marginTop: 28, flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Ionicons name="sync-outline" size={13} color="#22c55e" />
                  <Text style={{ color: "#22c55e", fontSize: 12, fontWeight: "600" }}>Tap to flip back</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

        </Animated.View>
      </View>

      {/* Bottom buttons */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8, gap: 10 }}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={() => next(false)} activeOpacity={0.82}
            style={{
              flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
              backgroundColor: "#1f0f10", borderWidth: 1.5, borderColor: "#7f1d1d",
              borderRadius: 14, paddingVertical: 14, gap: 7,
            }}
          >
            <Ionicons name="close-circle" size={19} color="#f87171" />
            <Text style={{ color: "#f87171", fontWeight: "700", fontSize: 14 }}>Still Learning</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => next(true)} activeOpacity={0.82}
            style={{
              flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
              backgroundColor: "#0f1f14", borderWidth: 1.5, borderColor: "#166534",
              borderRadius: 14, paddingVertical: 14, gap: 7,
            }}
          >
            <Ionicons name="checkmark-circle" size={19} color="#34d399" />
            <Text style={{ color: "#34d399", fontWeight: "700", fontSize: 14 }}>Got It!</Text>
          </TouchableOpacity>
        </View>

        {/* Regenerate */}
        <TouchableOpacity
          onPress={handleGenerate} activeOpacity={0.85}
          style={{
            borderRadius: 12, borderWidth: 1, borderColor: "#06b6d4",
            flexDirection: "row", alignItems: "center",
            justifyContent: "center", paddingVertical: 11, gap: 7,
          }}
        >
          <Ionicons name="sparkles-outline" size={16} color="#06b6d4" />
          <Text style={{ color: "#06b6d4", fontWeight: "700", fontSize: 13 }}>Generate New Cards</Text>
        </TouchableOpacity>
      </View>

    </Animated.View>
  );
}