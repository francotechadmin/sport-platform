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
      
      <div className="p-4 border-t flex flex-col gap-2">
        <ThemeToggle />
        <Button variant="outline" asChild className="w-full">
          <Link href="/signin">Sign Out</Link>
        </Button>
      </div>
    </div>
  );
} 