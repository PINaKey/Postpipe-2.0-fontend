"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
    Activity,
    AlertCircle,
    ArrowUpRight,
    Database,
    FileText,
    PlugZap,
    TrendingUp,
    Zap,
    CheckCircle2,
    Gauge,
    Globe,
    Layers,
    Radio,
    Cpu,
} from "lucide-react";
import { PLAN_LIMITS } from "@/config/plans";

interface UsageStats {
    plan?: string;
    monthlySubmissions?: number;
    limitSubmissions?: number;
    limitConnectors?: number;
    totalRequests: number;
    errorRate: number;
    avgLatency: number;
    activeConnectors: number;
    activeForms: number;
}

interface UsageClientProps {
    stats: UsageStats;
}

/* ── Bento stat card ─────────────────────────────────── */
function BentoStatCard({
    label,
    value,
    sub,
    icon: Icon,
    gradient,
    iconColor,
}: {
    label: string;
    value: string;
    sub: string;
    icon: React.ElementType;
    gradient: string;
    iconColor: string;
}) {
    return (
        <div className="relative rounded-2xl border border-white/[0.07] overflow-hidden group">
            {/* animated gradient background */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${gradient} blur-xl`} />
            <div className="absolute inset-0 bg-neutral-950/90" />
            {/* noise texture */}
            <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundSize: "200px 200px",
                }}
            />
            <div className="relative z-10 p-5 flex flex-col gap-5">
                {/* top row */}
                <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">{label}</span>
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                        <Icon className={["h-4 w-4", iconColor].join(" ")} />
                    </div>
                </div>
                {/* value */}
                <div>
                    <p className="text-4xl font-black tracking-tight text-white leading-none">{value}</p>
                    <p className="text-xs text-white/30 mt-2 leading-relaxed">{sub}</p>
                </div>
                {/* bottom accent line */}
                <div className={`h-[2px] w-12 rounded-full ${gradient} opacity-60`} />
            </div>
        </div>
    );
}

/* ── Usage limit row ─────────────────────────────────── */
function LimitRow({
    icon: Icon,
    label,
    used,
    limit,
    percent,
    unitLabel,
    color,
}: {
    icon: React.ElementType;
    label: string;
    used: string | number;
    limit: string | number;
    percent: number;
    unitLabel: string;
    color: string;
}) {
    const isWarning = percent >= 80;
    const isUnlimited = limit === "Unlimited";

    return (
        <div className="group flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300 p-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className="flex items-center justify-center h-8 w-8 rounded-lg bg-opacity-10 shrink-0"
                        style={{ backgroundColor: 'rgba(139,92,246,0.08)' }}
                    >
                        <Icon className={["h-4 w-4", color.replace('bg-', 'text-')].join(" ")} />
                    </div>
                    <span className="text-sm font-semibold text-white/80 truncate">{label}</span>
                </div>
                <div className="shrink-0 text-right">
                    {isUnlimited ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Unlimited
                        </span>
                    ) : (
                        <span className="text-xs font-mono text-white/40">
                            <span className="text-white font-bold text-sm">{used}</span>{" "}
                            <span className="text-white/25">/</span>{" "}
                            {limit} {unitLabel}
                        </span>
                    )}
                </div>
            </div>
            {!isUnlimited && (
                <div className="space-y-1.5 pl-11">
                    <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                isWarning
                                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                                    : "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500"
                            }`}
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-white/20 text-right">{percent.toFixed(1)}% consumed</p>
                </div>
            )}
        </div>
    );
}

/* ── Mini info pill ──────────────────────────────────── */
function InfoPill({ label, value, accent }: { label: string; value: string | number; accent: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 backdrop-blur-sm text-center min-w-[80px]">
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">{label}</span>
            <span className={`text-xl font-black mt-1 ${accent}`}>{value}</span>
        </div>
    );
}

