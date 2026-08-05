"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash, Database, Server, Variable, Copy, Info, Search } from "lucide-react";
import { getConnectorsAction } from "@/app/actions/dashboard";
import { addDatabaseAction, removeDatabaseAction } from "@/app/actions/connector-databases";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShaderBackground } from "@/components/ui/plasma-shader";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";

type Connector = {
    id: string;
    name: string;
    url: string;
    envPrefix?: string;
    databases?: Record<string, {
        uri: string;
        dbName: string;
        type?: 'mongodb' | 'postgres';
    }>;
};

export default function DatabasePage() {
    const [connectors, setConnectors] = useState<Connector[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [newDbInputs, setNewDbInputs] = useState<Record<string, { uri: string, dbName: string, type: 'mongodb' | 'postgres' }>>({});
    const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchConnectors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchConnectors = async () => {
        try {
            const res = await getConnectorsAction();
            const fetched = res as Connector[];
            setConnectors(fetched);
            if (fetched.length > 0 && !selectedConnectorId) {
                setSelectedConnectorId(fetched[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch connectors", error);
            toast({ title: "Error", description: "Failed to load connectors", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const filteredConnectors = useMemo(() => {
        return connectors.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            c.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [connectors, searchQuery]);

    const activeConnector = useMemo(() => {
        return connectors.find(c => c.id === selectedConnectorId);
    }, [connectors, selectedConnectorId]);

    // Ensure we have a selected connector if the list changes
    useEffect(() => {
        if (connectors.length > 0 && !selectedConnectorId) {
            setSelectedConnectorId(connectors[0].id);
        }
    }, [connectors, selectedConnectorId]);

    const handleInputChange = (connectorId: string, field: 'uri' | 'dbName' | 'type', value: string) => {
        setNewDbInputs(prev => ({
            ...prev,
            [connectorId]: {
                ...(prev[connectorId] || { uri: "", dbName: "", type: "mongodb" }),
                [field]: value
            }
        }));
    };

    const handleAddDatabase = async (connectorId: string) => {
        const input = newDbInputs[connectorId];
        if (!input || !input.uri || !input.dbName) {
            toast({ title: "Validation Error", description: "All fields are required", variant: "destructive" });
            return;
        }

        const alias = input.uri.toLowerCase().replace(/^mongodb_uri_/i, '').replace(/_/g, '-') || input.uri.toLowerCase();

        try {
            const res = await addDatabaseAction(connectorId, alias, input.uri, input.dbName, input.type);
            if (res.success) {
                toast({ title: "Database Added", description: `Alias '${alias}' configured as ${input.type}.` });
                setNewDbInputs(prev => ({
                    ...prev,
                    [connectorId]: { uri: "", dbName: "", type: "mongodb" }
                }));
                setOpenDialogs(prev => ({ ...prev, [connectorId]: false }));
                fetchConnectors();
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to add database", variant: "destructive" });
        }
    };

    const handleRemoveDatabase = async (connectorId: string, alias: string) => {
        try {
            const res = await removeDatabaseAction(connectorId, alias);
            if (res.success) {
                toast({ title: "Database Removed" });
                fetchConnectors();
            } else {
                toast({ title: "Error", description: res.error, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to remove database", variant: "destructive" });
        }
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center pt-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10">
            {/* ══ HEADER ══ */}
            <div className="relative w-full rounded-3xl overflow-hidden border border-border/50 shadow-sm bg-card p-8 md:p-10 flex flex-col justify-end min-h-[220px]" style={{ contain: 'layout', willChange: 'contents' }}>
                <ShaderBackground className="absolute inset-0 z-0 opacity-80 pointer-events-none mix-blend-screen" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                            <Database className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                            Databases
                        </h1>
                    </div>
                    <p className="text-base text-muted-foreground max-w-xl font-medium mt-2">
                        Configure connection strings and aliases for multiple databases within your deployed connectors.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full">
                {connectors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-card">
                        <div className="h-16 w-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-border">
                            <Server className="h-8 w-8 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight text-foreground">No Connectors Active</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm">Deploy a connector first to manage its database routing configurations.</p>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row items-start gap-8">
                        
                        {/* Master Column (Left Sidebar for Connectors) */}
                        <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4 shrink-0 h-[650px]">
                            <div className="relative shrink-0">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search connectors..." 
                                    className="pl-9 bg-card border-border shadow-sm rounded-xl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            
                            <ScrollArea className="flex-1 rounded-xl border border-border bg-card shadow-sm p-3">
                                <div className="flex flex-col gap-2">
                                    {filteredConnectors.length === 0 ? (
                                        <div className="py-8 text-center text-sm text-muted-foreground">
                                            No connectors match your search.
                                        </div>
                                    ) : (
                                        filteredConnectors.map((connector) => (
                                            <button
                                                key={connector.id}
                                                onClick={() => setSelectedConnectorId(connector.id)}
                                                className={cn(
                                                    "flex flex-col items-start gap-1 p-4 rounded-xl text-left transition-all border",
                                                    selectedConnectorId === connector.id 
                                                        ? "bg-accent border-border shadow-sm text-accent-foreground font-semibold" 
                                                        : "bg-transparent border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                <div className="flex items-center gap-2.5 w-full">
                                                    <Server className={cn("h-4 w-4 shrink-0", selectedConnectorId === connector.id ? "text-foreground" : "text-muted-foreground")} />
                                                    <span className="font-bold truncate text-sm">
                                                        {connector.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 w-full mt-1">
                                                    <code className="text-[10px] bg-muted border border-border/50 px-1.5 py-0.5 rounded font-mono font-medium text-muted-foreground shrink-0">
                                                        {connector.id}
                                                    </code>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Detail Column (Right Panel for Databases) */}
                        <div className="flex-1 w-full min-w-0 h-[650px]">
                            {!activeConnector ? (
                                <div className="flex h-full flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-card">
                                    <Database className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
                                    <h3 className="text-xl font-bold tracking-tight text-foreground">Select a Connector</h3>
                                    <p className="text-muted-foreground text-sm mt-2 max-w-sm">Choose a connector from the list to manage its mapped databases.</p>
                                </div>
                            ) : (
                                <div className="relative h-full rounded-3xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-3xl bg-neutral-900/60 dark:bg-black/60 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    
                                    {/* Noise Texture Layer */}
                                    <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                                    


                                    {/* Connector Detail Header */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:px-8 md:py-6 border-b border-white/10 bg-black/20 relative shrink-0 z-10">
                                        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-primary shadow-inner shrink-0">
                                                <Server className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-xl font-bold tracking-tight truncate">{activeConnector.name}</h3>
                                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                                                    <code className="text-xs bg-muted/80 border border-border px-1.5 py-0.5 rounded font-mono font-bold text-foreground shrink-0">
                                                        {activeConnector.id}
                                                    </code>
                                                    <span className="truncate max-w-[200px] md:max-w-sm">{activeConnector.url}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {activeConnector.envPrefix && (
                                            <Badge variant="outline" className="relative z-10 bg-background/50 backdrop-blur-sm border-primary/20 text-primary py-1.5 px-3 gap-2 shrink-0 rounded-full font-mono font-semibold">
                                                <Variable className="h-3.5 w-3.5" />
                                                Prefix: {activeConnector.envPrefix}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Connector Databases Grid */}
                                    <ScrollArea className="flex-1 z-10 w-full">
                                        <div className="p-6 md:p-8">
                                            <div className="flex items-center gap-2 mb-6">
                                                <Database className="h-5 w-5 text-primary" />
                                                <h4 className="text-base font-bold uppercase tracking-wider text-white">Configured Databases</h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                                            
                                            {/* Existing DB Mappings */}
                                            {activeConnector.databases && Object.entries(activeConnector.databases).map(([alias, config]) => (
                                                <div key={alias} className="group/db flex flex-col justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors h-full">
                                                    <div className="flex flex-col gap-3 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <span 
                                                                title={alias}
                                                                className="font-bold text-xs font-mono bg-primary/10 border border-primary/30 text-primary px-2.5 py-1 rounded-lg tracking-tight truncate min-w-0 max-w-full"
                                                            >
                                                                {alias}
                                                            </span>
                                                            <Badge variant="secondary" className={cn(
                                                                "text-[10px] h-5 px-2 uppercase font-bold tracking-widest shrink-0 mt-0.5",
                                                                config.type === 'postgres' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                            )}>
                                                                {config.type || 'mongodb'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Target Database</span>
                                                            <span className="text-sm font-bold font-mono text-foreground truncate">
                                                                {config.dbName}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50 border border-border/50 overflow-hidden">
                                                            <Variable className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                            <code className="text-xs text-muted-foreground font-mono truncate w-full">
                                                                {config.uri}
                                                            </code>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-1.5 text-xs text-foreground bg-background hover:bg-muted"
                                                            onClick={() => copyToClipboard(config.uri, "Variable Name")}
                                                        >
                                                            <Copy className="h-3.5 w-3.5" /> Copy Code
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                                                                >
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete the database mapping for <strong>{alias}</strong> from this connector.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction 
                                                                        onClick={() => handleRemoveDatabase(activeConnector.id, alias)}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add Database Card Trigger */}
                                            <Dialog 
                                                open={openDialogs[activeConnector.id] || false} 
                                                onOpenChange={(open) => {
                                                    setOpenDialogs(prev => ({ ...prev, [activeConnector.id]: open }));
                                                    if (!open) {
                                                        setNewDbInputs(prev => ({
                                                            ...prev,
                                                            [activeConnector.id]: { uri: "", dbName: "", type: "mongodb" }
                                                        }));
                                                    }
                                                }}
                                            >
                                                <DialogTrigger asChild>
                                                    <button className="flex flex-col items-center justify-center gap-4 p-5 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all text-primary cursor-pointer min-h-[220px] h-full">
                                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
                                                            <Plus className="h-6 w-6" />
                                                        </div>
                                                        <div className="text-center space-y-1">
                                                            <div className="font-bold text-sm">Add Mapping</div>
                                                            <div className="text-xs text-muted-foreground font-medium">New database route</div>
                                                        </div>
                                                    </button>
                                                </DialogTrigger>
                                                
                                                {/* Glassmorphism / Claymorphism / Noise Modal */}
                                                <DialogContent className="sm:max-w-[500px] border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),_inset_0_-2px_10px_rgba(0,0,0,0.5),_0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-3xl bg-neutral-900/60 overflow-hidden !rounded-3xl p-0 dark:border-white/10 dark:bg-black/60">
                                                    
                                                    {/* Noise Texture Layer */}
                                                    <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                                                    
                                                    {/* Ambient Glow */}
                                                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/30 rounded-full blur-[80px] pointer-events-none" />
                                                    
                                                    {/* Modal Inner Content */}
                                                    <div className="relative z-10 p-7 md:p-9 space-y-7">
                                                        <DialogHeader className="text-left space-y-2">
                                                            <DialogTitle className="text-2xl font-black text-white flex items-center gap-2.5 drop-shadow-md">
                                                                <Database className="h-6 w-6 text-primary" /> Map Database Route
                                                            </DialogTitle>
                                                            <DialogDescription className="text-white/70 text-sm font-medium">
                                                                Map an environment variable URI to an internal database name for <strong className="text-white">{activeConnector.name}</strong>.
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <div className="grid gap-6">
                                                            <div className="grid gap-2.5">
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-[11px] font-bold uppercase tracking-widest text-white/90 drop-shadow-sm">
                                                                        URI Variable Name
                                                                    </label>
                                                                    <div className="group/tooltip relative">
                                                                        <Info className="h-3.5 w-3.5 text-white/50 cursor-help" />
                                                                        <div className="absolute bottom-full right-0 mb-2 w-56 p-2.5 bg-background text-foreground text-xs leading-relaxed rounded-xl shadow-xl border border-border opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                                                            Exact Vercel environment variable name that holds the connection string (e.g. MONGODB_URI_PROD).
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="relative">
                                                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                                                                        <Variable className="h-4 w-4" />
                                                                    </div>
                                                                    <Input
                                                                        placeholder="e.g. MONGODB_URI_PRODUCTION"
                                                                        className="h-12 pl-10 bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary focus-visible:border-primary shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] rounded-xl font-mono text-sm"
                                                                        value={newDbInputs[activeConnector.id]?.uri || ""}
                                                                        onChange={e => handleInputChange(activeConnector.id, 'uri', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid gap-2.5">
                                                                <label className="text-[11px] font-bold uppercase tracking-widest text-white/90 drop-shadow-sm">DB Engine</label>
                                                                <Select
                                                                    value={newDbInputs[activeConnector.id]?.type || "mongodb"}
                                                                    onValueChange={val => handleInputChange(activeConnector.id, 'type', val)}
                                                                >
                                                                    <SelectTrigger className="h-12 text-sm bg-black/20 border-white/10 text-white focus:ring-primary focus:border-primary shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] rounded-xl">
                                                                        <SelectValue placeholder="Engine" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10">
                                                                        <SelectItem value="mongodb">MongoDB</SelectItem>
                                                                        <SelectItem value="postgres">PostgreSQL</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="grid gap-2.5">
                                                                <label className="text-[11px] font-bold uppercase tracking-widest text-white/90 drop-shadow-sm">Target DB Name</label>
                                                                <Input
                                                                    placeholder="e.g. main_db"
                                                                    className="h-12 bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary focus-visible:border-primary shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] rounded-xl text-sm"
                                                                    value={newDbInputs[activeConnector.id]?.dbName || ""}
                                                                    onChange={e => handleInputChange(activeConnector.id, 'dbName', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="pt-4">
                                                            <Button
                                                                onClick={() => handleAddDatabase(activeConnector.id)}
                                                                className="h-14 w-full font-bold text-sm tracking-wide shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),_0_0_20px_rgba(82,39,255,0.4)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),_0_0_30px_rgba(82,39,255,0.6)] gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border border-white/20 transition-all rounded-xl relative overflow-hidden group"
                                                            >
                                                                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300 pointer-events-none" />
                                                                <Plus className="h-4 w-4 relative z-10" /> 
                                                                <span className="relative z-10">Map Database Route</span>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                        </div>
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
}
