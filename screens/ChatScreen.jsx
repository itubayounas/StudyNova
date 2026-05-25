import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Animated, Alert,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { Ionicons }          from "@expo/vector-icons";
import { LinearGradient }    from "expo-linear-gradient";
import { useDocument }       from "../context/DocumentContext";
import { chatWithDocument }  from "../services/groqService";

const TypingDots = () => {
  const d1 = useRef(new Animated.Value(0)).current;
  const d2 = useRef(new Animated.Value(0)).current;
  const d3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    [d1, d2, d3].forEach((d, i) => {
      Animated.loop(Animated.sequence([
        Animated.delay(i * 160),
        Animated.timing(d, { toValue: -5, duration: 280, useNativeDriver: true }),
        Animated.timing(d, { toValue: 0,  duration: 280, useNativeDriver: true }),
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

const Bubble = ({ msg }) => {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;
  const isUser = msg.role === "user";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{
      opacity: fade, transform: [{ translateY: slide }],
      alignSelf: isUser ? "flex-end" : "flex-start",
      maxWidth: "82%", marginBottom: 14,
    }}>
      {!isUser && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 5 }}>
          <View style={{
            width: 20, height: 20, borderRadius: 6,
            backgroundColor: "#4f46e5", alignItems: "center", justifyContent: "center",
          }}>
            <Ionicons name="sparkles" size={11} color="#fff" />
          </View>
          <Text style={{ color: "#6b7280", fontSize: 11, fontWeight: "600" }}>StudyNova AI</Text>
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
  const { documentText, hasDocument, fileName } = useDocument();

  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const scrollRef = useRef(null);

  // Set welcome message based on whether a document is loaded
  useEffect(() => {
    setMessages([{
      id:   1,
      role: "assistant",
      text: hasDocument
        ? `Hey! I've read your document "${fileName}". Ask me anything about it — I can summarize, explain, or quiz you!`
        : "Hey! Go to the Upload tab and save your study material first. Then come back and ask me anything about it.",
    }]);
  }, [hasDocument, fileName]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  async function send() {
    if (!input.trim()) return;

    if (!hasDocument) {
      Alert.alert(
        "No document loaded",
        "Please go to the Upload tab, paste or upload your study material, then come back."
      );
      return;
    }

    const userMsg = { id: Date.now(), role: "user", text: input.trim() };

    // Build history for context (role + content format Groq expects)
    const history = messages
      .filter((m) => m.id !== 1)  // skip welcome message
      .map((m) => ({
        role:    m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await chatWithDocument(
        documentText,
        userMsg.text,
        history
      );

      setMessages((p) => [...p, {
        id:   Date.now() + 1,
        role: "assistant",
        text: reply,
      }]);
    } catch (err) {
      setMessages((p) => [...p, {
        id:   Date.now() + 1,
        role: "assistant",
        text: "Sorry, something went wrong. Please try again.",
      }]);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([{
      id:   Date.now(),
      role: "assistant",
      text: hasDocument
        ? `Chat cleared. Still reading "${fileName}" — ask me anything!`
        : "Chat cleared. Upload a document to get started.",
    }]);
  }

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
            <View style={{
              width: 6, height: 6, borderRadius: 3,
              backgroundColor: hasDocument ? "#22c55e" : "#f59e0b",
            }} />
            <Text style={{ color: "#6b7280", fontSize: 11 }}>
              {hasDocument ? `Reading: ${fileName}` : "No document loaded"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={clearChat}
          style={{ backgroundColor: "#1e1b4b", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}
        >
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
          {hasDocument && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: "#4b5563", fontSize: 11, fontWeight: "600", letterSpacing: 1, marginBottom: 8 }}>
                TRY ASKING
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  "Summarize this document",
                  "What are the key points?",
                  "Explain the main concept",
                  "What should I focus on?",
                ].map((q) => (
                  <TouchableOpacity
                    key={q} onPress={() => setInput(q)}
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
          )}

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
              placeholder={hasDocument ? "Ask anything about your document..." : "Upload a document first..."}
              placeholderTextColor="#374151"
              value={input}
              onChangeText={setInput}
              multiline
              onSubmitEditing={send}
            />
          </View>
          <TouchableOpacity
            onPress={send}
            disabled={loading || !input.trim()}
            activeOpacity={0.85}
            style={{ borderRadius: 16, overflow: "hidden" }}
          >
            <LinearGradient
              colors={input.trim() ? ["#6366f1", "#4f46e5"] : ["#242840", "#242840"]}
              style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="send" size={17} color={input.trim() ? "#fff" : "#4b5563"} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}