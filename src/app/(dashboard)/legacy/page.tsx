"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Users,
  Award as Medal,
  Share2,
  Link as LinkIcon,
  ThumbsUp,
} from "@deemlol/next-icons";

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
    <div className="p-6 bg-gradient-to-br from-blue-50/10 via-background to-background/95">
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-6 h-6 text-muted-foreground" />
        <h1 className="text-3xl font-bold">Locker Room</h1>
        <Badge
          variant="outline"
          className="ml-auto px-3 py-1 text-sm font-medium"
        >
          Verified Athletes Only
        </Badge>
      </div>

      {/* New Post */}
      <Card className="mb-8 bg-gradient-to-br from-blue-100/10 via-muted/30 to-transparent hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Share with fellow athletes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              className="w-full min-h-[100px] resize-none border-border rounded-lg focus-visible:ring-ring focus-visible:border-ring bg-background"
              placeholder="Share your training insights, ask questions, or seek advice..."
            />
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" className="gap-2">
                <LinkIcon className="h-4 w-4" />
                Link Performance Data
              </Button>
              <Button className="gap-2">
                <Share2 className="h-4 w-4" />
                Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      {posts.map((post) => (
        <Card
          key={post.id}
          className="mb-6 bg-gradient-to-br from-blue-100/5 via-muted/20 to-transparent hover:shadow-lg transition-all duration-300"
        >
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xl font-bold overflow-hidden border border-border">
                {post.athlete.avatar ? (
                  <img
                    src={post.athlete.avatar}
                    alt={post.athlete.name}
                    className="h-full w-full object-fit"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.style.display = "none";
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.textContent =
                          post.athlete.name.charAt(0);
                      }
                    }}
                  />
                ) : (
                  post.athlete.name.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="font-semibold">{post.athlete.name}</h3>
                  {post.athlete.verified && (
                    <Medal className="h-4 w-4 ml-1 text-primary" />
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

            <div className="bg-blue-100/10 p-3 rounded-md text-sm mb-4">
              <div className="font-medium mb-1">Linked Performance:</div>
              <div className="flex items-center justify-between">
                <span>Distance: {post.performance.distance}</span>
                <span>Pace: {post.performance.pace}</span>
              </div>
            </div>

            {/* Comments section */}
            <div className="mt-4 border-t border-border pt-4">
              <div className="flex items-center mb-3">
                <MessageSquare className="h-4 w-4 mr-2" />
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
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold mr-2 overflow-hidden border border-border">
                      {comment.athlete.avatar ? (
                        <img
                          src={comment.athlete.avatar}
                          alt={comment.athlete.name}
                          className="h-full w-full object-fit"
                          onError={(e) => {
                            e.currentTarget.src = "";
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.textContent =
                                comment.athlete.name.charAt(0);
                            }
                          }}
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
                        <ThumbsUp className="h-3 w-3 mr-1" />
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
                  className="mr-2 text-sm border-border focus-visible:ring-ring focus-visible:border-ring"
                />
                <Button variant="outline" size="sm" className="gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Link & Post
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="text-center p-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100/10 mb-4">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">
          End of feed. Check back later for more athlete insights.
        </p>
      </div>
    </div>
  );
}
