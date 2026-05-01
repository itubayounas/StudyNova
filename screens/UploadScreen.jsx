import { View, Text, TextInput, TouchableOpacity, ScrollView, Animated } from "react-native";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function UploadScreen() {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleSave = () => {
    if (!text.trim()) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeIn, backgroundColor: "#1a1d2e" }}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 50 }}>

        {/* Header */}
        <View style={{ marginTop: 10, marginBottom: 26 }}>
          <Text style={{ color: "#818cf8", fontSize: 12, fontWeight: "700", letterSpacing: 2 }}>
            STUDY MATERIAL
          </Text>
          <Text style={{ color: "#eef2ff", fontSize: 27, fontWeight: "800", marginTop: 5 }}>
            Upload Notes
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 14, marginTop: 5, lineHeight: 20 }}>
            Paste your textbook, slides or articles below
          </Text>
        </View>

        {/* Stats row - shows at a glance */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Words", value: text.trim() ? text.trim().split(/\s+/).length : 0, icon: "text-outline" },
            { label: "Lines", value: text ? text.split("\n").length : 0, icon: "list-outline" },
            { label: "Chars", value: text.length, icon: "analytics-outline" },
          ].map((stat) => (
            <View key={stat.label} style={{
              flex: 1, backgroundColor: "#242840",
              borderRadius: 12, padding: 12, alignItems: "center",
              borderWidth: 1, borderColor: "#2e3354",
            }}>
              <Ionicons name={stat.icon} size={16} color="#818cf8" style={{ marginBottom: 4 }} />
              <Text style={{ color: "#eef2ff", fontSize: 16, fontWeight: "700" }}>{stat.value}</Text>
              <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 1 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Text area */}
        <View style={{
          backgroundColor: "#242840", borderRadius: 16,
          borderWidth: 1.5, borderColor: text.length > 0 ? "#818cf8" : "#2e3354",
        }}>
          <View style={{
            flexDirection: "row", alignItems: "center",
            paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8,
            borderBottomWidth: 1, borderBottomColor: "#2e3354",
          }}>
            <Ionicons name="create-outline" size={14} color="#818cf8" />
            <Text style={{ color: "#818cf8", fontSize: 12, fontWeight: "600", marginLeft: 7, flex: 1 }}>
              Notes Editor
            </Text>
            {text.length > 0 && (
              <View style={{
                backgroundColor: "#312e81", borderRadius: 6,
                paddingHorizontal: 8, paddingVertical: 2,
              }}>
                <Text style={{ color: "#a5b4fc", fontSize: 11, fontWeight: "600" }}>
                  Ready to save
                </Text>
              </View>
            )}
          </View>

          <TextInput
            style={{
              color: "#e0e7ff", fontSize: 14, lineHeight: 23,
              padding: 14, minHeight: 170, textAlignVertical: "top",
            }}
            placeholder="Paste your study material here..."
            placeholderTextColor="#374151"
            multiline
            value={text}
            onChangeText={setText}
          />

          {/* Char fill bar */}
          {text.length > 0 && (
            <View style={{ height: 3, backgroundColor: "#2e3354", borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
              <View style={{
                height: 3, backgroundColor: "#818cf8",
                width: `${Math.min((text.length / 500) * 100, 100)}%`,
                borderBottomLeftRadius: 16,
              }} />
            </View>
          )}
        </View>

        {/* Save button */}
        <TouchableOpacity onPress={handleSave} activeOpacity={0.85} style={{ marginTop: 14, borderRadius: 14, overflow: "hidden" }}>
          <LinearGradient
            colors={
              saved
                ? ["#15803d", "#166534"]
                : text.length > 0
                ? ["#6366f1", "#4f46e5"]
                : ["#242840", "#242840"]
            }
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 15, gap: 9 }}
          >
            <Ionicons
              name={saved ? "checkmark-circle" : "cloud-upload-outline"}
              size={20} color={text.length > 0 ? "#fff" : "#4b5563"}
            />
            <Text style={{ color: text.length > 0 ? "#fff" : "#4b5563", fontWeight: "700", fontSize: 15 }}>
              {saved ? "Saved!" : "Save Notes"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 30, marginBottom: 18, gap: 10 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "#2e3354" }} />
          <Text style={{ color: "#4b5563", fontSize: 11, fontWeight: "600", letterSpacing: 1 }}>GENERATE WITH AI</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "#2e3354" }} />
        </View>

        {/* Action rows */}
        {[
          { icon: "chatbubbles-outline", label: "Chat with AI", sub: "Ask anything about your notes", color: "#6366f1", bg: "#1e1b4b" },
          { icon: "help-circle-outline", label: "Generate Quiz", sub: "Auto-create multiple choice questions", color: "#a855f7", bg: "#2e1065" },
          { icon: "layers-outline", label: "Flashcards", sub: "Flip cards with spaced repetition", color: "#06b6d4", bg: "#0c2a35" },
        ].map((item) => (
          <TouchableOpacity
            key={item.label} activeOpacity={0.75}
            style={{
              backgroundColor: "#242840",
              borderRadius: 14, borderWidth: 1, borderColor: "#2e3354",
              flexDirection: "row", alignItems: "center",
              padding: 14, marginBottom: 10,
            }}
          >
            <View style={{
              width: 42, height: 42, borderRadius: 12,
              backgroundColor: item.bg, alignItems: "center", justifyContent: "center", marginRight: 14,
            }}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#eef2ff", fontSize: 14, fontWeight: "700" }}>{item.label}</Text>
              <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>{item.sub}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={16} color="#374151" />
          </TouchableOpacity>
        ))}

      </ScrollView>
    </Animated.View>
  );
}