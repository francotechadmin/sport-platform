import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Use Node.js runtime in development, Edge in production
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    console.log("API route called - processing request");
    const { messages } = await req.json();

    console.log("Request payload:", { messageCount: messages?.length });

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid messages format");
      return new Response(
        JSON.stringify({ error: "Messages are required and must be an array" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log("Creating stream with openai model: gpt-4o");

    const result = streamText({
      model: openai("ft:gpt-4o-2024-08-06:humanityai:proform-reflection-v8-deepmode:BI73k4sj"),
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
      },
    );
  }
}
