import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const savings = searchParams.get("savings") || "0";
  const tools = searchParams.get("tools") || "";

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
          backgroundColor: "#fff",
          backgroundImage: "radial-gradient(circle at 25px 25px, #f1f5f9 2px, transparent 0)",
          backgroundSize: "40px 40px",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Decorative background circle */}
        <div 
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "200px",
            background: "rgba(34, 197, 94, 0.05)",
          }}
        />

        {/* Brand Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "60px",
            position: "absolute",
            top: "60px",
            left: "60px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "#16a34a",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: "20px",
              boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)",
            }}
          >
            SL
          </div>
          <span
            style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "#111",
              letterSpacing: "-0.02em",
            }}
          >
            SpendLens
          </span>
        </div>

        {/* Main Content Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "white",
            padding: "60px 80px",
            borderRadius: "32px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "20px",
            }}
          >
            Potential Savings Found
          </div>
          
          <div
            style={{
              fontSize: "120px",
              fontWeight: 900,
              color: "#16a34a",
              lineHeight: 1,
              marginBottom: "24px",
              display: "flex",
              alignItems: "baseline",
            }}
          >
            <span style={{ fontSize: "64px", marginRight: "4px" }}>$</span>
            {savings}
            <span style={{ fontSize: "40px", color: "#94a3b8", fontWeight: 500, marginLeft: "8px" }}>/mo</span>
          </div>

          {tools && tools.length > 0 && (
            <div
              style={{
                display: "flex",
                fontSize: "24px",
                color: "#334155",
                fontWeight: 500,
                background: "#f8fafc",
                padding: "12px 24px",
                borderRadius: "99px",
                border: "1px solid #f1f5f9",
                marginTop: "20px",
              }}
            >
              Auditing: {tools}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "20px",
            color: "#94a3b8",
            fontWeight: 500,
          }}
        >
          <span>Run your own free audit at</span>
          <span style={{ color: "#16a34a", fontWeight: 700 }}>spendlens.app</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
