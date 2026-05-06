import { ToolName } from "@/types/audit";

export interface PricingPlan {
  name: string;
  pricePerUserMonth: number;
  minSeats?: number;
}

export const PRICING_DATA: Record<ToolName, PricingPlan[]> = {
  Cursor: [
    { name: "Hobby", pricePerUserMonth: 0 },
    { name: "Pro", pricePerUserMonth: 20 },
    { name: "Business", pricePerUserMonth: 40 },
  ],
  "GitHub Copilot": [
    { name: "Individual", pricePerUserMonth: 10 },
    { name: "Business", pricePerUserMonth: 19 },
    { name: "Enterprise", pricePerUserMonth: 39 },
  ],
  Claude: [
    { name: "Free", pricePerUserMonth: 0 },
    { name: "Pro", pricePerUserMonth: 20 },
    { name: "Max", pricePerUserMonth: 100 },
    { name: "Team", pricePerUserMonth: 30, minSeats: 5 },
  ],
  ChatGPT: [
    { name: "Plus", pricePerUserMonth: 20 },
    { name: "Team", pricePerUserMonth: 30, minSeats: 2 },
    { name: "Enterprise", pricePerUserMonth: 60 }, // Estimated/Custom
  ],
  Gemini: [
    { name: "Free", pricePerUserMonth: 0 },
    { name: "Advanced", pricePerUserMonth: 20 },
  ],
  Windsurf: [
    { name: "Free", pricePerUserMonth: 0 },
    { name: "Pro", pricePerUserMonth: 15 },
    { name: "Teams", pricePerUserMonth: 35 },
  ],
  "Anthropic API": [
    { name: "API Usage", pricePerUserMonth: 1 }, // Base unit for logic
  ],
  "OpenAI API": [
    { name: "API Usage", pricePerUserMonth: 1 }, // Base unit for logic
  ],
};

/**
 * SOURCE URLs (Verified 2026-05-07):
 * Cursor: https://cursor.sh/pricing
 * Copilot: https://github.com/features/copilot/plans
 * Claude: https://www.anthropic.com/claude/pricing
 * ChatGPT: https://openai.com/chatgpt/pricing/
 * Gemini: https://gemini.google.com/advanced
 * Windsurf: https://codeium.com/windsurf/pricing
 */
