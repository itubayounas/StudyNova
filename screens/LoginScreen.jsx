import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
  Animated, ActivityIndicator, ScrollView,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "../lib/firebase";

export default function LoginScreen({ navigation }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Entrance animation
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // ✅ No navigation needed here — AuthContext detects the login
      // and App.js automatically switches to the main tab screen
    } catch (err) {
      // Show user-friendly error messages instead of raw Firebase codes
      const msg =
        err.code === "auth/user-not-found"     ? "No account found with this email." :
        err.code === "auth/wrong-password"     ? "Incorrect password. Try again." :
        err.code === "auth/invalid-email"      ? "Please enter a valid email." :
        err.code === "auth/invalid-credential" ? "Email or password is incorrect." :
        err.code === "auth/too-many-requests"  ? "Too many attempts. Try again later." :
        "Something went wrong. Please try again.";

      Alert.alert("Login failed", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#1a1d2e" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>

          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: 44 }}>
            <LinearGradient
              colors={["#6366f1", "#4f46e5"]}
              style={{
                width: 76, height: 76, borderRadius: 24,
                alignItems: "center", justifyContent: "center", marginBottom: 16,
              }}
            >
              <Ionicons name="sparkles" size={36} color="#fff" />
            </LinearGradient>
            <Text style={{ color: "#eef2ff", fontSize: 30, fontWeight: "800" }}>
              StudyNova
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
              Your AI-powered study companion
            </Text>
          </View>

          {/* Card */}
          <View style={{
            backgroundColor: "#242840",
            borderRadius: 20, borderWidth: 1, borderColor: "#2e3354",
            padding: 22,
          }}>
            <Text style={{
              color: "#818cf8", fontSize: 11,
              fontWeight: "700", letterSpacing: 2, marginBottom: 20,
            }}>
              WELCOME BACK
            </Text>

            {/* Email field */}
            <Text style={{ color: "#9ca3af", fontSize: 12, fontWeight: "600", marginBottom: 7 }}>
              Email
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "#1a1d2e",
              borderWidth: 1.5, borderColor: email ? "#6366f1" : "#2e3354",
              borderRadius: 12, paddingHorizontal: 14, marginBottom: 18,
            }}>
              <Ionicons name="mail-outline" size={17} color="#6b7280" style={{ marginRight: 10 }} />
              <TextInput
                style={{ flex: 1, color: "#e0e7ff", fontSize: 14, paddingVertical: 13 }}
                placeholder="you@email.com"
                placeholderTextColor="#374151"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password field */}
            <Text style={{ color: "#9ca3af", fontSize: 12, fontWeight: "600", marginBottom: 7 }}>
              Password
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "#1a1d2e",
              borderWidth: 1.5, borderColor: password ? "#6366f1" : "#2e3354",
              borderRadius: 12, paddingHorizontal: 14, marginBottom: 28,
            }}>
              <Ionicons name="lock-closed-outline" size={17} color="#6b7280" style={{ marginRight: 10 }} />
              <TextInput
                style={{ flex: 1, color: "#e0e7ff", fontSize: 14, paddingVertical: 13 }}
                placeholder="••••••••"
                placeholderTextColor="#374151"
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ padding: 4 }}>
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={18} color="#6b7280"
                />
              </TouchableOpacity>
            </View>

            {/* Login button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={{ borderRadius: 14, overflow: "hidden" }}
            >
              <LinearGradient
                colors={loading ? ["#312e81", "#312e81"] : ["#6366f1", "#4f46e5"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 15, alignItems: "center",
                  flexDirection: "row", justifyContent: "center", gap: 10,
                }}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Ionicons name="log-in-outline" size={19} color="#fff" />
                }
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                  {loading ? "Signing in..." : "Login"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Switch to signup */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={{ marginTop: 24, alignItems: "center" }}
          >
            <Text style={{ color: "#6b7280", fontSize: 14 }}>
              Don't have an account?{" "}
              <Text style={{ color: "#818cf8", fontWeight: "700" }}>Sign up free</Text>
            </Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}