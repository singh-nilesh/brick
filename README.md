# Brick

![Brick Logo](assets/images/brickStack.png)

## Project Overview
- **React Native (expo)**
Brick is a productivity and goal-tracking mobile application built with React Native. It helps users build better habits, track progress on goals, and share their journey with others. The app combines task management, habit tracking, and social features to create a comprehensive personal development platform.

## Key Features

- **Task Management**: Create, track, and complete daily tasks and to-dos
- **Habit Building**: Set up recurring habits with reference links and weekly schedules
- **Goal Groups**: Organize tasks and habits into meaningful goal groups
- **Progress Tracking**: Visual tracking of habit streaks and goal completion
- **Social Feeds**: Share progress with others and view community roadmaps
- **AI Assistance**: Get AI-powered suggestions for improvement


### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- React Native development environment

### Installation

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Setup environment variables
   Create a `.env` file in the root directory with the following:
   ```
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
   
   EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
   
   EXPO_PUBLIC_FIREBASE_API_KEY=your_key_here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_key_here
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_key_here
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_key_here
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_key_here
   EXPO_PUBLIC_FIREBASE_APP_ID=your_key_here
   ```

4. Start the development server
   ```bash
   npx react-native start
   ```

5. Run the application
   ```bash
   npx react-native run-android
   # or
   npx react-native run-ios
   ```