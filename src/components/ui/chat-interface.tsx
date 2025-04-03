"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import Markdown from "markdown-to-jsx";
import { User } from "@deemlol/next-icons";

export default function ChatInterface() {
  const model = "gpt-4o";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

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

  // Detect device type
  useEffect(() => {
    const checkIsIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    
    const checkIsMobile = () => {
      return window.innerWidth < 768;
    };
    
    setIsIOS(checkIsIOS());
    setIsMobile(checkIsMobile());
    setViewportHeight(window.innerHeight);
    
    const handleResize = () => {
      setIsMobile(checkIsMobile());
      setViewportHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle iOS keyboard visibility
  useEffect(() => {
    if (!isIOS || !isMobile) return;

    // Track when keyboard appears/disappears by monitoring viewport height changes
    const handleVisualViewportResize = () => {
      // If we're on iOS and the viewport height decreased significantly, keyboard likely appeared
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = viewportHeight - currentHeight;
      const keyboardIsNowVisible = heightDifference > 150; // Threshold to determine keyboard visibility
      
      setKeyboardVisible(keyboardIsNowVisible);
      
      // When keyboard appears, scroll to input after a small delay
      if (keyboardIsNowVisible && inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
          scrollToBottom();
        }, 100);
      }
    };

    // Use visualViewport API if available (more reliable on iOS)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportResize);
      return () => window.visualViewport?.removeEventListener('resize', handleVisualViewportResize);
    } else {
      // Fallback to window resize events
      window.addEventListener('resize', handleVisualViewportResize);
      return () => window.removeEventListener('resize', handleVisualViewportResize);
    }
  }, [isIOS, isMobile, viewportHeight]);

  // Add focus/blur handlers for iOS keyboard
  useEffect(() => {
    if (!isIOS || !isMobile) return;
    
    const handleFocus = () => {
      setKeyboardVisible(true);
      // Prevent body scrolling when keyboard is active
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = `${window.innerHeight}px`;
      
      // Scroll to input with delay to ensure layout is complete
      setTimeout(() => scrollToBottom(), 100);
    };
    
    const handleBlur = () => {
      setKeyboardVisible(false);
      // Restore normal scrolling
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
    
    inputRef.current?.addEventListener('focus', handleFocus);
    inputRef.current?.addEventListener('blur', handleBlur);
    
    return () => {
      inputRef.current?.removeEventListener('focus', handleFocus);
      inputRef.current?.removeEventListener('blur', handleBlur);
    };
  }, [isIOS, isMobile, inputRef.current]);

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

  // Add meta viewport tag for iOS
  useEffect(() => {
    if (isIOS && isMobile) {
      // Find or create viewport meta tag
      let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
      
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta') as HTMLMetaElement;
        viewportMeta.name = 'viewport';
        document.head.appendChild(viewportMeta);
      }
      
      // Set proper viewport properties - critical fix for iOS Safari
      viewportMeta.content = 'interactive-widget=resizes-content, width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';
    }
  }, [isIOS, isMobile]);

  return (
    <div 
      className="flex flex-col h-full w-full overflow-hidden" 
      style={{
        height: isIOS && isMobile ? `${viewportHeight}px` : '100%',
        position: 'relative'
      }}
    >
      {/* Chat messages */}
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 w-full"
        style={{
          paddingBottom: isIOS && isMobile ? (keyboardVisible ? '120px' : '80px') : '80px'
        }}
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Tell me about your goals and I'll help you achieve them.</p>
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

      {/* Message input - positioned fixed for iOS */}
      <div 
        className={`border-t border-slate-200/10 dark:border-slate-700/30 bg-background/90 backdrop-blur-sm p-4 w-full shadow-sm ${
          isIOS && isMobile ? 'fixed' : 'absolute'
        } bottom-0 left-0 right-0 md:left-auto`}
        style={{
          paddingBottom: isIOS ? `calc(0.75rem + env(safe-area-inset-bottom, 0.75rem))` : '1rem',
          zIndex: 50
        }}
      >
        <form onSubmit={onSubmit} className="flex items-center gap-2 w-full max-w-4xl mx-auto md:pr-4">
          <Input
            ref={inputRef}
            className="flex-1 min-h-10 rounded-lg border-slate-200/20 dark:border-slate-700/40 bg-background/90 backdrop-blur-sm shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300/50 dark:focus-visible:ring-slate-700/50"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            autoComplete="off"
            spellCheck="true"
            style={{ 
              fontSize: "16px",
              paddingTop: "0.65rem",
              paddingBottom: "0.65rem"
            }}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()} 
            className="rounded-lg shadow-sm h-10 px-3"
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