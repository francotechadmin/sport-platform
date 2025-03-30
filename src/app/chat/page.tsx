"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/ui/chat-interface";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ChatPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Mock conversation history
  const conversations = [
    { id: 1, title: "Running Training Plan", date: "2 hours ago" },
    { id: 2, title: "Swimming Technique Tips", date: "Yesterday" },
    { id: 3, title: "Nutrition Advice", date: "3 days ago" },
    { id: 4, title: "Recovery Strategies", date: "1 week ago" },
    { id: 5, title: "Race Day Preparation", date: "2 weeks ago" },
  ];

  return (
    <div className="flex h-[100dvh] flex-col md:flex-row max-w-7xl w-full mx-auto overflow-hidden fixed inset-0">
      {/* Mobile header */}
      <header className="border-b md:hidden w-full">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/dashboard" className="font-bold text-lg">
            SportAI Chat
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
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
                className="h-6 w-6"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar */}
      {mobileSidebarOpen && (
        <div className="md:hidden border-b bg-slate-50 dark:bg-slate-900 w-full">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h2 className="text-sm font-medium">Recent Chats</h2>
            <Button variant="ghost" size="sm">
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
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span className="ml-1">New</span>
            </Button>
          </div>
          <nav className="overflow-auto py-2">
            <ul className="space-y-2 px-2">
              {conversations.map((convo) => (
                <li key={convo.id}>
                  <Link
                    href={`/chat?id=${convo.id}`}
                    className="flex flex-col rounded-lg p-3 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <span className="font-medium">{convo.title}</span>
                    <span className="text-xs text-slate-500">{convo.date}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t">
            <Button variant="outline" asChild className="w-full">
              <Link
                href="/dashboard"
                onClick={() => setMobileSidebarOpen(false)}
              >
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Desktop sidebar - Adjusted width for better proportions */}
      <aside className="hidden md:flex w-72 flex-col border-r shrink-0">
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link href="/dashboard" className="font-bold text-lg">
            SportAI Chat
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h2 className="text-sm font-medium">Recent Chats</h2>
          <Button variant="ghost" size="sm">
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
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span className="ml-1">New</span>
          </Button>
        </div>
        <nav className="flex-1 overflow-auto py-2">
          <ul className="space-y-2 px-2">
            {conversations.map((convo) => (
              <li key={convo.id}>
                <Link
                  href={`/chat?id=${convo.id}`}
                  className="flex flex-col rounded-lg p-3 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span className="font-medium">{convo.title}</span>
                  <span className="text-xs text-slate-500">{convo.date}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </aside>

      {/* Main chat area with max-width for better readability */}
      <main
        className={`flex-1 flex flex-col overflow-hidden w-full ${
          mobileSidebarOpen ? "hidden md:flex" : ""
        }`}
      >
        <div className="h-full w-full max-h-[100dvh]">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}
