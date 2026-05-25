import "./global.css";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
// ✅ ADD THESE TWO IMPORTS
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginScreen     from "./screens/LoginScreen";
import RegisterScreen  from "./screens/RegisterScreen";
import UploadScreen    from "./screens/UploadScreen";
import ChatScreen      from "./screens/ChatScreen";
import QuizScreen      from "./screens/QuizScreen";
import FlashcardScreen from "./screens/FlashcardScreen";
import { DocumentProvider } from "./context/DocumentContext";

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ✅ Separate component so useSafeAreaInsets() works inside SafeAreaProvider
function MainTabs() {
  const insets = useSafeAreaInsets(); // ← reads Android bottom nav height

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle:            { backgroundColor: "#0f172a" },
        headerTintColor:        "#fff",
        tabBarStyle: {
          backgroundColor: "#0f172a",
          borderTopColor:  "#1e293b",
          // ✅ FIXED: paddingBottom now respects Android gesture nav / button bar
          paddingBottom:   Math.max(insets.bottom, 8),
          paddingTop:      8,
          height:          60 + Math.max(insets.bottom, 0), // expands for inset
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

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{
        flex: 1, backgroundColor: "#1a1d2e",
        justifyContent: "center", alignItems: "center",
      }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <>
          <Stack.Screen name="Login"    component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    // ✅ SafeAreaProvider must wrap everything
    <SafeAreaProvider>
      <DocumentProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </DocumentProvider>
    </SafeAreaProvider>
  );
}