"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Database, Zap, Globe } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Database,
    title: "Connect Your Database",
    description:
      "Provide your existing MongoDB or PostgreSQL credentials. PostPipe generates a secure, signed API endpoint in seconds — no backend code required.",
    color: "text-blue-400",
    glowColor: "bg-blue-500/10",
    accentRgb: "59, 130, 246",
    connectorColor: "#3b82f6",
    code: `// postpipe.config.js\ndb: "mongodb+srv://...",\nkey: process.env.PP_KEY`,
  },
  {
    step: "02",
    icon: Zap,
    title: "Embed the Form Snippet",
    description:
      "Copy a single HTML/JS snippet and drop it anywhere — a React app, a plain HTML page, Webflow, or WordPress. Zero dependencies.",
    color: "text-violet-400",
    glowColor: "bg-violet-500/10",
    accentRgb: "139, 92, 246",
    connectorColor: "#8b5cf6",
    code: `<!-- Paste anywhere -->\n<script src="pp.js"></script>\n<form data-pp="my-form">`,
  },
  {
    step: "03",
    icon: Globe,
    title: "Receive Verified Data",
    description:
      "Every submission is cryptographically signed and validated before it reaches your database. Your data, your control.",
    color: "text-emerald-400",
    glowColor: "bg-emerald-500/10",
    accentRgb: "16, 185, 129",
    connectorColor: "#10b981",
    code: `// Received & verified\n{\n  "email": "user@example.com",\n  "verified": true\n}`,
  },
];

function AnimatedConnector({ color, delay }: { color: string; delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="hidden lg:flex items-center justify-center w-20 shrink-0 mt-[60px]">
      <svg width="80" height="12" viewBox="0 0 80 12" fill="none">
        {/* Static track */}
        <line x1="0" y1="6" x2="80" y2="6" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {/* Animated fill */}
        <motion.line
          x1="0"
          y1="6"
          x2="80"
          y2="6"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.7, delay, ease: "easeOut" }}
          style={{ pathLength: 0 }}
        />
        {/* Arrow head dot */}
        <motion.circle
          cx="76"
          cy="6"
          r="3"
          fill={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: delay + 0.7, duration: 0.25 }}
        />
      </svg>
    </div>
  );
}

function StepCard({ step, idx, isInView }: { step: typeof steps[0]; idx: number; isInView: boolean }) {
  const Icon = step.icon;

  return (
    <motion.div
      className="relative flex flex-col w-full lg:max-w-[300px] rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: idx * 0.15 }}
    >
      {/* Animated border via box-shadow + pseudo */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none z-10"
        style={{ boxShadow: `0 0 0 1px rgba(${step.accentRgb}, 0.15)` }}
        animate={{
          boxShadow: [
            `0 0 0 1px rgba(${step.accentRgb}, 0.1)`,
            `0 0 0 1px rgba(${step.accentRgb}, 0.4), 0 0 20px rgba(${step.accentRgb}, 0.08)`,
            `0 0 0 1px rgba(${step.accentRgb}, 0.1)`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: idx * 0.6 }}
      />

      <div className="relative bg-card/60 backdrop-blur-sm p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-9 h-9 rounded-xl ${step.glowColor} flex items-center justify-center shrink-0`}>
            <Icon className={`h-4 w-4 ${step.color}`} />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase">
            Step {step.step}
          </span>
        </div>

        <h3 className="text-sm font-bold text-foreground mb-2 leading-snug">{step.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-5 flex-1">{step.description}</p>

        {/* Code window */}
        <div className="rounded-lg bg-[#080808] border border-white/5 p-3">
          <div className="flex gap-1.5 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-red-500/50" />
            <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
            <span className="w-2 h-2 rounded-full bg-emerald-500/50" />
          </div>
          <motion.pre
            className={`text-[10px] font-mono ${step.color} leading-relaxed whitespace-pre`}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 + idx * 0.15, duration: 0.5 }}
          >
            {step.code}
          </motion.pre>
        </div>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="py-16 px-4 bg-background" ref={sectionRef}>
      {/* Rounded outer container — near full width */}
      <div className="max-w-7xl mx-auto rounded-3xl border border-border/50 bg-card/20 overflow-hidden relative">
        {/* Subtle inner grid */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 px-8 py-14">
          {/* Header */}
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45 }}
          >
            <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-primary mb-3">
              Simple by Design
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
              Up and running in three steps
            </h2>
            <p className="text-muted-foreground text-base max-w-md mx-auto">
              No dedicated backend. No DevOps. No surprises.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="flex flex-col lg:flex-row items-stretch justify-center gap-0">
            {steps.map((step, idx) => (
              <React.Fragment key={step.step}>
                <StepCard step={step} idx={idx} isInView={isInView} />
                {idx < steps.length - 1 && (
                  <AnimatedConnector color={steps[idx + 1].connectorColor} delay={0.3 + idx * 0.2} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