/* ── Main Component ──────────────────────────────────── */
export default function UsageClient({ stats }: UsageClientProps) {
    const planName = stats.plan
        ? stats.plan.charAt(0).toUpperCase() + stats.plan.slice(1)
        : "Starter";

    const fallbackSubmissions =
        PLAN_LIMITS[stats.plan as keyof typeof PLAN_LIMITS]?.submissions ||
        PLAN_LIMITS.starter.submissions;
    const fallbackConnectors =
        PLAN_LIMITS[stats.plan as keyof typeof PLAN_LIMITS]?.connectors ||
        PLAN_LIMITS.starter.connectors;

    const submissionsLimit = stats.limitSubmissions === Infinity
        ? "Unlimited"
        : (stats.limitSubmissions || fallbackSubmissions).toLocaleString();

    const connectorsLimit = stats.limitConnectors === Infinity
        ? "Unlimited"
        : (stats.limitConnectors || fallbackConnectors).toString();

    const submissionsPercent =
        stats.limitSubmissions === Infinity
            ? 0
            : Math.min(100, ((stats.monthlySubmissions || 0) / (stats.limitSubmissions || fallbackSubmissions)) * 100);

    const connectorsPercent =
        stats.limitConnectors === Infinity
            ? 0
            : Math.min(100, (stats.activeConnectors / (stats.limitConnectors || fallbackConnectors)) * 100);

    const isUnlimited = stats.limitSubmissions === Infinity || stats.plan === "enterprise";
    const isStarter = !stats.plan || stats.plan === "starter";

    return (
        <div className="flex flex-col gap-6 w-full pb-10">

            {/* ─────────────────── HERO HEADER ─────────────────── */}
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.07] bg-neutral-950 shadow-2xl">
                {/* Orb glows */}
                <div className="absolute top-0 left-1/4 w-96 h-48 bg-violet-600/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-64 h-32 bg-fuchsia-600/15 rounded-full blur-[60px] pointer-events-none" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-[50px] pointer-events-none" />
                {/* Grid */}
                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
                        backgroundSize: "50px 50px",
                    }}
                />
                {/* Noise */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                        backgroundSize: "200px 200px",
                    }}
                />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-8 py-10">
                    <div className="flex flex-col gap-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-300 w-fit backdrop-blur-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                            System Observability
                        </div>
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter text-white leading-none">
                                Usage<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">.</span>
                            </h1>
                            <p className="mt-3 text-sm text-white/35 max-w-md leading-relaxed">
                                Real-time performance metrics, plan quota tracking, and infrastructure health for your PostPipe workspace.
                            </p>
                        </div>
                        {/* Status badges */}
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                All Systems Operational
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/40">
                                <Cpu className="h-3 w-3" />
                                {planName} Tier
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <InfoPill label="Plan" value={planName} accent="text-violet-300" />
                        <InfoPill label="Forms" value={stats.activeForms} accent="text-white" />
                        <InfoPill label="Connectors" value={stats.activeConnectors} accent="text-fuchsia-300" />
                        <InfoPill label="Requests" value={stats.totalRequests.toLocaleString()} accent="text-sky-300" />
                    </div>
                </div>

                {/* Bottom gradient border */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
            </div>

            {/* ─────────────────── STAT BENTO GRID ─────────────────── */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <BentoStatCard
                    label="Total Requests"
                    value={stats.totalRequests.toLocaleString()}
                    sub="Cumulative all-time ingest count across all endpoints"
                    icon={TrendingUp}
                    gradient="bg-gradient-to-br from-violet-600 to-indigo-600"
                    iconColor="text-violet-400"
                />
                <BentoStatCard
                    label="Error Rate"
                    value={`${stats.errorRate}%`}
                    sub="Estimated failure ratio across active form submissions"
                    icon={AlertCircle}
                    gradient="bg-gradient-to-br from-emerald-600 to-teal-600"
                    iconColor="text-emerald-400"
                />
                <BentoStatCard
                    label="Avg Latency"
                    value={`${stats.avgLatency}ms`}
                    sub="Backend p95 response time for form processing pipeline"
                    icon={Zap}
                    gradient="bg-gradient-to-br from-fuchsia-600 to-pink-600"
                    iconColor="text-fuchsia-400"
                />
            </div>

            {/* ─────────────────── USAGE LIMITS ─────────────────── */}
            <div className="relative rounded-2xl border border-white/[0.07] overflow-hidden bg-neutral-950">
                {/* Ambient glow */}
                <div className="absolute top-0 left-0 w-72 h-32 bg-violet-600/10 rounded-full blur-[60px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-48 h-24 bg-fuchsia-600/10 rounded-full blur-[40px] pointer-events-none" />

                {/* Header */}
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-white/[0.05]">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-violet-500/10 border border-violet-500/20">
                            <Layers className="h-4 w-4 text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">Usage Limits</h2>
                            <p className="text-xs text-white/30 mt-0.5">
                                On <span className="text-violet-400 font-bold">{planName}</span> plan &middot; Resets monthly
                            </p>
                        </div>
                    </div>
                    {isStarter && (
                        <Link href="/pricing">
                            <Button
                                size="sm"
                                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-500/20 transition-all gap-1.5 shrink-0"
                            >
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                Upgrade Plan
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Limit rows */}
                <div className="relative flex flex-col gap-2 p-4">
                    <LimitRow
                        icon={Activity}
                        label="Monthly Requests"
                        used={(stats.monthlySubmissions || 0).toLocaleString()}
                        limit={submissionsLimit}
                        percent={submissionsPercent}
                        unitLabel="req"
                        color="bg-violet-500 text-violet-400"
                    />
                    <LimitRow
                        icon={PlugZap}
                        label="Active Connectors"
                        used={stats.activeConnectors}
                        limit={connectorsLimit}
                        percent={connectorsPercent}
                        unitLabel="connectors"
                        color="bg-fuchsia-500 text-fuchsia-400"
                    />
                    <LimitRow
                        icon={FileText}
                        label="Active Forms"
                        used={stats.activeForms}
                        limit="Unlimited"
                        percent={0}
                        unitLabel="forms"
                        color="bg-emerald-500 text-emerald-400"
                    />
                </div>
            </div>

            {/* ─────────────────── INFRA BANNER ─────────────────── */}
            <div className={`relative flex items-center gap-5 rounded-2xl border overflow-hidden px-6 py-5 ${
                isUnlimited
                    ? "border-emerald-500/15 bg-emerald-500/[0.04]"
                    : "border-violet-500/15 bg-violet-500/[0.04]"
            }`}>
                {/* Left glow */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isUnlimited ? "bg-gradient-to-b from-emerald-400/80 to-teal-500/80" : "bg-gradient-to-b from-violet-500/80 to-fuchsia-500/80"}`} />

                <div className={`flex items-center justify-center h-10 w-10 rounded-xl shrink-0 ${
                    isUnlimited ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-violet-500/10 border border-violet-500/20"
                }`}>
                    {isUnlimited
                        ? <Globe className="h-5 w-5 text-emerald-400" />
                        : <Database className="h-5 w-5 text-violet-400" />}
                </div>

                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${isUnlimited ? "text-emerald-300" : "text-violet-300"}`}>
                        {isUnlimited ? "Scalable Infrastructure Enabled" : "Plan Limits Are Active"}
                    </p>
                    <p className="text-xs text-white/30 mt-0.5 leading-relaxed">
                        {isUnlimited
                            ? "Your current plan handles unlimited traffic and storage — scale without worrying about quotas."
                            : "You're on a metered plan. Monitor your usage above and upgrade anytime for higher throughput."}
                    </p>
                </div>

                {!isUnlimited && !isStarter && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-white/40 shrink-0">
                        <Radio className="h-3 w-3" />
                        Metered
                    </span>
                )}
            </div>
        </div>
    );
}
