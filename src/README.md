# LifeQuest RPG: The Gamified Productivity App

Welcome to LifeQuest RPG, a Next.js application designed to turn your daily tasks and long-term goals into an epic role-playing adventure. This app gamifies productivity by allowing you to level up your character, complete quests, fight weekly bosses, and develop skills—all by managing your real-life tasks.

## Core Concepts

The application is built around a few core gamification principles:

-   **Character Progression**: You are the main character. Completing tasks earns you Experience Points (XP), which increases your level. Leveling up grants you skill points to spend on improving your character's stats.
-   **Quests (Tasks)**: Your to-do list is transformed into a Quest Log. Quests can be daily, weekly, monthly, or one-time, each with varying difficulty and rewards.
-   **Economy (Coins & Gems)**: Completing quests rewards you with Coins and Gems, the in-app currencies. Use them to purchase rewards, items, and boosts from the shop.
-   **Health (HP)**: Your health is a measure of your consistency. Failing to complete daily quests or succumbing to boss attacks will decrease your HP. If it reaches zero, you face penalties.
-   **Stats & Skills**: You can customize your character by allocating skill points into three main trees: **Physical**, **Mental**, and **Life Skills**. These skills provide passive bonuses, like earning more XP or dealing more damage to the weekly boss.

## Key Features

### 1. Dashboard
The central hub for your adventure, providing a quick overview of your progress.
-   **Stats at a Glance**: View your current Level, XP, Coins, Gems, and task completion rate.
-   **AI Side Quests**: Get personalized quest recommendations from an AI assistant based on your character profile.
-   **Weekly Overview**: A chart visualizing your productivity (tasks completed and XP earned) over the past week.
-   **Contribution Heatmap**: A GitHub-style heatmap that shows your daily activity and tracks your current and longest streaks.
-   **Upcoming Quests & Boss Info**: Quick-access panels for your most important upcoming tasks and the current weekly boss.

### 2. Character & Inventory
This is where you manage your character's identity, stats, and gear.
-   **Profile**: Customize your name, avatar (by selecting a symbol or uploading an image), gender, and MBTI personality type.
-   **Equipment**: Equip items like weapons, armor, helmets, and shields, which can provide bonuses.
-   **Inventory**: View all the items and collectibles you've acquired.
-   **Skill Trees**: Allocate skill points to upgrade skills in the Physical, Mental, and Life Skills trees.

### 3. Quest Log (Tasks)
Your comprehensive to-do list, reimagined as a fantasy quest log.
-   **Multiple Views**: Filter quests by **Today**, **Week**, **All**, and **Completed**.
-   **AI Quest Breakdown**: Input a large, complex goal (e.g., "Learn a new programming language"), and the AI will break it down into smaller, actionable sub-quests.
-   **Habit Stacking Suggestions**: The AI analyzes your existing habits and suggests new, complementary ones to "stack" on top, helping you build powerful routines.
-   **Implementation Intentions**: A field to set an "if-then" plan for your quest, a proven technique to increase follow-through.

### 4. Special Quests (Dungeons)
Tackle multi-step, themed projects for epic rewards.
-   **AI-Generated Adventures**: Define a goal and difficulty, and the AI will generate a "Dungeon Crawl"—a mini-project with a creative title, description, and 3-5 thematically related challenges.
-   **Track Progress**: Check off challenges as you complete them to conquer the dungeon and claim a large XP reward.

### 5. Weekly Boss Fight
Every week, a new formidable boss appears. Defeat it by completing your quests.
-   **Dynamic Challenge**: Each boss has unique health, resistances, and weaknesses tied to quest categories (e.g., a boss might be weak to 'Health' quests but resistant to 'Career' quests).
-   **Telegraphed Attacks & Debuffs**: Bosses have attack patterns that can apply debuffs to your character if certain conditions are met (like failing a quest), adding a layer of strategy.
-   **AI Image Generation**: The boss's image can be generated and customized using an AI image model (Imagen).

