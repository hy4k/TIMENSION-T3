
import React, { useState, useEffect, useRef } from 'react';
import { OldPaperTexture } from './components/OldPaperTexture';
import { Navigation } from './components/Navigation';
import { SectionHeader } from './components/SectionHeader';
import { generateDailyHeadline, chatWithMentor, hasGlobalApiKey, simulateAlternateHistory, generateVintageMap, generateLocationTrivia, generateHistoricalPhotos, generateImage, testApiKey, setManualApiKey } from './services/geminiService';
import { AppSection, NewsArticle, Mentor, ChatMessage, TravelerProfile, AlternateHistoryResult, PivotPoint, ChronoscopeData } from './types';
import { Send, RefreshCw, ArrowRight, Star, ArrowLeft, History, ShieldAlert, Stamp, Zap, User, Briefcase, Gem, Feather, X, Radio, CheckCircle, Settings, LogOut, Compass, Globe, Timer, Search, Sparkles, MessageSquare, Clock, MapPin, AlertTriangle, Radar, ExternalLink, Map, Camera, BookOpen } from 'lucide-react';

// Type declaration for AI Studio window object
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        aistudio?: AIStudio;
    }
}

// --- Helper Components ---

// Dynamically Generates an Image via API if no source is provided
const AsyncImage: React.FC<{ prompt: string; alt: string; className?: string; aspectRatio?: string }> = ({ prompt, alt, className, aspectRatio = "1:1" }) => {
    const [src, setSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchImage = async () => {
            setLoading(true);
            // Verify we have an API key before trying to generate
            if (!hasGlobalApiKey() && !window.aistudio) {
                setLoading(false);
                return;
            }

            try {
                const url = await generateImage(prompt, aspectRatio);
                if (mounted && url) setSrc(url);
            } catch (e) {
                console.error("AsyncImage generation error", e);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchImage();
        return () => { mounted = false; };
    }, [prompt, aspectRatio]);

    return (
        <div className={`relative overflow-hidden bg-[#d6cdae] ${className}`}>
            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper/50 z-10">
                    <RefreshCw className="animate-spin text-ink opacity-50" size={24} />
                </div>
            )}
            {src ? (
                <img src={src} alt={alt} className="w-full h-full object-cover filter sepia-[0.5] contrast-125 grayscale-[0.2]" />
            ) : (
                !loading && (
                    <div className="w-full h-full flex items-center justify-center bg-ink/10 text-ink/50 font-mono text-xs p-4 text-center border-2 border-dashed border-ink/30">
                        <span className="opacity-50">{alt}</span>
                    </div>
                )
            )}
        </div>
    );
};


// --- Sub-Components ---

