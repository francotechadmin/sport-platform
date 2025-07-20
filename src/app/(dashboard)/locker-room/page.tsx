"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LockerRoomPage() {
  // Mock post data
  const posts = [
    {
      id: 1,
      athlete: {
        name: "Sarah Johnson",
        verified: true,
        avatar: "athlete-1.jpg",
        sport: "Marathon Runner",
      },
      content:
        "Just finished a grueling 20-mile training run. The last 5 miles were tough, but I maintained my target pace. Looking for advice on recovery nutrition for these longer sessions.",
      performance: {
        distance: "20 miles",
        pace: "7:45 min/mile",
        date: "Today",
      },
      comments: [
        {
          id: 101,
          athlete: {
            name: "Michael Chen",
            verified: true,
            avatar: "athlete-2.jpg",
          },
          content:
            "Try adding more protein immediately after your long runs. I've found a 3:1 carb to protein ratio works best for me.",
          hasReflection: true,
        },
      ],
    },
    {
      id: 2,
      athlete: {
        name: "Alex Rivera",
        verified: true,
        avatar: "athlete-3.jpg",
        sport: "Triathlete",
      },
      content:
        "Struggling with my swim technique. Despite putting in consistent pool time, my times aren't improving. Has anyone worked with a coach who specializes in triathlon swimming?",
      performance: {
        distance: "1500m",
        pace: "2:05 min/100m",
        date: "Yesterday",
      },
      comments: [
        {
          id: 201,
          athlete: {
            name: "Emma Lewis",
            verified: true,
            avatar: "athlete-4.jpg",
          },
          content:
            "Coach Wilson at TriSwim Academy completely transformed my technique. Worth every penny.",
          hasReflection: true,
        },
        {
          id: 202,
          athlete: {
            name: "David Park",
            verified: true,
            avatar: "athlete-5.jpg",
          },
          content:
            "Are you focusing on bilateral breathing? That was a game-changer for me.",
          hasReflection: false,
        },
      ],
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Locker Room</h1>
        <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
          Verified Athletes Only
        </Badge>
      </div>

      {/* New Post */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Share with fellow athletes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <textarea
              className="w-full p-3 min-h-[100px] rounded-md border border-input bg-transparent text-sm focus:outline-none"
              placeholder="Share your training insights, ask questions, or seek advice..."
            ></textarea>
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                <span className="inline-flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Link to your performance data
                </span>
              </div>
              <Button>Post</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      {posts.map((post) => (
        <Card key={post.id} className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xl font-bold overflow-hidden">
                {post.athlete.avatar ? (
                  <Image
                    src={post.athlete.avatar}
                    alt={post.athlete.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-fit"
                  />
                ) : (
                  post.athlete.name.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="font-semibold">{post.athlete.name}</h3>
                  {post.athlete.verified && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {post.athlete.sport}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {post.performance.date}
              </div>
            </div>

            <p className="mb-4">{post.content}</p>

            <div className="bg-muted/30 p-3 rounded-md text-sm mb-4">
              <div className="font-medium mb-1">Linked Performance:</div>
              <div className="flex items-center justify-between">
                <span>Distance: {post.performance.distance}</span>
                <span>Pace: {post.performance.pace}</span>
              </div>
            </div>

            {/* Comments section */}
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center mb-3">
                <h4 className="text-sm font-medium">Comments</h4>
                <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {post.comments.length}
                </span>
              </div>

              {post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="pl-4 border-l-2 border-muted mb-3"
                >
                  <div className="flex items-center mb-1">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold mr-2 overflow-hidden">
                      {comment.athlete.avatar ? (
                        <Image
                          src={comment.athlete.avatar}
                          alt={comment.athlete.name}
                          width={24}
                          height={24}
                          className="h-full w-full object-fit"
                        />
                      ) : (
                        comment.athlete.name.charAt(0)
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {comment.athlete.name}
                    </span>
                    {comment.hasReflection ? (
                      <Badge variant="outline" className="ml-2 text-xs">
                        With Reflection
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs bg-muted/50 text-muted-foreground"
                      >
                        No Reflection
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm ml-8">{comment.content}</p>
                </div>
              ))}

              <div className="mt-3 flex">
                <Input
                  placeholder="Add a comment (requires linking to your recent reflection)"
                  className="mr-2 text-sm"
                />
                <Button variant="outline" size="sm">
                  Link & Post
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="text-center p-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/30 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </div>
        <p className="text-muted-foreground">
          End of feed. Check back later for more athlete insights.
        </p>
      </div>
    </div>
  );
}