### 6. Habits & Challenges
-   **Habit Tracker**: A dedicated interface for managing and tracking recurring habits, separate from one-time quests. It tracks streaks and weekly progress.
-   **Challenge Hub**: A feature for undertaking long-term, structured challenges (e.g., a "30-Day Fitness Challenge"). It tracks daily check-ins and overall success rate.

### 7. Journal & Review
Tools for reflection and capturing thoughts.
-   **Advanced Journal**: A rich text editor where you can write entries, upload images, and capture your thoughts. Journaling rewards XP and Coins. A penalty system discourages deleting recent entries to promote mindfulness.
-   **Weekly Review**: A guided form to reflect on your wins, challenges, and learnings.
-   **AI Insights**: After completing a few reviews, the AI can analyze your entries to identify emerging themes, key observations, and provide actionable suggestions for the upcoming week.
-   **Notes Vault**: A powerful, markdown-enabled note-taking system.
    -   **File Explorer Interface**: Navigate your notes with a familiar file explorer view.
    -   **Advanced Filtering & Sorting**: Filter notes by category and sort them by date, title, or priority.
    -   **Pinned Notes**: Pin important notes to keep them at the top of your list.
    -   **Rich Metadata**: Organize notes with mood, priority, color-coding, and tags.

### 8. Productivity Tools
A suite of tools to enhance focus and manage your time.
-   **Smart Timetable Generator**: An AI-powered tool that creates an optimized daily schedule based on your available hours, tasks, commitments, and personality profile (Chronotype, Work Style, MBTI). The generated schedule can be viewed and edited in a Notion-style table or a Kanban board.
-   **Pomodoro Timer**: A highly customizable focus timer.
    - **Presets & Customization**: Use presets like 'Deep Code' or create custom timings for focus and break sessions.
    - **Quest Integration**: Link a focus session to a specific quest to track progress.
    - **AI Timing Suggestions**: The AI suggests an optimal session duration based on the linked quest's difficulty and your personal context.
    - **Flow State Extension**: If you're in the zone, the timer offers to extend your session automatically.
-   **Guided Breathing**: A selection of guided breathing exercises (e.g., Box Breathing, 4-7-8) with animated visuals to help you relax and recenter.

### 9. AI Coach
A personal productivity coach you can chat with.
-   **Context-Aware Chat**: The AI coach has access to your recent tasks, weekly reviews, and personality type to provide personalized, motivating, and insightful advice.
-   **Markdown & Emojis**: The coach responds in a friendly, formatted style to make the conversation engaging.

### 10. Notifications
A personalized notification system to keep you on track.
-   **AI-Generated Alerts**: The AI crafts notifications based on your stats, incomplete tasks, and preferred style (e.g., creative, funny, motivational).
-   **Contextual & Actionable**: Notifications are relevant to your current situation and often include a direct link to the relevant page in the app.

## Technical Implementation

-   **Frontend**: Built with **Next.js** and the **App Router**.
-   **UI**: A combination of **Tailwind CSS** and **ShadCN UI** components, providing a modern and responsive design.
-   **State Management**: Client-side state and business logic are managed through **React Context** (`UserContext`, `HabitsContext`). Local storage is used for persistence in this demo.
-   **Generative AI**: All AI features are powered by **Google's Gemini models** accessed via the **Genkit** framework.
    -   **Flows**: Server-side Genkit flows (`/src/ai/flows`) define the logic for each AI feature, from generating timetables to providing chat responses.
    -   **Structured Output**: Zod schemas are used to enforce structured JSON output from the language models, ensuring reliability.
    -   **Image Generation**: The `imagen-4.0-fast-generate-001` model is used for creating boss images.
-   **Database (Mocked)**: In this version, all data is mocked locally in `src/lib/data.ts` and managed via React Context. Firebase Firestore is integrated but primarily used for the Habits & Challenges feature.
-   **Firebase**:
    -   **Firestore**: Used for real-time data synchronization for the Habits & Challenges features.
    -   **Authentication**: The structure is in place for Firebase Authentication.
    -   **Providers**: A robust provider pattern (`FirebaseProvider`, `FirebaseClientProvider`) ensures that Firebase services are initialized correctly and only on the client-side.
