// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CreatorProvider } from "./contexts/CreatorContext";
import Dashboard from "./pages/Dashboard";
import AuthWrapper from "./components/auth/AuthWrapper";
import { useCreator } from "./contexts/CreatorContext";
import "./index.css";

// Public Route - Shows all creators without login
const PublicRoute = ({ children }) => {
  const { authLoading } = useCreator();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
};

// Protected Route - Requires login for actions
// const ProtectedRoute = ({ children }) => {
//   const { currentUser, authLoading } = useCreator();

//   if (authLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!currentUser) {
//     return <AuthWrapper />;
//   }

//   return children;
// };

function AppContent() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Dashboard />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PublicRoute>
                <Dashboard />
              </PublicRoute>
            }
          />
          <Route path="/login" element={<AuthWrapper />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <CreatorProvider>
      <AppContent />
    </CreatorProvider>
  );
}

export default App;
