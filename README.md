# 💪 FitTracker Pro

> **A comprehensive, gamified fitness tracking application built with React Native and Expo**

[![React Native](https://img.shields.io/badge/React_Native-0.79.5-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.20-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.53.0-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 🚀 Overview

FitTracker Pro is a feature-rich, social fitness application that combines comprehensive workout tracking with gamification elements and social features. Built with modern React Native and powered by Supabase, it provides users with an engaging platform to track their fitness journey, connect with friends, and stay motivated through progress visualization and achievement systems.

## ✨ Key Features

### 🏋️ **Comprehensive Workout Tracking**
- **Real-time Workout Sessions**: Start, pause, and track live workout sessions with detailed exercise logging
- **Exercise Library**: Extensive database of exercises with categories, equipment requirements, and instructions
- **Set & Rep Tracking**: Log sets, reps, weight, and RPE (Rate of Perceived Exertion) for each exercise
- **Workout Templates**: Create and save custom workout routines for quick access
- **Session Analytics**: Track workout duration, total volume, and performance metrics

### 📊 **Advanced Analytics & Statistics**
- **Progress Visualization**: Interactive charts showing volume progression, workout frequency, and muscle group distribution
- **Performance Metrics**: Track total volume, sets, reps, and workout duration over time
- **Weight Tracking**: Comprehensive body weight logging with trend analysis
- **Muscle Group Analysis**: Pie charts showing training distribution across muscle groups
- **Historical Data**: View detailed session history and performance trends

### 🎮 **Gamification System**
- **XP & Leveling**: Earn experience points for completed workouts and level up your fitness journey
- **Achievement Badges**: Unlock badges for various milestones and accomplishments
- **Workout Streaks**: Track consecutive workout days with streak leaderboards
- **Progress Bars**: Visual progress indicators for XP, levels, and fitness goals
- **Motivational Elements**: Daily motivational quotes and achievement celebrations

### 👥 **Social Features**
- **Friend System**: Add friends, view their profiles, and track mutual connections
- **Activity Feed**: Real-time feed showing friends' workout completions and achievements
- **Social Profiles**: Comprehensive user profiles with stats, goals, and fitness journey
- **Leaderboards**: Compete with friends on workout streaks, total volume, and achievements
- **Workout Sharing**: Share completed workouts and achievements with your network

### 🎯 **User Experience**
- **Intuitive Navigation**: Clean, modern UI with bottom tab navigation and smooth transitions
- **Real-time Updates**: Live data synchronization across all app features
- **Offline Support**: Core functionality works offline with data sync when connected
- **Customizable Settings**: Personalize units, notifications, and app preferences
- **Onboarding Flow**: Guided setup for new users with goal setting and preferences

## 🛠️ Technical Stack

### **Frontend**
- **React Native 0.79.5** - Cross-platform mobile development
- **Expo 53.0.20** - Development platform and build tools
- **React Navigation 7.x** - Navigation and routing
- **React Native Reanimated 4.0** - Smooth animations and gestures
- **React Native Chart Kit 6.12** - Data visualization and charts
- **React Native Vector Icons** - Icon library
- **Expo Linear Gradient** - Gradient backgrounds and effects

### **Backend & Database**
- **Supabase 2.53.0** - Backend-as-a-Service with PostgreSQL
- **Real-time Subscriptions** - Live data updates and notifications
- **Row Level Security (RLS)** - Secure data access and user isolation
- **Custom Functions** - Database functions for complex queries and analytics

### **State Management & Context**
- **React Context API** - Global state management for workout sessions
- **AsyncStorage** - Local data persistence and caching
- **Real-time State Sync** - Automatic data synchronization across components

### **Development Tools**
- **TypeScript 5.8.3** - Type safety and enhanced developer experience
- **Babel** - JavaScript compilation and transformation
- **ESLint** - Code linting and quality assurance

## 📱 App Architecture

### **Navigation Structure**
```
App.js
├── Auth Stack (Unauthenticated)
│   └── Auth Screen
└── Main Stack (Authenticated)
    ├── Onboarding Flow
    ├── Account Management
    └── Tab Navigator
        ├── Dashboard (Social Feed & Quick Actions)
        ├── Workout Hub (Exercise Library & Templates)
        ├── Current Workout (Live Session Tracking)
        ├── Statistics (Analytics & Progress)
        ├── Social (Friends & Leaderboards)
        └── Profile (Settings & Account)
```

### **Core Components**
- **WorkoutContext**: Global state management for active workout sessions
- **Exercise Components**: Reusable components for exercise display and interaction
- **Statistics Components**: Chart and visualization components for data display
- **Social Components**: Activity feeds, user profiles, and social interactions
- **Game Components**: XP tracking, progress bars, and achievement displays

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fittracker-pro.git
   cd fittracker-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Supabase**
   - Create a new Supabase project
   - Update `lib/supabase.ts` with your project URL and anon key
   - Set up the database schema (tables, functions, and RLS policies)

4. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with the following key tables:

- **Users & Authentication**: User profiles, authentication, and preferences
- **Workout Sessions**: Workout tracking with timestamps and metadata
- **Exercises**: Exercise library with categories and instructions
- **Sets & Reps**: Detailed set tracking with weight, reps, and RPE
- **Social Features**: Friends, activity feeds, and social interactions
- **Gamification**: XP tracking, levels, badges, and achievements
- **Analytics**: Aggregated statistics and performance metrics

## 🎯 Future Roadmap

### **Planned Features**
- 🤖 **AI-Powered Chatbot**: Intelligent fitness assistant for workout guidance and questions
- 🏆 **Advanced Achievement System**: Medals and badges for lifting milestones and personal records
- 📈 **Enhanced Leaderboards**: Exercise-specific, weight-based, and time-based competitions
- 🔔 **Smart Notifications**: Personalized workout reminders and achievement notifications
- 📱 **Apple Watch Integration**: Native watch app for workout tracking
- 🌐 **Web Dashboard**: Comprehensive web interface for detailed analytics
- 🎨 **Custom Themes**: Personalizable app themes and color schemes

### **Premium Features**
- 🏷️ **Custom Workout Templates**: Advanced template creation with tags and colors
- 📊 **Advanced Analytics**: Detailed performance insights and trend analysis
- 👥 **Group Challenges**: Team-based fitness challenges and competitions
- 📱 **Priority Support**: Enhanced customer support and feature requests

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to:

- Report bugs and request features
- Submit pull requests
- Set up the development environment
- Follow our coding standards

## 📄 License

This project is licensed under the 0BSD License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Native Community** for the excellent framework and ecosystem
- **Expo Team** for the amazing development platform
- **Supabase** for the powerful backend infrastructure
- **Open Source Contributors** for the various libraries and tools used

## 📞 Support

- 📧 **Email**: amcfdc1@student.le.ac.uk
- 🐛 **Issues & Bug Reports**: amcfdc1@student.le.ac.uk
- 💡 **Feature Requests**: amcfdc1@student.le.ac.uk

---

<div align="center">

**Built with ❤️ for the fitness community**

[⭐ Star this repo](https://github.com/DevAfi/WorkoutTrackerTest) • [🐛 Report Bug](mailto:amcfdc1@student.le.ac.uk) • [💡 Request Feature](mailto:amcfdc1@student.le.ac.uk)

</div>