// 0. LOGIN VIEW (Redesigned as Authentic Newspaper Front Page)
const LoginView: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [apiKeySet, setApiKeySet] = useState(false);
    const [isGlobalKey, setIsGlobalKey] = useState(false);
    const [showKeyInput, setShowKeyInput] = useState(false);
    const [manualKey, setManualKeyInput] = useState('');

    useEffect(() => {
        const checkKey = async () => {
            if (hasGlobalApiKey()) {
                setIsGlobalKey(true);
                setApiKeySet(true);
            } else if (window.aistudio) {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySet(hasKey);
            }
        };
        checkKey();
    }, []);

    const handleApiKeySelect = async () => {
        if (isGlobalKey) return;
        if (window.aistudio) {
            try {
                await window.aistudio.openSelectKey();
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySet(hasKey);
            } catch (e) {
                console.error("Key selection failed", e);
            }
        } else {
            setShowKeyInput(!showKeyInput);
        }
    };

    const saveManualKey = () => {
        if (!manualKey.trim()) return;
        setManualApiKey(manualKey);
        setApiKeySet(true);
        setShowKeyInput(false);
    };

    const handleLogin = async () => {
        if (!apiKeySet) {
            alert("TELEGRAPH ERROR: Connection key required.");
            return;
        }
        setLoading(true);

        // Perform Real API Handshake to Verify Billing/Connection
        const isConnected = await testApiKey();

        if (isConnected) {
            onLogin();
        } else {
            alert("TELEGRAPH LINE DEAD: The API Key provided is invalid, expired, or has insufficient billing permissions. Please check your deployment settings.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-dvh bg-paper flex flex-col items-center py-8 px-4 relative z-50">
            {/* Newspaper Header */}
            <div className="max-w-4xl w-full border-b-4 border-double border-ink pb-4 text-center">
                <div className="flex justify-between items-end border-b-2 border-ink pb-2 mb-3">
                    <span className="font-mono text-xs uppercase font-bold text-ink">Vol. I - No. 1</span>
                    <span className="font-mono text-xs uppercase font-bold text-ink">Special Edition: 1925</span>
                    <span className="font-mono text-xs uppercase font-bold text-ink">Price: Two Cents</span>
                </div>
                <h1 className="font-serif text-6xl md:text-9xl font-black uppercase text-ink tracking-tight leading-[0.8] scale-y-110 mb-4">
                    Timension
                </h1>
                <div className="border-t-2 border-b border-ink py-1">
                    <p className="font-serif italic text-lg text-ink font-bold tracking-widest uppercase">
                        "The Only Chronicle That Prints Tomorrow's News Today"
                    </p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 mt-6">

                {/* Left Column (News) */}
                <div className="md:col-span-3 hidden md:block border-r border-ink pr-6 text-justify">
                    <h3 className="font-serif text-2xl font-bold uppercase leading-none mb-2 border-b border-ink pb-1">Weather Anomaly</h3>
                    <p className="font-body text-sm leading-tight text-ink/90 mb-4">
                        <span className="font-bold float-left text-3xl mr-1 leading-[0.8]">M</span>eteorologists are baffled by sudden chronometric fluctuations. Winds from the future are expected to reach gale force by evening.
                    </p>
                    <h3 className="font-serif text-2xl font-bold uppercase leading-none mb-2 border-b border-ink pb-1 pt-4">Stock Market</h3>
                    <ul className="font-mono text-xs leading-relaxed">
                        <li className="flex justify-between"><span>Telegraph Co.</span> <span>+12%</span></li>
                        <li className="flex justify-between"><span>Steam Engines</span> <span>-4%</span></li>
                        <li className="flex justify-between"><span>Aether Corp.</span> <span>+55%</span></li>
                    </ul>
                </div>

                {/* Center Column (Headline + Login Form) */}
                <div className="md:col-span-6 flex flex-col items-center">
                    <h2 className="font-serif text-4xl md:text-5xl font-black uppercase leading-[0.9] mb-8 text-ink text-center">
                        TIME BARRIER BREACHED!
                    </h2>

                    {/* The Centerpiece Login Form */}
                    <div className="w-full max-w-md border-[6px] border-double border-ink p-6 bg-[#fdf6e3] shadow-[12px_12px_0px_0px_rgba(43,34,24,0.8)] transform -rotate-1 relative mb-8 hover:rotate-0 transition-transform duration-300">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-ink text-paper px-6 py-1 font-mono text-sm font-bold uppercase z-10 tracking-widest border border-white">
                            Official Traveler Visa
                        </div>

                        <div className="text-center mb-6 mt-2 border-b border-ink/20 pb-4">
                            <h3 className="font-sans font-black text-3xl uppercase leading-none">Access Grant</h3>
                            <p className="font-mono text-[10px] uppercase tracking-widest mt-1">Authorized Personnel Only</p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="font-mono text-[10px] uppercase font-bold block mb-1 text-left">Traveler Identity</label>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-paper border-b-2 border-ink font-serif text-2xl p-2 focus:outline-none placeholder:text-ink/20 text-center"
                                    placeholder="Enter Name"
                                />
                            </div>

                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className="w-full bg-ink text-paper py-4 font-mono font-bold uppercase text-base hover:bg-alert-red transition-all flex items-center justify-center gap-3 shadow-lg active:translate-y-1 active:shadow-none"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Stamp size={18} />}
                                Verify Stamp & Enter
                            </button>
                        </div>

                        <div className="mt-4 pt-2 text-center opacity-50">
                            <p className="font-mono text-[8px] uppercase">
                                Class 4 Temporal Clearance Required
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column (Supporting Story + Ad) */}
                <div className="md:col-span-3 border-l-0 md:border-l border-ink pl-0 md:pl-6 flex flex-col">
                    <div className="mb-6">
                        <h3 className="font-serif text-xl font-bold uppercase mb-2 border-b border-ink pb-1">The Gateway Open</h3>
                        <p className="font-body text-sm text-justify leading-snug">
                            <span className="drop-cap text-3xl">S</span>cientists have confirmed the bridge between 1924 and 2025 is stable.
                            Citizens wishing to converse with future entities or explore historical divergences must present the visa in the center column immediately.
                        </p>
                    </div>

                    {/* Filler Ad */}
                    <div className="mt-auto border-4 border-ink p-4 text-center hidden md:block opacity-80 bg-paper-light rotate-2">
                        <h4 className="font-serif font-black uppercase text-xl mb-1">Dr. Z's Tonic</h4>
                        <p className="font-serif italic text-sm mb-2">"Cures Time Lag Instantly!"</p>
                        <div className="font-mono text-xs font-bold border-t border-ink pt-1">Sold at all Apothecaries</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 0.5 TRAVELER'S VAULT (Static Profile)
const TravelerVault: React.FC<{ isOpen: boolean; onClose: () => void; userEmail: string; onLogout: () => void }> = ({ isOpen, onClose, userEmail, onLogout }) => {
    const profile: TravelerProfile = {
        email: userEmail || "Time Traveler",
        stats: {
            rank: "Chrono-Captain",
            centuriesTraversed: 42,
            paradoxesCaused: 0,
            artifactsFound: 12,
            majorDiscoveries: 7,
            joinDate: "1924-10-12"
        },
        inventory: [
            'The Lost Key of Alexandria',
            'Da Vinci\'s Clockwork Bird',
            'Press Badge'
        ]
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#f0e6d2] w-full max-w-lg h-[80vh] border-4 border-double border-ink shadow-2xl relative flex flex-col overflow-hidden">

                <div className="bg-ink text-paper p-4 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                        <Briefcase className="text-vintage-gold" />
                        <div>
                            <h2 className="font-serif text-2xl font-bold leading-none">Traveler's Dossier</h2>
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">Classified</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:text-alert-red transition-colors"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 relative">
                    <OldPaperTexture />
                    {/* Profile Content (Same as before) */}
                    <div className="flex gap-4 mb-8 border-b-2 border-ink pb-6">
                        <div className="w-24 h-32 bg-gray-300 border-2 border-ink shadow-md p-1 relative rotate-[-2deg]">
                            <div className="w-full h-full bg-ink/10 flex flex-col items-center justify-center">
                                <User size={40} className="text-ink/50" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="font-mono text-[10px] uppercase text-ink block font-bold">Agent Name</label>
                            <p className="font-serif text-xl font-bold border-b border-dotted border-ink mb-2 truncate text-ink">{profile.email}</p>
                            <label className="font-mono text-[10px] uppercase text-ink block font-bold">Current Rank</label>
                            <p className="font-serif text-lg italic text-sepia-accent font-bold mb-2">{profile.stats.rank}</p>
                        </div>
                    </div>
                    {/* Logout */}
                    <button onClick={onLogout} className="w-full border-2 border-ink py-3 font-mono uppercase text-xs font-bold hover:bg-alert-red hover:text-paper transition-colors flex items-center justify-center gap-2 group text-ink">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

// 1. DASHBOARD & CHRONICLE
const DashboardView: React.FC = () => {
    const [viewMode, setViewMode] = useState<'DASHBOARD' | 'NEWSPAPER'>('DASHBOARD');
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [loadingNews, setLoadingNews] = useState(false);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchHeadline = async () => {
        setLoadingNews(true);
        setViewMode('NEWSPAPER');
        const data = await generateDailyHeadline();
        setArticle(data);
        setLoadingNews(false);
    };

    if (viewMode === 'NEWSPAPER') {
        return (
            <div className="p-4 max-w-4xl mx-auto space-y-8 pb-24 animate-in slide-in-from-right duration-500">
                <button onClick={() => setViewMode('DASHBOARD')} className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-ink hover:text-sepia-accent mb-4">
                    <ArrowLeft size={16} /> Return to Command Deck
                </button>

                <div className="border-b-4 border-double border-ink mb-6 pb-2 text-center relative bg-paper shadow-lg p-4">
                    <div className="flex justify-between items-center border-b border-ink pb-1 mb-2 px-2">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-ink">Vol. XCVIII</span>
                        <span className="font-serif italic text-xs text-ink">The Voice of History</span>
                    </div>
                    <h1 className="font-serif text-5xl md:text-8xl font-black text-ink uppercase tracking-tighter leading-[0.85] mb-4 scale-y-110">Timension</h1>
                    <div className="border-t-2 border-b-2 border-ink py-1 flex justify-between px-4 items-center bg-paper-dark/30">
                        <span className="font-serif font-bold uppercase text-sm text-ink">{article?.date || "CALCULATING DATE..."}</span>
                        <span className="font-serif font-bold uppercase text-sm text-ink">{article?.weather || "..."}</span>
                    </div>
                </div>

                {loadingNews ? (
                    <div className="h-96 flex flex-col items-center justify-center font-mono animate-pulse text-sepia-accent space-y-4 border-4 border-dashed border-ink/20 bg-paper/50">
                        <RefreshCw className="animate-spin" size={48} />
                        <span className="text-xl tracking-widest">DECODING SIGNAL...</span>
                    </div>
                ) : (
                    <div className="bg-paper p-2 animate-in fade-in duration-700">
                        <div className="text-center mb-8 border-b-2 border-black pb-6">
                            <h2 className="font-serif text-4xl md:text-6xl font-black leading-[0.9] mb-4 uppercase tracking-tight text-ink drop-shadow-sm">{article?.headline}</h2>
                        </div>
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/2 order-2 md:order-1">
                                <div className="w-full border-4 border-ink p-2 bg-white mb-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-[-1deg]">
                                    <div className="relative w-full h-64 md:h-80 bg-gray-300 overflow-hidden">
                                        <img src={article?.imageUrl} alt="Historical Event" className="w-full h-full object-cover filter sepia-[0.3] contrast-125 grayscale-[100%]" />
                                    </div>
                                </div>
                            </div>
                            <div className="md:w-1/2 order-1 md:order-2 flex flex-col justify-between">
                                <p className="font-body text-xl leading-relaxed text-justify drop-cap-parent text-ink first-letter:text-6xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] first-letter:font-serif">
                                    {article?.content}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default Dashboard
    return (
        <div className="p-4 max-w-4xl mx-auto pb-24 h-[calc(100vh-80px)] flex flex-col justify-center items-center">
            <div className="w-full max-w-lg bg-[#f0e6d2] border-4 border-ink p-6 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <Compass size={300} className="text-ink" />
                </div>
                <div className="relative z-10 text-center space-y-8">
                    <div>
                        <h2 className="font-mono text-xs uppercase tracking-[0.4em] text-ink mb-2">Temporal Command Center</h2>
                        <h1 className="font-serif text-4xl md:text-5xl font-black uppercase text-ink leading-none">Status: Online</h1>
                    </div>
                    <div className="flex justify-center gap-8 border-y border-ink py-4">
                        <div className="text-center">
                            <span className="font-mono text-[10px] uppercase block text-ink/60">Local Time</span>
                            <span className="font-mono text-xl font-bold text-ink tabular-nums">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="text-center">
                            <span className="font-mono text-[10px] uppercase block text-ink/60">Current Era</span>
                            <span className="font-mono text-xl font-bold text-ink">{time.getFullYear()} AD</span>
                        </div>
                    </div>
                    <button onClick={fetchHeadline} className="w-full bg-ink text-paper py-5 px-6 font-serif text-xl font-bold uppercase tracking-widest hover:bg-sepia-accent transition-all hover:scale-[1.02] shadow-[4px_4px_0px_0px_rgba(50,50,50,1)] flex items-center justify-center gap-3">
                        <Feather className="w-5 h-5" /> Materialize Chronicle
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. CHRONOSCOPE
const Chronoscope: React.FC = () => {
    const [locationInput, setLocationInput] = useState("");
    const [data, setData] = useState<ChronoscopeData | null>(null);
    const [view, setView] = useState<'INPUT' | 'MENU' | 'MAP' | 'TRIVIA' | 'PHOTOS'>('INPUT');
    const [loading, setLoading] = useState(false);

    // Handlers
    const handleSetLocation = () => {
        if (!locationInput.trim()) return;
        setData({ location: locationInput });
        setView('MENU');
    };

    const handleLoadMap = async () => {
        if (!data?.location) return;
        setLoading(true);
        setView('MAP');
        if (!data.vintageMapUrl) {
            const mapUrl = await generateVintageMap(data.location);
            setData(prev => prev ? ({ ...prev, vintageMapUrl: mapUrl || undefined }) : null);
        }
        setLoading(false);
    };

    const handleLoadTrivia = async () => {
        if (!data?.location) return;
        setLoading(true);
        setView('TRIVIA');
        if (!data.trivia) {
            const facts = await generateLocationTrivia(data.location);
            setData(prev => prev ? ({ ...prev, trivia: facts }) : null);
        }
        setLoading(false);
    };

    const handleLoadPhotos = async () => {
        if (!data?.location) return;
        setLoading(true);
        setView('PHOTOS');
        if (!data.historicalPhotos) {
            const photos = await generateHistoricalPhotos(data.location);
            setData(prev => prev ? ({ ...prev, historicalPhotos: photos }) : null);
        }
        setLoading(false);
    };

    const reset = () => {
        setData(null);
        setLocationInput("");
        setView('INPUT');
    };

    // INPUT VIEW
    if (view === 'INPUT') {
        return (
            <div className="p-4 max-w-3xl mx-auto pb-24 h-[calc(100vh-80px)] flex flex-col items-center justify-center">
                <SectionHeader title="Chronoscope" subtitle="Select Temporal Coordinates" />
                <div className="w-full max-w-lg space-y-6 animate-in zoom-in duration-500">
                    <div className="bg-paper border-4 border-ink p-8 shadow-2xl relative">
                        <label className="font-mono text-xs uppercase font-bold text-ink mb-2 block tracking-widest">Destination Name</label>
                        <div className="flex border-b-4 border-ink pb-2 mb-6">
                            <MapPin className="text-ink mr-3" size={28} />
                            <input
                                type="text"
                                value={locationInput}
                                onChange={(e) => setLocationInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSetLocation()}
                                placeholder="e.g. Paris, The Colosseum..."
                                className="bg-transparent w-full font-serif text-3xl font-bold text-ink placeholder:text-ink/30 focus:outline-none"
                            />
                        </div>
                        <button onClick={handleSetLocation} disabled={!locationInput.trim()} className="w-full bg-ink text-paper py-4 font-mono font-bold uppercase text-lg tracking-widest hover:bg-sepia-accent transition-all shadow-[4px_4px_0px_0px_rgba(50,50,50,1)] active:translate-y-1 active:shadow-none">
                            Lock Coordinates
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // MENU VIEW
    if (view === 'MENU') {
        return (
            <div className="p-4 max-w-3xl mx-auto pb-24 min-h-[calc(100vh-80px)] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={reset} className="font-mono text-xs font-bold uppercase flex items-center gap-2 hover:text-sepia-accent transition-colors">
                        <ArrowLeft size={16} /> New Destination
                    </button>
                    <h2 className="font-serif text-2xl font-black uppercase underline decoration-double">{data?.location}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 items-center">
                    <button onClick={handleLoadMap} className="h-64 border-4 border-ink bg-[#f0e6d2] p-4 flex flex-col items-center justify-center gap-4 hover:-translate-y-2 hover:shadow-xl transition-all group relative overflow-hidden">
                        <Map size={48} className="text-ink group-hover:scale-110 transition-transform" />
                        <div className="text-center relative z-10">
                            <h3 className="font-serif text-xl font-bold uppercase leading-none mb-1">Cartography</h3>
                            <span className="font-mono text-[10px] uppercase tracking-widest">View 1920s Map</span>
                        </div>
                    </button>
                    <button onClick={handleLoadTrivia} className="h-64 border-4 border-ink bg-[#f0e6d2] p-4 flex flex-col items-center justify-center gap-4 hover:-translate-y-2 hover:shadow-xl transition-all group relative overflow-hidden">
                        <BookOpen size={48} className="text-ink group-hover:scale-110 transition-transform" />
                        <div className="text-center relative z-10">
                            <h3 className="font-serif text-xl font-bold uppercase leading-none mb-1">Intel</h3>
                            <span className="font-mono text-[10px] uppercase tracking-widest">Secret History</span>
                        </div>
                    </button>
                    <button onClick={handleLoadPhotos} className="h-64 border-4 border-ink bg-[#f0e6d2] p-4 flex flex-col items-center justify-center gap-4 hover:-translate-y-2 hover:shadow-xl transition-all group relative overflow-hidden">
                        <Camera size={48} className="text-ink group-hover:scale-110 transition-transform" />
                        <div className="text-center relative z-10">
                            <h3 className="font-serif text-xl font-bold uppercase leading-none mb-1">Visuals</h3>
                            <span className="font-mono text-[10px] uppercase tracking-widest">Time Travel Photos</span>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    // CONTENT VIEWS
    return (
        <div className="p-4 max-w-3xl mx-auto pb-24 min-h-[calc(100vh-80px)]">
            <button onClick={() => setView('MENU')} className="mb-6 font-mono text-xs font-bold uppercase flex items-center gap-2 hover:text-sepia-accent transition-colors">
                <ArrowLeft size={16} /> Back to Menu
            </button>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-96 space-y-4">
                    <RefreshCw className="animate-spin text-ink" size={48} />
                    <p className="font-mono text-xs uppercase tracking-widest animate-pulse">Retrieving Archives...</p>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* MAP */}
                    {view === 'MAP' && (
                        <div className="bg-paper border-4 border-double border-ink p-2 shadow-2xl rotate-1">
                            <h2 className="font-serif text-2xl text-center font-bold uppercase mb-2">Survey Map: {data?.location} (c. 1920)</h2>
                            <div className="aspect-square bg-[#e6dbc4] relative overflow-hidden border-2 border-ink">
                                {data?.vintageMapUrl ? (
                                    <img src={data.vintageMapUrl} alt="Vintage Map" className="w-full h-full object-cover sepia contrast-125" />
                                ) : (
                                    <div className="flex items-center justify-center h-full font-mono text-xs text-alert-red">[MAP GENERATION FAILED - CHECK API]</div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* TRIVIA */}
                    {view === 'TRIVIA' && (
                        <div className="space-y-6">
                            {data?.trivia?.map((fact, i) => (
                                <div key={i} className="bg-white border-2 border-ink p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] relative">
                                    <span className="absolute -top-3 -left-2 bg-ink text-paper font-mono text-xs px-2 py-1 font-bold">FACT #{i + 1}</span>
                                    <p className="font-body text-xl leading-relaxed text-ink/90">{fact}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* PHOTOS */}
                    {view === 'PHOTOS' && (
                        <div className="space-y-8">
                            {data?.historicalPhotos?.length ? data.historicalPhotos.map((photo, i) => (
                                <div key={i} className={`bg-white p-3 border-2 border-ink shadow-lg ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'} transition-transform hover:rotate-0 hover:z-10`}>
                                    <div className="aspect-[4/3] bg-gray-200 overflow-hidden relative mb-2">
                                        <img src={photo} alt={`Historical view ${i + 1}`} className="w-full h-full object-cover grayscale contrast-125" />
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center font-mono text-alert-red">UNABLE TO DEVELOP PHOTOS - CHECK API KEY</div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// 3. MENTOR CHAT
const MentorChat: React.FC = () => {
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const mentors: Mentor[] = [
        {
            id: 'einstein', name: 'Albert Einstein', role: 'Physics', era: '1921', avatar: 'E',
            imageUrl: '', // Generated via AsyncImage
            bio: 'The eccentric genius who dared to bend time itself.',
            systemPrompt: 'You are Einstein.',
            greeting: "Greetings from 1921! I must know—in your year 2025, have you finally unified gravity and electromagnetism?"
        },
        {
            id: 'sarojini', name: 'Sarojini Naidu', role: 'Politics & Poetry', era: '1930', avatar: 'S',
            imageUrl: '', // Generated via AsyncImage
            bio: 'The Nightingale of India. A voice of fire and grace in the struggle for freedom.',
            systemPrompt: 'You are Sarojini Naidu.',
            greeting: "Namaste, traveler. I speak to you from a time of great struggle. Does the sun of freedom shine brightly in your time?"
        },
        {
            id: 'buddha', name: 'Gautama Buddha', role: 'Philosophy', era: '500 BCE', avatar: 'B',
            imageUrl: '',
            bio: 'The Awakened One. Teacher of the Middle Way and the path to enlightenment.',
            systemPrompt: 'You are Gautama Buddha. Speak with infinite compassion, calm, and wisdom. Use metaphors from nature. Focus on mindfulness, suffering, and the present moment.',
            greeting: "Peace be with you. You travel through time, yet the mind often wanders furthest. What truth do you seek in this moment?"
        },
        {
            id: 'hitler', name: 'Adolf Hitler', role: 'Leader of Germany', era: '1940', avatar: 'H',
            imageUrl: '',
            bio: 'Chancellor of Germany. A figure of immense historical consequence and tyranny.',
            systemPrompt: 'You are Adolf Hitler from the 1940s. You are speaking to a student from the future. Answer questions about your time and actions from your perspective. Do not violate safety guidelines, but maintain the historical persona.',
            greeting: "The telegraph brings news from the future? Impossible. Tell me, does the Reich stand eternal in your time?"
        }
    ];

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        if (selectedMentor) {
            setMessages([{
                id: 'init',
                sender: 'ai',
                text: selectedMentor.greeting,
                timestamp: Date.now()
            }]);
        }
    }, [selectedMentor]);

    const handleSend = async () => {
        if (!input.trim() || !selectedMentor) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const reply = await chatWithMentor(selectedMentor.name, selectedMentor.era, messages, userMsg.text);
        const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', text: reply, timestamp: Date.now() };
        setMessages(prev => [...prev, aiMsg]);
        setLoading(false);
    };

    // Helper for generating specific image prompts
    const getMentorImagePrompt = (mentor: Mentor) => {
        if (mentor.id === 'sarojini') return "Authentic vintage photograph of Sarojini Naidu in the 1930s, indian freedom fighter, poet, black and white portrait, high quality";
        if (mentor.id === 'buddha') return "Ancient statue or painting of Gautama Buddha, stone texture, vintage photography style, spiritual atmosphere, golden light";
        if (mentor.id === 'hitler') return "Historical portrait of Adolf Hitler, 1940s, military uniform, vintage black and white newspaper photo";
        return `Portrait of ${mentor.name}, ${mentor.era}, vintage photography, historical figure`;
    };

    const getMentorFacePrompt = (mentor: Mentor) => {
        if (mentor.id === 'sarojini') return "Sarojini Naidu vintage portrait face only";
        if (mentor.id === 'buddha') return "Face of Gautama Buddha statue, vintage style, close up";
        if (mentor.id === 'hitler') return "Adolf Hitler face only, vintage 1940s photo";
        return `Portrait of ${mentor.name}, face only`;
    }

    if (!selectedMentor) {
        return (
            <div className="p-4 max-w-3xl mx-auto pb-24">
                <SectionHeader title="Great Minds Gallery" subtitle="Establish a Neural Link" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mentors.map(mentor => (
                        <div key={mentor.id} onClick={() => { setSelectedMentor(mentor); }}
                            className="relative group cursor-pointer overflow-hidden border-4 border-ink bg-paper shadow-xl hover:-translate-y-2 transition-all duration-300">
                            <div className="h-64 overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-700">
                                <AsyncImage
                                    prompt={getMentorImagePrompt(mentor)}
                                    alt={mentor.name}
                                    className="w-full h-full"
                                    aspectRatio="4:3"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
                                <div className="absolute bottom-0 left-0 p-4 text-paper">
                                    <h3 className="font-serif text-3xl font-bold leading-none mb-1">{mentor.name}</h3>
                                    <p className="font-mono text-[10px] uppercase tracking-widest text-vintage-gold">{mentor.era} • {mentor.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-3xl mx-auto pb-24 h-[calc(100vh-80px)] flex flex-col pt-4">
            <div className="flex items-center gap-4 border-b-4 border-double border-ink pb-4 mb-2 bg-[#fdf6e3] z-20 shadow-sm px-2">
                <button onClick={() => setSelectedMentor(null)} className="p-2 border border-ink hover:bg-ink hover:text-paper rounded-full transition-colors">
                    <ArrowLeft size={16} />
                </button>
                <div className="w-14 h-14 rounded-full border-2 border-ink overflow-hidden shrink-0">
                    <AsyncImage
                        prompt={getMentorFacePrompt(selectedMentor)}
                        alt={selectedMentor.name}
                        className="w-full h-full"
                    />
                </div>
                <div>
                    <h3 className="font-serif font-black text-2xl text-ink leading-none">{selectedMentor.name}</h3>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 p-4 border-x-4 border-ink bg-[#e6dbc4] relative shadow-inner" ref={scrollRef}>
                <OldPaperTexture />
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex relative z-10 animate-in slide-in-from-bottom-2 duration-500 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' ? (
                            <div className="max-w-[85%] bg-[#fdf6e3] border border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] p-5 relative rotate-[-1deg]">
                                <p className="font-mono text-sm leading-relaxed text-ink/90 whitespace-pre-wrap font-medium">{msg.text}</p>
                            </div>
                        ) : (
                            <div className="max-w-[85%] bg-white border border-gray-300 shadow-md p-4 relative rotate-[1deg]">
                                <p className="font-body text-xl leading-snug text-ink-light">{msg.text}</p>
                            </div>
                        )}
                    </div>
                ))}
                {loading && <div className="text-center font-mono text-xs uppercase animate-pulse">Waiting for reply...</div>}
            </div>

            <div className="mt-4 relative z-20">
                <div className="bg-paper border-4 border-ink p-1 flex gap-2 shadow-lg">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent p-3 font-body text-xl placeholder:text-ink/30 focus:outline-none text-ink"
                    />
                    <button onClick={handleSend} className="bg-ink text-paper px-6 hover:bg-sepia-accent transition-colors"><Send size={24} /></button>
                </div>
            </div>
        </div>
    );
};

// 4. SIMULATION
const Simulation: React.FC = () => {
    const [result, setResult] = useState<AlternateHistoryResult | null>(null);
    const [calculating, setCalculating] = useState(false);
    const [selectedPivot, setSelectedPivot] = useState<PivotPoint | null>(null);
    const [customInput, setCustomInput] = useState("");

    const pivots: PivotPoint[] = [
        { id: 'titanic', event: 'Sinking of the Titanic', year: '1912', originalOutcome: 'Ship sinks, safety regulations change.', image: '' },
        { id: 'bunker', event: 'The Berlin Bunker', year: '1945', originalOutcome: 'Hitler commits suicide.', image: '' },
    ];

    const handleSimulate = async () => {
        if (!selectedPivot || !customInput) return;
        setCalculating(true);
        setResult(null);
        const simResult = await simulateAlternateHistory(selectedPivot.event, selectedPivot.originalOutcome, customInput);
        setResult(simResult);
        setCalculating(false);
    };

    return (
        <div className="p-4 max-w-3xl mx-auto pb-24">
            <SectionHeader title="Simulation Engine" subtitle="What If...?" />

            {!result ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="newspaper-border p-4 bg-paper">
                        <h3 className="font-mono text-xs font-bold uppercase mb-4 text-ink">Step 1: Select Event</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {pivots.map(p => (
                                <div key={p.id} onClick={() => setSelectedPivot(p)}
                                    className={`cursor-pointer border-2 p-2 transition-all group ${selectedPivot?.id === p.id ? 'border-alert-red bg-alert-red/5' : 'border-ink'}`}>
                                    <div className="h-24 w-full bg-gray-300 mb-2 overflow-hidden filter grayscale">
                                        {/* DYNAMIC PIVOT IMAGE */}
                                        <AsyncImage
                                            prompt={p.id === 'titanic' ? 'RMS Titanic sinking 1912 vintage photo' : 'Berlin Bunker ruins 1945 vintage photo'}
                                            alt={p.event}
                                            className="w-full h-full"
                                            aspectRatio="16:9"
                                        />
                                    </div>
                                    <h4 className="font-serif font-bold text-sm text-ink">{p.event}</h4>
                                    <span className="font-mono text-[10px] text-ink/60">{p.year}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedPivot && (
                        <div className="newspaper-border p-4 bg-paper animate-in slide-in-from-bottom-4">
                            <h3 className="font-mono text-xs font-bold uppercase mb-2 text-ink">Step 2: Inject Variable</h3>
                            <textarea
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                placeholder="e.g. He escapes via secret tunnel..."
                                className="w-full h-24 border-2 border-ink p-3 font-mono text-sm focus:outline-none bg-white/50 text-ink"
                            />
                            <button onClick={handleSimulate} disabled={calculating || !customInput}
                                className="w-full mt-4 bg-ink text-paper py-4 font-mono font-bold uppercase text-lg hover:bg-sepia-accent transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(44,44,44,1)] active:translate-y-1 active:shadow-none"
                            >
                                {calculating ? (
                                    <>
                                        <RefreshCw className="animate-spin" /> Calculating Ripples...
                                    </>
                                ) : "Simulate Timeline"}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-in zoom-in-95 duration-700">
                    <button onClick={() => setResult(null)} className="mb-6 font-mono text-xs underline text-ink flex items-center gap-1 hover:text-sepia-accent">
                        <ArrowLeft size={12} /> Return to Variables
                    </button>

                    {/* GRAPHICAL TIMELINE VIEW */}
                    <div className="bg-[#f0e6d2] border-4 border-double border-ink shadow-2xl relative overflow-hidden pb-8">
                        <div className="absolute inset-0 border-l-2 border-dashed border-ink left-1/2 transform -translate-x-1/2 opacity-20 pointer-events-none h-full"></div>

                        {/* Headline Image Header */}
                        <div className="w-full h-48 md:h-64 bg-black relative border-b-4 border-ink overflow-hidden group">
                            {result.imageUrl && <img src={result.imageUrl} className="w-full h-full object-cover opacity-90 sepia-[0.3]" alt="Alternate Reality" />}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                            <div className="absolute bottom-4 left-0 right-0 text-center px-4">
                                <div className="inline-block bg-alert-red text-paper px-3 py-1 font-mono text-[10px] uppercase font-bold mb-2 tracking-widest">Timeline Divergence Confirmed</div>
                                <h1 className="font-serif text-2xl md:text-4xl font-black uppercase leading-none text-paper drop-shadow-md">"{result.finalHeadline}"</h1>
                            </div>
                        </div>

                        {/* Graphical Nodes */}
                        <div className="px-6 py-8 relative max-w-2xl mx-auto space-y-12">
                            {result.timelineSteps.map((step, i) => (
                                <div key={i} className="relative flex items-center gap-4 group">
                                    {/* Visual Node */}
                                    <div className="hidden md:flex flex-col items-center w-24 shrink-0">
                                        <div className="w-12 h-12 rounded-full border-4 border-ink bg-paper flex items-center justify-center font-serif font-bold text-xl shadow-lg z-10 group-hover:bg-vintage-gold transition-colors">
                                            {i + 1}
                                        </div>
                                        <div className="font-mono text-[10px] uppercase font-bold mt-2 text-ink/60">
                                            {i === 0 ? '1950s' : i === 1 ? '1980s' : '2025'}
                                        </div>
                                    </div>

                                    {/* Content Card */}
                                    <div className="flex-1 bg-white border-2 border-ink p-5 shadow-[6px_6px_0px_0px_rgba(43,34,24,0.1)] relative rotate-1 transition-transform group-hover:rotate-0">
                                        <div className="absolute -left-2 top-1/2 w-4 h-4 bg-ink transform -translate-y-1/2 rotate-45 hidden md:block"></div>
                                        <h4 className="font-serif font-bold text-lg mb-1 uppercase text-vintage-gold">
                                            {i === 0 ? 'The Immediate Consequence' : i === 1 ? 'The Ripple Effect' : 'The New Present'}
                                        </h4>
                                        <p className="font-body text-lg leading-snug text-ink">{step}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Main App remains largely the same, wrapping components
const App: React.FC = () => {
    const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.HOME);
    const [session, setSession] = useState<any>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = () => {
        setSession(null);
        setCurrentSection(AppSection.HOME);
        setIsProfileOpen(false);
    };

    if (!session) {
        return (
            <div className="min-h-screen w-full bg-paper text-ink font-serif relative overflow-hidden">
                <OldPaperTexture />
                <div className="relative z-10">
                    <LoginView onLogin={() => setSession({ user: { email: 'traveler@timension.com' } })} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-paper text-ink font-serif relative overflow-x-hidden">
            <OldPaperTexture />
            <div className="relative z-10">
                <div className="sticky top-0 bg-paper/95 backdrop-blur-sm z-30 border-b border-ink shadow-sm p-2 flex justify-between items-center px-4 h-16">
                    <div className="w-8"></div>
                    <span className="font-serif font-black text-2xl tracking-tighter text-ink cursor-default">TIMENSION</span>
                    <button onClick={() => setIsProfileOpen(true)} className="w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center hover:bg-vintage-gold/20 transition-colors bg-paper">
                        <User size={20} className="text-ink" />
                    </button>
                </div>
                <main className="pt-4">
                    {currentSection === AppSection.HOME && <DashboardView />}
                    {currentSection === AppSection.CHRONOSCOPE && <Chronoscope />}
                    {currentSection === AppSection.MENTORS && <MentorChat />}
                    {currentSection === AppSection.CHRONICLE && <Simulation />}
                </main>
                <TravelerVault isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} userEmail={session?.user?.email} onLogout={handleLogout} />
                <Navigation currentSection={currentSection} onNavigate={setCurrentSection} />
            </div>
        </div>
    );
};

export default App;
