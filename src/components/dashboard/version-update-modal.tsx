"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function VersionUpdateModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Check if user has seen the v3 update
        const hasSeen = localStorage.getItem("postpipe_v3_update_seen");
        if (!hasSeen) {
            setOpen(true);
        }
    }, []);

    const handleClose = () => {
        setOpen(false);
        localStorage.setItem("postpipe_v3_update_seen", "true");
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); }}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-border/50 shadow-2xl">
                <div className="relative w-full h-[280px]">
                    <img 
                        src="https://res.cloudinary.com/dbaw86kzf/image/upload/v1786981389/36f21d7a-f2f2-4c6a-9383-92d0e1e4fd62.png" 
                        alt="Postpipe v3.0" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                </div>
                <div className="px-6 pb-6 pt-0 relative z-10 -mt-12">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-3xl font-bold text-white drop-shadow-md">
                            <Sparkles className="w-6 h-6 text-violet-400" />
                            Postpipe v3.0 is here!
                        </DialogTitle>
                        <DialogDescription className="text-base mt-2 text-neutral-200 drop-shadow">
                            We've been hard at work to bring you our biggest update yet.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="mt-6 space-y-5">
                        <div className="space-y-1">
                            <h4 className="text-[15px] font-semibold text-white flex items-center gap-2">
                                <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-xs">NEW</span>
                                Riven Deploy Partnership
                            </h4>
                            <p className="text-sm text-neutral-400">Deploy your FastAPI and Express connectors directly to Riven's high-performance infrastructure with a single click.</p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[15px] font-semibold text-white flex items-center gap-2">
                                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs">UPDATE</span>
                                Form Builder Redesign
                            </h4>
                            <p className="text-sm text-neutral-400">A completely overhauled, professionally designed Form Builder layout with a top stepper and centered live preview.</p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[15px] font-semibold text-white flex items-center gap-2">
                                <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs">FEATURE</span>
                                Connector Live Verification
                            </h4>
                            <p className="text-sm text-neutral-400">Instantly verify that your deployed connectors are active and securely connected to your database right from the dashboard.</p>
                        </div>
                    </div>
                    
                    <DialogFooter className="mt-8">
                        <Button className="w-full h-11 bg-white hover:bg-neutral-200 text-black font-semibold text-md rounded-xl transition-all" onClick={handleClose}>
                            Awesome, let's explore!
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
