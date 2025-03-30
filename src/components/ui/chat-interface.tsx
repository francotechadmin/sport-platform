"use client";

import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { openai } from "@ai-sdk/openai";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ModelSelector } from "./model-selector";

export default function ChatInterface() {
  const [model, setModel] = useState("gpt-4o");

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
    <div className="flex flex-col h-full">
      {/* Header with model selector */}
      <div className="p-4 flex justify-end items-center border-b">
        <ModelSelector model={model} setModel={setModel} />
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
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
              className={`max-w-[80%] ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <CardContent className="p-3">
                <div className="whitespace-pre-line">
                  {message.parts?.map((part, i) => {
                    if (part.type === "text") {
                      return <div key={`${message.id}-${i}`}>{part.text}</div>;
                    }
                    return null;
                  }) ||
                    (message.content ? message.content : "[Empty response]")}
                </div>
              </CardContent>
            </Card>
            {message.role === "user" && (
              <Avatar className="h-8 w-8">
                <div className="bg-slate-300 flex h-full w-full items-center justify-center rounded-full text-xs">
                  YOU
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
            <Card className="max-w-[80%] bg-muted">
              <CardContent className="p-3">
                <p className="animate-pulse">Thinking...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-red-700 text-sm">
            Error: {error.message || "Something went wrong"}
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="border-t p-4">
        <form onSubmit={onSubmit} className="flex items-end gap-2">
          <Input
            className="flex-1 min-h-10 rounded-md"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
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
