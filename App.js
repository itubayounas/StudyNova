import "./global.css";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginScreen     from "./screens/LoginScreen";
import RegisterScreen  from "./screens/RegisterScreen";
import UploadScreen    from "./screens/UploadScreen";
import ChatScreen      from "./screens/ChatScreen";
import QuizScreen      from "./screens/QuizScreen";
import FlashcardScreen from "./screens/FlashcardScreen";

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Main tabs (only shown when user is logged in) ──────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle:            { backgroundColor: "#0f172a" },
        headerTintColor:        "#fff",
        tabBarStyle: {
          backgroundColor: "#0f172a",
          borderTopColor:  "#1e293b",
          paddingBottom:   5,
          height:          60,
        },
        tabBarActiveTintColor:   "#6366f1",
        tabBarInactiveTintColor: "#64748b",
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Upload:     focused ? "cloud-upload"   : "cloud-upload-outline",
            Chat:       focused ? "chatbubbles"    : "chatbubbles-outline",
            Quiz:       focused ? "help-circle"    : "help-circle-outline",
            Flashcards: focused ? "layers"         : "layers-outline",
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Upload"     component={UploadScreen} />
      <Tab.Screen name="Chat"       component={ChatScreen} />
      <Tab.Screen name="Quiz"       component={QuizScreen} />
      <Tab.Screen name="Flashcards" component={FlashcardScreen} />
    </Tab.Navigator>
  );
}

// ─── Root navigator — switches based on auth state ──────────────
function RootNavigator() {
  const { user, loading } = useAuth();

  // Firebase is checking AsyncStorage for a saved session
  // Show a spinner so the app does not flash the login screen
  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: "#1a1d2e",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      {user ? (
        // ✅ Logged in → show the main tab screen
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        // ❌ Not logged in → show auth screens
        <>
          <Stack.Screen name="Login"    component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// ─── App root ───────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}