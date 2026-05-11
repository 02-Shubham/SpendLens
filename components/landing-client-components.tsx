"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

export function AuroraBackgroundLayer({
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

export function HeroContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-50 border border-green-400 text-green-600 text-[14.5px] font-semibold mb-6">
        <Zap className="h-3.5 w-3.5 fill-current" />
        <span>Used by 200+ fast-growing teams</span>
      </div>
      
      <h1 className="font-serif text-[53px] text-text-primary mb-4">
        Find out exactly how much you&apos;re <i className="font-serif italic text-green-500">overspending</i> on AI tools
      </h1>
      <p className="mx-auto max-w-[530px] text-[20px] text-gray-600 mb-8">
        Audit your AI spend in 2 minutes. Stop paying for unused seats and features.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link 
          href="/start" 
          className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-green-500 hover:bg-white text-white hover:text-green-600 border-2 border-green-500 px-6 py-3.5 rounded-xl text-[18px] font-semibold transition-all duration-200 active:scale-[0.98]"
        >
          Run Free Audit
          <ArrowRight className="h-6 w-6 transition-transform duration-200 group-hover:translate-x-2" />
        </Link>
      </div>
      <div className="text-[15.5px] text-gray-500 font-medium px-4 mt-4">
        Free forever · No credit card · Results in 2 min
      </div>
    </motion.div>
  );
}

export function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
