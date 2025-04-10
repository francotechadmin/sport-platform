"use client";

import ChatInterface from "@/components/ui/chat-interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatPage() {
  return (
    <div className="p-6 bg-gradient-to-br from-background to-background/95">
      <div className="flex items-center gap-3 mb-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-purple-500"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <h1 className="text-3xl font-bold">AI Performance Coach</h1>
      </div>

      <Card className="bg-gradient-to-br from-purple-500/10 to-transparent hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Coach Chat</span>
            <span className="text-sm text-muted-foreground font-normal">
              Get personalized guidance and feedback
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 border-t border-purple-500/20">
          <div className="h-[calc(100vh-350px)]">
            <ChatInterface />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
