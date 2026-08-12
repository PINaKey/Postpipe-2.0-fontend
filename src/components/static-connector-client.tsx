"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
    Check, Copy, Terminal, ArrowRight, ShieldCheck,
    AlertCircle, Eye, EyeOff, Loader2, Zap, Database, Server, Lock,
    ChevronRight, Activity, Cpu, Key, FileCode, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import NewFormClient from "@/components/dashboard/new-form-client";
import { registerConnectorAction, finalizeConnectorAction } from "@/app/actions/register";
import { ShaderAnimation } from "@/components/ui/shader-animation";

const STEPS = [
    { id: 1, label: "Generate", icon: Zap, desc: "Create secure credentials" },
    { id: 2, label: "Deploy", icon: Server, desc: "Push to the cloud" },
    { id: 3, label: "Connect", icon: Database, desc: "Link your instance" },
];

export default function StaticConnectorClient({ liveConnectorsCount = 0 }: { liveConnectorsCount?: number }) {
    const { user } = useAuth();
    const setupRef = useRef<HTMLDivElement>(null);

    const [step, setStep] = useState(1);
    const [connectorName, setConnectorName] = useState("");
    const [connectorType, setConnectorType] = useState<"express" | "fastapi">("express");
    const [connectorData, setConnectorData] = useState<{ id: string; secret: string } | null>(null);
    const [deploymentUrl, setDeploymentUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isDashboardReady, setIsDashboardReady] = useState(false);

    useEffect(() => {
        if (user?.email) {
            const storedStep = localStorage.getItem(`pp_setup_step_${user.email}`);
            const storedType = localStorage.getItem(`pp_connector_type_${user.email}`);
            const storedData = localStorage.getItem(`pp_connector_data_${user.email}`);
            if (storedStep) setStep(parseInt(storedStep));
            if (storedType) setConnectorType(storedType as "express" | "fastapi");
            if (storedData) setConnectorData(JSON.parse(storedData));
            if (storedStep === "4") setIsDashboardReady(true);
        }
    }, [user]);

    const saveState = (newStep: number, data?: any) => {
        if (user?.email) {
            localStorage.setItem(`pp_setup_step_${user.email}`, newStep.toString());
            localStorage.setItem(`pp_connector_type_${user.email}`, connectorType);
            if (data) localStorage.setItem(`pp_connector_data_${user.email}`, JSON.stringify(data));
        }
        setStep(newStep);
        if (data) setConnectorData(data);
    };

    const scrollToSetup = () => {
        if (setupRef.current) {
            const y = setupRef.current.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const handleGenerate = async () => {
        if (!connectorName) {
            toast({ title: "Name Required", description: "Please give your connector a name.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        const fd = new FormData();
        fd.append("name", connectorName);
        const res = await registerConnectorAction(fd);
        setIsLoading(false);
        if (res.success && res.connectorId && res.connectorSecret) {
            saveState(2, { id: res.connectorId, secret: res.connectorSecret });
            toast({ title: "Credentials Generated", description: "Now deploy your connector." });
        } else {
            toast({ title: "Error", description: res.error || "Failed to generate", variant: "destructive" });
        }
    };

    const handleConnect = async () => {
        if (!deploymentUrl || !connectorData) return;
        setIsLoading(true);
        const res = await finalizeConnectorAction(connectorData.id, deploymentUrl);
        setIsLoading(false);
        if (res.success) {
            saveState(4);
            setIsDashboardReady(true);
            toast({ title: "Connected!", description: "Your connector is live." });
        } else {
            toast({ title: "Connection Failed", description: res.error, variant: "destructive" });
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: `${label} copied.` });
    };

    if (showCreateForm) {
        return (
            <div className="pt-20 px-8">
                <NewFormClient onBack={() => setShowCreateForm(false)} />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-background relative flex flex-col">
            {/* Subtle Hero Shader - fading into background */}
            <div className="absolute top-0 left-0 right-0 h-[45vh] z-0 overflow-hidden pointer-events-none opacity-40">
                <ShaderAnimation />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col w-full max-w-7xl mx-auto px-6 py-12 md:py-24 gap-12">
                {/* Header */}
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border bg-card/50 px-3 py-1 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500" />
                        </span>
                        Setup Workspace
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                        New <span className="text-violet-500">Connector</span>
                    </h1>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Deploy a private connector to your cloud provider. We'll generate secure credentials and guide you through the process in three steps.
                    </p>
                </div>

                <div ref={setupRef} className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Left Col: Wizard */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
                        {/* Steps UI */}
                        {!isDashboardReady && (
                            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {STEPS.map((s, i) => {
                                    const isActive = step === s.id;
                                    const isDone = step > s.id;
                                    return (
                                        <div key={s.id} className="flex items-center gap-2 sm:gap-3 flex-1 min-w-[120px]">
                                            <div className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border flex-1 transition-all duration-300 shadow-sm",
                                                isActive ? "bg-card border-violet-500/30 shadow-[0_4px_20px_-4px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/10" : 
                                                isDone ? "bg-card/50 border-border/50 text-muted-foreground" : "bg-muted/30 border-transparent opacity-50"
                                            )}>
                                                <div className={cn(
                                                    "flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg transition-colors duration-300 shrink-0",
                                                    isActive ? "bg-violet-500/10 text-violet-500" :
                                                    isDone ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {isDone ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                                                </div>
                                                <div className="hidden sm:block">
                                                    <p className={cn("text-sm font-semibold", isActive ? "text-foreground" : "")}>{s.label}</p>
                                                    <p className="text-[10px] text-muted-foreground line-clamp-1">{s.desc}</p>
                                                </div>
                                                <div className="sm:hidden font-semibold text-sm">
                                                    {s.label}
                                                </div>
                                            </div>
                                            {i < STEPS.length - 1 && (
                                                <ChevronRight className={cn("h-4 w-4 shrink-0 transition-colors", step > s.id ? "text-violet-500" : "text-muted-foreground/30")} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Wizard Content Card */}
                        <div className="rounded-2xl border bg-card shadow-sm p-6 sm:p-8 min-h-[400px] flex flex-col justify-center relative">
                            
                            {/* ── Step 1: Generate ── */}
                            {step === 1 && !isDashboardReady && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                                    <div>
                                        <h2 className="text-2xl font-bold">Generate Credentials</h2>
                                        <p className="text-muted-foreground mt-1">Name your connector and choose a framework to get started.</p>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold">Connector Name</label>
                                            <Input
                                                placeholder="e.g. Production Database"
                                                value={connectorName}
                                                onChange={e => setConnectorName(e.target.value)}
                                                className="h-12 bg-background/50 focus-visible:ring-violet-500/20 focus:border-violet-500/50 transition-colors"
                                                onFocus={() => setTimeout(scrollToSetup, 100)}
                                                onClick={() => setTimeout(scrollToSetup, 100)}
                                                onKeyDown={e => e.key === "Enter" && handleGenerate()}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold">Framework</label>
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setConnectorType("express")}
                                                    className={cn("p-4 rounded-xl border text-left transition-all hover:-translate-y-0.5", connectorType === "express" ? "bg-violet-500/10 border-violet-500/30 ring-1 ring-violet-500/10" : "bg-card hover:border-violet-500/20")}
                                                >
                                                    <div className="font-bold text-sm flex items-center justify-between">
                                                        Express <Badge variant="secondary" className="text-[10px] rounded-md px-1.5">Node.js</Badge>
                                                    </div>
                                                    <div className="text-xs mt-2 text-muted-foreground">Lightweight serverless setup</div>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConnectorType("fastapi")}
                                                    className={cn("p-4 rounded-xl border text-left transition-all hover:-translate-y-0.5", connectorType === "fastapi" ? "bg-violet-500/10 border-violet-500/30 ring-1 ring-violet-500/10" : "bg-card hover:border-violet-500/20")}
                                                >
                                                    <div className="font-bold text-sm flex items-center justify-between">
                                                        FastAPI <Badge variant="secondary" className="text-[10px] rounded-md px-1.5">Python</Badge>
                                                    </div>
                                                    <div className="text-xs mt-2 text-muted-foreground">High performance serverless setup</div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4">
                                        <Button
                                            onClick={handleGenerate}
                                            disabled={isLoading || !connectorName}
                                            className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white font-semibold gap-2 transition-all shadow-[0_4px_14px_0_rgba(139,92,246,0.25)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.3)]"
                                        >
                                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Zap className="h-5 w-5" /> Generate Secure Credentials</>}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 2: Deploy ── */}
                            {step === 2 && !isDashboardReady && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                                    <div>
                                        <h2 className="text-2xl font-bold">Deploy to Cloud</h2>
                                        <p className="text-muted-foreground mt-1">Push your connector template directly to Vercel or your preferred cloud.</p>
                                    </div>

                                    {/* Credentials block */}
                                    {connectorData && (
                                        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-4 shadow-sm">
                                            <div className="flex items-center gap-2 text-violet-500 text-xs font-semibold uppercase tracking-widest">
                                                <ShieldCheck className="h-4 w-4" />
                                                Your Secrets
                                            </div>
                                            <div className="relative group rounded-lg border bg-background p-4 font-mono text-xs overflow-hidden">
                                                <div className="space-y-1.5 text-foreground/80 overflow-x-auto">
                                                    <div>POSTPIPE_CONNECTOR_ID={connectorData.id}</div>
                                                    <div>POSTPIPE_CONNECTOR_SECRET=<span className={cn(showSecret ? "" : "blur-sm transition-all")}>{connectorData.secret}</span></div>
                                                </div>
                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-1 rounded-md">
                                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowSecret(!showSecret)}>
                                                        {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard(`POSTPIPE_CONNECTOR_ID=${connectorData.id}\nPOSTPIPE_CONNECTOR_SECRET=${connectorData.secret}`, "Credentials")}>
                                                        <Copy className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                Save these! They authenticate your connector with the Postpipe dashboard.
                                            </p>
                                        </div>
                                    )}

                                    {/* Deploy targets */}
                                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                                        <a 
                                            href={`https://vercel.com/new/clone?repository-url=${encodeURIComponent(connectorType === "fastapi" ? "https://github.com/PostPipe/postpipe-connector-fastapi" : "https://github.com/PostPipe/postpipe-connector-template")}&env=POSTPIPE_CONNECTOR_ID,POSTPIPE_CONNECTOR_SECRET&POSTPIPE_CONNECTOR_ID=${connectorData?.id || ''}&POSTPIPE_CONNECTOR_SECRET=${connectorData?.secret || ''}`}
                                            target="_blank" rel="noopener noreferrer" 
                                            className="group relative flex flex-col items-center gap-4 rounded-xl border bg-card hover:bg-muted/30 hover:border-foreground/20 p-6 text-center transition-all hover:-translate-y-1 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background transition-transform group-hover:scale-110 shadow-lg">
                                                <svg viewBox="0 0 76 65" fill="currentColor" className="h-6 w-6"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" /></svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">Deploy with Vercel</p>
                                                <p className="text-xs text-muted-foreground mt-1">1-Click Setup • Pre-filled env vars</p>
                                            </div>
                                        </a>

                                        {connectorType === "fastapi" && (
                                            <a 
                                                href="https://app.rivendeploy.com/new?repo=https%3A%2F%2Fgithub.com%2FPostPipe%2Fpostpipe-connector-fastapi" 
                                                target="_blank" rel="noopener noreferrer" 
                                                className="group relative flex flex-col items-center gap-4 rounded-xl border bg-card hover:bg-muted/30 hover:border-[#F97316]/30 p-6 text-center transition-all hover:-translate-y-1 overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-b from-[#F97316]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F97316] text-white transition-transform group-hover:scale-110 shadow-lg shadow-[#F97316]/20">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">Deploy with Riven</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Managed Cloud Deployment</p>
                                                </div>
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-6 border-t">
                                        <Button variant="ghost" onClick={() => setStep(1)} className="h-11">Back</Button>
                                        <Button className="flex-1 h-11 gap-2" onClick={() => setStep(3)}>
                                            I've deployed it <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 3: Connect ── */}
                            {step === 3 && !isDashboardReady && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                                    <div>
                                        <h2 className="text-2xl font-bold">Connect Instance</h2>
                                        <p className="text-muted-foreground mt-1">Provide the URL where your connector is running.</p>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold">Deployment URL</label>
                                        <Input
                                            placeholder="https://my-connector.vercel.app"
                                            value={deploymentUrl}
                                            onChange={e => setDeploymentUrl(e.target.value)}
                                            className="h-12 bg-background/50 focus-visible:ring-violet-500/20 focus:border-violet-500/50"
                                            onKeyDown={e => e.key === "Enter" && handleConnect()}
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <Button variant="ghost" onClick={() => setStep(2)} className="h-11">Back</Button>
                                        <Button 
                                            onClick={handleConnect} 
                                            disabled={isLoading || !deploymentUrl} 
                                            className="flex-1 h-11 bg-violet-600 hover:bg-violet-500 text-white font-semibold gap-2 shadow-[0_4px_14px_0_rgba(139,92,246,0.25)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.3)]"
                                        >
                                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Lock className="h-4 w-4" /> Verify Connection</>}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* ── Complete ── */}
                            {isDashboardReady && (
                                <div className="text-center space-y-8 py-8 animate-in fade-in zoom-in-95 duration-500 w-full">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-[3px] border-foreground mx-auto">
                                        <Check className="h-12 w-12 text-foreground" strokeWidth={4} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black">Ready to roll</h2>
                                        <p className="text-muted-foreground mt-2 max-w-sm mx-auto text-lg">Your connector is live, secure, and ready to handle incoming data.</p>
                                    </div>

                                    <div className="bg-card border rounded-2xl p-6 text-left max-w-md mx-auto space-y-3 shadow-sm">
                                        <div className="flex items-center gap-2 text-foreground font-bold">
                                            <Database className="h-5 w-5 text-foreground" /> Database Configuration
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Before mapping, ensure you have added your <strong className="text-foreground">Database Alias</strong> (variable name) and <strong className="text-foreground">Database URL</strong> as environment variables in your deployment platform (e.g. Vercel).
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                                        <Link href="/dashboard/database">
                                            <Button className="h-12 px-8 bg-foreground hover:bg-foreground/90 text-background font-semibold gap-2 shadow-lg w-full sm:w-auto">
                                                <Database className="h-5 w-5" /> Create Database Mapping
                                            </Button>
                                        </Link>
                                        <Button variant="outline" className="h-12 px-8 w-full sm:w-auto" onClick={() => {
                                            if (user?.email) {
                                                localStorage.removeItem(`pp_setup_step_${user.email}`);
                                                setIsDashboardReady(false);
                                                setStep(1);
                                                setConnectorData(null);
                                            }
                                        }}>
                                            Set up another
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Col: Live Preview Sidebar */}
                    <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-24">
                        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col">
                            <div className="px-5 py-4 border-b bg-muted/20 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-violet-500" />
                                <h3 className="text-sm font-semibold">Live Preview</h3>
                            </div>
                            
                            <div className="p-5 space-y-6">
                                {/* Status Header */}
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="text-lg font-bold truncate max-w-[200px]">
                                            {connectorName || "Unnamed Connector"}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <div className={cn("h-2 w-2 rounded-full", isDashboardReady ? "bg-emerald-500" : step > 1 ? "bg-amber-500" : "bg-muted-foreground/30")} />
                                            {isDashboardReady ? "Live & Connected" : step > 1 ? "Awaiting Deployment" : "Draft"}
                                        </div>
                                    </div>
                                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 border border-violet-500/20">
                                        {connectorType === "express" ? <FileCode className="h-5 w-5 text-violet-500" /> : <Cpu className="h-5 w-5 text-violet-500" />}
                                    </div>
                                </div>

                                {/* Properties List */}
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Framework</span>
                                        <span className="font-medium">{connectorType === "express" ? "Express.js" : "FastAPI"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Runtime Environment</span>
                                        <span className="font-medium">{connectorType === "express" ? "Node.js" : "Python 3.9+"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Authentication</span>
                                        <span className="font-medium flex items-center gap-1.5"><Key className="h-3.5 w-3.5 text-emerald-500" /> Bearer Token</span>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <span className="text-sm text-muted-foreground">Connector ID</span>
                                        <div className="p-2.5 rounded-lg bg-muted/50 border font-mono text-[11px] break-all">
                                            {connectorData?.id || "conn_xxxxxxxxxxxxxxxxxxxx"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4 flex flex-col gap-3">
                                <div className="rounded-xl border bg-card p-4 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                                            <Database className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{liveConnectorsCount} Live {liveConnectorsCount === 1 ? 'Connector' : 'Connectors'}</p>
                                            <p className="text-[10px] text-muted-foreground">Manage existing instances</p>
                                        </div>
                                    </div>
                                    <Link href="/dashboard/connectors">
                                        <Button size="sm" variant="secondary" className="h-8">Manage</Button>
                                    </Link>
                                </div>

                            <div className="text-center mt-2">
                                <Link href="/docs/guides/static-connector" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
                                    <AlertCircle className="h-3 w-3" /> Setup documentation & guides
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
