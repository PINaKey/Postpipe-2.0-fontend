'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile, cancelSubscription } from '@/lib/auth/actions';
import { compressImage } from '@/lib/image-compression';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Lock, User, Mail, Upload, Loader2, Link as LinkIcon,
    AlertCircle, CheckCircle2, CreditCard, ArrowUpRight,
    Sparkles, Shield, Zap, Users, Infinity as InfinityIcon,
    CalendarDays,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PLAN_LIMITS } from "@/config/plans";

const formatDate = (dateString: string | Date) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('default', { month: 'long' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
};

function InfoIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    );
}

export default function ProfileClient() {
    const { user, loading, refreshSession } = useAuth();
    const [state, formAction] = useActionState(updateProfile, { success: false, message: '' });

    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setImage(user.image || '');
            setIsDirty(false);
        }
    }, [user, state.success]);

    useEffect(() => {
        if (user) {
            const hasNameChanged = name !== (user.name || '');
            const hasImageChanged = image !== (user.image || '');
            setIsDirty(hasNameChanged || hasImageChanged);
        }
    }, [name, image, user]);

    const handleSubmit = () => { setIsSaving(true); };

    useEffect(() => {
        if (state.message) {
            setIsSaving(false);
            if (state.success && refreshSession) refreshSession();
        }
    }, [state, refreshSession]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const compressedFile = await compressImage(file);
            const formData = new FormData();
            formData.append('file', compressedFile);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) setImage(data.url);
            else console.error('Upload failed:', data.error);
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm("Are you sure you want to cancel your subscription?")) return;
        setIsCancelling(true);
        try {
            const res = await cancelSubscription();
            if (res.success) { if (refreshSession) refreshSession(); }
            else alert(res.message || "Failed to cancel subscription");
        } catch {
            alert("An unexpected error occurred.");
        } finally {
            setIsCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            </div>
        );
    }

    const getInitials = (name: string) =>
        name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

    const planName = (user?.plan || 'starter').charAt(0).toUpperCase() + (user?.plan || 'starter').slice(1);
    const planLimit = PLAN_LIMITS[user?.plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.starter;
    const submissionsUsed = user?.monthlySubmissions || 0;
    const submissionsMax = planLimit.submissions;
    const submissionsPercent = user?.plan === 'enterprise' ? 0 : Math.min(100, (submissionsUsed / submissionsMax) * 100);

    const planFeatures: Record<string, { icon: React.ComponentType<{ className?: string }>; text: string }[]> = {
        starter: [
            { icon: Shield, text: "2 Database Connectors" },
            { icon: Zap, text: "Zero-Trust Signature Verification" },
            { icon: Users, text: "Community Support" },
        ],
        builder: [
            { icon: Shield, text: "10 Database Connectors" },
            { icon: Zap, text: "Custom Webhooks & Triggers" },
            { icon: Users, text: "Priority Email Support" },
        ],
        enterprise: [
            { icon: InfinityIcon, text: "Unlimited Database Connectors" },
            { icon: Sparkles, text: "White-labeled Dashboard" },
            { icon: Users, text: "24/7 Slack Support & SLA" },
        ],
    };

    const features = planFeatures[user?.plan || 'starter'] || planFeatures.starter;

    return (
        <div className="flex flex-col gap-6 w-full pb-10">

            {/* ─────────────── HERO ─────────────── */}
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0a0a] min-h-[180px]">
                {/* Dot-matrix texture */}
                <div
                    className="absolute inset-0 opacity-[0.35]"
                    style={{
                        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                        backgroundSize: "24px 24px",
                    }}
                />
                {/* Fade the dots at the right side so content reads clean */}
                <div className="absolute inset-0" style={{ background: `linear-gradient(to right, transparent 40%, #0a0a0a 90%)` }} />
                {/* Bottom rule */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/[0.06]" />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 px-8 py-10">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="rounded-full p-[2px] bg-white/10">
                            <Avatar className="h-20 w-20 rounded-full">
                                <AvatarImage src={image} alt="Avatar" className="object-cover" />
                                <AvatarFallback className="text-xl font-black bg-neutral-900 text-white/60">
                                    {getInitials(name || user?.name || "U")}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="absolute bottom-0.5 right-0.5 h-4 w-4 bg-emerald-500 border-2 border-[#0a0a0a] rounded-full" />
                    </div>

                    {/* Text */}
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/40 w-fit">
                            <User className="h-3 w-3" />
                            Account Settings
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-white leading-none">
                            {name || user?.name || 'Profile'}<span className="text-white/20">.</span>
                        </h1>
                        <p className="text-sm text-white/30">
                            {user?.email} &middot; <span className="text-white/50 font-medium">{planName}</span> Plan
                        </p>
                    </div>

                    {/* Right stats */}
                    <div className="hidden md:flex items-center gap-2 shrink-0">
                        {[
                            { label: "Plan", value: planName },
                            { label: "Submissions", value: submissionsUsed.toString() },
                        ].map((s) => (
                            <div key={s.label} className="flex flex-col items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-3 text-center min-w-[80px]">
                                <span className="text-[9px] uppercase tracking-[0.18em] text-white/25 font-semibold">{s.label}</span>
                                <span className="text-lg font-black text-white mt-1">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─────────────── TWO COLUMN GRID ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                {/* ── LEFT: Personal Info ── */}
                <form action={formAction} onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="flex flex-col h-full rounded-2xl border border-white/[0.07] bg-[#0d0d0d] overflow-hidden">
                        {/* Card header */}
                        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.05]">
                            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.05] border border-white/[0.08] shrink-0">
                                <User className="h-4 w-4 text-white/50" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white">Personal Information</h2>
                                <p className="text-xs text-white/30 mt-0.5">Update your photo and personal details.</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 p-6 flex-1">
                            {/* Avatar + URL row */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                <div className="relative shrink-0">
                                    <div className="p-[2px] rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
                                        <Avatar className="h-16 w-16 rounded-full">
                                            <AvatarImage src={image} alt="Avatar" className="object-cover" />
                                            <AvatarFallback className="text-sm font-bold bg-neutral-900 text-violet-300">
                                                {getInitials(name || "U")}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2 min-w-0">
                                    <Label htmlFor="image" className="text-xs font-bold uppercase tracking-widest text-white/40">Avatar URL</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1 min-w-0">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
                                            <Input
                                                id="image" name="image" type="url"
                                                value={image}
                                                onChange={(e) => setImage(e.target.value)}
                                                placeholder="https://example.com/avatar.png"
                                                className="pl-9 bg-white/[0.03] border-white/[0.07] text-white placeholder:text-white/20 focus:border-white/20 focus:ring-0 text-sm"
                                            />
                                        </div>
                                        <input type="file" className="hidden" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
                                        <Button type="button" variant="outline" size="icon"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-all"
                                        >
                                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] bg-white/[0.05]" />

                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-white/40">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
                                    <Input
                                        id="name" name="name" type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="pl-9 bg-white/[0.03] border-white/[0.07] text-white placeholder:text-white/20 focus:border-white/20 focus:ring-0"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                                    Email Address
                                    <span className="text-[10px] font-normal text-white/20 normal-case tracking-normal bg-white/[0.04] px-1.5 py-0.5 rounded">(read-only)</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
                                    <Input
                                        id="email" name="email" type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="pl-9 bg-white/[0.02] border-white/[0.05] text-white/30 border-dashed cursor-not-allowed"
                                    />
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/15" />
                                </div>
                                <p className="text-[11px] text-white/20 flex items-center gap-1">
                                    <InfoIcon className="h-3 w-3 inline shrink-0" />
                                    To change your email, contact{' '}
                                    <a href="mailto:support@postpipe.in" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">support@postpipe.in</a>.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-white/[0.05] bg-white/[0.01]">
                            <div className="text-sm">
                                {state.message && (
                                    <div className={["flex items-center gap-2 font-medium text-xs", state.success ? 'text-emerald-400' : 'text-red-400'].join(' ')}>
                                        {state.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                        {state.message}
                                    </div>
                                )}
                            </div>
                            <Button
                                type="submit"
                                disabled={!isDirty || isSaving}
                                className="bg-white text-black hover:bg-white/90 border-0 transition-all disabled:opacity-30 min-w-[130px] font-bold"
                            >
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </form>

                {/* ── RIGHT: Subscription & Usage ── */}
                <div className="flex flex-col gap-4 h-full">

                    {/* Plan banner */}
                    <div className="relative rounded-2xl border border-white/[0.07] bg-[#0d0d0d] overflow-hidden">
                        <div className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full bg-white/10" />

                        <div className="relative flex items-center justify-between gap-4 p-5">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/[0.05] border border-white/[0.08] shrink-0">
                                    <CreditCard className="h-4 w-4 text-white/50" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Current Plan</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-2xl font-black text-white capitalize">{planName}</p>
                                        {user?.cancelAtPeriodEnd && (
                                            <span className="inline-flex items-center text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                                                Cancelling Soon
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                {(user?.plan === 'starter' || !user?.plan) && (
                                    <Button asChild size="sm" className="bg-white text-black hover:bg-white/90 border-0 font-bold gap-1.5">
                                        <a href="/pricing"><ArrowUpRight className="h-3.5 w-3.5" />Upgrade</a>
                                    </Button>
                                )}
                                {user?.plan !== 'starter' && !user?.cancelAtPeriodEnd && (
                                    <Button variant="ghost" size="sm" onClick={handleCancelSubscription} disabled={isCancelling}
                                        className="text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.07] transition-all">
                                        {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel Plan'}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Cancellation notice */}
                        {user?.cancelAtPeriodEnd && user?.currentPeriodEnd && (
                            <div className="relative flex items-start gap-3 mx-4 mb-4 rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-sm">
                                <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                                <p className="text-orange-300/80 text-xs leading-relaxed">
                                    You won't be charged again. Access expires on{' '}
                                    <strong className="text-orange-300">{formatDate(user.currentPeriodEnd)}</strong>. After that, you'll revert to the Starter plan.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Submissions usage */}
                    <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d0d] p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                                <Zap className="h-3.5 w-3.5 text-white/50" />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-white/40">Monthly Submissions</p>
                        </div>
                        <div className="flex items-end justify-between">
                            <p className="text-3xl font-black text-white">{submissionsUsed.toLocaleString()}</p>
                            <p className="text-sm text-white/30 font-mono">
                                {user?.plan === 'enterprise' ? '∞ unlimited' : `/ ${submissionsMax.toLocaleString()}`}
                            </p>
                        </div>
                        {user?.plan !== 'enterprise' && (
                            <div className="space-y-1.5">
                                <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
                                    <div
                                        className={["h-full rounded-full transition-all duration-1000", submissionsPercent >= 80 ? "bg-red-500" : "bg-white/40"].join(' ')}
                                        style={{ width: `${submissionsPercent}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-white/20 text-right">{submissionsPercent.toFixed(1)}% consumed</p>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[11px] text-white/25">
                            <CalendarDays className="h-3 w-3" />
                            Resets on {user?.usageResetDate ? formatDate(user.usageResetDate) : 'the 1st of next month'}.
                        </div>
                    </div>

                    {/* Plan features */}
                    <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d0d] p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                                <Sparkles className="h-3.5 w-3.5 text-white/50" />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-white/40">Plan Features</p>
                        </div>
                        <ul className="flex flex-col gap-2.5">
                            {features.map((f, i) => {
                                const FIcon = f.icon;
                                return (
                                <li key={i} className="flex items-center gap-3 group">
                                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-white/[0.04] border border-white/[0.07] shrink-0">
                                        <FIcon className={["h-3 w-3", "text-white/40"].join(" ")} />
                                    </div>
                                    <span className="text-sm text-white/45 group-hover:text-white/65 transition-colors">{f.text}</span>
                                </li>
                                );
                            })}
                        </ul>
                        {(user?.plan === 'starter' || !user?.plan) && (
                            <a href="/pricing"
                                className="mt-5 flex items-center justify-center gap-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 text-xs font-semibold text-white/40 hover:bg-white/[0.06] hover:text-white/60 transition-all"
                            >
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                Upgrade to unlock more features
                            </a>
                        )}
                        {user?.plan !== 'starter' && (
                            <a href="mailto:founder@postpipe.in"
                                className="mt-5 flex items-center justify-center gap-2 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 text-xs font-bold text-white/30 hover:text-white/50 hover:bg-white/[0.04] transition-all"
                            >
                                Contact Enterprise Support
                            </a>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
