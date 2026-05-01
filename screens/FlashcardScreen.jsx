import { View, Text, TouchableOpacity, Animated, Dimensions, ScrollView } from "react-native";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const CARDS = [
  { id: 1, front: "What is mitosis?", back: "Cell division producing two identical daughter cells with the same chromosome number.", tag: "Biology" },
  { id: 2, front: "Define osmosis", back: "Movement of water through a membrane from low to high solute concentration.", tag: "Biology" },
  { id: 3, front: "Newton's 2nd Law", back: "F = ma — Force equals mass times acceleration.", tag: "Physics" },
  { id: 4, front: "Pythagorean theorem", back: "a² + b² = c², where c is the hypotenuse of a right triangle.", tag: "Math" },
];

const TAG = {
  Biology: { bg: "#0f1f14", border: "#166534", text: "#86efac" },
  Physics: { bg: "#0c1929", border: "#1e3a8a", text: "#93c5fd" },
  Math:    { bg: "#1f1400", border: "#78350f", text: "#fcd34d" },
};

export default function FlashcardScreen() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [learning, setLearning] = useState(0);

  const flipVal  = useRef(new Animated.Value(0)).current;
  const slideVal = useRef(new Animated.Value(0)).current;
  const fadeVal  = useRef(new Animated.Value(1)).current;
  const mountFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(mountFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const flip = () => {
    Animated.spring(flipVal, {
      toValue: flipped ? 0 : 1,
      tension: 55, friction: 8, useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const next = (didKnow) => {
    if (didKnow) setKnown((k) => k + 1);
    else setLearning((l) => l + 1);

    const dir = didKnow ? 1 : -1;
    Animated.parallel([
      Animated.timing(slideVal, { toValue: dir * (width + 40), duration: 260, useNativeDriver: true }),
      Animated.timing(fadeVal,  { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      flipVal.setValue(0);
      setFlipped(false);
      setIndex((i) => (i + 1) % CARDS.length);
      slideVal.setValue(-dir * (width + 40));
      fadeVal.setValue(0);
      Animated.parallel([
        Animated.spring(slideVal, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
        Animated.timing(fadeVal, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]).start();
    });
  };

  const card = CARDS[index];
  const tag  = TAG[card.tag] || TAG.Biology;

  const frontRot = flipVal.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRot  = flipVal.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  const knownPct = Math.round((known / CARDS.length) * 100);

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

        {/* Progress */}
        <View style={{ backgroundColor: "#2e3354", borderRadius: 4, height: 5, marginTop: 14 }}>
          <View style={{ height: 5, borderRadius: 4, backgroundColor: "#22c55e", width: `${knownPct}%` }} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
          <Text style={{ color: "#4b5563", fontSize: 12 }}>Card {index + 1} of {CARDS.length}</Text>
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
            position: flipped ? "absolute" : "relative",
            width: "100%",
          }}>
            <TouchableOpacity onPress={flip} activeOpacity={0.9}>
              <View style={{
                backgroundColor: "#242840", borderRadius: 24, minHeight: 270,
                padding: 28, alignItems: "center", justifyContent: "center",
                borderWidth: 1.5, borderColor: "#3730a3",
                shadowColor: "#6366f1", shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
              }}>
                <View style={{
                  backgroundColor: tag.bg, borderWidth: 1, borderColor: tag.border,
                  borderRadius: 8, paddingHorizontal: 11, paddingVertical: 4, marginBottom: 22,
                }}>
                  <Text style={{ color: tag.text, fontSize: 11, fontWeight: "700", letterSpacing: 1 }}>
                    {card.tag.toUpperCase()}
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
            position: flipped ? "relative" : "absolute",
            width: "100%",
          }}>
            <TouchableOpacity onPress={flip} activeOpacity={0.9}>
              <View style={{
                backgroundColor: "#1a2e22", borderRadius: 24, minHeight: 270,
                padding: 28, alignItems: "center", justifyContent: "center",
                borderWidth: 1.5, borderColor: "#166534",
                shadowColor: "#22c55e", shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12, shadowRadius: 20, elevation: 8,
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
      <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingBottom: 30, paddingTop: 8 }}>
        <TouchableOpacity
          onPress={() => next(false)} activeOpacity={0.82}
          style={{
            flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
            backgroundColor: "#1f0f10", borderWidth: 1.5, borderColor: "#7f1d1d",
            borderRadius: 14, paddingVertical: 14, gap: 7,
          }}
        >
          <Ionicons name="close-circle" size={19} color="#f87171" />
          <Text style={{ color: "#f87171", fontWeight: "700", fontSize: 14 }}>Learning</Text>
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

    </Animated.View>
  );
}