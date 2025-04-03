"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface SidebarProps {
  title?: string;
}

export function Sidebar({ title = "SportAI" }: SidebarProps) {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };
  
  // Mock conversation history
  const conversations = [
    { id: 1, title: "Running Training Plan", date: "2 hours ago" },
    { id: 2, title: "Swimming Technique Tips", date: "Yesterday" },
    { id: 3, title: "Nutrition Advice", date: "3 days ago" },
    { id: 4, title: "Recovery Strategies", date: "1 week ago" },
    { id: 5, title: "Race Day Preparation", date: "2 weeks ago" },
  ];
  
  return (
    <div className="h-screen w-64 border-r flex flex-col">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="font-bold text-xl">
          {title}
        </Link>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        <Link 
          href="/dashboard" 
          className={`flex items-center px-3 py-2 rounded-md ${
            isActive("/dashboard") 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Dashboard
        </Link>
        
        <Link 
          href="/chat" 
          className={`flex items-center px-3 py-2 rounded-md ${
            isActive("/chat") 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-muted"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Chat
        </Link>
      </nav>
      
      {/* Chat History Section - Only shown when on chat page */}
      {isActive("/chat") && (
        <div className="flex-1 px-2 overflow-auto">
          <div className="flex items-center justify-between px-2 py-2">
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
              <span className="ml-1 text-xs">New</span>
            </Button>
          </div>
          <ul className="space-y-1">
            {conversations.map((convo) => (
              <li key={convo.id}>
                <Link
                  href={`/chat?id=${convo.id}`}
                  className="flex flex-col rounded-lg p-2 text-sm hover:bg-muted"
                >
                  <span className="font-medium">{convo.title}</span>
                  <span className="text-xs text-muted-foreground">{convo.date}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="p-4 border-t flex flex-col gap-2">
        <ThemeToggle />
        <Button variant="outline" asChild className="w-full">
          <Link href="/signin">Sign Out</Link>
        </Button>
      </div>
    </div>
  );
} 