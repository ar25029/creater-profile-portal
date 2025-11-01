import React, { createContext, useContext, useReducer, useEffect } from "react";
import { creatorService } from "../firebase/creatorService";
import { authService } from "../firebase/authService";

const CreatorContext = createContext();

const initialState = {
  creators: [],
  loading: false,
  error: null,
  currentCreator: null,
  uploadProgress: 0,
  isUploading: false,
  currentUser: null,
  authLoading: true,
};

function creatorReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_CREATORS":
      return { ...state, creators: action.payload, loading: false };
    case "SET_CREATOR":
      return { ...state, currentCreator: action.payload, loading: false };
    case "ADD_CREATOR":
      return { ...state, creators: [action.payload, ...state.creators] };
    case "UPDATE_CREATOR":
      return {
        ...state,
        creators: state.creators.map((creator) =>
          creator.id === action.payload.id ? action.payload : creator
        ),
        currentCreator: action.payload,
      };
    case "DELETE_CREATOR":
      return {
        ...state,
        creators: state.creators.filter(
          (creator) => creator.id !== action.payload
        ),
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
        isUploading: false,
        uploadProgress: 0,
      };
    case "SET_UPLOAD_PROGRESS":
      return { ...state, uploadProgress: action.payload };
    case "SET_UPLOADING":
      return {
        ...state,
        isUploading: action.payload,
        uploadProgress: action.payload ? 0 : 100,
      };
    case "RESET_UPLOAD_STATE":
      return { ...state, isUploading: false, uploadProgress: 0, error: null };
    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.payload, authLoading: false };
    case "SET_AUTH_LOADING":
      return { ...state, authLoading: action.payload };
    default:
      return state;
  }
}

export function CreatorProvider({ children }) {
  const [state, dispatch] = useReducer(creatorReducer, initialState);

  // Auth functions
  const register = async (email, password, displayName) => {
    try {
      const result = await authService.register(email, password, displayName);
      dispatch({ type: "SET_CURRENT_USER", payload: result.user });
      return result;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      dispatch({ type: "SET_CURRENT_USER", payload: result.user });
      return result;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: "SET_CURRENT_USER", payload: null });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  // Creator functions - Fetch all creators (public)
  const fetchAllCreators = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const creators = await creatorService.getCreators(); // This now gets all creators
      dispatch({ type: "SET_CREATORS", payload: creators });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  };

  // Fetch only user's creators (private)
  const fetchUserCreators = async (userId) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const creators = await creatorService.getCreatorsByUser(userId);
      dispatch({ type: "SET_CREATORS", payload: creators });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  };

  const fetchCreator = async (id) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const creator = await creatorService.getCreator(id);
      dispatch({ type: "SET_CREATOR", payload: creator });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    }
  };

  const addCreator = async (creatorData, images) => {
    if (!state.currentUser) {
      throw new Error("You must be logged in to add creators.");
    }

    try {
      const id = await creatorService.addCreator(
        creatorData,
        images,
        state.currentUser.id,
        state.currentUser.name
      );

      const newCreator = {
        id,
        ...creatorData,
        createdBy: state.currentUser.id,
        authorName: state.currentUser.name,
        profileImage: creatorData.profileImage || "",
        coverImage: creatorData.coverImage || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: "ADD_CREATOR", payload: newCreator });
      return id;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  const updateCreator = async (id, creatorData, images) => {
    if (!state.currentUser) {
      throw new Error("You must be logged in to update creators.");
    }

    try {
      await creatorService.updateCreator(
        id,
        creatorData,
        images,
        state.currentUser.id
      );
      const updatedCreator = {
        id,
        ...creatorData,
        updatedAt: new Date(),
      };
      dispatch({ type: "UPDATE_CREATOR", payload: updatedCreator });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  const deleteCreator = async (id) => {
    if (!state.currentUser) {
      throw new Error("You must be logged in to delete creators.");
    }

    try {
      await creatorService.deleteCreator(id, state.currentUser.id);
      dispatch({ type: "DELETE_CREATOR", payload: id });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  const canDeleteCreator = (creatorId) => {
    if (!state.currentUser) return false;
    const creator = state.creators.find((c) => c.id === creatorId);
    return creator && creator.createdBy === state.currentUser.id;
  };

  // Check auth state on app start and fetch all creators
  useEffect(() => {
    dispatch({ type: "SET_AUTH_LOADING", payload: true });

    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        dispatch({ type: "SET_CURRENT_USER", payload: user });
        // When user logs in, we keep showing all creators but enable actions
      } else {
        dispatch({ type: "SET_CURRENT_USER", payload: null });
      }
      dispatch({ type: "SET_AUTH_LOADING", payload: false });
    });

    // Always fetch all creators initially
    fetchAllCreators();

    return () => unsubscribe();
  }, []);

  return (
    <CreatorContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        fetchAllCreators,
        fetchUserCreators,
        fetchCreator,
        addCreator,
        updateCreator,
        deleteCreator,
        canDeleteCreator,
      }}
    >
      {children}
    </CreatorContext.Provider>
  );
}

export const useCreator = () => {
  const context = useContext(CreatorContext);
  if (!context) {
    throw new Error("useCreator must be used within a CreatorProvider");
  }
  return context;
};
