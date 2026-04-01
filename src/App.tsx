/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Info, 
  Globe, 
  BarChart3, 
  Search, 
  Cpu, 
  FileText, 
  X, 
  Loader2,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  History,
  Camera
} from 'lucide-react';
import { analyzeNews, generateVisualContext, type AnalysisResult } from './services/geminiService';

const TEAM_MEMBERS = [
  { name: "Faiz zaman pasha", id: "245890044" },
  { name: "Akshay Jakkannagari", id: "245890008" },
  { name: "Kondamuri haridhar", id: "245890474" },
  { name: "Challa deepak", id: "245890212" }
];

const RECENT_NEWS = [
  {
    id: 1,
    title: "Global Climate Summit Reaches Historic Agreement on Carbon Credits",
    classification: "REAL",
    image: "https://picsum.photos/seed/summit/800/450",
    date: "2 hours ago",
    category: "Environment"
  },
  {
    id: 2,
    title: "New Mars Colony Footage Leaked by Anonymous Source Claims Life Found",
    classification: "FAKE",
    image: "https://picsum.photos/seed/mars_life/800/450",
    date: "5 hours ago",
    category: "Space"
  },
  {
    id: 3,
    title: "Tech Giant Announces Neural Link for Pets to Enable Basic Speech",
    classification: "FAKE",
    image: "https://picsum.photos/seed/pet_tech/800/450",
    date: "1 day ago",
    category: "Technology"
  },
  {
    id: 4,
    title: "Archeologists Discover Submerged City off the Coast of Alexandria",
    classification: "REAL",
    image: "https://picsum.photos/seed/alexandria/800/450",
    date: "1 day ago",
    category: "History"
  },
  {
    id: 5,
    title: "AI-Generated Deepfake of World Leader Goes Viral on Social Media",
    classification: "FAKE",
    image: "https://picsum.photos/seed/deepfake/800/450",
    date: "2 days ago",
    category: "Politics"
  },
  {
    id: 6,
    title: "Viral Video of Celebrity Endorsing New Crypto Token is Partially AI-Synthesized",
    classification: "MISLEADING",
    image: "https://picsum.photos/seed/crypto_viral/800/450",
    date: "3 days ago",
    category: "Finance"
  }
];

const LIVE_TICKER = [
  "FACTIFY: Scanning global news streams for deepfakes...",
  "ALERT: High disinformation activity detected in social media nodes...",
  "FACT-CHECK: Claims about 'Neural Link' classified as MISLEADING...",
  "SENTINEL: Deepfake detection active on 2.4M video streams...",
  "GROUNDING: Real-time verification linked to BBC, Reuters, and NDTV..."
];

// --- Components ---

const ImageWithFallback = ({ src, fallbackSrc, alt, className }: { src: string, fallbackSrc: string, alt: string, className?: string }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-zinc-900/50 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-indigo-500/40" size={20} />
            <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Scanning...</span>
          </div>
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-700`}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (!hasError) {
            setImgSrc(fallbackSrc);
            setHasError(true);
          } else {
            // Final fallback to a reliable random image if both keyword and specific seed fail
            setImgSrc(`https://picsum.photos/800/600?random=${Math.random()}`);
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
};

