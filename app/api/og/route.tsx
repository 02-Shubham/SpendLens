import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const savings = searchParams.get("savings") || "0";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              background: "#16a34a",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: "18px",
            }}
          >
            SL
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#111",
            }}
          >
            SpendLens
          </span>
        </div>

        {/* Savings number */}
        <div
          style={{
            fontSize: "96px",
            fontWeight: 900,
            color: "#16a34a",
            lineHeight: 1,
            marginBottom: "16px",
          }}
        >
          ${savings}/mo
        </div>

        <div
          style={{
            fontSize: "28px",
            color: "#374151",
            fontWeight: 500,
          }}
        >
          in potential AI spend savings
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "18px",
            color: "#6b7280",
          }}
        >
          spendlens.app · AI tool spend auditor
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
