import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AuditSummary } from "@/types/audit";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  const { auditSummary } = (await req.json()) as { auditSummary: AuditSummary };

  const topSaving = [...auditSummary.results].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
  const fallbackSummary = `You're spending $${(auditSummary.totalMonthlySavings * 12).toFixed(0)} more per year than you need to. The biggest fix: ${topSaving?.recommendedAction || "consolidate overlapping tools"}${topSaving ? ` — that alone saves $${(topSaving.monthlySavings * 12).toFixed(0)}/yr` : ""}. Make that one change first, then tackle the rest.`;

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ summary: fallbackSummary });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `You are a blunt, friendly advisor helping a startup CTO cut their AI software costs. Write 2-3 short sentences (max 70 words total) that:
1. Start with the single biggest action they should take RIGHT NOW and how much it saves per year (use exact numbers from the data).
2. Give one sentence on the next best action.
3. End with a simple, encouraging close — no corporate speak.

Rules:
- Use plain English. Write like you're texting a smart friend, not writing a report.
- NO words like: "leverage", "optimize", "implement", "streamline", "transition", "significant", "efficiency".
- Use "$X/yr" not "$X annually". Use "switch to" not "migrate to".
- IMPORTANT: If a recommendation advises consolidating specific tasks/workflows from a tool while leaving remaining spend active, phrase it as "Drop [workflow] from [Tool]" rather than instructing them to switch or ditch the tool entirely.
- Be specific with tool names and dollar amounts.

Audit data: ${JSON.stringify(auditSummary)}

Return only the 3-4 sentences, nothing else.`;

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
