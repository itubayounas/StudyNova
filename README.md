# 📚 StudyAI — AI-Powered Study Assistant

**StudyAI** is an AI-powered mobile application built with React Native and Expo to help students study smarter and make learning more interactive.

The application allows students to upload their study materials, including PDF and DOCX documents, or paste text directly. Using AI powered by the **Grok API (xAI)**, StudyAI transforms learning materials into interactive quizzes, flashcards, and AI-powered conversations.

The goal is to simplify the learning process by helping students understand, practice, and revise their study material in one place.

## ✨ Features

### 📄 Document Upload & Processing
- Upload PDF, DOCX, and plain text files.
- Extract text from uploaded study materials.
- Use personal study documents as input for AI-powered learning tools.

### 🧠 AI-Generated Quizzes
- Generate multiple-choice questions from uploaded notes and documents.
- Create interactive quizzes based on study content.
- Practice and evaluate understanding of learning materials.

### 🗂️ Smart Flashcards
- Automatically generate flashcards from study material.
- Interactive flip-card interface for active recall.
- Spaced repetition logic based on the SM-2 algorithm to support effective revision.

### 💬 AI Study Chat
- Interactive AI chat powered by the Grok API.
- Ask questions about study materials.
- Real-time chat experience with typing indicators and message animations.

### ☁️ Firebase Integration
- Firebase Firestore for cloud document storage.
- User session management.
- Cloud-based data handling.

### 🎨 Modern User Interface
- Custom mobile UI built with NativeWind.
- Smooth animations and gesture-based interactions.
- Expo Linear Gradient for enhanced visual design.
- React Native Reanimated for interactive UI experiences.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Mobile Development | React Native, Expo SDK 54 |
| Styling | NativeWind, Tailwind CSS |
| Backend / Cloud | Firebase, Firestore |
| AI Integration | Grok API (xAI) |
| Navigation | React Navigation |
| File Handling | Expo Document Picker |
| Animations | React Native Reanimated |
| Gradient UI | Expo Linear Gradient |
| Development Language | JavaScript / TypeScript (as applicable) |

## ⚙️ Application Workflow

1. **Upload Study Material:** Students upload PDF, DOCX, or plain text files.
2. **Extract Content:** The application extracts text from the uploaded documents.
3. **Generate Learning Content:** The Grok API processes the extracted material to generate quizzes, flashcards, and AI chat responses.
4. **Practice & Revise:** Students interact with quizzes and flashcards to reinforce their understanding.
5. **Ask Questions:** Students use the AI chat interface to explore and clarify concepts.

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Expo CLI / EAS CLI
- Android Studio (for Android development)
- Expo Go or an Android emulator (for testing)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/itubayounas/StudyAI.git
```

**2. Navigate to the project directory**

```bash
cd StudyAI
```

**3. Install dependencies**

```bash
npm install
```

**4. Configure environment variables**

Create a `.env` file in the project root and add the required API keys:

```env
EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder values with your own API keys.

**5. Start the Expo development server**

```bash
npx expo start
```

Follow the terminal instructions to run the application on an emulator or compatible device.

## 📱 Android Build

To generate an Android APK using EAS Build:

```bash
eas build --platform android --profile preview
```

For local Android development builds, generate the native project and use Gradle:

```bash
npx expo prebuild --platform android
cd android
.\gradlew.bat assembleDebug
```

## 🎯 Project Objectives

- Make studying more interactive through AI-powered learning tools.
- Reduce the time required to create quizzes and revision materials.
- Encourage active recall and spaced repetition.
- Provide students with an accessible AI study companion.
- Integrate modern LLM capabilities into a mobile learning application.

## 📖 Key Learnings

Developing StudyAI provided practical experience in:

- Integrating Large Language Model (LLM) APIs into a mobile application.
- Handling asynchronous document uploads and text extraction.
- Managing application data and sessions with Firebase.
- Implementing spaced repetition using the SM-2 algorithm.
- Designing gesture-based interactions and animated mobile interfaces.
- Building and configuring Android applications using Expo and EAS.

## 🔮 Future Improvements

- Personalized learning recommendations.
- Enhanced learning analytics and progress tracking.
- Additional document formats and content-processing capabilities.
- More advanced spaced repetition and revision scheduling.

## 👩‍💻 Developer

**Tuba Younas**

- GitHub: [@itubayounas](https://github.com/itubayounas)
- LinkedIn: [Tuba Younas](https://www.linkedin.com/in/tuba-younas/)
- Portfolio: [tuba-younas.vercel.app](https://tuba-younas.vercel.app/)

---

⭐ If you find this project interesting, consider giving the repository a star!

**StudyAI — Learn Smarter. Practice Better.**
