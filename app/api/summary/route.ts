import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AuditSummary } from "@/types/audit";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  const { auditSummary } = (await req.json()) as { auditSummary: AuditSummary };

  const fallbackSummary = `Based on your AI stack audit, we've identified $${auditSummary.totalMonthlySavings.toFixed(2)} in potential monthly savings ($${auditSummary.totalAnnualSavings.toFixed(2)} annually). Your biggest opportunity lies in ${auditSummary.results.sort((a, b) => b.monthlySavings - a.monthlySavings)[0]?.recommendedAction || "optimizing your current plans"}. Implementing these changes will streamline your operations while maintaining the same AI power for your ${auditSummary.results.length} tools.`;

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ summary: fallbackSummary });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a financial advisor reviewing an AI tool spend audit. Write a 80-100 word personalized summary paragraph for a startup team. Be specific about their biggest saving opportunity. Tone: direct, professional, no fluff. Audit data: ${JSON.stringify(auditSummary)}. Return only the paragraph, no preamble.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    if (text) {
      return NextResponse.json({ summary: text });
    }

    return NextResponse.json({ summary: fallbackSummary });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({ summary: fallbackSummary });
  }
}
