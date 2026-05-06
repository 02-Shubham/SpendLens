import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { AuditSummary } from "@/types/audit";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(req: NextRequest) {
  const { auditSummary } = await req.json() as { auditSummary: AuditSummary };

  const fallbackSummary = `Based on your AI stack audit, we've identified $${auditSummary.totalMonthlySavings.toFixed(2)} in potential monthly savings ($${auditSummary.totalAnnualSavings.toFixed(2)} annually). Your biggest opportunity lies in ${auditSummary.results.sort((a, b) => b.monthlySavings - a.monthlySavings)[0]?.recommendedAction || "optimizing your current plans"}. Implementing these changes will streamline your operations while maintaining the same AI power for your ${auditSummary.results.length} tools.`;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ summary: fallbackSummary });
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229", // Using current stable sonnet as per best practice if 2025 isn't out
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `You are a financial advisor reviewing an AI tool spend audit. Write a 80-100 word personalized summary paragraph for a startup team. Be specific about their biggest saving opportunity. Tone: direct, professional, no fluff. Audit data: ${JSON.stringify(auditSummary)}. Return only the paragraph, no preamble.`
        }
      ]
    });

    const content = response.content[0];
    if (content.type === "text") {
        return NextResponse.json({ summary: content.text.trim() });
    }
    
    return NextResponse.json({ summary: fallbackSummary });
  } catch (error) {
    console.error("Anthropic API error:", error);
    return NextResponse.json({ summary: fallbackSummary });
  }
}
