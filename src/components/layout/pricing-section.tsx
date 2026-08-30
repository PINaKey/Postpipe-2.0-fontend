"use client";

import { buttonVariants, Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star, Shield, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  yearlyPeriod: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  yearlyHref?: string;
  isPopular: boolean;
  icon: React.ReactNode;
}

const postpipePlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "0",
    yearlyPrice: "0",
    period: "forever",
    yearlyPeriod: "forever",
    features: [
      "2 Database Connectors",
      "1,000 Submissions / month",
      "Zero-Trust Signature Verification",
      "Community Support",
    ],
    description: "Perfect for testing and personal projects.",
    buttonText: "Get Started",
    href: "#",
    isPopular: false,
    icon: <Zap className="h-6 w-6 text-zinc-400" />
  },
  {
    name: "Builder",
    price: "699",
    yearlyPrice: "1899",
    period: "3 months",
    yearlyPeriod: "year",
    features: [
      "10 Database Connectors",
      "50,000 Submissions / month",
      "Custom Webhooks & Triggers",
      "Cloudinary File Uploads",
      "Priority Email Support",
    ],
    description: "For freelancers and production applications.",
    buttonText: "Upgrade to Builder",
    href: "https://rzp.io/rzp/M5r0TdJo",
    yearlyHref: "https://rzp.io/rzp/Cu9LVU4",
    isPopular: true,
    icon: <Star className="h-6 w-6 text-zinc-100" />
  },
  {
    name: "Enterprise",
    price: "Custom",
    yearlyPrice: "Custom",
    period: "",
    yearlyPeriod: "",
    features: [
      "Unlimited Connectors",
      "Unlimited Submissions",
      "Custom Database Adapters",
      "White-labeled Dashboard",
      "24/7 Slack Support & SLA",
    ],
    description: "For agencies and high-volume routing.",
    buttonText: "Contact Sales",
    href: "mailto:founder@postpipe.in",
    isPopular: false,
    icon: <Shield className="h-6 w-6 text-zinc-400" />
  },
];

export function PricingSection() {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "hsl(var(--primary))",
          "hsl(var(--accent))",
          "hsl(var(--secondary))",
          "hsl(var(--muted))",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <section id="pricing" className="py-20 md:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-zinc-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg whitespace-pre-line max-w-2xl mx-auto">
            Bring your own infrastructure. Only pay for the tools and limits you need to scale your forms.
          </p>
        </div>

        <div className="flex justify-center items-center gap-4 mb-16">
          <span className={cn("text-sm font-medium", isMonthly ? "text-foreground" : "text-muted-foreground")}>Quarterly</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <Label>
              <Switch
                ref={switchRef as any}
                checked={!isMonthly}
                onCheckedChange={handleToggle}
                className="relative bg-zinc-800 data-[state=checked]:bg-primary border-border border"
              />
            </Label>
          </label>
          <span className={cn("text-sm font-medium flex items-center gap-1.5", !isMonthly ? "text-foreground" : "text-muted-foreground")}>
            Yearly <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">Save Big</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 sm:2 gap-4 max-w-6xl mx-auto">
          {postpipePlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 1 }}
              whileInView={
                isDesktop
                  ? {
                      y: plan.isPopular ? -20 : 0,
                      opacity: 1,
                      x: index === 2 ? -30 : index === 0 ? 30 : 0,
                      scale: index === 0 || index === 2 ? 0.94 : 1.0,
                    }
                  : {}
              }
              viewport={{ once: true }}
              transition={{
                duration: 1.6,
                type: "spring",
                stiffness: 100,
                damping: 30,
                delay: 0.4,
                opacity: { duration: 0.5 },
              }}
              className={cn(
                `rounded-[2rem] border p-8 xl:p-10 bg-background/80 backdrop-blur-xl text-center lg:flex lg:flex-col lg:justify-center relative transition-all`,
                plan.isPopular ? "border-zinc-500/50 shadow-2xl shadow-white/5 ring-1 ring-zinc-500/20" : "border-border/50 hover:bg-card/40",
                "flex flex-col",
                !plan.isPopular && "mt-5",
                index === 0 || index === 2
                  ? "z-0 transform translate-x-0 translate-y-0 -translate-z-[50px] rotate-y-[10deg]"
                  : "z-10",
                index === 0 && "origin-right",
                index === 2 && "origin-left"
              )}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-8 px-3 py-1 bg-zinc-100 text-zinc-900 text-[10px] font-bold uppercase tracking-widest rounded-b-lg">
                  Founder's Deal
                </div>
              )}
              
              <div className="flex-1 flex flex-col">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 mx-auto", plan.isPopular ? "bg-zinc-800 mt-2" : "bg-zinc-800/50")}>
                    {plan.icon}
                </div>
                
                <h3 className="text-2xl font-bold mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                    {plan.description}
                </p>
                
                <div className="mt-2 flex items-baseline justify-center gap-x-2">
                  {plan.price === "Custom" ? (
                    <span className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">
                        Custom
                    </span>
                  ) : (
                    <div className="flex items-end gap-2 flex-wrap justify-center">
                        {plan.isPopular && (
                             <span className="text-lg text-muted-foreground line-through decoration-muted-foreground/50 leading-none mb-1">
                                 ₹{isMonthly ? "1299" : "2400"}
                             </span>
                        )}
                        <span className="text-4xl lg:text-5xl font-black tracking-tight text-foreground flex items-center leading-none">
                            <span className="text-2xl mr-1">₹</span>
                            <NumberFlow
                                value={
                                isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                                }
                                format={{
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                                }}
                                transformTiming={{
                                duration: 500,
                                easing: "ease-out",
                                }}
                                willChange
                                className="font-variant-numeric: tabular-nums leading-none"
                            />
                        </span>
                        {((isMonthly ? plan.period : plan.yearlyPeriod) !== "forever") && (
                            <span className="text-sm font-semibold leading-none mb-1 ml-1 text-muted-foreground">
                            / {isMonthly ? plan.period : plan.yearlyPeriod}
                            </span>
                        )}
                    </div>
                  )}
                </div>

                {plan.price !== "Custom" && plan.price !== "0" && (
                    <div className="mt-6 flex justify-center">
                        <span className="inline-flex items-center rounded-md bg-green-500/10 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-green-500 border border-green-500/20 leading-snug">
                            {isMonthly ? "🎉 Flat 30% Off on UPI Mandates by any UPI App" : "🎉 20% Discount on UPI Mandates on all UPI Apps"}
                        </span>
                    </div>
                )}
                
                {plan.price === "0" && (
                     <div className="mt-6 flex justify-center h-8">
                     </div>
                )}

                <ul className="mt-8 gap-4 flex flex-col flex-1 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-foreground/80">
                      <Check className={cn("h-4 w-4 shrink-0 mt-0.5", plan.isPopular ? "text-zinc-100" : "text-zinc-500")} />
                      <span className="text-left">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={(!isMonthly && plan.yearlyHref) ? plan.yearlyHref : plan.href}
                  className="w-full"
                  target={plan.isPopular ? "_blank" : "_self"}
                  rel={plan.isPopular ? "noopener noreferrer" : ""}
                >
                  <Button 
                    variant={plan.isPopular ? "secondary" : "outline"} 
                    className={cn(
                        "w-full h-12 font-bold gap-2 text-base group/btn",
                        plan.isPopular ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200" : "border-zinc-700 hover:bg-zinc-800"
                    )}
                  >
                    {plan.buttonText} 
                    {plan.isPopular && <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
