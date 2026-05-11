import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, ShieldCheck, Zap, TrendingDown, Layers, MousePointer2 } from "lucide-react";
import { SiOpenai, SiAnthropic, SiGooglegemini, SiGithubcopilot, SiWindsurf } from "react-icons/si";
import { AuroraBackgroundLayer, HeroContent, AnimatedSection } from "@/components/landing-client-components";

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[64px] bg-white/70 backdrop-blur-xl border-b border-gray-100/50">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="SpendLens" 
            width={32} 
            height={32} 
            className="h-auto w-auto" 
            priority // Critical for LCP
          />
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

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-zinc-50 pt-32 pb-20 md:pt-48 md:pb-32">
      {/* Abstract Background Elements */}
      <AuroraBackgroundLayer showRadialGradient animationSpeed={15} />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-white/58" />
      
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <HeroContent />
      </div>

      {/* Tool Logos Strip */}
      <div className="mt-20 px-6 max-w-5xl mx-auto">
        <p className="text-center text-[13.5px] uppercase tracking-widest text-gray-400 font-medium mb-8">
          Trusted by teams using
        </p>
        <div className="flex flex-wrap justify-center items-center gap-11 md:gap-18 grayscale hover:grayscale-0 transition-all duration-700">
          {/* Tool icons... */}
          <ToolIcon icon={<SiOpenai className="h-9 w-9 text-gray-700 group-hover:text-[#10a37f] transition-colors duration-300" />} label="ChatGPT" />
          <ToolIcon icon={<SiAnthropic className="h-9 w-9 text-gray-700 group-hover:text-[#d97706] transition-colors duration-300" />} label="Claude" />
          <ToolIcon 
            icon={
              <svg viewBox="0 0 24 24" className="h-9 w-9 text-gray-700 group-hover:text-[#6366f1] transition-colors duration-300" fill="currentColor" aria-hidden="true">
                <path d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V16.42a2 2 0 0 0 1 1.732l7.5 4.33a3 3 0 0 0 3 0l7.5-4.33a2 2 0 0 0 1-1.732V7.577a2 2 0 0 0-1-1.732z" />
              </svg>
            } 
            label="Cursor" 
          />
          <ToolIcon icon={<SiGithubcopilot className="h-9 w-9 text-gray-700 group-hover:text-[#24292e] transition-colors duration-300" />} label="Copilot" />
          <ToolIcon icon={<SiGooglegemini className="h-9 w-9 text-gray-700 group-hover:text-[#4285f4] transition-colors duration-300" />} label="Gemini" />
          <ToolIcon icon={<SiWindsurf className="h-9 w-9 text-gray-700 group-hover:text-[#0ea5e9] transition-colors duration-300" />} label="Windsurf" />
        </div>
      </div>
    </section>
  );
}

function ToolIcon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 group">
      {icon}
      <span className="text-[12.5px] font-semibold tracking-wide text-gray-400 group-hover:text-gray-700 transition-colors">{label}</span>
    </div>
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
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className="relative h-full p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
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
              </div>
            </AnimatedSection>
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
