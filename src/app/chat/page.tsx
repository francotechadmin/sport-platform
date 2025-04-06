"use client";

import ChatInterface from "@/components/ui/chat-interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Athlete Coach</h1>

      <Card className="border border-muted rounded-lg shadow-md">
        <CardHeader>
          <CardTitle>Coach Chat</CardTitle>
        </CardHeader>
        <CardContent className="p-0 border-t border-muted">
          <div className="h-[calc(100vh-350px)]">
            <ChatInterface />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
