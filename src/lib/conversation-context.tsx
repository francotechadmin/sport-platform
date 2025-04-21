"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  ChatConversation,
  createNewConversation,
  getConversationById,
  getConversations,
  saveConversation,
  generateTitle,
} from "@/lib/chat-storage";

// Define the shape of our context
interface ConversationContextType {
  conversations: ChatConversation[];
  currentConversation: ChatConversation | null;
  currentConversationId: string | null;
  loadConversation: (id?: string) => void;
  createConversation: () => void;
  updateConversation: (conversation: ChatConversation) => void;
  refreshConversations: () => void;
}

// Create the context with a default value
const ConversationContext = createContext<ConversationContextType>({
  conversations: [],
  currentConversation: null,
  currentConversationId: null,
  loadConversation: () => {},
  createConversation: () => {},
  updateConversation: () => {},
  refreshConversations: () => {},
});

// Custom hook to use the conversation context
export const useConversation = () => useContext(ConversationContext);

// Provider component
export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<ChatConversation | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(searchParams.get("id"));

  // Custom event for localStorage changes - with debounce and minimal logging
  const createStorageChangeEvent = useCallback((key: string) => {
    // Simple debounce implementation
    const debouncedDispatch = (() => {
      let timeout: NodeJS.Timeout | null = null;
      return (key: string) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          // Create a custom event that works within the same tab
          const event = new CustomEvent("local-storage-change", {
            detail: { key },
          });
          window.dispatchEvent(event);
        }, 300);
      };
    })();

    debouncedDispatch(key);
  }, []);

  // Load all conversations from localStorage - with refresh tracking and minimal logging
  const refreshingRef = useRef(false);
  const refreshConversations = useCallback(() => {
    // Skip if already refreshing
    if (refreshingRef.current) return;

    refreshingRef.current = true;
    // No logging here

    try {
      const loadedConversations = getConversations();
      setConversations(loadedConversations);
    } catch (error) {
      console.error("Error refreshing conversations:", error);
    } finally {
      // Reset refreshing flag after a delay
      setTimeout(() => {
        refreshingRef.current = false;
      }, 500);
    }
  }, []);

  // Track if we're currently creating a conversation to prevent loops
  const isCreatingConversationRef = useRef(false);

  // Create a new conversation - avoid circular dependency and minimal logging
  const createConversation = useCallback(() => {
    // Prevent multiple simultaneous calls
    if (isCreatingConversationRef.current) {
      console.log("Already creating a conversation, skipping");
      return null;
    }

    isCreatingConversationRef.current = true;
    console.log("Creating new conversation");

    try {
      const newConversation = createNewConversation();

      // Save to localStorage
      saveConversation(newConversation);

      // Update state
      setCurrentConversation(newConversation);
      setCurrentConversationId(newConversation.id);

      // Update URL without triggering navigation events
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("id", newConversation.id);
      window.history.replaceState({}, "", newUrl.toString());

      // Dispatch custom event
      if (typeof window !== "undefined") {
        createStorageChangeEvent("chat_history");
      }

      // Manually update conversations array to avoid waiting for refresh
      setConversations((prev) => [newConversation, ...prev.slice(0, 19)]);

      return newConversation;
    } finally {
      // Reset the flag after a delay to prevent immediate re-triggering
      setTimeout(() => {
        isCreatingConversationRef.current = false;
      }, 500);
    }
  }, [createStorageChangeEvent]);

  // Track if we're currently loading a conversation to prevent loops
  const isLoadingConversationRef = useRef(false);

  // Load a specific conversation by ID - with improved debugging
  const loadConversation = useCallback(
    (id?: string) => {
      // Prevent multiple simultaneous calls
      if (isLoadingConversationRef.current) {
        console.log("Already loading a conversation, skipping");
        return;
      }

      isLoadingConversationRef.current = true;

      try {
        // Use provided ID or get from URL
        const conversationId = id || searchParams.get("id");
        console.log("loadConversation called with ID:", conversationId);

        // If current conversation is already the requested one, do nothing
        if (conversationId && conversationId === currentConversationId) {
          console.log("Conversation already loaded, skipping");
          return;
        }

        // If no ID, create a new conversation
        if (!conversationId) {
          console.log("No conversation ID provided, creating new conversation");
          if (!isCreatingConversationRef.current) {
            createConversation();
          }
          return;
        }

        // Try to load the conversation
        const loadedConversation = getConversationById(conversationId);
        console.log(
          "Loaded conversation:",
          loadedConversation ? "Found" : "Not found"
        );

        if (loadedConversation) {
          console.log(
            "Setting current conversation to:",
            loadedConversation.id
          );

          // Update state directly without the two-step process
          setCurrentConversation(loadedConversation);
          setCurrentConversationId(conversationId);

          // Update URL if needed, using history API to avoid navigation events
          if (id && !searchParams.get("id")) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set("id", conversationId);
            window.history.replaceState({}, "", newUrl.toString());
          }
        } else {
          // If conversation not found, create a new one
          console.log("Conversation not found, creating new one");
          if (!isCreatingConversationRef.current) {
            createConversation();
          }
        }
      } finally {
        // Reset the flag after a delay to prevent immediate re-triggering
        setTimeout(() => {
          isLoadingConversationRef.current = false;
        }, 500);
      }
    },
    [searchParams, currentConversationId, createConversation]
  );

  // Update an existing conversation - minimal logging
  const updateConversation = useCallback(
    (conversation: ChatConversation) => {
      // Generate title if needed
      if (
        conversation.title === "New Conversation" &&
        conversation.messages.length >= 2
      ) {
        conversation.title = generateTitle(conversation.messages);
      }

      // Create a deep copy to ensure we're not affected by reference issues
      const conversationCopy = JSON.parse(
        JSON.stringify(conversation)
      ) as ChatConversation;

      // Save to localStorage
      try {
        saveConversation(conversationCopy);
      } catch (saveError) {
        console.error("Error in saveConversation:", saveError);
      }

      // Update current conversation if it's the one being updated
      if (currentConversationId === conversation.id) {
        setCurrentConversation(conversationCopy);
      }

      // Dispatch custom event
      if (typeof window !== "undefined") {
        createStorageChangeEvent("chat_history");
      }

      // Update conversations array directly
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === conversation.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = conversationCopy;
          return updated;
        }
        return [conversationCopy, ...prev.slice(0, 19)];
      });
    },
    [currentConversationId, createStorageChangeEvent]
  );

  // Initialize - load conversations on mount - minimal logging
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    refreshConversations();

    // Listen for storage events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "chat_history") {
        refreshConversations();
      }
    };

    // Listen for our custom events within the same tab
    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === "chat_history") {
        refreshConversations();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "local-storage-change",
      handleCustomStorageChange as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "local-storage-change",
        handleCustomStorageChange as EventListener
      );
    };
  }, [refreshConversations]);

  // Load conversation when ID changes in URL - with guards to prevent loops
  useEffect(() => {
    // Skip if we're already loading or creating a conversation
    if (isLoadingConversationRef.current || isCreatingConversationRef.current) {
      return;
    }

    const urlId = searchParams.get("id");

    // Only load if the URL ID is different from the current one and not null
    if (urlId && urlId !== currentConversationId) {
      console.log("URL ID changed, loading conversation:", urlId);
      loadConversation(urlId);
    }
  }, [searchParams, currentConversationId, loadConversation]);

  // Context value
  const value = {
    conversations,
    currentConversation,
    currentConversationId,
    loadConversation,
    createConversation,
    updateConversation,
    refreshConversations,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};
