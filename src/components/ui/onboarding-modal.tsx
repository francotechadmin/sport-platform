"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  setUserSelfDescription,
  setOnboardingComplete,
} from "@/lib/chat-storage";

type OnboardingStep = "intro" | "subscription" | "user-prompt";

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState<OnboardingStep>("intro");
  const [identityTag, setIdentityTag] = useState<string | null>(null);
  const [userDescription, setUserDescription] = useState("");
  const [isDescriptionValid, setIsDescriptionValid] = useState(false);

  // Validate user description when it changes
  useEffect(() => {
    setIsDescriptionValid(userDescription.trim().length >= 20);
  }, [userDescription]);

  const handleClose = () => {
    // Only mark onboarding as complete if user has completed all steps
    if (step === "user-prompt" && isDescriptionValid) {
      // Save user description to localStorage
      setUserSelfDescription(userDescription);
      setOnboardingComplete(true);
      setOpen(false);
      onComplete();
    } else if (step !== "user-prompt") {
      setOpen(false);
      onComplete();
    }
  };

  const handleNext = () => {
    if (step === "intro") {
      setStep("subscription");
    } else if (step === "subscription") {
      setStep("user-prompt");
    } else if (step === "user-prompt" && isDescriptionValid) {
      // Save user description to localStorage
      setUserSelfDescription(userDescription);
      setOnboardingComplete(true);
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full sm:max-w-md md:max-w-4xl max-h-[90dvh] overflow-y-auto px-3 sm:px-6">
        {step === "intro" ? (
          <>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl sm:text-2xl">
                Welcome to ProFormAi
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                The first AI designed to mirror your mindset, not just measure
                your performance.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4 text-sm sm:text-base">
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">
                  What ProFormAi can do:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>
                    Help you reflect through pressure, recovery, and evolution
                  </li>
                  <li>
                    Provide personalized insights based on your training data
                  </li>
                  <li>Adapt to your specific athletic needs and goals</li>
                  <li>
                    Offer guidance based on sports science and performance
                    psychology
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-foreground">
                  Why it&apos;s different from ChatGPT/LLMs:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Focused on athletic performance and mental training</li>
                  <li>Calibrated to understand athlete-specific challenges</li>
                  <li>Built around sports psychology principles</li>
                  <li>Learns from your specific training patterns over time</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-foreground">
                  Select your identity (optional):
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Pro Athlete",
                    "College Athlete",
                    "High School Athlete",
                    "Recreational Athlete",
                  ].map((tag) => (
                    <Button
                      key={tag}
                      variant={identityTag === tag ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIdentityTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button onClick={handleNext} className="w-full sm:w-auto">
                Next
              </Button>
            </DialogFooter>
          </>
        ) : step === "subscription" ? (
          <>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl sm:text-2xl">
                Subscription Tiers
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Choose the plan that fits your training needs
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-3">
              <Card className="border-2 border-muted">
                <CardHeader>
                  <CardTitle>Free Tier</CardTitle>
                  <CardDescription>Basic reflections</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>Basic training analysis</li>
                    <li>Limited AI conversations</li>
                    <li>Performance tracking</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-accent shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Pro Tier</CardTitle>
                    <span className="bg-accent text-accent-foreground text-xs font-medium px-2 py-1 rounded">
                      Recommended
                    </span>
                  </div>
                  <CardDescription>
                    Personalized memory / training logs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>All Free features</li>
                    <li>Personalized training insights</li>
                    <li>Long-term progress tracking</li>
                    <li>Unlimited AI consultations</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-muted">
                <CardHeader>
                  <CardTitle>Legacy Tier</CardTitle>
                  <CardDescription>
                    Voice identity preservation + mentor mode
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>All Pro features</li>
                    <li>Custom voice interface</li>
                    <li>Mentor mode with personalized coaching</li>
                    <li>Advanced analytics and predictions</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <DialogFooter className="mt-6">
              <Button onClick={handleNext} className="w-full sm:w-auto">
                Next
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl sm:text-2xl">
                Tell Us About Yourself
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                This information helps your AI coach provide personalized
                guidance
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">
                  Describe yourself as an athlete:
                </h3>
                <p className="text-sm text-muted-foreground">
                  Include your sport, experience level, goals, strengths,
                  weaknesses, and any specific areas you want to improve. This
                  information will be used by your AI coach in future
                  conversations.
                </p>
                <Textarea
                  value={userDescription}
                  onChange={(e) => setUserDescription(e.target.value)}
                  placeholder="I'm a marathon runner with 3 years of experience. My goal is to qualify for Boston. My strengths are endurance and consistency, but I struggle with speed work and recovery. I'm looking to improve my race strategy and mental toughness during the final miles..."
                  className="min-h-[150px]"
                />
                <p className="text-xs text-muted-foreground">
                  {userDescription.trim().length < 20 ? (
                    <span className="text-red-500">
                      Please provide at least 20 characters
                    </span>
                  ) : (
                    <span className="text-green-500">
                      Great! This will help your coach provide personalized
                      guidance
                    </span>
                  )}
                </p>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                onClick={handleNext}
                className="w-full sm:w-auto"
                disabled={!isDescriptionValid}
              >
                Complete Setup
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
