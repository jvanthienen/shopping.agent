import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { PHOTO_ANALYSIS_PROMPT, SYNTHESIS_PROMPT, FALLBACK_ADAPTIVE_QUESTIONS } from "@/lib/prompts";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "analyze-photos") {
      return await analyzePhotos(body);
    } else if (action === "synthesize-profile") {
      return await synthesizeProfile(body);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("Analyze API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function analyzePhotos(body: {
  selfieBase64: string;
  bodyPhotoBase64: string;
  heightCm?: number;
}) {
  const { selfieBase64, bodyPhotoBase64, heightCm } = body;

  if (!selfieBase64 || !bodyPhotoBase64) {
    return NextResponse.json({ error: "Both selfie and body photo required" }, { status: 400 });
  }

  const selfieMediaType = detectMediaType(selfieBase64);
  const bodyMediaType = detectMediaType(bodyPhotoBase64);

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: selfieMediaType, data: stripDataPrefix(selfieBase64) },
            },
            {
              type: "image",
              source: { type: "base64", media_type: bodyMediaType, data: stripDataPrefix(bodyPhotoBase64) },
            },
            {
              type: "text",
              text: `${PHOTO_ANALYSIS_PROMPT}${heightCm ? `\n\nUser's height: ${heightCm}cm` : ""}`,
            },
          ],
        },
      ],
    });

    const text = response.content.find((c) => c.type === "text")?.text ?? "";
    const analysis = JSON.parse(text);
    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Photo analysis failed, returning fallback questions:", err);
    // Return fallback questions so the wizard can continue
    return NextResponse.json({
      undertone: "Could not determine from photos",
      hairColor: "Could not determine from photos",
      eyeColor: "Could not determine from photos",
      contrast: "Medium",
      bodyProportions: "Could not determine from photos",
      suggestedSeason: "True Summer",
      confidence: 0.3,
      adaptiveQuestions: FALLBACK_ADAPTIVE_QUESTIONS,
    });
  }
}

async function synthesizeProfile(body: {
  selfieBase64?: string;
  bodyPhotoBase64?: string;
  photoAnalysis: Record<string, unknown>;
  colorQuizAnswers: Record<string, string>;
  styleQuizAnswers: Record<string, string | string[]>;
  sizes: Record<string, string[]>;
  heightCm?: number;
  location?: string;
}) {
  const { photoAnalysis, colorQuizAnswers, styleQuizAnswers, sizes, heightCm, location, selfieBase64, bodyPhotoBase64 } = body;

  const contextParts = [
    "## Photo Analysis Results",
    JSON.stringify(photoAnalysis, null, 2),
    "\n## Color Validation Quiz Answers",
    JSON.stringify(colorQuizAnswers, null, 2),
    "\n## Style & Lifestyle Quiz Answers",
    JSON.stringify(styleQuizAnswers, null, 2),
    "\n## User's Sizes",
    JSON.stringify(sizes, null, 2),
  ];
  if (heightCm) contextParts.push(`\n## Height: ${heightCm}cm`);
  if (location) contextParts.push(`\n## Location: ${location}`);

  const contentBlocks: Anthropic.Messages.ContentBlockParam[] = [];

  // Include photos if available for the synthesis model to reference
  if (selfieBase64) {
    contentBlocks.push({
      type: "image",
      source: { type: "base64", media_type: detectMediaType(selfieBase64), data: stripDataPrefix(selfieBase64) },
    });
  }
  if (bodyPhotoBase64) {
    contentBlocks.push({
      type: "image",
      source: { type: "base64", media_type: detectMediaType(bodyPhotoBase64), data: stripDataPrefix(bodyPhotoBase64) },
    });
  }

  contentBlocks.push({
    type: "text",
    text: `${SYNTHESIS_PROMPT}\n\n---\n\n## User Data\n\n${contextParts.join("\n")}`,
  });

  const response = await anthropic.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: 8000,
    messages: [{ role: "user", content: contentBlocks }],
  });

  const text = response.content.find((c) => c.type === "text")?.text ?? "";

  // Try to parse the JSON — handle potential markdown wrapping
  let profile;
  try {
    profile = JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code fences
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      profile = JSON.parse(match[1].trim());
    } else {
      throw new Error("Failed to parse profile JSON from Claude response");
    }
  }

  return NextResponse.json(profile);
}

function stripDataPrefix(base64: string): string {
  return base64.replace(/^data:image\/[^;]+;base64,/, "");
}

function detectMediaType(base64: string): "image/jpeg" | "image/png" | "image/webp" | "image/gif" {
  if (base64.startsWith("data:image/png")) return "image/png";
  if (base64.startsWith("data:image/webp")) return "image/webp";
  if (base64.startsWith("data:image/gif")) return "image/gif";
  return "image/jpeg";
}
