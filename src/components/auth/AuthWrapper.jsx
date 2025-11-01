import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useCreator } from "../../contexts/CreatorContext";
import Login from "./Login";
import Register from "./Register";
import { Users, Sparkles, CheckCircle } from "lucide-react";

const AuthWrapper = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const { currentUser } = useCreator();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, location]);

  const handleRegisterSuccess = () => {
    setSignupSuccess(true);
    setTimeout(() => {
      setIsLogin(true);
      setSignupSuccess(false);
    }, 3000);
  };

  // If user is already authenticated, show loading until redirect
  if (currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="relative z-10 w-full max-w-6xl flex">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex flex-1 flex-col justify-center text-white p-12"
        >
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Users
                  className="w-8 h-8"
                  onClick={() => {
                    navigate("/");
                  }}
                />
              </div>
              <h1 className="text-4xl font-bold">Creator Portal</h1>
            </div>

            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Manage your creator profiles with our powerful dashboard. Connect,
              organize, and grow your creator network effortlessly.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-white/90">
                  Secure user authentication
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-white/90">
                  Personal creator management
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-white/90">Real-time updates</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Auth Forms */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {signupSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-full max-w-md"
              >
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Account Created!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your account has been successfully created. Redirecting to
                    login...
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </motion.div>
            ) : isLogin ? (
              <Login key="login" onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
              <Register
                key="register"
                onSwitchToLogin={() => setIsLogin(true)}
                onRegisterSuccess={handleRegisterSuccess}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthWrapper;
