import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Three dots that bounce while AI is thinking
const TypingDots = () => {
  const d1 = useRef(new Animated.Value(0)).current;
  const d2 = useRef(new Animated.Value(0)).current;
  const d3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    [d1, d2, d3].forEach((d, i) => {
      Animated.loop(Animated.sequence([
        Animated.delay(i * 160),
        Animated.timing(d, { toValue: -5, duration: 280, useNativeDriver: true }),
        Animated.timing(d, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.delay(500),
      ])).start();
    });
  }, []);

  return (
    <View style={{ flexDirection: "row", gap: 5, paddingVertical: 2 }}>
      {[d1, d2, d3].map((d, i) => (
        <Animated.View key={i} style={{
          width: 7, height: 7, borderRadius: 4,
          backgroundColor: "#818cf8", transform: [{ translateY: d }],
        }} />
      ))}
    </View>
  );
};

// Each chat bubble fades + slides in
const Bubble = ({ msg }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;
  const isUser = msg.role === "user";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{
      opacity: fade, transform: [{ translateY: slide }],
      alignSelf: isUser ? "flex-end" : "flex-start",
      maxWidth: "80%", marginBottom: 14,
    }}>
      {/* AI sender label */}
      {!isUser && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 5 }}>
          <View style={{
            width: 20, height: 20, borderRadius: 6,
            backgroundColor: "#4f46e5", alignItems: "center", justifyContent: "center",
          }}>
            <Ionicons name="sparkles" size={11} color="#fff" />
          </View>
          <Text style={{ color: "#6b7280", fontSize: 11, fontWeight: "600" }}>StudyAI</Text>
        </View>
      )}

      {isUser ? (
        <LinearGradient
          colors={["#6366f1", "#4f46e5"]}
          style={{ borderRadius: 18, borderBottomRightRadius: 5, paddingHorizontal: 15, paddingVertical: 11 }}
        >
          <Text style={{ color: "#fff", fontSize: 14, lineHeight: 21 }}>{msg.text}</Text>
        </LinearGradient>
      ) : (
        <View style={{
          backgroundColor: "#242840", borderWidth: 1, borderColor: "#2e3354",
          borderRadius: 18, borderBottomLeftRadius: 5,
          paddingHorizontal: 15, paddingVertical: 11,
        }}>
          <Text style={{ color: "#c7d2fe", fontSize: 14, lineHeight: 21 }}>{msg.text}</Text>
        </View>
      )}
    </Animated.View>
  );
};

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", text: "Hey! Save your notes in the Upload tab and I will answer any question about them." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), role: "user", text: input };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMessages((p) => [...p, {
        id: Date.now() + 1, role: "assistant",
        text: "Grok AI connects in Step 5. You asked: " + userMsg.text,
      }]);
      setLoading(false);
    }, 1200);
  };

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  return (
    <View style={{ flex: 1, backgroundColor: "#1a1d2e" }}>

      {/* Top bar */}
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 12,
        paddingHorizontal: 18, paddingVertical: 13,
        backgroundColor: "#242840",
        borderBottomWidth: 1, borderBottomColor: "#2e3354",
      }}>
        <LinearGradient
          colors={["#6366f1", "#4f46e5"]}
          style={{ width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="sparkles" size={17} color="#fff" />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#eef2ff", fontSize: 15, fontWeight: "700" }}>AI Tutor</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 1 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#22c55e" }} />
            <Text style={{ color: "#6b7280", fontSize: 11 }}>Online · Powered by Grok</Text>
          </View>
        </View>
        <TouchableOpacity style={{
          backgroundColor: "#1e1b4b", borderRadius: 8,
          paddingHorizontal: 10, paddingVertical: 5,
        }}>
          <Text style={{ color: "#818cf8", fontSize: 12, fontWeight: "600" }}>Clear</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: 16, paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Suggested questions */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: "#4b5563", fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 8 }}>
              TRY ASKING
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {["Summarize my notes", "What are the key points?", "Make it simpler"].map((q) => (
                <TouchableOpacity
                  key={q}
                  onPress={() => setInput(q)}
                  style={{
                    backgroundColor: "#242840", borderWidth: 1, borderColor: "#2e3354",
                    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8,
                  }}
                >
                  <Text style={{ color: "#818cf8", fontSize: 12 }}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {messages.map((m) => <Bubble key={m.id} msg={m} />)}

          {loading && (
            <View style={{
              alignSelf: "flex-start", backgroundColor: "#242840",
              borderWidth: 1, borderColor: "#2e3354",
              borderRadius: 18, borderBottomLeftRadius: 5,
              paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12,
            }}>
              <TypingDots />
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={{
          flexDirection: "row", alignItems: "flex-end", gap: 10,
          padding: 12, backgroundColor: "#242840",
          borderTopWidth: 1, borderTopColor: "#2e3354",
        }}>
          <View style={{
            flex: 1, backgroundColor: "#1a1d2e",
            borderWidth: 1.5, borderColor: input ? "#6366f1" : "#2e3354",
            borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9,
          }}>
            <TextInput
              style={{ color: "#e0e7ff", fontSize: 14, maxHeight: 90 }}
              placeholder="Ask anything about your notes..."
              placeholderTextColor="#374151"
              value={input}
              onChangeText={setInput}
              multiline
            />
          </View>
          <TouchableOpacity onPress={send} activeOpacity={0.85} style={{ borderRadius: 16, overflow: "hidden" }}>
            <LinearGradient
              colors={input ? ["#6366f1", "#4f46e5"] : ["#242840", "#242840"]}
              style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="send" size={17} color={input ? "#fff" : "#4b5563"} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}