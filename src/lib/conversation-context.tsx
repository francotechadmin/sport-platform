"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<ChatConversation | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(searchParams.get("id"));

  // Debounce function to prevent excessive refreshes
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Custom event for localStorage changes - with debounce and minimal logging
  const createStorageChangeEvent = debounce((key: string) => {
    // Create a custom event that works within the same tab
    const event = new CustomEvent("local-storage-change", {
      detail: { key },
    });
    window.dispatchEvent(event);
    // No logging here
  }, 300);

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

  // Create a new conversation - avoid circular dependency and minimal logging
  const createConversation = useCallback(() => {
    const newConversation = createNewConversation();

    // Save to localStorage
    saveConversation(newConversation);

    // Update state
    setCurrentConversation(newConversation);
    setCurrentConversationId(newConversation.id);

    // Update URL
    router.replace(`${pathname}?id=${newConversation.id}`);

    // Dispatch custom event
    if (typeof window !== "undefined") {
      createStorageChangeEvent("chat_history");
    }

    // Manually update conversations array to avoid waiting for refresh
    setConversations((prev) => [newConversation, ...prev.slice(0, 19)]);

    return newConversation;
  }, [router, pathname]);

  // Load a specific conversation by ID - with improved debugging
  const loadConversation = useCallback(
    (id?: string) => {
      // Use provided ID or get from URL
      const conversationId = id || searchParams.get("id");
      console.log("loadConversation called with ID:", conversationId);

      // If no ID, create a new conversation
      if (!conversationId) {
        console.log("No conversation ID provided, creating new conversation");
        createConversation();
        return;
      }

      // Try to load the conversation
      const loadedConversation = getConversationById(conversationId);
      console.log(
        "Loaded conversation:",
        loadedConversation ? "Found" : "Not found"
      );

      if (loadedConversation) {
        console.log("Setting current conversation to:", loadedConversation.id);

        // Force a state update with the loaded conversation
        setCurrentConversation(null); // Clear first to force re-render
        setTimeout(() => {
          setCurrentConversation(loadedConversation);
          setCurrentConversationId(conversationId);

          // Update URL if needed
          if (id && !searchParams.get("id")) {
            router.replace(`${pathname}?id=${conversationId}`);
          }
        }, 50);
      } else {
        // If conversation not found, create a new one
        console.log("Conversation not found, creating new one");
        createConversation();
      }
    },
    [searchParams, router, pathname, createConversation]
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
    [currentConversationId]
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

  // Load conversation when ID changes in URL - minimal logging
  useEffect(() => {
    const urlId = searchParams.get("id");

    if (urlId && urlId !== currentConversationId) {
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
