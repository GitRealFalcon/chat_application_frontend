# Chattify - Real-Time Chat Application

A modern, feature-rich chat application built with React and Vite, enabling real-time messaging, group chats, user notifications, and intuitive user interactions.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Available Scripts](#available-scripts)

---

## 🛠 Tech Stack

### Frontend Framework & Build Tool
- **React** (v19.2.0) - A JavaScript library for building user interfaces
- **Vite** (v7.2.4) - A modern frontend build tool with fast HMR (Hot Module Replacement)

### State Management
- **Redux Toolkit** (v2.11.2) - Modern approach to Redux state management
- **React-Redux** (v9.2.0) - Official React bindings for Redux

### Routing
- **React Router DOM** (v7.13.0) - Declarative client-side routing

### Real-Time Communication
- **Socket.IO Client** (v4.8.3) - Real-time bidirectional communication library

### HTTP Client
- **Axios** (v1.13.5) - Promise-based HTTP client for API requests

### Styling
- **Tailwind CSS** (v4.1.18) - Utility-first CSS framework
- **Tailwind CSS Vite** (v4.1.18) - Vite integration for Tailwind CSS

### Development Tools
- **ESLint** (v9.39.1) - JavaScript linting utility
- **ESLint Plugin React Hooks** - ESLint plugin for React hooks
- **ESLint Plugin React Refresh** - ESLint plugin for React Fast Refresh

---

## ✨ Features

### Authentication & Authorization
- **User Registration** - Create new user accounts
- **User Login** - Secure login with authentication
- **Auth State Management** - Redux-based authentication state
- **Protected Routes** - Auth layout for secure pages

### Real-Time Chat
- **Direct Messaging** - One-on-one conversations
- **Real-Time Message Delivery** - Powered by Socket.IO
- **Message Input** - Rich input component for composing messages
- **Chat History** - View previous messages

### Group Chat
- **Group Creation** - Create and manage group chats
- **Group Management** - Manage group members and settings
- **Group Messages** - Send and receive group messages

### User Management
- **User Profiles** - View and manage user profiles
- **User Search** - Find and connect with other users
- **Online Status** - See which users are currently online
- **User Information Display** - User details and profile information

### Notifications
- **Real-Time Notifications** - Instant alerts for messages and events
- **Notification State** - Manage notification preferences and state

### User Interface
- **Responsive Sidebar** - Navigate between chats and features
- **Navbar** - Application navigation header
- **Dashboard/Home Page** - Central hub for all chat activities
- **Loading States** - Multiple loader components for better UX
  - Bouncing Loader
  - Spin Button
  - Spin Loader
- **Reusable Components**
  - Button Component
  - Input Component
  - Auth Layout

### Theme
- **Theme Support** - Switch between different themes (Redux-based)

---

## 📁 Project Structure

```
src/
├── App/
│   ├── hooks.js          # Custom React hooks
│   └── store.js          # Redux store configuration
├── assets/               # Static assets
├── components/
│   ├── authLayout.jsx    # Authentication layout wrapper
│   ├── chat/
│   │   └── SearchUser.jsx
│   ├── common/
│   │   ├── Button.jsx
│   │   └── Input.jsx
│   ├── homePage/
│   │   ├── Chat.jsx
│   │   ├── Input.jsx
│   │   ├── Navbar.jsx
│   │   ├── Profile.jsx
│   │   └── UserInfo.jsx
│   ├── Loaders/
│   │   ├── BouncingLoader.jsx
│   │   ├── SpinButton.jsx
│   │   └── SpinLoader.jsx
│   └── sidebar/
│       └── Sidebar.jsx
├── features/             # Redux slices and API calls
│   ├── auth/
│   │   ├── authAPI.js
│   │   └── authSlice.js
│   ├── chat/
│   │   ├── chatAPI.js
│   │   └── chatSlice.js
│   ├── group/
│   │   ├── groupAPI.js
│   │   └── groupSlice.js
│   ├── notification/
│   │   └── notificationSlice.js
│   ├── theme/
│   │   └── themeSlice.js
│   └── user/
│       ├── userAPI.js
│       └── userSlice.js
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── services/
│   ├── API/
│   │   └── axiosInstans.js
│   └── socket/
│       ├── socket.js
│       └── socketListeners.js
├── utils/
│   ├── constants.js
│   ├── helpers.js
│   └── validators.js
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v14.0 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Chattify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (if needed)
   - Create an `.env` or `.env.local` file in the root directory
   - Add your API endpoints and socket server URL

---

## 🏃 Running the Application

### Development Server
Start the development server with hot module replacement:
```bash
npm run dev
```
The application will be available at `http://localhost:5173` (default Vite port)

### Build for Production
Create an optimized production build:
```bash
npm run build
```

### Preview Production Build
Preview the production build locally:
```bash
npm run preview
```

### Linting
Run ESLint to check code quality:
```bash
npm run lint
```

---

## 📦 Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the development server with HMR |
| `npm run build` | Build the application for production |
| `npm run lint` | Run ESLint to check code quality |
| `npm run preview` | Preview the production build locally |

---

## 🔗 Key Technologies Integration

- **Redux Toolkit** manages global state for auth, chat, groups, notifications, theme, and user data
- **Socket.IO** enables real-time bidirectional communication between client and server
- **Axios** handles all HTTP requests to the backend API
- **React Router** provides client-side routing for navigation
- **Tailwind CSS** provides utility-first styling for responsive UI
- **Vite** ensures fast development experience with instant HMR

---

## 📝 License

This project is part of the V2 Chattify Application Suite.

---

## 👨‍💻 Development Notes

- All Redux slices follow the Redux Toolkit best practices
- Component structure follows modular design patterns
- Socket listeners are centralized for easier management
- API calls are abstracted in separate API files
- Utility functions are organized by category

---

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
