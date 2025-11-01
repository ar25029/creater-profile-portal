// src/firebase/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "./config";

export const authService = {
  // Register new user
  async register(email, password, displayName) {
    try {
      console.log("Attempting to register user:", email);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User registered successfully:", userCredential.user.uid);

      // Update profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
        console.log("Profile updated with display name");
      }

      return {
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName || displayName,
        },
      };
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = this.getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  },

  // Login user
  async login(email, password) {
    try {
      console.log("Attempting to login user:", email);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User logged in successfully:", userCredential.user.uid);

      return {
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName || "User",
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = this.getAuthErrorMessage(error.code);
      throw new Error(errorMessage);
    }
  },

  // Logout user
  async logout() {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Logout failed. Please try again.");
    }
  },

  // Listen for auth state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Auth state changed: User signed in", user.uid);
        callback({
          id: user.uid,
          email: user.email,
          name: user.displayName || "User",
        });
      } else {
        console.log("Auth state changed: User signed out");
        callback(null);
      }
    });
  },

  // Get current user
  getCurrentUser() {
    const user = auth.currentUser;
    if (user) {
      return {
        id: user.uid,
        email: user.email,
        name: user.displayName || "User",
      };
    }
    return null;
  },

  // Error message mapping
  getAuthErrorMessage(errorCode) {
    console.log("Auth error code:", errorCode);

    switch (errorCode) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please use a different email.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled. Please contact support.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  },
};