export default function App() {
  const [input, setInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!input.trim() && !selectedImage && !urlInput.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);
    setImageUrl(null);
    setError(null);

    try {
      const analysis = await analyzeNews({ 
        text: input || undefined, 
        url: urlInput || undefined, 
        imageBase64: selectedImage || undefined 
      });
      setResult(analysis);
      
      // Generate image in background
      try {
        const img = await generateVisualContext(analysis.image_prompt);
        setImageUrl(img);
      } catch (imgErr) {
        console.error("Image generation failed:", imgErr);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("The sentinel failed to process the data. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <span className="font-display font-bold text-xl tracking-tighter uppercase">CogniVerify</span>
        </div>
        
        <button 
          onClick={() => setShowAbout(true)}
          className="glass-morphism px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-white/20 transition-all pointer-events-auto"
        >
          <Info size={16} />
          About Project
        </button>
      </nav>

      {/* Live Ticker */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-zinc-950/80 backdrop-blur-sm border-y border-zinc-900 py-2 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...LIVE_TICKER, ...LIVE_TICKER].map((text, i) => (
            <span key={i} className="mx-8 text-[10px] font-mono text-indigo-400/80 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
              {text}
            </span>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto pt-40 pb-20 px-6">
        {/* Hero Section */}
        <header className="text-center mb-16 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-[0.2em] mb-6"
          >
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            Sentinel Status: Active // Node_04
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-4 uppercase"
          >
            CogniVerify <span className="text-indigo-500">Factify</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto"
          >
            Advanced AI fact-checking and forensic validation engine. 
            Detecting misinformation and deepfakes with live web grounding.
          </motion.p>
        </header>

        {/* Input Section */}
        <section className="mb-12">
          <div className="sentinel-card p-1">
            <div className="bg-zinc-950 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] font-mono">
                  <Globe size={14} />
                  Input Verification Stream
                </div>
                {(selectedImage || urlInput) && (
                  <button 
                    onClick={() => {
                      setSelectedImage(null);
                      setUrlInput('');
                    }}
                    className="text-[10px] text-red-400 uppercase font-bold flex items-center gap-1 hover:text-red-300"
                  >
                    <X size={12} /> Clear All
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 focus-within:border-indigo-500/50 transition-all">
                  <ExternalLink size={18} className="text-zinc-500" />
                  <input 
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Paste news URL here (e.g., https://bbc.com/news/...)"
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-zinc-700"
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <textarea 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Or paste news headline / article snippet here..."
                      className="w-full bg-transparent border-none focus:ring-0 text-xl md:text-2xl font-light placeholder:text-zinc-700 resize-none min-h-[120px]"
                    />
                  </div>
                
                <div className="w-full md:w-48 h-32 md:h-auto">
                  <label className={`w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${selectedImage ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'}`}>
                    {selectedImage ? (
                      <img src={selectedImage} alt="Selected" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <Upload className="text-zinc-600 mb-2" size={24} />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center px-2">Attach Evidence Photo</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || (!input.trim() && !selectedImage && !urlInput.trim())}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-widest flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(79,70,229,0.2)]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Factifying...
                    </>
                  ) : (
                    <>
                      Initiate Fact-Check
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Feed Section (Only show if no result) */}
        {!result && !isAnalyzing && (
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-20 space-y-20"
          >
            {/* Recent Scans Grid */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <History className="text-indigo-500" size={20} />
                <h2 className="text-xl font-display font-bold uppercase tracking-widest">Recent Sentinel Scans</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {RECENT_NEWS.map((news) => (
                  <div key={news.id} className="sentinel-card group cursor-pointer hover:border-zinc-700 transition-all">
                    <div className="aspect-video relative overflow-hidden">
                      <ImageWithFallback 
                        src={news.image} 
                        fallbackSrc={`https://picsum.photos/seed/${news.id}/800/450`}
                        alt={news.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[9px] font-mono font-bold text-zinc-300 uppercase tracking-widest border border-white/10">
                          {news.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
                          news.classification === 'REAL' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                          news.classification === 'FAKE' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {news.classification}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] text-zinc-500 font-mono uppercase mb-2">{news.date}</div>
                      <h3 className="font-bold text-sm leading-snug group-hover:text-indigo-400 transition-colors">{news.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Evidence Archive */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <ImageIcon className="text-indigo-500" size={20} />
                <h2 className="text-xl font-display font-bold uppercase tracking-widest">Visual Evidence Archive</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="sentinel-card aspect-square relative group cursor-crosshair">
                    <ImageWithFallback 
                      src={`https://picsum.photos/seed/archive_${i}/400/400`} 
                      fallbackSrc={`https://picsum.photos/400/400?random=${i}`}
                      alt={`Archive ${i}`} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-[10px] font-mono font-bold text-white uppercase tracking-widest bg-indigo-600 px-2 py-1 rounded">
                        SCAN_ID: {Math.floor(Math.random() * 100000)}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle size={20} />
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Layer 1: Verdict Header */}
              <div className={`sentinel-card p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-l-8 ${
                result.verdict === 'REAL' ? 'border-l-emerald-500' : 
                result.verdict === 'FAKE' ? 'border-l-red-500' : 
                'border-l-yellow-500'
              }`}>
                <div className="flex-1">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">CogniVerify Verdict</div>
                  <h2 className={`text-6xl font-display font-black tracking-tighter ${
                    result.verdict === 'REAL' ? 'text-emerald-500' : 
                    result.verdict === 'FAKE' ? 'text-red-500' : 
                    'text-yellow-500'
                  }`}>
                    {result.verdict}
                  </h2>
                  <div className="mt-4 p-4 bg-zinc-950 rounded border border-zinc-800/50">
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 font-mono">Claim Under Analysis</div>
                    <p className="text-sm text-zinc-300 font-medium leading-tight">"{result.claim}"</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1 font-mono">Confidence Score</div>
                  <div className="text-4xl font-display font-bold text-white font-mono tracking-tighter">{result.confidence_score}%</div>
                  <div className="mt-2">
                    <div className="w-32 h-1 bg-zinc-800 rounded-full overflow-hidden ml-auto">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-1000" 
                        style={{ width: `${result.confidence_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Layer 2: Reality Check & Reasoning */}
                <div className="md:col-span-2 space-y-8">
                  {/* Reality Check */}
                  <div className="sentinel-card p-6 border-t-4 border-t-indigo-500">
                    <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] font-mono">
                      <Globe size={14} />
                      Reality Check: Factual Comparison
                    </div>
                    <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap">
                      {result.reality_check}
                    </p>
                  </div>

                  {/* Reasoning & Signals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="sentinel-card p-6">
                      <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] font-mono">
                        <Cpu size={14} />
                        Forensic Reasoning
                      </div>
                      <ul className="space-y-3">
                        {result.reasoning.map((point, i) => (
                          <li key={i} className="flex gap-3 text-xs text-zinc-400">
                            <span className="text-indigo-500 mt-1">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="sentinel-card p-6">
                      <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-red-400 uppercase tracking-[0.2em] font-mono">
                        <ShieldAlert size={14} />
                        Manipulation Signals
                      </div>
                      <ul className="space-y-3">
                        {result.manipulation_signals.map((signal, i) => (
                          <li key={i} className="flex gap-3 text-xs text-zinc-400">
                            <span className="text-red-500 mt-1">•</span>
                            {signal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Visual Context / Evidence */}
                <div className="space-y-4">
                  {selectedImage && (
                    <div className="sentinel-card aspect-video relative group">
                      <ImageWithFallback 
                        src={selectedImage} 
                        fallbackSrc={selectedImage}
                        alt="Input evidence" 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-3">
                        <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Input Evidence</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="sentinel-card aspect-video relative group">
                    {imageUrl ? (
                      <ImageWithFallback 
                        src={imageUrl} 
                        fallbackSrc={`https://picsum.photos/seed/${result.verdict}/800/450`}
                        alt="Visual context" 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700">
                        <Loader2 className="animate-spin mb-2" size={20} />
                        <span className="text-[9px] font-bold uppercase tracking-widest font-mono">Synthesizing Context</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3">
                      <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Contextual Reconstruction</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Layer 3: Supporting Facts */}
                <div className="sentinel-card p-6">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                    <FileText size={14} />
                    Supporting Facts & Data
                  </div>
                  <div className="space-y-4">
                    <div className="bg-zinc-950 p-3 rounded border border-zinc-800/50 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Source Reliability:</span>
                      <span className={`text-[10px] font-mono font-bold uppercase ${
                        result.source_reliability.level === 'HIGH' ? 'text-emerald-400' :
                        result.source_reliability.level === 'MEDIUM' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {result.source_reliability.level}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono italic leading-tight">
                      {result.source_reliability.explanation}
                    </p>
                    <div className="prose-invert space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {result.supporting_facts.map((fact, i) => (
                        <p key={i} className="flex gap-3 text-sm">
                          <span className="text-indigo-500 mt-1.5">•</span>
                          {fact}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Layer 4: Final Explanation */}
                <div className="sentinel-card p-6 bg-indigo-500/5 border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                    <Info size={14} />
                    Final Explanation (Simple)
                  </div>
                  <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <p className="prose-invert text-zinc-100 font-medium leading-relaxed whitespace-pre-wrap">
                      {result.final_explanation_simple}
                    </p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <BarChart3 size={14} />
                      Confidence Level: {result.confidence_score}%
                    </div>
                    <ShieldCheck className="text-indigo-500/50" size={20} />
                  </div>
                </div>

                {/* Layer 5: Forensic Evidence Gallery */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600/20 rounded flex items-center justify-center text-indigo-500">
                      <Camera size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold uppercase tracking-widest">Forensic Evidence Gallery</h3>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Multi-Vector Visual Analysis Stream</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {result.forensic_gallery.map((evidence, i) => (
                      <div key={i} className="sentinel-card overflow-hidden group">
                        <div className="aspect-video relative">
                          <ImageWithFallback 
                            src={`https://picsum.photos/seed/${evidence.image_query.replace(/\s+/g, '_')}/800/450`}
                            fallbackSrc={`https://picsum.photos/800/450?random=${i}`}
                            alt={evidence.label}
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 bg-indigo-600 rounded text-[9px] font-bold text-white uppercase tracking-widest shadow-lg">
                              {evidence.label}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10">
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                              <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                                Match: {evidence.match_percentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-5 space-y-3">
                          <div>
                            <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 font-mono">Analysis Focus</div>
                            <div className="text-sm font-bold text-white uppercase tracking-tight">{evidence.analysis_focus}</div>
                          </div>
                          <div className="p-3 bg-zinc-950 rounded border border-zinc-900">
                            <div className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-2 font-mono">Forensic Reason</div>
                            <p className="text-xs text-zinc-400 leading-relaxed font-mono italic">
                              "{evidence.forensic_reason}"
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="sentinel-card max-w-2xl w-full relative z-10 max-h-[90vh] flex flex-col shadow-2xl"
            >
              <div className="p-8 pb-6 sticky top-0 bg-zinc-900 z-20 flex justify-between items-start border-b border-zinc-800/50">
                <div>
                  <h3 className="text-3xl font-display font-bold uppercase tracking-tight mb-2">CogniVerify: Factify</h3>
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Project Mission</div>
                </div>
                <button 
                  onClick={() => setShowAbout(false)}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar">
                <p className="text-zinc-400 text-lg leading-relaxed mb-10">
                  CogniVerify: Factify is engineered as a premier truth sentinel, dedicated to neutralizing 
                  digital misinformation through advanced neural reasoning. By integrating high-fidelity 
                  AI synthesis with real-time multi-vector grounding, we provide an authoritative 
                  verification layer for complex claims and visual media. Our mission is to restore 
                  global information integrity through forensic-grade analysis and surgical precision.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                  {[
                    { icon: <Cpu size={16} />, title: "Neural Synthesis", desc: "Advanced claim extraction and tone analysis." },
                    { icon: <Globe size={16} />, title: "Global Grounding", desc: "Real-time cross-referencing with authoritative sources." },
                    { icon: <ShieldCheck size={16} />, title: "Forensic Integrity", desc: "High-fidelity visual and metadata verification." }
                  ].map((pillar, i) => (
                    <div key={i} className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                      <div className="text-indigo-500 mb-2">{pillar.icon}</div>
                      <div className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">{pillar.title}</div>
                      <div className="text-[10px] text-zinc-500 leading-tight">{pillar.desc}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Development Team</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TEAM_MEMBERS.map((member) => (
                      <div key={member.id} className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">{member.name}</div>
                          <div className="text-xs text-zinc-500">ID: {member.id}</div>
                        </div>
                        <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                          <Cpu size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500 font-bold uppercase tracking-widest">
                  <span>Version 1.0.0 Sentinel</span>
                  <span className="flex items-center gap-1">
                    Powered by Gemini 3 <ExternalLink size={12} />
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-grid opacity-[0.4]" />
        <div className="scanline" />
      </div>
    </div>
  );
}
