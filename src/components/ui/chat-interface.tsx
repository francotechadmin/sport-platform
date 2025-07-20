"use client";

import { useEffect, useRef, useState } from "react";
import { useChat, Message } from "@ai-sdk/react";
import { ChatMessage, getUserSelfDescription } from "@/lib/chat-storage";
import { useConversation } from "@/lib/conversation-context";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import Markdown from "markdown-to-jsx";
import {
  User,
  ArrowUpCircle,
  Mic,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Check,
} from "@deemlol/next-icons";
import * as React from "react";

// Define types for different message parts
type TextUIPart = { type: "text"; text: string };
type OtherUIPart = { type: string };
type MessagePart = TextUIPart | OtherUIPart;

export default function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [feedbackMessages, setFeedbackMessages] = useState<
    Record<string, "like" | "dislike" | null>
  >({});

  // Get conversation data from context
  const {
    currentConversation: conversation,
    currentConversationId,
    updateConversation,
    refreshConversations,
  } = useConversation();

  // Initialize speech recognition with interim results enabled
  const {
    isListening,
    isSupported,
    finalTranscript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    interimResults: true,
    continuous: true,
  });

  // Track base input before speech recognition starts
  const baseInputRef = useRef<string>('');
  // Track accumulated final speech text across multiple recognition sessions
  const accumulatedFinalTextRef = useRef<string>('');
  // Track the last processed final transcript to avoid duplicates
  const lastFinalTranscriptRef = useRef<string>('');
  // Track the last speech-generated value to detect manual edits
  const lastSpeechValueRef = useRef<string>('');
  // Track if speech updates should be disabled (user is manually editing)
  const speechUpdatesDisabledRef = useRef<boolean>(false);
  
  // Track if we've created a conversation to prevent duplicates
  const hasCreatedConversationRef = useRef(false);

  // Convert ChatMessage[] to Message[] for useChat
  const convertToUIChatMessages = (chatMessages: ChatMessage[]): Message[] => {
    return chatMessages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      parts: msg.parts,
    })) as Message[];
  };

  // Convert Message[] to ChatMessage[] for storage
  const convertToChatMessages = (uiMessages: Message[]): ChatMessage[] => {
    return uiMessages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      parts: msg.parts,
    })) as ChatMessage[];
  };

  // Initialize chat with system message and any existing messages
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    setMessages,
  } = useChat({
    api: "/api/chat",
    id: currentConversationId || undefined,
    initialMessages: conversation?.messages
      ? convertToUIChatMessages(conversation.messages)
      : [],
    body: {
      userDescription: getUserSelfDescription(),
    },
    onResponse: () => {
      // No logging needed
    },
    onFinish: () => {
      // Save conversation to localStorage after each message with minimal logging
      setTimeout(() => {
        if (conversation && currentConversationId) {
          // Get the latest messages
          const chatMessages = convertToChatMessages(messages);

          // Create updated conversation
          const updatedConversation = {
            ...conversation,
            messages: chatMessages,
            updatedAt: Date.now(),
          };

          // Use the context method to save
          updateConversation(updatedConversation);
        }
      }, 500);
    },
    onError: (error) => {
      console.error("Chat API error:", error);
    },
  });

  // Load initial messages from conversation if available
  useEffect(() => {
    if (
      conversation?.messages &&
      conversation.messages.length > 0 &&
      messages.length === 0
    ) {
      setMessages(convertToUIChatMessages(conversation.messages));
    }
  }, [conversation, setMessages, messages.length]);

  // Update conversation when messages change - with debounce and minimal logging
  const messageUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only save if we have a conversation and messages
    if (conversation && currentConversationId && messages.length > 0) {
      // Clear any existing timeout
      if (messageUpdateTimeoutRef.current) {
        clearTimeout(messageUpdateTimeoutRef.current);
      }

      // Debounce the update to avoid excessive saves
      messageUpdateTimeoutRef.current = setTimeout(() => {
        const chatMessages = convertToChatMessages(messages);

        // Create updated conversation with a new timestamp to force update
        const updatedConversation = {
          ...conversation,
          messages: chatMessages,
          updatedAt: Date.now(),
        };

        // Save to context and localStorage
        updateConversation(updatedConversation);
      }, 500);
    }

    // Cleanup timeout on unmount
    return () => {
      if (messageUpdateTimeoutRef.current) {
        clearTimeout(messageUpdateTimeoutRef.current);
      }
    };
  }, [messages, conversation, currentConversationId, updateConversation]);

  // Detect if user is on mobile
  useEffect(() => {
    const checkIsMobile = () => {
      return (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 768
      );
    };

    setIsMobile(checkIsMobile());

    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll to bottom only when necessary
  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      // Check if scrolling is needed (content exceeds container)
      const container = messageContainerRef.current;
      const shouldScroll =
        container &&
        (container.scrollHeight > container.clientHeight ||
          // Always scroll on new user message or during loading
          messages[messages.length - 1]?.role === "user" ||
          isLoading);

      if (shouldScroll) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, isLoading]);

  // Custom submit handler with keyboard dismissal
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Blur the input to dismiss keyboard on mobile
    inputRef.current?.blur();

    // If no conversation exists and we haven't already created one, create one before submitting
    if (
      (!conversation || !currentConversationId) &&
      !hasCreatedConversationRef.current
    ) {
      console.log(
        "No conversation exists, creating one before submitting message"
      );

      // Mark that we're creating a conversation to prevent duplicates
      hasCreatedConversationRef.current = true;

      // Create a new conversation directly
      const newConversation = {
        id: crypto.randomUUID(),
        title: "New Conversation",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };

      // Save it to localStorage without overwriting existing conversations
      try {
        // Get existing conversations first
        const existingData = localStorage.getItem("chat_history");
        const conversations = existingData ? JSON.parse(existingData) : [];

        // Add the new conversation to the beginning
        conversations.unshift(newConversation);

        // Save back to localStorage
        localStorage.setItem("chat_history", JSON.stringify(conversations));
        console.log(
          "Created new conversation for message:",
          newConversation.id
        );

        // Update URL to include the new conversation ID
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("id", newConversation.id);
        window.history.replaceState({}, "", newUrl.toString());

        // Force a refresh to load the new conversation
        refreshConversations();

        // Wait a moment for the conversation to be loaded
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error("Error creating new conversation for message:", error);
      }
    }

    try {
      await handleSubmit(e);
    } catch (error) {
      console.error("Error submitting message:", error);
    }
  };

  // Add a newline at current cursor position
  const addNewline = (textarea: HTMLTextAreaElement) => {
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const value = textarea.value;
    const newValue =
      value.substring(0, selectionStart) + "\n" + value.substring(selectionEnd);

    // Update the value
    handleInputChange({
      target: { value: newValue },
    } as React.ChangeEvent<HTMLTextAreaElement>);

    // Set cursor position after the new line (needs to be after state update)
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = selectionStart + 1;
        inputRef.current.selectionEnd = selectionStart + 1;

        // Resize the textarea
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      }
    }, 0);
  };

  // Handle keydown for textarea with different behavior for desktop and mobile
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (isMobile) {
        // On mobile: Enter always adds a newline, never submits
        e.preventDefault();
        addNewline(e.currentTarget);
      } else {
        // On desktop:
        // - Shift+Enter adds a newline
        // - Plain Enter submits the form
        if (e.shiftKey) {
          // Shift+Enter adds a newline
          e.preventDefault();
          addNewline(e.currentTarget);
        } else {
          // Plain Enter submits if there's content
          if (input.trim()) {
            e.preventDefault();
            const form = inputRef.current?.closest("form");
            form?.requestSubmit();
          } else {
            // Prevent submission for empty input
            e.preventDefault();
          }
        }
      }
    }
  };

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (inputRef.current) {
      // Reset height to calculate proper scrollHeight
      inputRef.current.style.height = "auto";

      // Set new height based on content (with a reasonable max height)
      const newHeight = Math.min(inputRef.current.scrollHeight, 150);
      inputRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  // Add meta viewport tag for better mobile handling
  useEffect(() => {
    // Find or create viewport meta tag
    let viewportMeta = document.querySelector(
      'meta[name="viewport"]'
    ) as HTMLMetaElement | null;

    if (!viewportMeta) {
      viewportMeta = document.createElement("meta") as HTMLMetaElement;
      viewportMeta.name = "viewport";
      document.head.appendChild(viewportMeta);
    }

    // Set viewport properties
    viewportMeta.content =
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
  }, []);

  // Handle copy message content
  const copyMessageContent = (message: {
    id: string;
    role: string;
    content?: string;
    parts?: Array<MessagePart>;
  }) => {
    // Get text content from message
    let content = "";
    if (message.parts) {
      content = message.parts
        .filter((part): part is TextUIPart => part.type === "text")
        .map((part) => part.text)
        .join("\n");
    } else if (message.content) {
      content = message.content;
    }

    // Copy to clipboard
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setCopiedMessageId(message.id);
        setTimeout(() => setCopiedMessageId(null), 2000);
      })
      .catch((err) => console.error("Failed to copy: ", err));
  };

  // Handle message feedback
  const handleFeedback = (messageId: string, type: "like" | "dislike") => {
    setFeedbackMessages((prev) => {
      // Toggle feedback if already selected
      if (prev[messageId] === type) {
        return { ...prev, [messageId]: null };
      }
      return { ...prev, [messageId]: type };
    });
  };

  // Handle regenerate message
  const regenerateMessage = () => {
    // Find the last assistant message and regenerate
    const lastUserMessageIndex = [...messages]
      .reverse()
      .findIndex((m) => m.role === "user");
    if (lastUserMessageIndex !== -1) {
      const lastUserMessage = [...messages].reverse()[lastUserMessageIndex];

      let lastContent = "";
      // Extract text content from the message
      if (lastUserMessage.parts && lastUserMessage.parts.length > 0) {
        // Find the first text part
        const textParts = lastUserMessage.parts.filter(
          (part): part is TextUIPart => part.type === "text"
        );
        if (textParts.length > 0) {
          lastContent = textParts[0].text;
        }
      } else if (lastUserMessage.content) {
        lastContent = lastUserMessage.content;
      }

      if (!lastContent) return;

      // Set input to the last user message and submit
      handleInputChange({
        target: {
          value: lastContent,
        },
      } as React.ChangeEvent<HTMLTextAreaElement>);

      // Small delay to ensure the input state is updated before submitting
      setTimeout(() => {
        const form = inputRef.current?.closest("form");
        form?.requestSubmit();
      }, 50);
    }
  };

  // Handle speech input - accumulate final results and show interim results
  useEffect(() => {
    // Don't update if speech updates are disabled (user is manually editing)
    if (speechUpdatesDisabledRef.current) return;
    
    // Only update if we're currently listening or have new final results
    if (!isListening && !finalTranscript) return;
    
    // Accumulate new final results
    if (finalTranscript && finalTranscript !== lastFinalTranscriptRef.current) {
      // Check if this is a new final result
      if (lastFinalTranscriptRef.current && finalTranscript.startsWith(lastFinalTranscriptRef.current)) {
        // Extract only the new part
        const newPart = finalTranscript.slice(lastFinalTranscriptRef.current.length).trim();
        if (newPart) {
          const needsSpace = accumulatedFinalTextRef.current && 
            !accumulatedFinalTextRef.current.endsWith(' ') && 
            !newPart.startsWith(' ');
          accumulatedFinalTextRef.current += (needsSpace ? ' ' : '') + newPart;
        }
      } else {
        // Completely new final result
        const needsSpace = accumulatedFinalTextRef.current && 
          !accumulatedFinalTextRef.current.endsWith(' ') && 
          !finalTranscript.startsWith(' ');
        accumulatedFinalTextRef.current += (needsSpace ? ' ' : '') + finalTranscript.trim();
      }
      lastFinalTranscriptRef.current = finalTranscript;
    }
    
    // Build display text: base + accumulated final + current interim
    let displayText = baseInputRef.current;
    
    if (accumulatedFinalTextRef.current) {
      displayText += (displayText ? ' ' : '') + accumulatedFinalTextRef.current;
    }
    
    if (interimTranscript) {
      displayText += (displayText ? ' ' : '') + interimTranscript;
    }
    
    const finalDisplayText = displayText.trim();
    lastSpeechValueRef.current = finalDisplayText;
      
    handleInputChange({
      target: { value: finalDisplayText }
    } as React.ChangeEvent<HTMLTextAreaElement>);
  }, [finalTranscript, interimTranscript, isListening, handleInputChange]);

  // Custom input change handler that detects manual edits
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // If the new value differs from what speech generated, disable speech updates
    if (newValue !== lastSpeechValueRef.current) {
      speechUpdatesDisabledRef.current = true;
      
      // Clear all speech-related state when user manually edits
      accumulatedFinalTextRef.current = '';
      lastFinalTranscriptRef.current = '';
      lastSpeechValueRef.current = '';
      
      // Reset the speech hook's internal state
      resetTranscript();
      
      // If speech recognition is active, stop it
      if (isListening) {
        stopListening();
      }
    }
    
    // Always call the original handler
    handleInputChange(e);
  };

  // Handle microphone button click
  const handleMicrophoneClick = () => {
    if (!isSupported) {
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      // Re-enable speech updates when starting new session
      speechUpdatesDisabledRef.current = false;
      
      // Always start fresh with current input as base
      baseInputRef.current = input;
      // Clear accumulated speech state for fresh start
      accumulatedFinalTextRef.current = '';
      lastFinalTranscriptRef.current = '';
      lastSpeechValueRef.current = '';
      
      // Reset speech hook state to ensure clean start
      resetTranscript();
      
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Chat messages */}
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 w-full"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-muted-foreground">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-base">
                Your performance coach is ready
              </p>
              <p className="text-sm">
                Ask about your training, goals, or mental preparation
              </p>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 my-4 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex flex-col">
              <Card
                className={`${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground border-primary/10 py-0"
                    : "bg-transparent border-none shadow-none p-0"
                }`}
              >
                <CardContent
                  className={`border-none p-4 inline-block 
                  ${message.role === "user" ? "bg-primary/10" : "p-2"}`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.parts?.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <Markdown key={`${message.id}-${i}`}>
                            {(part as TextUIPart).text}
                          </Markdown>
                        );
                      }
                      return null;
                    }) ||
                      (message.content ? (
                        <Markdown>{message.content}</Markdown>
                      ) : (
                        "[Empty response]"
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Message action buttons - only for assistant messages */}
              {message.role === "assistant" && (
                <div className="flex mt-1 gap-1 opacity-70 hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-muted"
                    onClick={() => copyMessageContent(message)}
                    title="Copy message"
                  >
                    {copiedMessageId === message.id ? (
                      <Check className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 rounded-full hover:bg-muted ${
                      feedbackMessages[message.id] === "like" ? "bg-muted" : ""
                    }`}
                    onClick={() => handleFeedback(message.id, "like")}
                    title="Thumbs up"
                  >
                    <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 rounded-full hover:bg-muted ${
                      feedbackMessages[message.id] === "dislike"
                        ? "bg-muted"
                        : ""
                    }`}
                    onClick={() => handleFeedback(message.id, "dislike")}
                    title="Thumbs down"
                  >
                    <ThumbsDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>

                  {message.id ===
                    messages.filter((m) => m.role === "assistant").pop()
                      ?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-muted"
                      onClick={regenerateMessage}
                      title="Regenerate response"
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            {message.role === "user" && (
              <Avatar className="h-8 w-8 border border-border shadow-sm">
                <div className="bg-muted flex h-full w-full items-center justify-center rounded-full text-xs">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-start gap-3">
            <Card className="max-w-[80%] md:max-w-[85%] bg-transparent border-none shadow-none p-0">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive text-sm my-4 mx-auto max-w-[90%]">
            Error: {error.message || "Something went wrong. Please try again."}
          </div>
        )}
        {speechError && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive text-sm my-4 mx-auto max-w-[90%]">
            Voice input error: {speechError}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input - fixed position at bottom */}
      <div className="border-t border-border p-4 w-full bg-muted/30">
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 w-full"
          onSubmitCapture={(e) => e.preventDefault()}
        >
          <Textarea
            ref={inputRef}
            className="flex-1 min-h-10 resize-none border-border rounded-lg focus-visible:ring-ring focus-visible:border-ring bg-background"
            placeholder="Ask about your training, goals, recovery..."
            value={input}
            onChange={handleCustomInputChange}
            onKeyDown={handleKeyDown}
            autoComplete="true"
            spellCheck="true"
            style={{
              fontSize: "16px",
              minHeight: "44px",
              maxHeight: "150px",
            }}
            rows={1}
          />
          <div className="flex space-x-2">
            {isSupported && (
              <Button
                type="button"
                variant={isListening ? "default" : "outline"}
                size="icon"
                className={`rounded-full h-10 w-10 flex-shrink-0 transition-all duration-200 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/25 animate-pulse ring-2 ring-red-300' 
                    : 'border-border hover:bg-muted'
                }`}
                onClick={handleMicrophoneClick}
                title={isListening ? 'Stop recording' : 'Start voice input'}
                disabled={isLoading}
              >
                <Mic className={`h-5 w-5 transition-all duration-200 ${
                  isListening ? 'animate-pulse scale-110' : ''
                }`} />
                <span className="sr-only">
                  {isListening ? 'Stop recording' : 'Voice input'}
                </span>
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-full h-10 w-10 flex-shrink-0"
            >
              <ArrowUpCircle className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
