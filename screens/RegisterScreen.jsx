import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
  Animated, ActivityIndicator, ScrollView,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../lib/firebase";

export default function RegisterScreen({ navigation }) {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // Password strength logic
  const getStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6)   return { label: "Too short", color: "#ef4444", width: "20%" };
    if (password.length < 8)   return { label: "Weak",      color: "#f59e0b", width: "45%" };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password))
                               return { label: "Strong",    color: "#22c55e", width: "100%" };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password))
                               return { label: "Good",      color: "#6366f1", width: "75%" };
    return                            { label: "Fair",      color: "#f59e0b", width: "55%" };
  };

  const strength = getStrength();

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Password mismatch", "Your passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Step 1 — Create the Firebase Auth account
      const { user } = await createUserWithEmailAndPassword(
        auth, email.trim(), password
      );

      // Step 2 — Save display name to the auth profile
      // This lets us show user?.displayName anywhere in the app
      await updateProfile(user, { displayName: name.trim() });

      // Step 3 — Create the user document in Firestore
      // This is the root document all their notes will be stored under
      // Structure: users/{uid}/documents/{docId}
      await setDoc(doc(db, "users", user.uid), {
        name:      name.trim(),
        email:     email.trim(),
        createdAt: serverTimestamp(),
        docCount:  0,               // track how many docs they upload
      });

      // ✅ AuthContext detects the new login automatically
      // App.js switches to main tabs — no navigation.navigate() needed

    } catch (err) {
      const msg =
        err.code === "auth/email-already-in-use" ? "An account with this email already exists." :
        err.code === "auth/invalid-email"        ? "Please enter a valid email." :
        err.code === "auth/weak-password"        ? "Please choose a stronger password." :
        "Something went wrong. Please try again.";

      Alert.alert("Registration failed", msg);
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
          <View style={{ alignItems: "center", marginBottom: 36 }}>
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
              Create Account
            </Text>
            <Text style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
              Start your AI study journey
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
              YOUR DETAILS
            </Text>

            {/* Full Name */}
            <Text style={{ color: "#9ca3af", fontSize: 12, fontWeight: "600", marginBottom: 7 }}>
              Full Name
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "#1a1d2e",
              borderWidth: 1.5, borderColor: name ? "#6366f1" : "#2e3354",
              borderRadius: 12, paddingHorizontal: 14, marginBottom: 18,
            }}>
              <Ionicons name="person-outline" size={17} color="#6b7280" style={{ marginRight: 10 }} />
              <TextInput
                style={{ flex: 1, color: "#e0e7ff", fontSize: 14, paddingVertical: 13 }}
                placeholder="Ahmed Khan"
                placeholderTextColor="#374151"
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email */}
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

            {/* Password */}
            <Text style={{ color: "#9ca3af", fontSize: 12, fontWeight: "600", marginBottom: 7 }}>
              Password
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "#1a1d2e",
              borderWidth: 1.5, borderColor: password ? "#6366f1" : "#2e3354",
              borderRadius: 12, paddingHorizontal: 14, marginBottom: 8,
            }}>
              <Ionicons name="lock-closed-outline" size={17} color="#6b7280" style={{ marginRight: 10 }} />
              <TextInput
                style={{ flex: 1, color: "#e0e7ff", fontSize: 14, paddingVertical: 13 }}
                placeholder="Min. 6 characters"
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

            {/* Strength bar */}
            {strength && (
              <View style={{ marginBottom: 18 }}>
                <View style={{ height: 3, backgroundColor: "#2e3354", borderRadius: 3 }}>
                  <View style={{
                    height: 3, borderRadius: 3,
                    backgroundColor: strength.color,
                    width: strength.width,
                  }} />
                </View>
                <Text style={{ color: strength.color, fontSize: 11, marginTop: 5 }}>
                  {strength.label}
                </Text>
              </View>
            )}

            {/* Confirm Password */}
            <Text style={{ color: "#9ca3af", fontSize: 12, fontWeight: "600", marginBottom: 7 }}>
              Confirm Password
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "#1a1d2e",
              borderWidth: 1.5,
              borderColor:
                confirm.length === 0 ? "#2e3354" :
                confirm === password ? "#22c55e" : "#ef4444",
              borderRadius: 12, paddingHorizontal: 14, marginBottom: 26,
            }}>
              <Ionicons name="shield-checkmark-outline" size={17} color="#6b7280" style={{ marginRight: 10 }} />
              <TextInput
                style={{ flex: 1, color: "#e0e7ff", fontSize: 14, paddingVertical: 13 }}
                placeholder="Re-enter password"
                placeholderTextColor="#374151"
                secureTextEntry={!showPass}
                value={confirm}
                onChangeText={setConfirm}
              />
              {confirm.length > 0 && (
                <Ionicons
                  name={confirm === password ? "checkmark-circle" : "close-circle"}
                  size={19}
                  color={confirm === password ? "#22c55e" : "#ef4444"}
                />
              )}
            </View>

            {/* Register button */}
            <TouchableOpacity
              onPress={handleRegister}
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
                  : <Ionicons name="person-add-outline" size={19} color="#fff" />
                }
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                  {loading ? "Creating account..." : "Create Account"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Switch to login */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={{ marginTop: 24, alignItems: "center" }}
          >
            <Text style={{ color: "#6b7280", fontSize: 14 }}>
              Already have an account?{" "}
              <Text style={{ color: "#818cf8", fontWeight: "700" }}>Login</Text>
            </Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}