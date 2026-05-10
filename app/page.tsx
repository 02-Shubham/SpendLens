"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, ShieldCheck, Zap, TrendingDown, Layers, MousePointer2 } from "lucide-react";
import { SiOpenai, SiAnthropic, SiGooglegemini, SiGithubcopilot, SiWindsurf } from "react-icons/si";
import { cn } from "@/lib/utils";

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[64px] bg-white/70 backdrop-blur-xl border-b border-gray-100/50">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="SpendLens" width={32} height={32} className="h-auto w-auto" />
          <span className="font-serif font-bold text-[22px] tracking-tight text-gray-900">
            SpendLens
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-gray-500">
          <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a>
          <a href="#why-us" className="hover:text-gray-900 transition-colors">Why SpendLens</a>
        </nav>

        <Link 
          href="/start" 
          className="bg-green-500 text-white px-5 py-2 rounded-full text-[14px] font-medium hover:bg-green-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Start Audit
        </Link>
      </div>
    </header>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function AuroraBackgroundLayer({
  showRadialGradient = true,
  animationSpeed = 15,
}: {
  showRadialGradient?: boolean;
  animationSpeed?: number;
}) {
  const auroraStyles = {
    "--aurora": "repeating-linear-gradient(100deg,#22c55e 10%,#34d399 15%,#6ee7b7 20%,#2dd4bf 25%,#14b8a6 30%)",
    "--white-gradient": "repeating-linear-gradient(100deg,#fff 0%,#fff 7%,transparent 10%,transparent 12%,#fff 16%)",
    "--animation-speed": `${animationSpeed}s`,
  } as CSSProperties & Record<"--aurora" | "--white-gradient" | "--animation-speed", string>;

  return (
    <div className="aurora-background-layer" style={auroraStyles} aria-hidden="true">
      <div className={cn("aurora-background-gradient", showRadialGradient && "aurora-radial-mask")} />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-zinc-50 pt-32 pb-20 md:pt-48 md:pb-32">
      {/* Abstract Background Elements */}
      <AuroraBackgroundLayer showRadialGradient animationSpeed={15} />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-white/58" />
      
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-400 text-green-600 text-[13px] font-semibold mb-6">
            <Zap className="h-3 w-3 fill-current" />
            <span>Used by 200+ fast-growing teams</span>
          </div>
          
          {/* <h1 className="font-serif text-[48px] md:text-[72px] leading-[1.1] text-gray-900 mb-8 tracking-tight">
            Stop guessing your <br />
            <i className="italic font-serif text-green-600">AI tool spend.</i>
          </h1>
          
          <p className="text-[18px] md:text-[20px] text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The first automated audit engine built specifically for modern AI stacks. 
            Find hidden savings across Cursor, Claude, ChatGPT, and 10+ other tools.
          </p> */}
          <h1 className="font-serif text-[48px] text-text-primary mb-4">
            Find out exactly how much you&apos;re <i className="font-serif italic text-green-500">overspending</i> on AI tools
          </h1>
          <p className="mx-auto max-w-[480px] text-[18px] text-gray-600 mb-8">
            Audit your AI spend in 2 minutes. Stop paying for unused seats and features.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/start" 
              className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-green-500 hover:bg-white text-white hover:text-green-600 border-2 border-green-500 px-5 py-3 rounded-xl text-[16px] font-semibold transition-all duration-200 active:scale-[0.98]"
            >
              Run Free Audit
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-2" />
            </Link>
          </div>
          <div className="text-[14px] text-gray-500 font-medium px-4 mt-4">
            Free forever · No credit card · Results in 2 min
          </div>
        </motion.div>
      </div>

      {/* Tool Logos Strip */}
      <div className="mt-20 px-6 max-w-4xl mx-auto">
        <p className="text-center text-[12px] uppercase tracking-widest text-gray-400 font-medium mb-8">
          Trusted by teams using
        </p>
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 grayscale hover:grayscale-0 transition-all duration-700">

          {/* ChatGPT / OpenAI */}
          <div className="flex flex-col items-center gap-2 group">
            <SiOpenai className="h-8 w-8 text-gray-700 group-hover:text-[#10a37f] transition-colors duration-300" />
            <span className="text-[11px] font-semibold tracking-wide text-gray-400 group-hover:text-gray-700 transition-colors">ChatGPT</span>
          </div>

          {/* Claude / Anthropic */}
          <div className="flex flex-col items-center gap-2 group">
            <SiAnthropic className="h-8 w-8 text-gray-700 group-hover:text-[#d97706] transition-colors duration-300" />
            <span className="text-[11px] font-semibold tracking-wide text-gray-400 group-hover:text-gray-700 transition-colors">Claude</span>
          </div>

          {/* Cursor — custom SVG (not in react-icons yet) */}
          <div className="flex flex-col items-center gap-2 group">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 text-gray-700 group-hover:text-[#6366f1] transition-colors duration-300"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V16.42a2 2 0 0 0 1 1.732l7.5 4.33a3 3 0 0 0 3 0l7.5-4.33a2 2 0 0 0 1-1.732V7.577a2 2 0 0 0-1-1.732z" />
            </svg>
            <span className="text-[11px] font-semibold tracking-wide text-gray-400 group-hover:text-gray-700 transition-colors">Cursor</span>
          </div>

          {/* GitHub Copilot */}
          <div className="flex flex-col items-center gap-2 group">
            <SiGithubcopilot className="h-8 w-8 text-gray-700 group-hover:text-[#24292e] transition-colors duration-300" />
            <span className="text-[11px] font-semibold tracking-wide text-gray-400 group-hover:text-gray-700 transition-colors">Copilot</span>
          </div>

          {/* Gemini / Google */}
          <div className="flex flex-col items-center gap-2 group">
            <SiGooglegemini className="h-8 w-8 text-gray-700 group-hover:text-[#4285f4] transition-colors duration-300" />
            <span className="text-[11px] font-semibold tracking-wide text-gray-400 group-hover:text-gray-700 transition-colors">Gemini</span>
          </div>

          {/* Windsurf */}
          <div className="flex flex-col items-center gap-2 group">
            <SiWindsurf className="h-8 w-8 text-gray-700 group-hover:text-[#0ea5e9] transition-colors duration-300" />
            <span className="text-[11px] font-semibold tracking-wide text-gray-400 group-hover:text-gray-700 transition-colors">Windsurf</span>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      icon: <MousePointer2 className="h-6 w-6" />,
      title: "Input your stack",
      desc: "Tell us which tools, plans, and seats you're currently paying for. No login required."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Audit Engine runs",
      desc: "Our logic analyzes workflow overlaps, seat inefficiencies, and cheaper alternatives."
    },
    {
      icon: <TrendingDown className="h-6 w-6" />,
      title: "Get your savings",
      desc: "Instantly see exactly where to downgrade, switch, or cancel to save thousands."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gray-50/50 border-y border-gray-100">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-[32px] md:text-[42px] text-gray-900 mb-4">How it works</h2>
          <p className="text-gray-500 text-[18px]">From audit to savings in three simple steps.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-8 rounded-2xl bg-white border border-gray-100 shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-[20px] font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed text-[15px]">{step.desc}</p>
              
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-6 -translate-y-1/2 z-10 text-gray-200">
                  <ArrowRight className="h-6 w-6" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Why SpendLens ────────────────────────────────────────────────────────────

function WhyBetter() {
  const features = [
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Workflow Aware",
      desc: "We don't just count tools. We analyze if your coding, writing, and research workflows actually justify the cost."
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Defensible Logic",
      desc: "Audit reports designed to be shared with finance. No generic 'switch to free' advice—actual usage-fit reasoning."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Live Market Data",
      desc: "Pricing plans for AI tools change weekly. SpendLens always uses the most current retail and credit-based pricing."
    }
  ];

  return (
    <section id="why-us" className="py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1">
            <h2 className="font-serif text-[32px] md:text-[42px] text-gray-900 mb-6 leading-tight">
              Better than a <br />
              <i className="italic text-green-600">manual spreadsheet.</i>
            </h2>
            <p className="text-gray-600 text-[18px] mb-8 leading-relaxed">
              Spreadsheets are static. AI tool pricing and capabilities move at the speed of light. 
              SpendLens is the living auditor that keeps your stack lean as the industry evolves.
            </p>
            
            <ul className="space-y-4">
              {["No complex formulas needed", "Automated redundancy detection", "One-click shareable reports"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[15px] font-medium text-gray-700">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Zap className="h-3 w-3 fill-current" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex-1 grid gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-xl border border-gray-100 bg-white hover:border-green-100 hover:bg-green-50/30 transition-all group">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-green-600 flex items-center justify-center transition-colors">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{f.title}</h4>
                    <p className="text-gray-500 text-[14px] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-5xl bg-gray-900 rounded-[32px] p-8 md:p-16 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-green-500/10 blur-[100px]" />
        
        <h2 className="font-serif text-[32px] md:text-[48px] text-white mb-6">
          Ready to save on your <br /> AI stack?
        </h2>
        <p className="text-gray-400 text-[18px] mb-10 max-w-xl mx-auto">
          Join hundreds of teams who have already optimized their AI tool spending with SpendLens.
        </p>
        
        <Link 
          href="/start" 
          className="inline-flex items-center gap-2 bg-green-500 text-gray-900 px-10 py-5 rounded-2xl text-[18px] font-bold hover:bg-green-400 transition-all hover:scale-[1.05] active:scale-[0.95]"
        >
          Run My Free Audit <ArrowRight className="h-5 w-5" />
        </Link>
        
        <div className="mt-8 text-gray-500 text-[14px]">
          Free audit · Results in seconds · No account needed
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-green-100 selection:text-green-900">
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhyBetter />
      <CTA />
      
      <footer className="py-12 border-t border-gray-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50 grayscale">
          <Image src="/logo.png" alt="SpendLens" width={24} height={24} className="h-auto w-auto" />
          <span className="font-serif font-bold text-[18px] tracking-tight text-gray-900">
            SpendLens
          </span>
        </div>
        <p className="text-gray-400 text-[13px]">
          &copy; {new Date().getFullYear()} SpendLens. Built for fast-growing teams.
        </p>
      </footer>
    </div>
  );
}
