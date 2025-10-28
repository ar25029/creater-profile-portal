import React, { createContext, useContext, useReducer, useEffect } from "react";
import { creatorService } from "../firebase/creatorService";

const CreatorContext = createContext();

const initialState = {
  creators: [],
  loading: false,
  error: null,
  currentCreator: null,
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
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export function CreatorProvider({ children }) {
  const [state, dispatch] = useReducer(creatorReducer, initialState);

  const fetchCreators = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const creators = await creatorService.getCreators();
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
    try {
      const id = await creatorService.addCreator(creatorData, images);
      const newCreator = {
        id,
        ...creatorData,
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
    try {
      await creatorService.updateCreator(id, creatorData, images);
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
    try {
      await creatorService.deleteCreator(id);
      dispatch({ type: "DELETE_CREATOR", payload: id });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  return (
    <CreatorContext.Provider
      value={{
        ...state,
        fetchCreators,
        fetchCreator,
        addCreator,
        updateCreator,
        deleteCreator,
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
