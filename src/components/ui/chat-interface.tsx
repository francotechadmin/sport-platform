"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
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

export default function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [feedbackMessages, setFeedbackMessages] = useState<
    Record<string, "like" | "dislike" | null>
  >({});

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
      onResponse: (response) => {
        console.log("Chat API response received:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers.entries()]),
        });
      },
      onFinish: (message) => {
        console.log("Chat API stream finished:", {
          messageId: message.id,
          role: message.role,
          contentParts: message.parts?.length || 0,
        });
      },
      onError: (error) => {
        console.error("Chat API error:", error);
      },
    });

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
    parts?: Array<{ type: string; text: string }>;
  }) => {
    // Get text content from message
    let content = "";
    if (message.parts) {
      content = message.parts
        .filter((part) => part.type === "text")
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

      const lastContent = lastUserMessage.parts
        ? lastUserMessage.parts[0].text
        : lastUserMessage.content;
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

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Chat messages */}
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 w-full"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 text-muted-foreground">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-primary"
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
                className={`max-w-[80%] md:max-w-[85%] ${
                  message.role === "user" &&
                  "bg-primary text-primary-foreground border-primary/10 px-4 min-w-[60px]"
                }`}
              >
                <CardContent className="border-none w-full">
                  <div>
                    {message.parts?.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <Markdown key={`${message.id}-${i}`}>
                            {part.text}
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
                <div className="flex mt-0 gap-1 opacity-70 hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => copyMessageContent(message)}
                    title="Copy message"
                  >
                    {copiedMessageId === message.id ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 rounded-full ${
                      feedbackMessages[message.id] === "like"
                        ? "bg-primary/20"
                        : ""
                    }`}
                    onClick={() => handleFeedback(message.id, "like")}
                    title="Thumbs up"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 rounded-full ${
                      feedbackMessages[message.id] === "dislike"
                        ? "bg-primary/20"
                        : ""
                    }`}
                    onClick={() => handleFeedback(message.id, "dislike")}
                    title="Thumbs down"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </Button>

                  {message.id ===
                    messages.filter((m) => m.role === "assistant").pop()
                      ?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={regenerateMessage}
                      title="Regenerate response"
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            {message.role === "user" && (
              <Avatar className="h-8 w-8 border border-muted shadow-sm">
                <div className="bg-slate-200 dark:bg-slate-800 flex h-full w-full items-center justify-center rounded-full text-xs">
                  <User className="h-4 w-4" />
                </div>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-start gap-3">
            <Avatar className="h-8 w-8 border border-primary/20 shadow-sm">
              <div className="bg-primary text-primary-foreground flex h-full w-full items-center justify-center rounded-full text-xs">
                AI
              </div>
            </Avatar>
            <Card className="max-w-[80%] md:max-w-[85%] bg-card border-muted shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"></div>
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
        {/* This empty div is used as a reference for scrolling to the bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input - fixed position at bottom */}
      <div className="border-t p-4 w-full">
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 w-full"
          // disable native form submission
          onSubmitCapture={(e) => e.preventDefault()}
        >
          <Textarea
            ref={inputRef}
            className="flex-1 min-h-10 resize-none border rounded-lg focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Ask about your training, goals, recovery..."
            value={input}
            onChange={handleInputChange}
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
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10 flex-shrink-0"
            >
              <Mic className="h-5 w-5" />
              <span className="sr-only">Voice input</span>
            </Button>
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
