"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import Markdown from "markdown-to-jsx";
import { User } from "@deemlol/next-icons"

export default function ChatInterface() {
  const model = "gpt-4o";
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Log messages whenever they change
  useEffect(() => {
    console.log("Messages updated:", messages);
  }, [messages]);

  // Scroll to bottom whenever messages change or during streaming
  useEffect(() => {
    // Only scroll if we have messages or are in loading state
    if (messages.length > 0 || isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  // Function to scroll to the bottom of the messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Log errors
  useEffect(() => {
    if (error) {
      console.error("Chat error state:", error);
    }
  }, [error]);

  // Custom submit handler with logging
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitting message:", input);

    try {
      await handleSubmit(e);
      console.log("Message submitted successfully");
    } catch (error) {
      console.error("Error submitting message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-h-[100dvh]">

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch p-4 space-y-4 w-full">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No messages yet. Start a conversation!</p>
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
              <Avatar className="h-8 w-8">
                <div className="bg-primary text-primary-foreground flex h-full w-full items-center justify-center rounded-full text-xs">
                  AI
                </div>
              </Avatar>
            )}
            <Card
              className={`max-w-[90%] ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
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
              <Avatar className="h-8 w-8">
                <div className="bg-slate-300 dark:bg-slate-700 flex h-full w-full items-center justify-center rounded-full text-xs">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Avatar>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center justify-start gap-3">
            <Avatar className="h-8 w-8">
              <div className="bg-primary text-primary-foreground flex h-full w-full items-center justify-center rounded-full text-xs">
                AI
              </div>
            </Avatar>
            <Card className="max-w-[90%] bg-muted">
              <CardContent className="p-3">
                <p className="animate-pulse">Thinking...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-400 text-sm">
            Error: {error.message || "Something went wrong"}
          </div>
        )}

        {/* This empty div is used as a reference for scrolling to the bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t p-4 pb-[calc(1rem+var(--sab))] w-full shrink-0">
        <form onSubmit={onSubmit} className="flex items-end gap-2 w-full">
          <Input
            className="flex-1 min-h-10 rounded-md text-base"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            autoComplete="on"
            autoCorrect="on"
            spellCheck="true"
            style={{ fontSize: "16px" }}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
