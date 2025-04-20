import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Use Node.js runtime in development, Edge in production
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    console.log("API route called - processing request");
    const { messages, userDescription } = await req.json();

    console.log("Request payload:", {
      messageCount: messages?.length,
      hasUserDescription: !!userDescription,
    });

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid messages format");
      return new Response(
        JSON.stringify({ error: "Messages are required and must be an array" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create system prompt with user description if available
    let systemPrompt =
      "You are a fitness coach who provides personalized guidance and mental health support. You are friendly, supportive, and always encouraging. You provide detailed explanations and actionable advice.";

    if (userDescription) {
      systemPrompt += `\n\nThe user has provided the following information about themselves, which you should use to personalize your responses:\n${userDescription}`;
    }

    const result = streamText({
      model: openai(process.env.OPEN_AI_MODEL || "gpt-4o"), // Default to gpt-4o if not specified
      system: systemPrompt,
      messages,
    });

    console.log("Stream created, returning response");

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred during your request.",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
