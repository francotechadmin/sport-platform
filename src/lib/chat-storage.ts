import { v4 as uuidv4 } from "uuid";

// Types for chat storage
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "data";
  content: string;
  parts?: Array<{
    type:
      | "text"
      | "reasoning"
      | "tool_invocation"
      | "source"
      | "file"
      | "step_start";
    text?: string;
    [key: string]: any;
  }>;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface UserProfile {
  selfDescription: string;
  onboardingComplete: boolean;
}

// Constants
const CHAT_HISTORY_KEY = "chat_history"; // This must match the key used in direct localStorage operations
const USER_PROFILE_KEY = "user_profile";
const MAX_HISTORY_LENGTH = 20; // Maximum number of conversations to store

// Debug function to check all localStorage keys - minimal version
export const debugLocalStorage = (): void => {
  // This function is intentionally empty to reduce console noise
  // Uncomment the code below for debugging if needed
  /*
  const localStorage = getLocalStorage();
  if (!localStorage) return;
  
  // Just check if chat_history exists
  const chatHistory = localStorage.getItem(CHAT_HISTORY_KEY);
  if (chatHistory) {
    try {
      const parsed = JSON.parse(chatHistory);
      console.log(`Chat history found with ${parsed.length} conversations`);
    } catch (e) {
      console.error("Error parsing chat history");
    }
  } else {
    console.log("No chat history found");
  }
  */
};

// Helper function to safely access localStorage (handles SSR)
const getLocalStorage = () => {
  if (typeof window !== "undefined") {
    return window.localStorage;
  }
  return null;
};

// Generate a title based on the first user message
export const generateTitle = (messages: ChatMessage[]): string => {
  const firstUserMessage = messages.find((msg) => msg.role === "user");

  if (!firstUserMessage || !firstUserMessage.content) {
    return "New Conversation";
  }

  // Extract first 30 characters of the first user message
  const content = firstUserMessage.content.trim();
  const title =
    content.length > 30 ? `${content.substring(0, 30)}...` : content;

  return title;
};

// Format relative time (e.g., "2 hours ago", "Yesterday")
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) {
    return "Just now";
  } else if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (hours < 24) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (days < 7) {
    return days === 1 ? "Yesterday" : `${days} days ago`;
  } else if (weeks < 4) {
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }
};

// Save a conversation to localStorage - minimal logging
export const saveConversation = (conversation: ChatConversation): void => {
  const localStorage = getLocalStorage();
  if (!localStorage) {
    console.error("localStorage not available");
    return;
  }

  try {
    // Get existing conversations
    const existingData = localStorage.getItem(CHAT_HISTORY_KEY);
    let conversations: ChatConversation[] = existingData
      ? JSON.parse(existingData)
      : [];

    // Find if this conversation already exists
    const existingIndex = conversations.findIndex(
      (c) => c.id === conversation.id
    );

    if (existingIndex >= 0) {
      // Update existing conversation
      conversations[existingIndex] = conversation;
    } else {
      // Add new conversation at the beginning
      conversations.unshift(conversation);

      // Limit the number of stored conversations
      if (conversations.length > MAX_HISTORY_LENGTH) {
        conversations = conversations.slice(0, MAX_HISTORY_LENGTH);
      }
    }

    // Save to localStorage
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error("Error saving conversation to localStorage:", error);
  }
};

// Get all conversations from localStorage - minimal logging
export const getConversations = (): ChatConversation[] => {
  const localStorage = getLocalStorage();
  if (!localStorage) {
    return [];
  }

  try {
    const data = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!data) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Error retrieving conversations:", error);
    return [];
  }
};

// Get a specific conversation by ID
export const getConversationById = (id: string): ChatConversation | null => {
  const conversations = getConversations();
  return conversations.find((c) => c.id === id) || null;
};

// Create a new conversation
export const createNewConversation = (): ChatConversation => {
  const now = Date.now();
  return {
    id: uuidv4(),
    title: "New Conversation",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
};

// Delete a conversation
export const deleteConversation = (id: string): void => {
  const localStorage = getLocalStorage();
  if (!localStorage) return;

  try {
    const conversations = getConversations();
    const updatedConversations = conversations.filter((c) => c.id !== id);
    localStorage.setItem(
      CHAT_HISTORY_KEY,
      JSON.stringify(updatedConversations)
    );
  } catch (error) {
    console.error("Error deleting conversation:", error);
  }
};

// Save user profile
export const saveUserProfile = (profile: UserProfile): void => {
  const localStorage = getLocalStorage();
  if (!localStorage) return;

  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Error saving user profile:", error);
  }
};

// Get user profile
export const getUserProfile = (): UserProfile | null => {
  const localStorage = getLocalStorage();
  if (!localStorage) return null;

  try {
    const data = localStorage.getItem(USER_PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    return null;
  }
};

// Check if onboarding is complete
export const isOnboardingComplete = (): boolean => {
  const profile = getUserProfile();
  return profile?.onboardingComplete === true;
};

// Set onboarding complete status
export const setOnboardingComplete = (complete: boolean): void => {
  const profile = getUserProfile() || {
    selfDescription: "",
    onboardingComplete: false,
  };
  profile.onboardingComplete = complete;
  saveUserProfile(profile);
};

// Get user self-description
export const getUserSelfDescription = (): string => {
  const profile = getUserProfile();
  return profile?.selfDescription || "";
};

// Set user self-description
export const setUserSelfDescription = (description: string): void => {
  const profile = getUserProfile() || {
    selfDescription: "",
    onboardingComplete: false,
  };
  profile.selfDescription = description;
  saveUserProfile(profile);
};
