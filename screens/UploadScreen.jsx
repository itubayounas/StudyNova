import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Animated, Alert, ActivityIndicator,
} from "react-native";
import { useState, useRef, useEffect, useCallback }         from "react";
import { useNavigation }                       from "@react-navigation/native";
import { Ionicons }                            from "@expo/vector-icons";
import { LinearGradient }                      from "expo-linear-gradient";
import * as DocumentPicker                     from "expo-document-picker";
import * as ImagePicker                        from "expo-image-picker";
import * as FileSystem                         from "expo-file-system/legacy";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth }                            from "../lib/firebase";
import { useDocument }                         from "../context/DocumentContext";
import { extractTextFromFile }                 from "../lib/fileParser"; // ✅ FIXED

export default function UploadScreen() {
  const [text,        setText]        = useState("");
  const [saved,       setSaved]       = useState(false);
  const [fileName,    setFileName]    = useState("");
  const [parseStatus, setParseStatus] = useState("idle");
  const [showFullText, setShowFullText] = useState(false); // ← controls text expand

  const fadeIn           = useRef(new Animated.Value(0)).current;
  const { saveDocument } = useDocument();
  const navigation       = useNavigation();

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1, duration: 500, useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (saved) {
      setSaved(false);
    }
  }, [text, fileName]);

  const isBusy = parseStatus === "picking" || parseStatus === "parsing";

  async function copyFileToCache(uri, name) {
    const safeName = name.replace(/\s+/g, "_");
    const destUri  = `${FileSystem.cacheDirectory}${safeName}`;
    if (uri.startsWith(FileSystem.cacheDirectory)) return uri;
    await FileSystem.copyAsync({ from: uri, to: destUri });
    return destUri;
  }

  async function processFile(uri, name, mimeType) {
    try {
      setParseStatus("parsing");
      setFileName(name);
      setShowFullText(false); // reset expand on new file
      const safeUri   = await copyFileToCache(uri, name);
      const extracted = await extractTextFromFile(safeUri, name, mimeType);
      setText(extracted);
      setParseStatus("done");
    } catch (err) {
      setParseStatus("error");
      Alert.alert("Could not read file", err.message);
    }
  }

  async function handlePickDocument() {
    try {
      setParseStatus("picking");
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "application/vnd.ms-powerpoint",
          "text/plain",
          "text/markdown",
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled) { setParseStatus("idle"); return; }
      const file = result.assets[0];
      await processFile(file.uri, file.name, file.mimeType);
    } catch (err) {
      setParseStatus("error");
      Alert.alert("Error picking document", err.message);
    }
  }

  async function handlePickImage() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Please allow access to your photo library.");
        return;
      }
      setParseStatus("picking");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality:    0.8,
      });
      if (result.canceled) { setParseStatus("idle"); return; }
      const asset = result.assets[0];
      const name  = asset.fileName || `image_${Date.now()}.jpg`;
      await processFile(asset.uri, name, asset.mimeType || "image/jpeg");
    } catch (err) {
      setParseStatus("error");
      Alert.alert("Error picking image", err.message);
    }
  }

  async function handleSave() {
    if (!text.trim()) return;
    try {
      const userId = auth.currentUser?.uid;
      saveDocument(text, fileName || "Manual notes", text.length);
      await addDoc(collection(db, "users", userId, "documents"), {
        fileName:  fileName || "Manual notes",
        rawText:   text,
        wordCount: text.trim().split(/\s+/).length,
        createdAt: serverTimestamp(),
        type:      fileName ? "file" : "manual",
      });
      setSaved(true);
    } catch (err) {
      Alert.alert("Save failed", err.message);
    }
  }

  // ── Navigate to tab ────────────────────────────────────────────
  const handleNavigate = useCallback((tabName) => {
  if (!saved) {
    Alert.alert(
      "Save first",
      "Please save your uploaded document before moving to another screen."
    );
    return;
  }

  // UploadScreen is a tab screen, so navigation IS the tab navigator.
  // navigate() on a tab navigator switches tabs directly.
  navigation.navigate(tabName);
}, [saved, navigation]);

  const statusColor =
    parseStatus === "done"  ? "#22c55e" :
    parseStatus === "error" ? "#ef4444" : "#818cf8";

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <Animated.View style={{ flex: 1, opacity: fadeIn, backgroundColor: "#1a1d2e" }}>
      <ScrollView
        contentContainerStyle={{ padding: 22, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Header */}
        <View style={{ marginTop: 10, marginBottom: 22 }}>
          <Text style={{ color: "#818cf8", fontSize: 12, fontWeight: "700", letterSpacing: 2 }}>
            STUDY MATERIAL
          </Text>
          <Text style={{ color: "#eef2ff", fontSize: 27, fontWeight: "800", marginTop: 5 }}>
            Upload Notes
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 14, marginTop: 4, lineHeight: 20 }}>
            Upload a file or paste your text below
          </Text>
        </View>

        {/* Upload Buttons Row */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
          <TouchableOpacity
            onPress={handlePickDocument}
            disabled={isBusy}
            activeOpacity={0.8}
            style={{
              flex: 2, backgroundColor: "#242840",
              borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed",
              borderColor: parseStatus === "done" ? "#22c55e" : "#6366f1",
              padding: 16, alignItems: "center",
            }}
          >
            {isBusy ? (
              <ActivityIndicator color="#818cf8" size="large" style={{ marginBottom: 8 }} />
            ) : (
              <View style={{
                width: 46, height: 46, borderRadius: 14, backgroundColor: "#1e1b4b",
                alignItems: "center", justifyContent: "center", marginBottom: 8,
              }}>
                <Ionicons
                  name={parseStatus === "done" ? "checkmark-circle" : "document-attach-outline"}
                  size={24}
                  color={parseStatus === "done" ? "#22c55e" : "#818cf8"}
                />
              </View>
            )}
            <Text style={{ color: "#eef2ff", fontWeight: "700", fontSize: 13, textAlign: "center" }}>
              {isBusy ? "Processing..." : parseStatus === "done" ? "Upload Another" : "PDF / DOCX / PPTX"}
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 3, textAlign: "center" }}>
              Documents & text files
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePickImage}
            disabled={isBusy}
            activeOpacity={0.8}
            style={{
              flex: 1, backgroundColor: "#242840",
              borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed",
              borderColor: "#a855f7", padding: 16, alignItems: "center",
            }}
          >
            <View style={{
              width: 46, height: 46, borderRadius: 14, backgroundColor: "#2e1065",
              alignItems: "center", justifyContent: "center", marginBottom: 8,
            }}>
              <Ionicons name="image-outline" size={24} color="#a855f7" />
            </View>
            <Text style={{ color: "#eef2ff", fontWeight: "700", fontSize: 13, textAlign: "center" }}>
              Image
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 3, textAlign: "center" }}>
              Photo of notes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Chip */}
        {parseStatus !== "idle" && (
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 8,
            backgroundColor:
              parseStatus === "done"  ? "#0f1f14" :
              parseStatus === "error" ? "#1f0f10" : "#1e1b4b",
            borderRadius: 10, padding: 10, marginBottom: 14, borderWidth: 1,
            borderColor:
              parseStatus === "done"  ? "#166534" :
              parseStatus === "error" ? "#7f1d1d" : "#312e81",
          }}>
            {isBusy
              ? <ActivityIndicator color="#818cf8" size="small" />
              : <Ionicons
                  name={parseStatus === "done" ? "checkmark-circle-outline" : "alert-circle-outline"}
                  size={16} color={statusColor}
                />
            }
            <Text style={{ color: statusColor, fontSize: 13, fontWeight: "600", flex: 1 }}>
              {parseStatus === "picking" ? "Opening file picker..."            :
               parseStatus === "parsing" ? `Reading ${fileName || "file"}...` :
               parseStatus === "done"    ? `✓ ${fileName} — text extracted`   :
               "Failed to read file. Try another."}
            </Text>
          </View>
        )}

        {/* OR Divider */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 10 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "#2e3354" }} />
          <Text style={{ color: "#4b5563", fontSize: 11, fontWeight: "600" }}>OR PASTE TEXT</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "#2e3354" }} />
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Words", value: wordCount,                                         icon: "text-outline" },
            { label: "Lines", value: text ? text.split("\n").length : 0,                icon: "list-outline" },
            { label: "Chars", value: text.length,                                       icon: "analytics-outline" },
          ].map((stat) => (
            <View key={stat.label} style={{
              flex: 1, backgroundColor: "#242840", borderRadius: 12,
              padding: 12, alignItems: "center", borderWidth: 1, borderColor: "#2e3354",
            }}>
              <Ionicons name={stat.icon} size={16} color="#818cf8" style={{ marginBottom: 4 }} />
              <Text style={{ color: "#eef2ff", fontSize: 16, fontWeight: "700" }}>{stat.value}</Text>
              <Text style={{ color: "#6b7280", fontSize: 11, marginTop: 1 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Text Editor — FIXED HEIGHT ──────────────────────── */}
        <View style={{
          backgroundColor: "#242840", borderRadius: 16, marginBottom: 14,
          borderWidth: 1.5, borderColor: text.length > 0 ? "#818cf8" : "#2e3354",
        }}>
          {/* Editor header */}
          <View style={{
            flexDirection: "row", alignItems: "center",
            paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8,
            borderBottomWidth: 1, borderBottomColor: "#2e3354",
          }}>
            <Ionicons name="create-outline" size={14} color="#818cf8" />
            <Text style={{
              color: "#818cf8", fontSize: 12, fontWeight: "600",
              marginLeft: 7, flex: 1,
            }} numberOfLines={1}>
              {fileName || "Notes Editor"}
            </Text>
            {text.length > 0 && (
              <View style={{ backgroundColor: "#312e81", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ color: "#a5b4fc", fontSize: 11, fontWeight: "600" }}>Ready to save</Text>
              </View>
            )}
          </View>

          {/* ── Text preview — capped at 160px, expandable ── */}
          <View style={{
            maxHeight: showFullText ? 400 : 160, // ← KEY FIX: cap height
            overflow: "hidden",
          }}>
            <TextInput
              style={{
                color: "#e0e7ff", fontSize: 13, lineHeight: 21,
                padding: 14, textAlignVertical: "top",
                minHeight: 120,
              }}
              placeholder={
                isBusy
                  ? "Extracting text from file..."
                  : "Paste or type your study material here..."
              }
              placeholderTextColor="#374151"
              multiline
              editable={!isBusy}
              value={text}
              onChangeText={setText}
              scrollEnabled={showFullText} // allow scroll when expanded
            />
          </View>

          {/* Show more / less toggle */}
          {text.length > 300 && (
            <TouchableOpacity
              onPress={() => setShowFullText(!showFullText)}
              style={{
                borderTopWidth: 1, borderTopColor: "#2e3354",
                paddingVertical: 8, alignItems: "center",
                flexDirection: "row", justifyContent: "center", gap: 5,
              }}
            >
              <Ionicons
                name={showFullText ? "chevron-up" : "chevron-down"}
                size={14} color="#818cf8"
              />
              <Text style={{ color: "#818cf8", fontSize: 12, fontWeight: "600" }}>
                {showFullText
                  ? "Show less"
                  : `Show all ${wordCount} words`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Fill bar */}
          {text.length > 0 && (
            <View style={{ height: 3, backgroundColor: "#2e3354", borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
              <View style={{
                height: 3, backgroundColor: "#818cf8", borderBottomLeftRadius: 16,
                width: `${Math.min((text.length / 1000) * 100, 100)}%`,
              }} />
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={!text.trim() || isBusy}
          activeOpacity={0.85}
          style={{ borderRadius: 14, overflow: "hidden", marginBottom: 30 }}
        >
          <LinearGradient
            colors={
              saved           ? ["#15803d", "#166534"] :
              text.length > 0 ? ["#6366f1", "#4f46e5"] :
              ["#242840", "#242840"]
            }
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 15, gap: 9 }}
          >
            <Ionicons
              name={saved ? "checkmark-circle" : "save-outline"}
              size={20} color={text.length > 0 ? "#fff" : "#4b5563"}
            />
            <Text style={{ color: text.length > 0 ? "#fff" : "#4b5563", fontWeight: "700", fontSize: 15 }}>
              {saved ? "Saved! Tap a feature below ✓" : "Save & Enable AI Features"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* AI Section Divider */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18, gap: 10 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "#2e3354" }} />
          <Text style={{ color: "#4b5563", fontSize: 11, fontWeight: "600", letterSpacing: 1 }}>
            GENERATE WITH AI
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "#2e3354" }} />
        </View>

        {saved && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: "#dbeafe", fontSize: 14, fontWeight: "600", marginBottom: 6 }}>
              Document saved successfully. Choose a screen to continue:
            </Text>
          </View>
        )}

        {/* AI Action Rows */}
        {[
          {
            icon: "chatbubbles-outline", label: "Chat with AI",
            sub:  text ? "Ask anything about your content" : "Upload or paste content first",
            color: "#6366f1", bg: "#1e1b4b", screen: "Chat",
          },
          {
            icon: "help-circle-outline", label: "Generate Quiz",
            sub:  text ? "Auto-create 8 MCQ questions" : "Upload or paste content first",
            color: "#a855f7", bg: "#2e1065", screen: "Quiz",
          },
          {
            icon: "layers-outline", label: "Flashcards",
            sub:  text ? "Generate 10 flip cards" : "Upload or paste content first",
            color: "#06b6d4", bg: "#0c2a35", screen: "Flashcards",
          },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={() => handleNavigate(item.screen)}
            activeOpacity={0.75}
            disabled={!saved}
            style={{
              backgroundColor: "#242840", borderRadius: 14, borderWidth: 1,
              borderColor: saved ? item.color + "55" : "#2e3354",
              flexDirection: "row", alignItems: "center",
              padding: 14, marginBottom: 10,
              opacity: saved ? 1 : 0.4,
            }}
          >
            <View style={{
              width: 42, height: 42, borderRadius: 12,
              backgroundColor: item.bg, alignItems: "center",
              justifyContent: "center", marginRight: 14,
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