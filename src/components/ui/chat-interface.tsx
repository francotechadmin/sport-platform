"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import Markdown from "markdown-to-jsx";
import { User } from "@deemlol/next-icons";
import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpCircle } from "@deemlol/next-icons";

// Create a Textarea component for multiline input
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export default function ChatInterface() {
  const model = "gpt-4o";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
      body: { model },
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
    console.log("Key pressed:", e.key);

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

  return (
    <div className="flex flex-col h-full w-full overflow-hidden max-w-2xl mx-auto">
      {/* Chat messages */}
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4  w-full pb-20"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Tell me about your goals!</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role !== "user" && (
              <Avatar className="h-8 w-8 ring-1 ring-slate-200/20 dark:ring-slate-700/30">
                <div className="bg-primary/90 text-primary-foreground flex h-full w-full items-center justify-center rounded-full text-xs shadow-sm">
                  AI
                </div>
              </Avatar>
            )}
            <Card
              className={`max-w-[80%] md:max-w-[90%] shadow-sm border-0 ${
                message.role === "user"
                  ? "bg-primary/90 text-primary-foreground"
                  : "bg-muted/80 backdrop-blur-sm"
              }`}
            >
              <CardContent className="p-3">
                <div className="prose prose-sm dark:prose-invert max-w-none">
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
            {message.role === "user" && (
              <Avatar className="h-8 w-8 ring-1 ring-slate-200/20 dark:ring-slate-700/30">
                <div className="bg-slate-300/90 dark:bg-slate-700/90 flex h-full w-full items-center justify-center rounded-full text-xs shadow-sm">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Avatar>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center justify-start gap-3">
            <Avatar className="h-8 w-8 ring-1 ring-slate-200/20 dark:ring-slate-700/30">
              <div className="bg-primary/90 text-primary-foreground flex h-full w-full items-center justify-center rounded-full text-xs shadow-sm">
                AI
              </div>
            </Avatar>
            <Card className="max-w-[80%] md:max-w-[90%] bg-muted/80 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="p-3">
                <p className="animate-pulse">Thinking...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200/30 dark:border-red-900/30 bg-red-50/90 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-400 text-sm shadow-sm backdrop-blur-sm">
            Error: {error.message || "Something went wrong"}
          </div>
        )}

        {/* This empty div is used as a reference for scrolling to the bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input - fixed position at bottom */}
      <div
        className="border-t border-slate-200/10 dark:border-slate-700/30 bg-background/90 backdrop-blur-sm p-4 w-full shadow-sm fixed bottom-0 left-0 right-0 z-50 md:static md:border-t-0 md:bg-background/90 md:backdrop-blur-none"
        style={{
          paddingBottom: `calc(1rem + env(safe-area-inset-bottom, 0.75rem))`,
        }}
      >
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 w-full max-w-xl mx-auto"
          // disable native form submission
          onSubmitCapture={(e) => e.preventDefault()}
        >
          <Textarea
            ref={inputRef}
            className="flex-1 rounded-lg border-slate-200/20 dark:border-slate-700/40 bg-background/90 backdrop-blur-sm shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300/50 dark:focus-visible:ring-slate-700/50"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoComplete="true"
            spellCheck="true"
            style={{
              fontSize: "16px",
              minHeight: "40px",
              maxHeight: "150px",
            }}
            rows={1}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg shadow-sm h-10 px-3"
            onClick={() => inputRef.current?.blur()} // Ensure keyboard is dismissed on mobile
          >
            <ArrowUpCircle className="h-6 w-6" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
