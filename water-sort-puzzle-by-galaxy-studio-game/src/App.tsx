/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Sparkles, 
  HelpCircle, 
  RotateCcw, 
  PlusCircle, 
  Volume2, 
  VolumeX, 
  Play, 
  ChevronRight, 
  BookOpen,
  ArrowRight,
  Gift,
  Settings,
  Check,
  Undo,
  X,
  Info,
  Ban,
  MegaphoneOff,
  Home,
  ShoppingBag,
  Lock,
  Music,
  Palette
} from 'lucide-react';
import { Bottle } from './components/Bottle';
import { LevelSelector } from './components/LevelSelector';
import { Stats } from './components/Stats';
import { PrivacyAboutModal } from './components/PrivacyAboutModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { BottleState, COLOR_PALETTE, WaterLayer } from './types';
import { canPour, pour, checkWin, generateLevel, getHint } from './utils/gameLogic';
import { audio } from './utils/audio';

// Visual skin configs
export interface MarketSkin {
  id: string;
  name: string;
  color: string;
  cost: number;
  desc: string;
  isPremium?: boolean;
  priceInRupees?: string;
  priceInDollars?: string;
}

// Visual themes
interface ThemeConfig {
  id: string;
  name: string;
  tag: string;
  bgClass: string;
  containerBg: string;
  accentBtnClass: string;
  secondaryBtnClass: string;
  textColor: string;
  labelColor: string;
  description: string;
}

const THEMES: ThemeConfig[] = [
  {
    id: 'summer',
    name: 'Studio Pure White',
    tag: '⚪ WHITE',
    bgClass: 'bg-white',
    containerBg: 'bg-white/95 border-2 border-slate-200/80 shadow-xl',
    accentBtnClass: 'bg-amber-400 hover:bg-amber-500 text-slate-900 border-amber-600 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-slate-900',
    labelColor: 'bg-slate-900 text-white',
    description: 'A super-clean pure white workspace designed to make liquid colors shine under clear lights.'
  },
  {
    id: 'christmas',
    name: 'Cozy Wood Cabin (Image 1)',
    tag: '🪵 CABIN',
    bgClass: 'bg-wood-cabin',
    containerBg: 'bg-white/85 backdrop-blur-md border-2 border-orange-200 shadow-xl',
    accentBtnClass: 'bg-orange-400 hover:bg-orange-500 text-slate-900 border-orange-600 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-stone-100 hover:bg-stone-200 text-slate-800 border-stone-300 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-stone-900',
    labelColor: 'bg-orange-400 text-slate-900',
    description: 'Warm mountain cabin light atmosphere with rich soft wood colors and cozy highlight borders.'
  },
  {
    id: 'pastel',
    name: 'Pastel SortPuz (Image 2)',
    tag: '☁️ SKYWAYS',
    bgClass: 'bg-pastel-breeze',
    containerBg: 'bg-white/80 backdrop-blur-md border-2 border-sky-100 shadow-xl',
    accentBtnClass: 'bg-sky-400 hover:bg-sky-500 text-sky-950 border-sky-600 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-white/90 hover:bg-white text-sky-900 border-sky-200 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-sky-950',
    labelColor: 'bg-sky-400 text-sky-950',
    description: 'Light, bright, airy sky background with floating clouds and minimal rounded glass styling.'
  },
  {
    id: 'stars',
    name: 'Starry Midnight (Image 3)',
    tag: '🌌 STARFALL',
    bgClass: 'bg-forest-stars',
    containerBg: 'bg-white/85 backdrop-blur-md border-2 border-indigo-200 shadow-xl',
    accentBtnClass: 'bg-indigo-400 hover:bg-indigo-500 text-white border-indigo-600 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-slate-100 hover:bg-slate-200 text-indigo-900 border-slate-200 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-indigo-900',
    labelColor: 'bg-indigo-400 text-slate-900',
    description: 'Deep light royal twilight morning sky with constellation and dreamy sky-blue highlights.'
  },
  {
    id: 'pink',
    name: 'Water Splash (Image 4)',
    tag: '🌸 SUNSET',
    bgClass: 'bg-playful-pink',
    containerBg: 'bg-white/80 backdrop-blur-md border-2 border-pink-100 shadow-xl',
    accentBtnClass: 'bg-rose-500 hover:bg-rose-600 text-white border-rose-700 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-white hover:bg-white text-rose-800 border-pink-200 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-pink-900',
    labelColor: 'bg-rose-400 text-white',
    description: 'Joyful peach/pink tropical sunrise gradient canvas, clean light borders, and high contrast accents.'
  },
  {
    id: 'volcanic',
    name: 'Obsidian Fire Cave',
    tag: '🌋 OBSIDIAN',
    bgClass: 'bg-volcanic-fire',
    containerBg: 'bg-slate-900/85 backdrop-blur-md border-2 border-orange-500/80 shadow-[0_0_20px_rgba(234,88,12,0.15)]',
    accentBtnClass: 'bg-orange-600 hover:bg-orange-700 text-white border-orange-900 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-slate-800 hover:bg-slate-700 text-orange-200 border-slate-950 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-orange-100',
    labelColor: 'bg-orange-600 text-white',
    description: 'A subterranean volcanic obsidian cavern filled with deep red magma streams and molten stone contours.'
  },
  {
    id: 'deepsea',
    name: 'Deep-Sea Atlantic Abyss',
    tag: '🧜‍♂️ ABYSS',
    bgClass: 'bg-deep-sea-trench',
    containerBg: 'bg-slate-900/85 backdrop-blur-md border-2 border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    accentBtnClass: 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-900 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-slate-800 hover:bg-slate-700 text-cyan-200 border-slate-950 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-cyan-100',
    labelColor: 'bg-cyan-600 text-white',
    description: 'Dive into the pitch-black waters of the deep Atlantic trench with stunning bioluminescent highlights.'
  },
  {
    id: 'aurora',
    name: 'Polar Northern Aurora',
    tag: '🌌 POLARIS',
    bgClass: 'bg-aurora-borealis',
    containerBg: 'bg-slate-900/85 backdrop-blur-md border-2 border-emerald-500/85 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    accentBtnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-900 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-slate-800 hover:bg-slate-700 text-emerald-200 border-slate-950 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-emerald-100',
    labelColor: 'bg-emerald-600 text-white',
    description: 'Experience the shimmering green and sky-violet currents of the majestic winter Aurora Borealis.'
  },
  {
    id: 'cyberpunk',
    name: 'Neo-Tokyo Cyberpunk',
    tag: '⚡ CYBER',
    bgClass: 'bg-neon-cyberpunk',
    containerBg: 'bg-slate-950/90 backdrop-blur-md border-2 border-pink-500/80 shadow-[0_0_20px_rgba(236,72,153,0.2)]',
    accentBtnClass: 'bg-pink-600 hover:bg-pink-700 text-white border-pink-900 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-slate-900 hover:bg-slate-800 text-pink-300 border-pink-950 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-pink-100',
    labelColor: 'bg-pink-600 text-white',
    description: 'Fast-paced metropolitan styling featuring high contrast laser pink, ultraviolet and cyan elements.'
  },
  {
    id: 'emerald',
    name: 'Magic Jade Forest',
    tag: '🌳 EMERALD',
    bgClass: 'bg-enchanted-emerald',
    containerBg: 'bg-teal-950/85 backdrop-blur-md border-2 border-teal-500/80 shadow-[0_0_20px_rgba(20,184,166,0.15)]',
    accentBtnClass: 'bg-teal-600 hover:bg-teal-700 text-white border-teal-900 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    secondaryBtnClass: 'bg-slate-800 hover:bg-slate-700 text-teal-200 border-slate-950 border-b-4 font-bold rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2',
    textColor: 'text-teal-100',
    labelColor: 'bg-teal-600 text-white',
    description: 'Immerse in the luxury of ancient druid woodlands with gold moss details and rich emerald gradients.'
  }
];

// 100 Custom Premium Vessel shapes for the Galactic Market (Guaranteed non-repeating)
const vesselPrefixes = [
  "Quantum", "Hyperion", "Nebula", "Luminous", "Aether", "Eclipse", "Solar", "Galactic", "Stellar", "Pulsar", 
  "Abyssal", "Astral", "Celestial", "Titan", "Spectral", "Cosmic", "Helios", "Obsidian", "Vortex", "Chrono", 
  "Prism", "Sovereign", "Tempest", "Zenith", "Phoenix", "Aurora", "Infinity", "Helix", "Saga", "Legacy",
  "Arcane", "Cyber", "Enchanted", "Mystic", "Prestige", "Vector", "Titanium", "Matrix", "Supernova", "Primal"
];
const vesselSuffixes = [
  "Chalice", "Flask", "Beaker", "Vessel", "Decanter", "Potion", "Specimen", "Prism", "Star", "Goblet", 
  "Sphere", "Cylinder", "Obelisk", "Capsule", "Reservoir", "Container", "Urn", "Crucible", "Amphora", "Jar",
  "Phial", "Carafe", "Vial", "Canister", "Vat", "Cauldron", "Cruet", "Tumbler", "Conduit", "Crux"
];
const vesselEmojis = [
  "🧪", "🥛", "💎", "🔮", "🔲", "🍷", "⭐", "🏆", "🔬", "🍺", "🍹", "🍼", "🍯", "🏺", "🍶", "🥤", "🍵", "🏮", "🧬"
];

const MARKET_VESSELS = Array.from({ length: 100 }, (_, i) => {
  if (i === 0) {
    return { id: 'standard', name: 'Classic specimen', icon: '🧪', cost: 0, desc: 'The classic narrow-neck glass test tube.' };
  }
  
  const prefIndex = i % vesselPrefixes.length;
  const suffIndex = (i * 7) % vesselSuffixes.length;
  const emojiIndex = (i * 3) % vesselEmojis.length;
  
  const name = `${vesselPrefixes[prefIndex]} ${vesselSuffixes[suffIndex]} #${i}`;
  
  // Cost ranging from 10,000 up to 1,000,000 (10 Lakh)
  const rawCost = 10000 + (i - 1) * (990000 / 98);
  const cost = Math.round(rawCost / 5000) * 5000;
  
  const desc = `Procedural Premium vessel shape #${i}. Unique silhouette with exquisite glass styling.`;
  
  return {
    id: `vessel_${i}`,
    name,
    icon: vesselEmojis[emojiIndex],
    cost,
    desc
  };
});

// Exactly 20 beautifully unique premium cosmic skins, costing from 10,000 to 200,000 (2 lakh) coins
const SKIN_TEMPLATES = [
  { name: "Nova Shimmer", color: "#ec4899" },
  { name: "Lunar Aura", color: "#cbd5e1" },
  { name: "Solar Eclipse", color: "#f97316" },
  { name: "Nebula Mist", color: "#14b8a6" },
  { name: "Orion Vortex", color: "#6366f1" },
  { name: "Cosmic Glow", color: "#d946ef" },
  { name: "Pulsar Pulse", color: "#06b6d4" },
  { name: "Astral Drift", color: "#3b82f6" },
  { name: "Supernova Flare", color: "#eab308" },
  { name: "Spectral Flame", color: "#22c55e" },
  { name: "Gravity Wave", color: "#a855f7" },
  { name: "Aurora Shimmer", color: "#84cc16" },
  { name: "Wormhole Ray", color: "#7c3aed" },
  { name: "Void Reflection", color: "#f43f5e" },
  { name: "Plasma Storm", color: "#00f2fe" },
  { name: "Stardust Shimmer", color: "#fda4af" },
  { name: "Meteor Ember", color: "#ef4444" },
  { name: "Celestial Glow", color: "#10b981" },
  { name: "Chronos Halo", color: "#dc2626" },
  { name: "Infinity Nexus", color: "#ff007f" }
];

const MARKET_SKINS: MarketSkin[] = [
  { id: "skin_none", name: "Standard Classic", color: "#475569", cost: 0, desc: "Classic glass boundary lines with standard shadows." },
  ...SKIN_TEMPLATES.map((tmpl, idx) => {
    // Cost distributed smoothly from 10,000 up to 200,000 (2 lakh) coins
    const rawCost = 10000 + idx * (190000 / 19);
    const cost = Math.round(rawCost / 5000) * 5000;
    
    return {
      id: `skin_${idx + 1}`,
      name: tmpl.name,
      color: tmpl.color,
      cost,
      desc: `glowing neon outlined aura shader in ${tmpl.name} look.`
    };
  })
];

const SPIN_WHEEL_SECTORS = [
  { value: 100, color: '#3b82f6', label: '100 Coin', secondaryColor: '#1d4ed8' },
  { value: 10000, color: '#eab308', label: '10,000 Coin', secondaryColor: '#ca8a04', highlight: true },
  { value: 10, color: '#f97316', label: '10 Coin', secondaryColor: '#c2410c' },
  { value: 1000, color: '#a855f7', label: '1,000 Coin', secondaryColor: '#7e22ce' },
  { value: 100, color: '#3b82f6', label: '100 Coin', secondaryColor: '#1d4ed8' },
  { value: 10000, color: '#eab308', label: '10,000 Coin', secondaryColor: '#ca8a04', highlight: true },
  { value: 10, color: '#f97316', label: '10 Coin', secondaryColor: '#c2410c' },
  { value: 1000, color: '#a855f7', label: '1,000 Coin', secondaryColor: '#7e22ce' },
];

export default function App() {
  // Game level states
  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    const saved = localStorage.getItem('water_sort_level');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(() => {
    const saved = localStorage.getItem('water_sort_max_unlocked');
    return saved ? Math.max(1, parseInt(saved, 10)) : 1;
  });

  // Coin wallet balance (Initial starting balance set to 1000 coins so users can freely shop!)
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('water_sort_coins');
    if (saved) return parseInt(saved, 10);
    return 1000; 
  });

  // Persistent Cooldown states
  const [lastSpinTime, setLastSpinTime] = useState<number>(() => {
    const saved = localStorage.getItem('water_sort_last_spin_time');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lastGiftTime, setLastGiftTime] = useState<number>(() => {
    const saved = localStorage.getItem('water_sort_last_gift_time');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCooldown = (ms: number) => {
    if (ms <= 0) return '';
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Welcome Lucky Spin Wheel states for first-time players
  const [hasDoneInitialSpin, setHasDoneInitialSpin] = useState<boolean>(() => {
    return localStorage.getItem('water_sort_has_done_spin') === 'true';
  });
  const [totalSpinsCount, setTotalSpinsCount] = useState<number>(() => {
    const saved = localStorage.getItem('water_sort_total_spin_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showSpinModalManual, setShowSpinModalManual] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinAngle, setSpinAngle] = useState<number>(0);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [showSpinClaimedSuccess, setShowSpinClaimedSuccess] = useState<boolean>(false);

  const handleOpenSpinModalManual = () => {
    audio.playClick();
    setSpinResult(null);
    setShowSpinClaimedSuccess(false);
    setIsSpinning(false);
    setSpinAngle(0);
    setShowSpinModalManual(true);
  };

  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(() => {
    const saved = localStorage.getItem('water_sort_unlocked_themes');
    return saved ? JSON.parse(saved) : ['summer', 'pastel']; 
  });

  // Purchased Vessel and Skin arrays
  const [unlockedVessels, setUnlockedVessels] = useState<string[]>(() => {
    const saved = localStorage.getItem('water_sort_unlocked_vessels');
    return saved ? JSON.parse(saved) : ['standard'];
  });

  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(() => {
    const saved = localStorage.getItem('water_sort_unlocked_skins');
    return saved ? JSON.parse(saved) : ['skin_none'];
  });

  // Equipped styles
  const [activeVesselStyle, setActiveVesselStyle] = useState<string>(() => {
    return localStorage.getItem('water_sort_active_vessel') || 'standard';
  });

  const [activeSkinId, setActiveSkinId] = useState<string>(() => {
    return localStorage.getItem('water_sort_active_skin_id') || 'skin_none';
  });

  const [activeSkinGlowColor, setActiveSkinGlowColor] = useState<string | undefined>(() => {
    return localStorage.getItem('water_sort_active_skin_glow') || undefined;
  });

  // Skin toggle option State
  const [skinEnabled, setSkinEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('water_sort_skin_enabled');
    return saved !== 'false';
  });

  const finalSkinGlowColor = skinEnabled ? activeSkinGlowColor : undefined;
  const finalCenterSkinGlowColor = skinEnabled ? (activeSkinGlowColor || '#EC4899') : undefined;

  // Market display states
  const [showMarketModal, setShowMarketModal] = useState<boolean>(false);
  const [marketTab, setMarketTab] = useState<'vessels' | 'skins' | 'themes'>('vessels');
  const [marketOrigin, setMarketOrigin] = useState<'home' | 'settings' | 'game'>('home');
  const [skinPage, setSkinPage] = useState<number>(0);
  
  // 3D Vessel Demo & Game Speed States
  const [selectedDemoVesselId, setSelectedDemoVesselId] = useState<string>('standard');
  const [selectedDemoSkinId, setSelectedDemoSkinId] = useState<string>('skin_none');
  const [isVesselSpinning, setIsVesselSpinning] = useState<boolean>(false);
  const [gameSpeed, setGameSpeed] = useState<number>(0.6); // Default 0.6x for slow, relaxing gameplay as requested
  const [showSpeedSelectModal, setShowSpeedSelectModal] = useState<boolean>(false);

  // 10-level Milestone states
  const [milestoneNeedleValue, setMilestoneNeedleValue] = useState<number>(50);
  const [milestoneNeedleDir, setMilestoneNeedleDir] = useState<number>(1);
  const [isMilestoneSpinning, setIsMilestoneSpinning] = useState<boolean>(true);
  const [isMilestoneBoxOpened, setIsMilestoneBoxOpened] = useState<boolean>(false);
  const [milestoneClaimedBonus, setMilestoneClaimedBonus] = useState<number | null>(null);
  const [milestoneBonusClaimed, setMilestoneBonusClaimed] = useState<boolean>(false);

  // Audio synthesis helper for milestone reward screens (runs inside the browser natively!)
  const playBonusSound = (type: 'stop' | 'open') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      if (type === 'stop') {
        // Sparkle ascending coin chimes
        const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = i % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.07);
          gain.gain.setValueAtTime(0, now + i * 0.07);
          gain.gain.linearRampToValueAtTime(0.15, now + i * 0.07 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.5);
        });
      } else if (type === 'open') {
        // Rich mystery box fanfare chord
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4 to C6
        notes.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.05);
          gain.gain.setValueAtTime(0, now + i * 0.05);
          gain.gain.linearRampToValueAtTime(0.2, now + i * 0.05 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.65);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.7);
        });
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // Splash loader (Loads for 4 seconds total)
  const [isSplashActive, setIsSplashActive] = useState<boolean>(true);
  const [splashPhase, setSplashPhase] = useState<'studio' | 'gate'>('studio');
  const [splashProgress, setSplashProgress] = useState<number>(0);
  const [currentLyric, setCurrentLyric] = useState<string>('Hey, Go! 🌴 Splashing colors in the flow!');

  useEffect(() => {
    const handleLyric = (e: any) => {
      if (e.detail && e.detail.lyric) {
        setCurrentLyric(e.detail.lyric);
      }
    };
    window.addEventListener('bgmLyric', handleLyric);
    return () => {
      window.removeEventListener('bgmLyric', handleLyric);
    };
  }, []);

  // Modals
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState<boolean>(false);
  const [showPrivacyOnly, setShowPrivacyOnly] = useState<boolean>(false);
  const [boosterPrompt, setBoosterPrompt] = useState<'tube' | 'hint' | 'skip' | null>(null);

  useEffect(() => {
    const phase1Duration = 2000; // Galaxy Studio splash screen (2 seconds)
    const phase2Duration = 2000; // Water Sort Puzzle Game loading gate (2 seconds)
    const intervalTime = 50;
    let elapsed = 0;

    const splashTimer = setInterval(() => {
      elapsed += intervalTime;

      if (elapsed < phase1Duration) {
        setSplashPhase('studio');
        setSplashProgress(0);
      } else if (elapsed < phase1Duration + phase2Duration) {
        setSplashPhase('gate');
        const p2Elapsed = elapsed - phase1Duration;
        const progress = Math.min(100, Math.floor((p2Elapsed / phase2Duration) * 100));
        setSplashProgress(progress);
      } else {
        clearInterval(splashTimer);
        setSplashProgress(100);
        setIsSplashActive(false);
      }
    }, intervalTime);

    // Bootstrap default storage saves - only save 1000 coins if they've completed their welcome spin
    if (!localStorage.getItem('water_sort_coins')) {
      if (localStorage.getItem('water_sort_has_done_spin') === 'true') {
        localStorage.setItem('water_sort_coins', '1000');
      } else {
        localStorage.setItem('water_sort_coins', '0');
      }
    }
    if (!localStorage.getItem('water_sort_unlocked_themes')) {
      localStorage.setItem('water_sort_unlocked_themes', JSON.stringify(['summer', 'pastel']));
    }
    if (!localStorage.getItem('water_sort_unlocked_vessels')) {
      localStorage.setItem('water_sort_unlocked_vessels', JSON.stringify(['standard']));
    }
    if (!localStorage.getItem('water_sort_unlocked_skins')) {
      localStorage.setItem('water_sort_unlocked_skins', JSON.stringify(['skin_none']));
    }

    return () => clearInterval(splashTimer);
  }, []);

  // Play the lucky welcome spin! Selects a dynamic wedge, animates, and prepares the reward claim
  const handleStartSpin = () => {
    if (isSpinning) return;
    
    const now = Date.now();
    const remaining = 86400000 - (now - lastSpinTime);
    if (remaining > 0) {
      audio.playInvalid();
      setClaimedReward(`⏳ LUCKY SPIN COOLDOWN!\nNext spin will be available in ${formatCooldown(remaining)}.`);
      setShowClaimModal(true);
      return;
    }

    audio.playClick();
    setIsSpinning(true);
    
    // Save last spin time to state and storage
    setLastSpinTime(now);
    localStorage.setItem('water_sort_last_spin_time', String(now));
    
    // Increment total spin requests counter for the active session
    const nextSpinCount = totalSpinsCount + 1;
    setTotalSpinsCount(nextSpinCount);
    localStorage.setItem('water_sort_total_spin_count', String(nextSpinCount));

    // Choose targetIdx based on precise custom probabilities requested by the user:
    // - 90% chance: 100 Coins (Wedges at Index 0 or 4)
    // - 7% chance: 1,000 Coins (Wedges at Index 3 or 7)
    // - 3% chance: 10 Coins (Wedges at Index 2 or 6)
    let targetIdx;
    const roll = Math.random() * 100;
    if (roll <= 90) {
      targetIdx = Math.random() < 0.5 ? 0 : 4; // 100 Coins
    } else if (roll <= 97) {
      targetIdx = Math.random() < 0.5 ? 3 : 7; // 1,000 Coins
    } else {
      targetIdx = Math.random() < 0.5 ? 2 : 6; // 10 Coins
    }

    const degreesPerSector = 360 / SPIN_WHEEL_SECTORS.length;
    const rounds = 5 + Math.floor(Math.random() * 3);
    
    // Fix alignment: pointing of pointer should be exactly in the center of the wedge slice, not on the partition border!
    // Offset by half sector width (degreesPerSector / 2) to prevent landing on joints
    const stopAngle = rounds * 360 + (360 - (targetIdx * degreesPerSector + (degreesPerSector / 2)));
    
    setSpinAngle(stopAngle);

    setTimeout(() => {
      const sector = SPIN_WHEEL_SECTORS[targetIdx];
      const wonAmount = sector.value || 100;
      setSpinResult(wonAmount);
      setIsSpinning(false);
      
      // Immediately show the award claim screen
      setShowSpinClaimedSuccess(true);

      // Automatically trigger the 'Claim' action after a brief 1.2s delay for perfect feedback
      setTimeout(() => {
        audio.playCelebration();
        setCoins((prevCoins) => {
          const finalCoins = prevCoins + wonAmount;
          localStorage.setItem('water_sort_coins', String(finalCoins));
          return finalCoins;
        });

        setHasDoneInitialSpin((prevHasDone) => {
          if (!prevHasDone) {
            localStorage.setItem('water_sort_has_done_spin', 'true');
            setClaimedReward(`🎉 WELCOME PACKAGE SECURED! Received 🪙 ${wonAmount.toLocaleString()} Coins as a starter bundle!`);
            return true;
          } else {
            setClaimedReward(`🎉 REWARD SECURED! Received 🪙 ${wonAmount.toLocaleString()} Coins from the Lucky Spin!`);
            return prevHasDone;
          }
        });

        setShowClaimModal(true);
        setShowSpinModalManual(false);
      }, 1200);
    }, 4600); // Wait for the rotation layout to settle beautifully
  };

  const [bottles, setBottles] = useState<BottleState[]>([]);

  // Dynamic window sizing state for adaptive, zero-overflow responsive layout
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 375,
    height: typeof window !== 'undefined' ? window.innerHeight : 667,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute responsive sizing bounds for gameplay bottles
  const availWidth = Math.min(windowSize.width, 576) - 32;
  const availHeight = Math.max(160, windowSize.height - 230); // Accurate space after subtracting header, stats and booster controls

  const getLevelScaleFactor = (lvl: number) => {
    const levelDiff = Math.max(0, lvl - 10);
    const scalingSteps = Math.floor(levelDiff / 10);
    // 8% size increase for every 10 levels after Level 10, capped at 1.48x (level 70+)
    const scaleFactor = 1.0 + scalingSteps * 0.08;
    return Math.min(1.48, scaleFactor);
  };

  const getStandardBottleSize = () => {
    const midpoint = Math.ceil(bottles.length / 2);
    const row1Count = bottles.length < 5 ? bottles.length : midpoint;
    const row2Count = bottles.length < 5 ? 0 : bottles.length - midpoint;
    const maxInRow = Math.max(row1Count, row2Count);
    if (maxInRow === 0) return { width: 68, height: 204 };

    const gapX = bottles.length >= 6 ? 6 : 12;
    const gapY = bottles.length >= 6 ? 12 : 16;
    const numRows = row2Count > 0 ? 2 : 1;

    const maxWidthByWidth = (availWidth - (maxInRow - 1) * gapX) / maxInRow;
    const maxHeightByHeight = (availHeight - (numRows - 1) * gapY) / numRows;

    let width = Math.min(maxWidthByWidth, maxHeightByHeight / 3);
    const maxAllowedWidth = bottles.length >= 6 ? 78 : 98;
    const minAllowedWidth = 32; // Allow smaller width on small devices to prevent overflow
    width = Math.min(maxAllowedWidth, Math.max(minAllowedWidth, width));

    // Dynamic level scaling logic (size progressively increases after level 10)
    const scale = getLevelScaleFactor(currentLevel);
    width = width * scale;

    return {
      width,
      height: width * 3,
    };
  };

  const standardBottleSize = getStandardBottleSize();

  const getGateBottleSize = () => {
    if (bottles.length === 0) return { compactWidth: 65, compactHeight: 195, giantWidth: 115, giantHeight: 345 };
    const outerCount = bottles.length - 1;
    const leftCount = Math.min(4, Math.floor(outerCount / 2));
    const rightCount = leftCount;
    const bottomCount = outerCount - (leftCount + rightCount);

    const gapX = 12;
    const gapY = 16;
    const maxRowMultiplier = 3.4; // allow more physical horizontal span
    const maxColMultiplier = bottomCount > 0 ? 4.5 : 3.5; // allow more physical vertical span

    const maxWidthByWidth = (availWidth - gapX * 4) / maxRowMultiplier;
    const maxHeightByHeight = (availHeight - gapY * maxColMultiplier) / maxColMultiplier;

    let compactWidth = Math.min(maxWidthByWidth, maxHeightByHeight / 3);
    // Increase size of the side and bottom bottles by about 20%
    compactWidth = compactWidth * 1.20;
    compactWidth = Math.min(80, Math.max(30, compactWidth)); // Increase caps from 68 to 80, and 24 to 30

    // Dynamic level scaling logic for gate bottles
    const scale = getLevelScaleFactor(currentLevel);
    compactWidth = compactWidth * scale;

    const giantWidth = compactWidth * 1.65; // Make center bottle slightly wider for extra epic feel

    return {
      compactWidth,
      compactHeight: compactWidth * 3,
      giantWidth,
      giantHeight: giantWidth * 3,
    };
  };

  const gateBottleSize = getGateBottleSize();
  const [selectedBottleId, setSelectedBottleId] = useState<number | null>(null);
  const [history, setHistory] = useState<BottleState[][]>([]);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'home' | 'level-select'>('home');
  const [addedExtraBottle, setAddedExtraBottle] = useState<boolean>(false);
  const [isTransitioningToWin, setIsTransitioningToWin] = useState<boolean>(false);

  // Oscillation effect for the needle kanta spinner
  useEffect(() => {
    if (status !== 'won' || !isMilestoneSpinning || currentLevel % 10 !== 0) return;
    const interval = setInterval(() => {
      setMilestoneNeedleValue((prev) => {
        let next = prev + milestoneNeedleDir * 4.5; // Speed of needle oscillation
        if (next >= 97) {
          next = 97;
          setMilestoneNeedleDir(-1);
        } else if (next <= 3) {
          next = 3;
          setMilestoneNeedleDir(1);
        }
        return next;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [status, isMilestoneSpinning, milestoneNeedleDir, currentLevel]);

  // Settings popover
  const [showHomeSettingsMenu, setShowHomeSettingsMenu] = useState<boolean>(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [tutorialCoords, setTutorialCoords] = useState<{ x: number; y: number; label: string } | null>(null);
  
  // Powerups State
  const [boosters, setBoosters] = useState<{ undo: number; extraBottle: number }>({
    undo: 5,
    extraBottle: 2
  });

  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('water_sort_theme');
    const matched = THEMES.find(t => t.id === saved);
    return matched || THEMES[0];
  });

  const isDarkThemeActive = activeTheme.id !== 'summer' && activeTheme.id !== 'pastel' && activeTheme.id !== 'pink';

  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('water_sort_music_muted');
    return saved === 'true';
  });

  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('water_sort_sound_muted');
    return saved === 'true';
  });

  // Snappy physical timings optimized for smooth fast progression
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [pourSourceId, setPourSourceId] = useState<number | null>(null);
  const [pourTargetId, setPourTargetId] = useState<number | null>(null);
  const [pourAngle, setPourAngle] = useState<number>(0);
  const [pourOffset, setPourOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isStreamActive, setIsStreamActive] = useState<boolean>(false);
  const [streamColor, setStreamColor] = useState<string>('');
  const [animatingSourceLayers, setAnimatingSourceLayers] = useState<WaterLayer[] | null>(null);
  const [animatingTargetLayers, setAnimatingTargetLayers] = useState<WaterLayer[] | null>(null);

  // Solvability hints
  const [isHintActive, setIsHintActive] = useState<boolean>(false);
  const [isExtraTubeHintActive, setIsExtraTubeHintActive] = useState<boolean>(false);
  const [hintDetails, setHintDetails] = useState<{ from: number; to: number } | null>(null);
  const [hintCoords, setHintCoords] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  useEffect(() => {
    if (!isHintActive || (!hintDetails && !isExtraTubeHintActive)) {
      setHintCoords(null);
      return;
    }

    const updateCoords = () => {
      if (isExtraTubeHintActive) {
        const extraBtn = document.getElementById('booster-button-extra-tube');
        if (extraBtn) {
          const parentElem = extraBtn.offsetParent || document.body;
          const parentRect = parentElem.getBoundingClientRect();
          const rect = extraBtn.getBoundingClientRect();
          setHintCoords({
            x1: rect.left - parentRect.left + rect.width / 2,
            y1: rect.top - parentRect.top - 15,
            x2: rect.left - parentRect.left + rect.width / 2,
            y2: rect.top - parentRect.top
          });
        }
        return;
      }

      const sourceElem = document.getElementById(`bottle-wrapper-${hintDetails.from}`);
      const targetElem = document.getElementById(`bottle-wrapper-${hintDetails.to}`);

      if (sourceElem && targetElem) {
        const parentElem = sourceElem.offsetParent || document.body;
        const parentRect = parentElem.getBoundingClientRect();
        const srcRect = sourceElem.getBoundingClientRect();
        const destRect = targetElem.getBoundingClientRect();

        setHintCoords({
          x1: srcRect.left - parentRect.left + srcRect.width / 2,
          y1: srcRect.top - parentRect.top,
          x2: destRect.left - parentRect.left + destRect.width / 2,
          y2: destRect.top - parentRect.top,
        });
      }
    };

    updateCoords();
    const timer1 = setTimeout(updateCoords, 60);
    const timer2 = setTimeout(updateCoords, 200);
    window.addEventListener('resize', updateCoords);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isHintActive, hintDetails, isExtraTubeHintActive, bottles]);

  // Interactive 2-level guide tutorial automatic tracking hook
  useEffect(() => {
    if (currentLevel > 2 || status !== 'playing') {
      setTutorialCoords(null);
      return;
    }

    const updateTutorialCoords = () => {
      const tutMove = getHint(bottles);
      if (!tutMove) {
        setTutorialCoords(null);
        return;
      }

      // If nothing is selected, point to 'from' bottle. If selected, point to 'to' bottle.
      const targetBottleId = selectedBottleId === null ? tutMove.from : tutMove.to;
      const targetElem = document.getElementById(`bottle-wrapper-${targetBottleId}`);
      if (targetElem) {
        const parentElem = targetElem.offsetParent || document.body;
        const parentRect = parentElem.getBoundingClientRect();
        const rect = targetElem.getBoundingClientRect();
        const label = selectedBottleId === null 
          ? "TAP TO SELECT BOTTLE" 
          : "TAP HERE TO POUR";
        setTutorialCoords({
          x: rect.left - parentRect.left + rect.width / 2,
          y: rect.top - parentRect.top,
          label
        });
      } else {
        setTutorialCoords(null);
      }
    };

    updateTutorialCoords();
    const t1 = setTimeout(updateTutorialCoords, 60);
    const t2 = setTimeout(updateTutorialCoords, 250);
    const t3 = setTimeout(updateTutorialCoords, 600);
    window.addEventListener('resize', updateTutorialCoords);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', updateTutorialCoords);
    };
  }, [currentLevel, status, selectedBottleId, bottles]);

  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [claimedReward, setClaimedReward] = useState<string>('');

  const pourAudioHandleRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    audio.setMusicMute(isMusicMuted);
  }, [isMusicMuted]);

  useEffect(() => {
    audio.setSoundMute(isSoundMuted);
  }, [isSoundMuted]);

  // Automatic ambient BGM trigger on first user interaction (bypasses browser autoplay policy cleanly)
  useEffect(() => {
    const triggerBGM = () => {
      if (!isMusicMuted) {
        audio.startBGM();
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('click', triggerBGM);
      window.removeEventListener('pointerdown', triggerBGM);
      window.removeEventListener('keydown', triggerBGM);
      window.removeEventListener('touchstart', triggerBGM);
      window.removeEventListener('mousedown', triggerBGM);
      window.removeEventListener('mouseover', triggerBGM);
      window.removeEventListener('focus', triggerBGM);
      document.removeEventListener('visibilitychange', triggerBGM);
    };

    window.addEventListener('click', triggerBGM);
    window.addEventListener('pointerdown', triggerBGM);
    window.addEventListener('keydown', triggerBGM);
    window.addEventListener('touchstart', triggerBGM);
    window.addEventListener('mousedown', triggerBGM);
    window.addEventListener('mouseover', triggerBGM, { once: true });
    window.addEventListener('focus', triggerBGM);
    document.addEventListener('visibilitychange', triggerBGM);

    if (!isMusicMuted) {
      audio.startBGM();
    }

    return cleanup;
  }, [isMusicMuted]);

  useEffect(() => {
    if (status === 'playing') {
      const initialBottles = generateLevel(currentLevel);
      setBottles(initialBottles);
      setSelectedBottleId(null);
      setHistory([]);
      setMovesCount(0);
      setAddedExtraBottle(false);
      setIsHintActive(false);
      setIsExtraTubeHintActive(false);
      setHintDetails(null);
    }
  }, [currentLevel, status]);

  const handleToggleMusicMute = () => {
    const nextMuted = !isMusicMuted;
    setIsMusicMuted(nextMuted);
    localStorage.setItem('water_sort_music_muted', String(nextMuted));
    audio.setMusicMute(nextMuted);
  };

  const handleToggleSoundMute = () => {
    const nextMuted = !isSoundMuted;
    setIsSoundMuted(nextMuted);
    localStorage.setItem('water_sort_sound_muted', String(nextMuted));
    audio.setSoundMute(nextMuted);
  };

  // Buy custom Vessel styles (exactly 10,000 Coins as requested)
  const handleEquipVessel = (vesselId: string, cost: number, name: string) => {
    const isUnlocked = unlockedVessels.includes(vesselId);
    if (isUnlocked) {
      audio.playClick();
      setActiveVesselStyle(vesselId);
      localStorage.setItem('water_sort_active_vessel', vesselId);
    } else {
      if (coins >= cost) {
        audio.playWin();
        const nextCoins = coins - cost;
        setCoins(nextCoins);
        localStorage.setItem('water_sort_coins', String(nextCoins));

        const nextUnlocked = [...unlockedVessels, vesselId];
        setUnlockedVessels(nextUnlocked);
        localStorage.setItem('water_sort_unlocked_vessels', JSON.stringify(nextUnlocked));

        setActiveVesselStyle(vesselId);
        localStorage.setItem('water_sort_active_vessel', vesselId);

        setClaimedReward(`🎉 BOTTLE UNLOCKED! You spent ${cost} Coins and equipped the precious "${name}" vessel shape successfully!`);
        setShowClaimModal(true);
      } else {
        audio.playInvalid();
        setClaimedReward(`⚠️ INSUFFICIENT COINS! Unlocking the "${name}" custom vessel costs exactly ${cost} Coins. Complete more levels to earn coins!`);
        setShowClaimModal(true);
      }
    }
  };

  // Buy procedural cosmetic Outline auras (exactly 10,000 Coins as requested)
  const handleEquipSkin = (skinId: string, glowColor: string, cost: number, name: string) => {
    const isUnlocked = unlockedSkins.includes(skinId);
    if (isUnlocked) {
      audio.playClick();
      setActiveSkinId(skinId);
      setActiveSkinGlowColor(glowColor);
      localStorage.setItem('water_sort_active_skin_id', skinId);
      localStorage.setItem('water_sort_active_skin_glow', glowColor);
    } else {
      if (coins >= cost) {
        audio.playWin();
        const nextCoins = coins - cost;
        setCoins(nextCoins);
        localStorage.setItem('water_sort_coins', String(nextCoins));

        const nextUnlocked = [...unlockedSkins, skinId];
        setUnlockedSkins(nextUnlocked);
        localStorage.setItem('water_sort_unlocked_skins', JSON.stringify(nextUnlocked));

        setActiveSkinId(skinId);
        setActiveSkinGlowColor(glowColor);
        localStorage.setItem('water_sort_active_skin_id', skinId);
        localStorage.setItem('water_sort_active_skin_glow', glowColor);

        setClaimedReward(`🌌 COSMIC SKIN SHADER EQUIPPED! You spent ${cost} Coins and activated the neon glowing "${name}" aura outline shader!`);
        setShowClaimModal(true);
      } else {
        audio.playInvalid();
        setClaimedReward(`⚠️ INSUFFICIENT COINS! Unlocking the precious space outline theme shader "${name}" costs ${cost} Coins. Keep sorting!`);
        setShowClaimModal(true);
      }
    }
  };

  // Switch Themes
  const handleSelectTheme = (theme: ThemeConfig) => {
    const isUnlocked = unlockedThemes.includes(theme.id);
    if (isUnlocked) {
      audio.playClick();
      setActiveTheme(theme);
      localStorage.setItem('water_sort_theme', theme.id);
    } else {
      if (coins >= 10000) {
        audio.playWin();
        const nextCoins = coins - 10000;
        setCoins(nextCoins);
        localStorage.setItem('water_sort_coins', String(nextCoins));

        const nextUnlocked = [...unlockedThemes, theme.id];
        setUnlockedThemes(nextUnlocked);
        localStorage.setItem('water_sort_unlocked_themes', JSON.stringify(nextUnlocked));

        setActiveTheme(theme);
        localStorage.setItem('water_sort_theme', theme.id);

        setClaimedReward(`🎉 THEME PURCHASED! Spent 10000 Coins and successfully unlocked the core landscape artwork theme "${theme.name}"!`);
        setShowClaimModal(true);
      } else {
        audio.playInvalid();
        setClaimedReward(`⚠️ INSUFFICIENT COINS! Premium Theme "${theme.name}" costs 10000 Coins. Solve more levels, or claim free coin bundles!`);
        setShowClaimModal(true);
      }
    }
  };

  const handleOpenThemeMarket = () => {
    audio.playClick();
    setMarketTab('themes');
    setShowMarketModal(true);
  };

  const handleStartGame = (lvl: number) => {
    setCurrentLevel(lvl);
    localStorage.setItem('water_sort_level', String(lvl));
    setStatus('playing');
  };

  const handleRestart = () => {
    const initialBottles = generateLevel(currentLevel);
    setBottles(initialBottles);
    setSelectedBottleId(null);
    setHistory([]);
    setMovesCount(0);
    setAddedExtraBottle(false);
    setIsHintActive(false);
    setIsExtraTubeHintActive(false);
    setHintDetails(null);
    if (pourAudioHandleRef.current) {
      pourAudioHandleRef.current.stop();
    }
    setIsPouring(false);
    setPourSourceId(null);
    setPourTargetId(null);
    setPourAngle(0);
    setPourOffset({ x: 0, y: 0 });
    setIsStreamActive(false);
  };

  const handleUndo = async () => {
    if (history.length === 0 || isPouring || isTransitioningToWin) return;
    
    if (coins < 50) {
      audio.playInvalid();
      setClaimedReward('⚠️ INSUFFICIENT COINS! Each Undo step costs exactly 50 gold coins. Solve more levels to earn coins!');
      setShowClaimModal(true);
      return;
    }

    // Determine the source and target bottles of the reverse animation
    const previousState = JSON.parse(JSON.stringify(history[history.length - 1])) as BottleState[];
    
    // Find undoSourceId and undoTargetId based on total volume changes (where water was added/removed)
    let undoSourceId: number | null = null;
    let undoTargetId: number | null = null;

    for (let i = 0; i < bottles.length; i++) {
      const bCur = bottles[i];
      const bPrev = previousState.find(b => b.id === bCur.id);
      if (bPrev) {
        const vCur = bCur.layers.reduce((sum, l) => sum + l.volume, 0);
        const vPrev = bPrev.layers.reduce((sum, l) => sum + l.volume, 0);
        if (vCur > vPrev) {
          undoSourceId = bCur.id;
        } else if (vCur < vPrev) {
          undoTargetId = bCur.id;
        }
      }
    }

    const nextCoins = coins - 50;
    setCoins(nextCoins);
    localStorage.setItem('water_sort_coins', String(nextCoins));
    audio.playUndo();

    const prevHistory = [...history];
    prevHistory.pop();
    setHistory(prevHistory);
    setMovesCount((prev) => Math.max(0, prev - 1));
    setSelectedBottleId(null);
    setIsHintActive(false);
    setIsExtraTubeHintActive(false);
    setHintDetails(null);

    if (undoSourceId !== null && undoTargetId !== null) {
      // Rise Phase: Smoothly lift the undo source bottle upwards first
      setSelectedBottleId(undoSourceId);
      await new Promise((r) => setTimeout(r, 250));

      const undoSourceBottle = bottles.find((b) => b.id === undoSourceId)!;
      const undoTargetBottle = bottles.find((b) => b.id === undoTargetId)!;

      // We run the full, physical pouring animation backwards using our premium rAF engine!
      await runPourAnimation(
        undoSourceId,
        undoTargetId,
        undoSourceBottle,
        undoTargetBottle,
        true
      );

      // Restore board state seamlessly
      setBottles(previousState);

      setIsPouring(false);
      setPourSourceId(null);
      setPourTargetId(null);
      setSelectedBottleId(null); // Return bottle back down to standard position
    } else {
      // Immediate backup restore if we can't find direct source/target tracking
      setBottles(previousState);
    }
  };

  const handleAddBottle = () => {
    if (isPouring || isTransitioningToWin) return;
    
    if (bottles.length >= 15) {
      setClaimedReward("⚠️ MAXIMUM BOTTLE LIMIT REACHED (15)!");
      setShowClaimModal(true);
      return;
    }
    
    const extraTube: BottleState = {
      id: bottles.length,
      layers: [],
      capacity: 4,
      isExtra: true
    };
    
    setBottles((prev) => [...prev, extraTube]);
    setAddedExtraBottle(true);
    setIsHintActive(false);
    setIsExtraTubeHintActive(false);
    setHintDetails(null);
  };

  const handleToggleHint = () => {
    if (isTransitioningToWin) return;
    if (isHintActive) {
      setIsHintActive(false);
      setHintDetails(null);
      setIsExtraTubeHintActive(false);
    } else {
      const hint = getHint(bottles);
      if (hint) {
        setHintDetails(hint);
        setIsExtraTubeHintActive(false);
        setIsHintActive(true);
      } else {
        audio.playInvalid();
        setIsExtraTubeHintActive(true);
        setIsHintActive(true);
        setClaimedReward("⚠️ STUCK - NO MOVES POSSIBLE!\nAn empty assist container is required to advance. Click the 'Extra' Tube Booster below! 🧪");
        setShowClaimModal(true);
      }
    }
  };

  const handleClaimGift = () => {
    audio.playWin();
    setBoosters({
      undo: 5,
      extraBottle: 2
    });
    const nextCoins = coins + 500;
    setCoins(nextCoins);
    localStorage.setItem('water_sort_coins', String(nextCoins));
    setClaimedReward('BOOSTER PACKAGE UNLOCKED! 🎁 Received +5 Undo charges, +2 Assist Tubes, and +500 Gold Coins!');
    setShowClaimModal(true);
  };

  const handleHomeGift = () => {
    const now = Date.now();
    const remaining = 43200000 - (now - lastGiftTime); // 12 hours
    if (remaining > 0) {
      audio.playInvalid();
      setClaimedReward(`⏳ DAILY GIFT COOLDOWN!\nNext free gift will be available in ${formatCooldown(remaining)}.`);
      setShowClaimModal(true);
      return;
    }

    audio.playClick();
    audio.playWin();
    
    // Save last gift time to state and storage
    setLastGiftTime(now);
    localStorage.setItem('water_sort_last_gift_time', String(now));

    const updatedCoins = coins + 50; // Giving 50 coins as requested
    setCoins(updatedCoins);
    localStorage.setItem('water_sort_coins', String(updatedCoins));
    setClaimedReward("🎁 CONGRATULATIONS!\nYou claimed your free gift and earned 🪙 +50 Gold Coins instantly!");
    setShowClaimModal(true);
  };

  const runPourAnimation = (
    sourceId: number,
    targetId: number,
    sourceBottle: BottleState,
    targetBottle: BottleState,
    isUndoAnim: boolean = false
  ): Promise<{ nextSource: BottleState; nextTarget: BottleState }> => {
    return new Promise((resolve) => {
      // Calculate coordinates translation offsets
      const sourceWrapper = document.getElementById(`bottle-wrapper-${sourceId}`);
      const targetWrapper = document.getElementById(`bottle-wrapper-${targetId}`);

      let dx = 0;
      let dy = 0;
      let sourceRect = { left: 0, top: 0, width: 60, height: 180 };

      if (sourceWrapper && targetWrapper) {
        const sRect = sourceWrapper.getBoundingClientRect();
        const tRect = targetWrapper.getBoundingClientRect();
        sourceRect = {
          left: sRect.left,
          top: sRect.top,
          width: sRect.width,
          height: sRect.height
        };
        dx = tRect.left - sRect.left;
        dy = tRect.top - sRect.top;
      } else {
        const sourceIndex = bottles.findIndex((b) => b.id === sourceId);
        const targetIndex = bottles.findIndex((b) => b.id === targetId);
        dx = (targetIndex - sourceIndex) * 98;
        dy = 0;
      }

      const isRight = dx > 0;
      const baseAngle = isRight ? 40 : -40; // Bottle rotates about 40° as requested!
      const shiftX = dx + (isRight ? -38 : 38);
      const shiftY = dy - 120;

      // Safe viewport boundary clamping logic to ensure bottle remains 100% visible
      // limits layout to safe screen zone [10, windowWidth - 10] and [64, windowHeight - 80]
      const bottleWidth = sourceRect.width || 60;
      const bottleHeight = sourceRect.height || 180;
      
      const safeMinX = 10 - sourceRect.left;
      const safeMaxX = windowSize.width - bottleWidth - 10 - sourceRect.left;
      const clampedShiftX = Math.max(safeMinX, Math.min(safeMaxX, shiftX));

      const safeMinY = 64 - sourceRect.top;
      const safeMaxY = windowSize.height - 80 - bottleHeight - sourceRect.top;
      const clampedShiftY = Math.max(safeMinY, Math.min(safeMaxY, shiftY));

      const topSourceLayer = sourceBottle.layers[sourceBottle.layers.length - 1];
      const streamColorVal = topSourceLayer ? topSourceLayer.color : '';
      setStreamColor(streamColorVal);

      // Perform the game-logic pour to get final states and total units poured
      const { source: nextSource, target: nextTarget, pouredUnits } = pour(sourceBottle, targetBottle);

      // If no units were poured, abort immediately
      if (pouredUnits <= 0) {
        resolve({ nextSource, nextTarget });
        return;
      }

      setIsPouring(true);
      setPourSourceId(sourceId);
      setPourTargetId(targetId);

      // Timing configuration scaled dynamically by gameSpeed to enable turbo-pouring with zero lag:
      const phase1LiftDuration = Math.max(20, Math.round(110 / gameSpeed));
      const phase1MoveDuration = Math.max(20, Math.round(90 / gameSpeed));
      const phase1TiltDuration = Math.max(20, Math.round(80 / gameSpeed));
      const phase1Duration = phase1LiftDuration + phase1MoveDuration + phase1TiltDuration;
      const phase2Duration = Math.max(30, Math.round(250 / gameSpeed));
      const phase3Duration = Math.max(10, Math.round(40 / gameSpeed));
      const phase4Duration = Math.max(20, Math.round(120 / gameSpeed));

      const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;

        if (elapsed < phase1Duration) {
          if (elapsed < phase1LiftDuration) {
            // Step 1: Smooth vertical lift upward (0 to -40px)
            const p = easeInOutCubic(elapsed / phase1LiftDuration);
            const liftY = p * -40;
            // Clamp lift to not exceed upper screen edge
            const clampedLiftY = Math.max(safeMinY, liftY);
            setPourOffset({ x: 0, y: clampedLiftY });
            setPourAngle(0);
          } else if (elapsed < phase1LiftDuration + phase1MoveDuration) {
            // Step 2: Smooth move laterally and vertically from lift peak to target pour offset
            const moveElapsed = elapsed - phase1LiftDuration;
            const p = easeInOutCubic(moveElapsed / phase1MoveDuration);
            const initialLiftY = Math.max(safeMinY, -40);
            setPourOffset({
              x: p * clampedShiftX,
              y: initialLiftY + p * (clampedShiftY - initialLiftY),
            });
            setPourAngle(0);
          } else {
            // Step 3: Smooth tilt once aligned with target mouth
            const tiltElapsed = elapsed - phase1LiftDuration - phase1MoveDuration;
            const p = easeInOutCubic(tiltElapsed / phase1TiltDuration);
            setPourOffset({ x: clampedShiftX, y: clampedShiftY });
            setPourAngle(p * baseAngle);
          }
          
          // No water flow or level updates yet
          setAnimatingSourceLayers(sourceBottle.layers);
          setAnimatingTargetLayers(targetBottle.layers);
          setIsStreamActive(false);

          requestAnimationFrame(animate);
        } else if (elapsed < phase1Duration + phase2Duration) {
          // PHASE 2: Pouring flow with perfect easeInOut level sync
          setIsStreamActive(true);

          // Play pouring sound immediately when liquid starts transferring (Phase 2)
          if (!pourAudioHandleRef.current) {
            pourAudioHandleRef.current = audio.startPour();
          }

          const flowElapsed = elapsed - phase1Duration;
          const ratio = Math.min(1, flowElapsed / phase2Duration);
          const easeP = easeInOutCubic(ratio); // Use easeInOut interpolation for natural motion!

          // Smoothly rotate slightly deeper from base angle (40°) as the liquid level drains
          const deeperAngle = isRight ? 45 : -45;
          setPourAngle(baseAngle + easeP * (deeperAngle - baseAngle));
          setPourOffset({ x: clampedShiftX, y: clampedShiftY });

          // Helper function for source interpolation
          const getSourceInterpolated = (volToRemove: number) => {
            const layersCopy = JSON.parse(JSON.stringify(sourceBottle.layers)) as WaterLayer[];
            let rem = volToRemove;
            while (rem > 0 && layersCopy.length > 0) {
              const top = layersCopy[layersCopy.length - 1];
              if (top.volume <= rem) {
                rem -= top.volume;
                layersCopy.pop();
              } else {
                top.volume -= rem;
                rem = 0;
              }
            }
            return layersCopy;
          };

          // Helper function for target interpolation
          const getTargetInterpolated = (volToAdd: number) => {
            const layersCopy = JSON.parse(JSON.stringify(targetBottle.layers)) as WaterLayer[];
            if (volToAdd <= 0) return layersCopy;
            if (layersCopy.length > 0 && layersCopy[layersCopy.length - 1].color === streamColorVal) {
              layersCopy[layersCopy.length - 1].volume += volToAdd;
            } else {
              layersCopy.push({
                color: streamColorVal,
                colorName: topSourceLayer ? topSourceLayer.colorName : '',
                volume: volToAdd,
              });
            }
            return layersCopy;
          };

          // Decreasing source water level and increasing target level smoothly and synchronously
          setAnimatingSourceLayers(getSourceInterpolated(easeP * pouredUnits));
          setAnimatingTargetLayers(getTargetInterpolated(easeP * pouredUnits));

          requestAnimationFrame(animate);
        } else if (elapsed < phase1Duration + phase2Duration + phase3Duration) {
          // PHASE 3: Trickle out, stream stops
          setIsStreamActive(false);
          setAnimatingSourceLayers(nextSource.layers);
          setAnimatingTargetLayers(nextTarget.layers);

          // Stop pouring sound exactly when pouring flow ends (Phase 3 start)
          if (pourAudioHandleRef.current) {
            pourAudioHandleRef.current.stop();
            pourAudioHandleRef.current = null;
          }
          
          // Apply state update mid-stream so react state matches rendered layer state seamlessly!
          setBottles((prev) =>
            prev.map((b) => {
              if (b.id === sourceId) return nextSource;
              if (b.id === targetId) return nextTarget;
              return b;
            })
          );

          requestAnimationFrame(animate);
        } else {
          // PHASE 4: Return home
          const returnElapsed = elapsed - phase1Duration - phase2Duration - phase3Duration;
          const p = easeInOutCubic(Math.min(1, returnElapsed / phase4Duration));

          // Stop pouring sound IMMEDIATELY when return starts
          if (pourAudioHandleRef.current) {
            pourAudioHandleRef.current.stop();
            pourAudioHandleRef.current = null;
          }

          setPourOffset({ x: (1 - p) * clampedShiftX, y: (1 - p) * clampedShiftY });
          setPourAngle((1 - p) * baseAngle);
          
          // Keep displaying final states
          setAnimatingSourceLayers(nextSource.layers);
          setAnimatingTargetLayers(nextTarget.layers);

          if (returnElapsed < phase4Duration) {
            requestAnimationFrame(animate);
          } else {
            // Animation finished! Clean up everything
            setPourOffset({ x: 0, y: 0 });
            setPourAngle(0);
            setIsStreamActive(false);
            setAnimatingSourceLayers(null);
            setAnimatingTargetLayers(null);
            setIsPouring(false);
            resolve({ nextSource, nextTarget });
          }
        }
      };

      requestAnimationFrame(animate);
    });
  };

  const handleSelectBottle = async (bottleId: number) => {
    if (status !== 'playing' || isPouring || isTransitioningToWin) return;

    if (selectedBottleId === null) {
      const bottle = bottles.find((b) => b.id === bottleId);
      if (!bottle || bottle.layers.length === 0) {
        audio.playInvalid();
        return;
      }
      
      audio.playSelect();
      setSelectedBottleId(bottleId);
    } else {
      const sourceId = selectedBottleId;
      const targetId = bottleId;

      if (sourceId === targetId) {
        audio.playSelect();
        setSelectedBottleId(null);
        return;
      }

      const sourceBottle = bottles.find((b) => b.id === sourceId)!;
      const targetBottle = bottles.find((b) => b.id === targetId)!;

      if (!canPour(sourceBottle, targetBottle)) {
        audio.playInvalid();
        setSelectedBottleId(null);
        return;
      }

      setIsHintActive(false);
      setIsExtraTubeHintActive(false);
      setHintDetails(null);

      const snapshot = JSON.parse(JSON.stringify(bottles)) as BottleState[];
      setHistory((prev) => [...prev, snapshot]);

      const { nextSource, nextTarget } = await runPourAnimation(
        sourceId,
        targetId,
        sourceBottle,
        targetBottle
      );

      setSelectedBottleId(null);
      setMovesCount((prev) => prev + 1);

      const afterPourAllBottles = bottles.map((b) => {
        if (b.id === sourceId) return nextSource;
        if (b.id === targetId) return nextTarget;
        return b;
      });

      if (checkWin(afterPourAllBottles)) {
        setIsTransitioningToWin(true);
        audio.playWin();

        setTimeout(() => {
          setIsTransitioningToWin(false);
          setStatus('won');

          // Reset 10-level milestone states for the newly won level!
          setMilestoneNeedleValue(50);
          setMilestoneNeedleDir(1);
          setIsMilestoneSpinning(true);
          setIsMilestoneBoxOpened(false);
          setMilestoneClaimedBonus(null);
          setMilestoneBonusClaimed(false);

          const nextLvl = currentLevel + 1;
          localStorage.setItem('water_sort_level', String(nextLvl));

          const nextMax = Math.max(maxUnlockedLevel, nextLvl);
          setMaxUnlockedLevel(nextMax);
          localStorage.setItem('water_sort_max_unlocked', String(nextMax));

          // +50 coins per level cleared
          const nextCoins = coins + 50;
          setCoins(nextCoins);
          localStorage.setItem('water_sort_coins', String(nextCoins));
        }, 1000);
      }
    }
  };

  const handleNextLevel = () => {
    audio.playClick();
    
    const proceed = () => {
      const nextLvl = currentLevel + 1;
      setCurrentLevel(nextLvl);

      const nextMax = Math.max(maxUnlockedLevel, nextLvl);
      setMaxUnlockedLevel(nextMax);
      localStorage.setItem('water_sort_max_unlocked', String(nextMax));

      setStatus('playing');
    };

    proceed();
  };

  const isGateLevel = currentLevel % 10 === 0 && currentLevel > 0;

  // Split outer tubes symmetrically for Gate Levels
  const getGateTubesSplit = () => {
    if (!isGateLevel || bottles.length === 0) {
      return { centerTube: null, leftTubes: [], rightTubes: [], bottomTubes: [] };
    }
    const centerTube = bottles[0];
    const outer = bottles.slice(1);
    const leftCount = Math.min(4, Math.floor(outer.length / 2));
    const rightCount = leftCount;
    const leftTubes = outer.slice(0, leftCount);
    const rightTubes = outer.slice(leftCount, leftCount + rightCount);
    const bottomTubes = outer.slice(leftCount + rightCount);
    
    return { centerTube, leftTubes, rightTubes, bottomTubes };
  };

  const { centerTube, leftTubes, rightTubes, bottomTubes } = getGateTubesSplit();

  // Symmetrical layout rows splitting
  const getTubeRows = () => {
    if (bottles.length < 5) {
      return [bottles, []];
    }
    const midpoint = Math.ceil(bottles.length / 2);
    const row1 = bottles.slice(0, midpoint);
    const row2 = bottles.slice(midpoint);
    return [row1, row2];
  };

  const [row1Tubes, row2Tubes] = getTubeRows();

  // Lock gameplay to user equipped/unlocked bottle shape
  const currentVesselStyle = activeVesselStyle;

  if (isSplashActive) {
    if (splashPhase === 'studio') {
      return (
        <div 
          id="splash-loader-screen-studio"
          className="fixed inset-0 bg-[#0052FF] flex flex-col items-center justify-center z-[99999] select-none text-white overflow-hidden cursor-pointer"
          onClick={() => {
            if (!isMusicMuted) {
              audio.startBGM();
            }
          }}
          onPointerDown={() => {
            if (!isMusicMuted) {
              audio.startBGM();
            }
          }}
        >
          <div className="flex flex-col items-center justify-center gap-10 max-w-sm w-full p-6">
            {/* Main Diamond Icon Container */}
            <div className="relative">
              {/* Solid Pink/Magenta/Red Rotated Square (Diamond) with soft drop shadow */}
              <div className="relative w-24 h-24 bg-[#FF0563] rounded-[24px] rotate-45 flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.22)]">
                {/* White Letter "G" - rotated back -45deg to stay upright */}
                <div className="transform -rotate-45 text-5xl font-black text-white font-sans tracking-tight">
                  G
                </div>
              </div>
            </div>

            {/* Texts Section */}
            <div className="flex flex-col items-center gap-2.5 text-center mt-3">
              <h1 className="text-white text-[42px] font-black tracking-[0.22em] leading-none uppercase translate-x-[0.11em] font-sans">
                GALAXY
              </h1>
              <p className="text-[#FF8FAB] text-xs font-black tracking-[0.48em] uppercase translate-x-[0.24em] mt-1 font-sans">
                STUDIO
              </p>
            </div>
          </div>

          {/* Kept clean with no intrusive overlay labels */}
        </div>
      );
    } else {
      // High Fidelity Custom Loading Gate Screen styled exactly like user reference image
      return (
        <div 
          id="splash-loader-screen-gate"
          className="fixed inset-0 bg-gradient-to-b from-[#7FB1FF] via-[#5D9AFF] to-[#2563EB] flex flex-col items-center justify-between z-[99999] select-none text-white overflow-hidden p-6 pb-12"
        >
          {/* Drifting subtle blue stars and ambient bubble sparkles */}
          <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
            <div className="absolute top-[10%] left-[8%] w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
            <div className="absolute top-[25%] right-[12%] w-3.5 h-3.5 bg-sky-200 rounded-full animate-pulse" />
            <div className="absolute top-[50%] left-[18%] w-1.5 h-1.5 bg-yellow-200 rounded-full" />
            <div className="absolute bottom-[35%] right-[15%] w-3 h-3 bg-purple-200 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
          </div>

          {/* Fluffy white Vector Silhouetted Clouds at bottom of loading gate */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none h-44 z-0 opacity-90">
            <svg className="absolute bottom-[-15px] left-0 w-full h-36 fill-white" viewBox="0 0 1000 100" preserveAspectRatio="none">
              <path d="M 0,100 C 60,70 140,70 190,100 C 240,60 370,60 440,100 C 490,50 640,50 710,100 C 770,70 910,70 1000,100 Z" fill="#F0F6FF" opacity="0.6" />
              <path d="M 0,100 C 100,80 180,55 280,100 C 350,72 480,45 600,100 C 660,65 820,55 890,100 L 1000,100 L 0,100" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Spacer */}
          <div className="h-4" />

          {/* Logo Title Section with Pouring Bottle Overlay exactly like reference layout */}
          <div className="flex flex-col items-center justify-center text-center relative z-10 w-full max-w-sm mt-4">
            {/* Embedded 3D Bottle Pouring from Above the title */}
            <div className="absolute -top-14 left-1/2 -translate-x-[40px] w-20 h-20 pointer-events-none z-20">
              <svg className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(255,255,255,0.4)]" viewBox="0 0 100 100">
                <g style={{ transform: 'rotate(-40deg) translate(-10px, -2px)', transformOrigin: '50px 50px' }}>
                  {/* Bottle */}
                  <path d="M 35,20 L 65,20 L 65,30 C 65,35 75,38 75,55 L 75,85 C 75,92 65,95 50,95 C 35,95 25,92 25,85 L 25,55 C 25,38 35,35 35,30 Z" fill="none" stroke="#FFFFFF" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 35,20 L 65,20 L 65,30 C 65,35 75,38 75,55 L 75,85 C 75,92 65,95 50,95 C 35,95 25,92 25,85 L 25,55 C 25,38 35,35 35,30 Z" fill="rgba(255,255,255,0.15)" />
                  {/* Liquid inside */}
                  <path d="M 28,60 C 28,85 32,90 50,90 C 68,90 72,85 72,60 L 72,55 C 72,55 58,58 50,55 C 42,52 28,55 28,55 Z" fill="#06b6d4" />
                  {/* Glowing Reflection */}
                  <path d="M 32,58 C 29,66 29,78 32,83" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
                </g>
                {/* Flow Stream Pouring Down into the Text */}
                <path d="M 40,28 C 30,35 25,48 25,75 L 25,120" fill="none" stroke="#22d3ee" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
                {/* Water sparkles */}
                <circle cx="25" cy="85" r="3" fill="#FFFFFF" className="animate-ping" style={{ animationDuration: '1.5s' }} />
                <circle cx="28" cy="110" r="2.5" fill="#38bdf8" />
              </svg>
            </div>

            {/* Playful 3D Cartoon Logo Titles: "Water" and "Sort" */}
            <div className="flex flex-col items-center select-none pt-4 mt-2">
              <h1 
                className="text-[64px] font-sans font-black tracking-wide text-[#FBBF24] select-none"
                style={{
                  lineHeight: '0.82',
                  textShadow: '-2.5px -2.5px 0px #FFF, 2.5px -2.5px 0px #FFF, -2.5px 2.5px 0px #FFF, 2.5px 2.5px 0px #FFF, 4px 5px 0px #D97706, 7px 8px 0px #78350F, 0px 12px 16px rgba(0,0,0,0.45)'
                }}
              >
                Water
              </h1>
              <h1 
                className="text-[72px] font-sans font-black tracking-wider text-[#EC4899] select-none mt-1"
                style={{
                  lineHeight: '0.9',
                  textShadow: '-2.5px -2.5px 0px #FFF, 2.5px -2.5px 0px #FFF, -2.5px 2.5px 0px #FFF, 2.5px 2.5px 0px #FFF, 4px 5px 0px #9D174D, 7px 8px 0px #4C0519, 0px 12px 16px rgba(0,0,0,0.45)'
                }}
              >
                Sort
              </h1>
            </div>
          </div>

          {/* Middle Section: Three Standalone Glass Bottles loaded with beautiful colorful state layers */}
          <div className="flex items-center justify-center gap-6 z-10 my-6">
            {/* Tube 1: Red, Orange, Yellow, Green layers */}
            <div className="relative animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0s' }}>
              <div className="absolute -inset-1.5 bg-green-400/30 rounded-[28px] blur-sm animate-pulse -z-10" />
              <svg className="w-[62px] h-[142px] overflow-visible drop-shadow-xl" viewBox="0 0 100 240">
                {/* Glass Bottle Shell definition matched exactly to Bottle components */}
                <path d="M 32,15 L 68,15 L 68,55 C 68,70 85,75 85,95 L 85,220 C 85,235 70,238 50,238 C 30,238 15,235 15,220 L 15,95 C 15,75 32,70 32,55 Z" fill="rgba(255,255,255,0.08)" stroke="#FFFFFF" strokeWidth="5.5" strokeLinejoin="round" />
                {/* Stopper cap rim */}
                <rect x="25" y="8" width="50" height="9" rx="3.5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="2" />
                {/* Colored Liquid Layers (Bottom to Top) */}
                {/* Red layer */}
                <path d="M 18,185 L 82,185 C 82,210 75,233 50,233 C 25,233 18,210 18,185 Z" fill="#EF4444" />
                {/* Orange layer */}
                <rect x="17.5" y="145" width="65" height="40" fill="#F97316" />
                {/* Yellow layer */}
                <rect x="17.5" y="105" width="65" height="40" fill="#FBBF24" />
                {/* Green layer */}
                <path d="M 18,95 Q 50,97 82,95 L 82,105 L 18,105 Z" fill="#22C55E" />
                <rect x="23" y="85" width="54" height="20" fill="#22C55E" />
                {/* Gloss highlights reflection */}
                <path d="M 23,98 C 20,115 20,195 23,212" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
              </svg>
            </div>

            {/* Tube 2: Green, Purple, Yellow layers */}
            <div className="relative animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.4s' }}>
              <div className="absolute -inset-1.5 bg-yellow-400/30 rounded-[28px] blur-sm animate-pulse -z-10" />
              <svg className="w-[62px] h-[142px] overflow-visible drop-shadow-xl" viewBox="0 0 100 240">
                <path d="M 32,15 L 68,15 L 68,55 C 68,70 85,75 85,95 L 85,220 C 85,235 70,238 50,238 C 30,238 15,235 15,220 L 15,95 C 15,75 32,70 32,55 Z" fill="rgba(255,255,255,0.08)" stroke="#FFFFFF" strokeWidth="5.5" strokeLinejoin="round" />
                <rect x="25" y="8" width="50" height="9" rx="3.5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="2" />
                {/* Green layer bottom */}
                <path d="M 18,185 L 82,185 C 82,210 75,233 50,233 C 25,233 18,210 18,185 Z" fill="#22C55E" />
                {/* Purple layer middle */}
                <rect x="17.5" y="125" width="65" height="60" fill="#A855F7" />
                {/* Yellow layer top */}
                <path d="M 18,95 Q 50,97 82,95 L 82,125 L 18,125 Z" fill="#FBBF24" />
                <rect x="23" y="85" width="54" height="15" fill="#FBBF24" />
                <path d="M 23,98 C 20,115 20,195 23,212" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
              </svg>
              {/* Starry glimmers floating */}
              <span className="absolute -top-3 -right-2 text-yellow-300 text-lg animate-spin" style={{ animationDuration: '4s' }}>✦</span>
            </div>

            {/* Tube 3: Pink, Royal Blue, Sky Blue layers */}
            <div className="relative animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.8s' }}>
              <div className="absolute -inset-1.5 bg-sky-400/30 rounded-[28px] blur-sm animate-pulse -z-10" />
              <svg className="w-[62px] h-[142px] overflow-visible drop-shadow-xl" viewBox="0 0 100 240">
                <path d="M 32,15 L 68,15 L 68,55 C 68,70 85,75 85,95 L 85,220 C 85,235 70,238 50,238 C 30,238 15,235 15,220 L 15,95 C 15,75 32,70 32,55 Z" fill="rgba(255,255,255,0.08)" stroke="#FFFFFF" strokeWidth="5.5" strokeLinejoin="round" />
                <rect x="25" y="8" width="50" height="9" rx="3.5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="2" />
                {/* Pink bottom */}
                <path d="M 18,185 L 82,185 C 82,210 75,233 50,233 C 25,233 18,210 18,185 Z" fill="#EC4899" />
                {/* Royal blue middle */}
                <rect x="17.5" y="125" width="65" height="60" fill="#2563EB" />
                {/* Sky Blue top */}
                <path d="M 18,95 Q 50,97 82,95 L 82,125 L 18,125 Z" fill="#38BDF8" />
                <rect x="23" y="85" width="54" height="15" fill="#38BDF8" />
                <path d="M 23,98 C 20,115 20,195 23,212" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
              </svg>
            </div>
          </div>

          {/* Bottom Section: Progress and Neon Loading Bar */}
          <div className="flex flex-col items-center gap-3 w-full max-w-xs z-10 select-none pb-4">
            <span className="text-[15px] font-sans font-black tracking-widest text-[#FFF] uppercase animate-pulse">
              LOADING {splashProgress}%
            </span>
            
            {/* Elegant Neon Green Progress Container exactly matching reference layout */}
            <div className="w-full bg-[#1E293B] h-6 rounded-full p-1.5 overflow-hidden relative border-2 border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
              <div 
                className="bg-[#4ADE80] h-full rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(74,222,128,0.85)]"
                style={{ width: `${splashProgress}%` }}
              />
              {/* Overlay sheen highlight for glossy 3D feel */}
              <div className="absolute top-[2px] inset-x-3 h-1.5 bg-white/25 rounded-full filter blur-[0.5px]" />
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className={`min-h-[100dvh] h-[100dvh] w-full overflow-hidden ${activeTheme.bgClass} ${activeTheme.textColor} flex flex-col relative transition-colors duration-500 font-sans select-none`}>
      
      {/* Drifting Clouds on Home Screen */}
      {status === 'home' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Cloud 1 */}
          <motion.div
            initial={{ x: '-20vw' }}
            animate={{ x: '110vw' }}
            transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
            className="absolute top-[8%] left-0 opacity-40"
          >
            <svg className="w-24 h-12 fill-white" viewBox="0 0 100 50">
              <path d="M 20 35 C 20 25, 35 15, 50 25 C 65 15, 80 25, 80 35 C 90 35, 95 40, 90 45 C 90 50, 10 50, 10 45 C 5 40, 10 35, 20 35 Z" />
            </svg>
          </motion.div>
          {/* Cloud 2 */}
          <motion.div
            initial={{ x: '110vw' }}
            animate={{ x: '-20vw' }}
            transition={{ repeat: Infinity, duration: 55, ease: 'linear' }}
            className="absolute top-[18%] left-0 opacity-30"
          >
            <svg className="w-32 h-16 fill-white" viewBox="0 0 100 50">
              <path d="M 20 35 C 20 25, 35 15, 50 25 C 65 15, 80 25, 80 35 C 90 35, 95 40, 90 45 C 90 50, 10 50, 10 45 C 5 40, 10 35, 20 35 Z" />
            </svg>
          </motion.div>
        </div>
      )}
      
      {/* Decorative top soft bar highlight */}
      {status === 'playing' && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-40" />
      )}

      {/* Upgraded Header Bar */}
      {status === 'playing' && (
        <header className="relative w-full py-2 px-4 shadow-sm z-30 flex-none">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
            
            {/* Left: Close back-to-menu button & Restart button as requested */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => { audio.playClick(); setStatus('home'); }}
                className="px-2.5 h-9 bg-neutral-800 hover:bg-neutral-750 text-white font-extrabold text-[10px] uppercase border-b-2 border-neutral-950 rounded-xl flex items-center gap-1 shadow active:translate-y-0.5 cursor-pointer transition"
                title="Return to Main Menu Screen"
              >
                <Home className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">HOME</span>
              </button>

              <button
                onClick={() => { audio.playClick(); handleRestart(); }}
                className="px-2.5 h-9 bg-neutral-800 hover:bg-neutral-750 text-white font-extrabold text-[10px] uppercase border-b-2 border-neutral-950 rounded-xl flex items-center gap-1 shadow active:translate-y-0.5 cursor-pointer transition"
                title="Restart Level"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">RESTART</span>
              </button>
            </div>

            {/* Middle: Chunky Level select dropdown option */}
            <div className="flex items-center gap-1 select-none">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-450 font-display">
                Lvl
              </span>
              
              <div className="relative">
                <select
                  value={currentLevel}
                  onChange={(e) => {
                    const targetLvl = parseInt(e.target.value, 10);
                    if (targetLvl > maxUnlockedLevel) {
                      audio.playInvalid();
                    } else {
                      audio.playClick();
                      handleStartGame(targetLvl);
                    }
                  }}
                  className="bg-neutral-950 border border-amber-400 text-white font-black text-xs px-2.5 py-1 rounded-lg text-center focus:outline-none focus:border-amber-500 cursor-pointer appearance-none pr-6 relative uppercase tracking-wider shadow"
                >
                  {Array.from({ length: Math.min(maxUnlockedLevel, 10000) }, (_, i) => i + 1).map((lvl) => (
                    <option key={lvl} value={lvl} className="bg-neutral-900 font-extrabold text-white text-xs">
                      {lvl} {lvl === currentLevel ? '★' : ''}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-amber-450 text-[8px] font-black z-10">
                  ▼
                </div>
              </div>
            </div>

            {/* Right: Sound, Coins and Market button */}
            <div className="flex items-center gap-2">
              {/* Quick Market trigger */}
              <button
                onClick={() => { audio.playClick(); setMarketOrigin('game'); setMarketTab('vessels'); setShowMarketModal(true); }}
                className="w-9 h-9 bg-yellow-400 hover:bg-yellow-500 text-neutral-950 border-b-2 border-yellow-700 rounded-xl flex items-center justify-center cursor-pointer shadow active:translate-y-0.5 transition"
                title="Galaxy Market Shop"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>

              {/* Coin wallet */}
              <div className="bg-neutral-950 px-2.5 h-9 border rounded-xl flex items-center gap-1 font-mono text-[10px] font-black text-amber-400 select-none">
                <span>🪙</span>
                <span>{coins}</span>
              </div>

              {/* Mute controller */}
              <button
                onClick={handleToggleSoundMute}
                className="w-9 h-9 bg-neutral-800 text-neutral-300 border-b-2 border-neutral-950 rounded-xl flex items-center justify-center cursor-pointer shadow active:translate-y-0.5"
                title={isSoundMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
              >
                {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-450" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>

          </div>
        </header>
      )}

      {/* How To Play Drawer Overlay */}
      <AnimatePresence>
        {showHowToPlay && (
          <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-6 relative text-slate-100 shadow-2xl"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => { audio.playClick(); setShowHowToPlay(false); }}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-750 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="bg-amber-400 text-neutral-909 p-2 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold font-display">How to Play</h3>
              </div>

              <div className="space-y-3 text-xs text-neutral-300 leading-relaxed font-sans font-medium">
                <div className="p-3 bg-neutral-950/50 rounded-xl border border-neutral-850">
                  <p className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <span className="bg-neutral-800 text-white px-1.5 py-0.5 rounded text-[10px]">1</span>
                    Select a Source Tube
                  </p>
                  <p>Tap any tube containing colorful liquids. The selected tube raises up to confirm selection.</p>
                </div>

                <div className="p-3 bg-neutral-950/50 rounded-xl border border-neutral-850">
                  <p className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <span className="bg-neutral-800 text-white px-1.5 py-0.5 rounded text-[10px]">2</span>
                    Select a Target Tube
                  </p>
                  <p>Tap another tube. Liquid pours in if there is space remaining and the top colors match (or the target is empty!).</p>
                </div>

                <div className="p-3 bg-neutral-950/50 rounded-xl border border-neutral-850">
                  <p className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                    <span className="bg-neutral-800 text-white px-1.5 py-0.5 rounded text-[10px]">3</span>
                    Perfect Single Color Fills
                  </p>
                  <p>Each tube must eventually be fully completed with 4 stacked units of one uniform solid color, or be left completely empty!</p>
                </div>
              </div>

              <button
                onClick={() => { audio.playClick(); setShowHowToPlay(false); }}
                className="w-full mt-6 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black py-4 rounded-xl shadow-lg cursor-pointer text-sm"
              >
                GOT IT, LET'S PLAY!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Claim Reward Box Modal */}
      <AnimatePresence>
        {showClaimModal && (
          <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-lg z-[100005] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border-4 border-amber-400 rounded-3xl w-full max-w-sm p-6 text-center relative overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.25)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_70%)] animate-slow-rotate -z-10" />

              <div className="absolute top-4 right-4">
                <button
                  onClick={() => { audio.playClick(); setShowClaimModal(false); }}
                  className="w-8 h-8 rounded-full bg-neutral-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 text-neutral-950 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg animate-bounce">
                🎉
              </div>

              <h2 className="text-xl font-black text-white font-display uppercase tracking-wide">
                Special Notification!
              </h2>

              <p className="my-3 text-[11px] text-neutral-300 bg-neutral-950/60 leading-relaxed font-mono border border-neutral-855 p-3 rounded-xl font-bold">
                {claimedReward}
              </p>

              <button
                onClick={() => { audio.playClick(); setShowClaimModal(false); }}
                className="w-full bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black py-3 rounded-xl shadow-md uppercase tracking-wider text-xs border-b-4 border-amber-600 transition-transform active:scale-98"
              >
                CONTINUE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* 🎡 FIRST TIME WELCOME LUCKY SPIN MODAL */}
      <AnimatePresence>
        {(!hasDoneInitialSpin || showSpinModalManual) && !isSplashActive && (
          <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-[3px] z-[9999] flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border-4 border-amber-400 rounded-[32px] w-full max-w-sm p-5 relative shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center my-auto"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-yellow-400" />
              
              {/* Optional close button if opened voluntarily from home page */}
              {showSpinModalManual && (
                <button
                  onClick={() => {
                    audio.playClick();
                    setShowSpinModalManual(false);
                  }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer font-bold border border-neutral-700 z-[1000]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Header Details */}
              <div className="flex flex-col items-center gap-1.5 mb-4 mt-2">
                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-400/20 px-3.5 py-1 rounded-full text-yellow-400 text-[10px] font-black font-mono tracking-widest uppercase">
                  <Gift className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                  <span>{hasDoneInitialSpin ? "LUCKY BONUS DRAW" : "WELCOME PRESENT"}</span>
                </div>
                <h2 className="text-white text-2xl font-black font-display tracking-tight leading-tight">
                  LUCKY SPIN WHEEL
                </h2>
                <p className="text-slate-400 text-[10px] font-mono leading-relaxed max-w-[280px]">
                  {hasDoneInitialSpin 
                    ? "Spin the lucky wheel again to win big prizes! Up to 10,000 Coins are up for grabs! 💎" 
                    : "Spin the lucky wheel once to unlock your starting coin balance! Up to 10,000 Coins are up for grabs! 💎"
                  }
                </p>
              </div>

              {/* Spin Wheel Container */}
              <div className="relative w-64 h-64 my-2 flex items-center justify-center">
                {/* Arrow Pointer */}
                <div className="absolute top-0 w-8 h-8 z-30 flex items-center justify-center -translate-y-1 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
                  <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 relative drop-shadow">
                    <div className="absolute w-2 h-2 rounded-full bg-white -top-4 -left-1 shadow-inner" />
                  </div>
                </div>

                {/* Outer Shiny Circle Rim */}
                <div className="absolute inset-0 rounded-full border-[8px] border-amber-500 bg-neutral-950 shadow-2xl flex items-center justify-center overflow-hidden">
                  
                  {/* Rotating Inner Wheel Plate */}
                  <motion.div
                    className="w-full h-full relative"
                    style={{
                      transformOrigin: '50% 50%',
                    }}
                    animate={{
                      rotate: spinAngle,
                    }}
                    transition={
                      isSpinning
                        ? { duration: 4.5, ease: [0.15, 0.85, 0.1, 1.002] }
                        : { duration: 0 }
                    }
                  >
                    <svg viewBox="0 0 200 200" className="w-full h-full relative overflow-visible">
                      <g transform="translate(100, 100)">
                        {/* Render 8 Wedge slices */}
                        {SPIN_WHEEL_SECTORS.map((sector, idx) => {
                          const degreesPerSector = 360 / 8;
                          const startAngle = idx * degreesPerSector;
                          const endAngle = (idx + 1) * degreesPerSector;
                          
                          // Helper values to draw beautiful SVG arc slices
                          const radStart = (startAngle - 90) * Math.PI / 180;
                          const radEnd = (endAngle - 90) * Math.PI / 180;
                          const R = 90;
                          
                          const x1 = R * Math.cos(radStart);
                          const y1 = R * Math.sin(radStart);
                          const x2 = R * Math.cos(radEnd);
                          const y2 = R * Math.sin(radEnd);
                          
                          const pathData = `M 0 0 L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`;
                          
                          // Midpoint calculations for placement of sector texts
                          const midAngle = startAngle + degreesPerSector / 2;
                          const radMid = (midAngle - 90) * Math.PI / 180;
                          const textR = 56;
                          const textX = textR * Math.cos(radMid);
                          const textY = textR * Math.sin(radMid);

                          return (
                            <g key={idx} className="relative select-none">
                              {/* Sector Slice Area */}
                              <path
                                d={pathData}
                                fill={sector.color}
                                stroke="#171717"
                                strokeWidth="2.5"
                              />
                              {/* Glowing Inner Details */}
                              <circle cx={x1} cy={y1} r="2.5" fill="#ffffff" opacity="0.6" />
                              
                              {/* Sector label text aligned cleanly towards center */}
                              <text
                                x={textX}
                                y={textY}
                                transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className={`font-mono text-[9px] font-black tracking-tighter ${
                                  sector.value === 10000 ? 'fill-yellow-300 font-extrabold stroke-neutral-900 stroke-[0.5px]' : 'fill-white'
                                }`}
                              >
                                {sector.value >= 1000 ? `${sector.value / 1000}k` : sector.value}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </svg>
                  </motion.div>
                </div>

                {/* Interactive SPIN button directly in the center of the wheel as requested! */}
                <button
                  disabled={isSpinning}
                  onClick={handleStartSpin}
                  className="absolute w-14 h-14 bg-gradient-to-b from-amber-400 to-amber-600 active:scale-95 disabled:scale-100 text-neutral-950 hover:text-black border-4 border-white rounded-full z-[100] flex flex-col items-center justify-center shadow-[inset_0_2px_0_rgba(255,255,255,0.4),0_6px_12px_rgba(0,0,0,0.45)] cursor-pointer transition-all font-display font-black text-[11px] select-none"
                  style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.2)' }}
                  title={isSpinning ? "Spinning..." : "Tap to Spin!"}
                >
                  <span className="leading-none tracking-tight">SPIN</span>
                  <span className="text-[7px] font-mono opacity-80 mt-0.5 leading-none">{isSpinning ? "🌀" : "TAP"}</span>
                </button>
              </div>

              {/* Action Buttons Panel */}
              <div className="w-full mt-3 flex flex-col gap-2.5 z-40 relative">
                {/* 1. Spin trigger */}
                {spinResult === null && (
                  <button
                    onClick={handleStartSpin}
                    disabled={isSpinning}
                    className={`w-full py-3 px-4 flex items-center justify-center gap-2 font-display text-xs font-black uppercase text-neutral-950 border-b-4 border-amber-700 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 rounded-2xl cursor-pointer shadow active:translate-y-0.5 transition-all ${
                      isSpinning ? 'opacity-50 cursor-not-allowed filter grayscale' : 'hover:brightness-110'
                    }`}
                  >
                    <RotateCcw className={`w-4 h-4 stroke-[3] ${isSpinning ? 'animate-spin' : ''}`} />
                    <span>{isSpinning ? 'SPINNING...' : 'TAP TO SPIN!'}</span>
                  </button>
                )}



                {/* 3. Reward Display & Claim Trigger */}
                {showSpinClaimedSuccess && spinResult !== null && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full bg-neutral-950 border-2 border-amber-500 p-4 rounded-3xl flex flex-col items-center gap-3 relative overflow-hidden"
                  >
                    <div className="absolute -right-6 -top-6 w-12 h-12 bg-amber-400/10 rounded-full blur-sm" />
                    <div className="w-11 h-11 bg-amber-400/15 border border-amber-400/40 rounded-full flex items-center justify-center text-xl text-amber-400">
                      🎁
                    </div>
                    <div>
                      <h4 className="text-amber-450 font-bold text-xs uppercase tracking-wider font-mono">PRIZE LANDED!</h4>
                      <p className="text-white font-black text-xl leading-none mt-1 font-display">
                        🪙 +{spinResult.toLocaleString()} COINS
                      </p>
                      <p className="text-neutral-400 text-[9px] font-mono mt-1 leading-relaxed">
                        Claim your prize instantly to start customizing empty tubes!
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        audio.playClick();
                        const claimAction = () => {
                          audio.playCelebration();
                          const wonAmount = spinResult || 100;
                          if (!hasDoneInitialSpin) {
                            // On first spin, keep the starting 1,000 progress coins and ADD this awesome spin wonAmount!
                            const finalCoins = coins + wonAmount;
                            setCoins(finalCoins);
                            localStorage.setItem('water_sort_coins', String(finalCoins));
                            localStorage.setItem('water_sort_has_done_spin', 'true');
                            setHasDoneInitialSpin(true);
                            setClaimedReward(`🎉 WELCOME PACKAGE SECURED! Received 🪙 ${wonAmount.toLocaleString()} Coins as a starter bundle!`);
                          } else {
                            const nextCoins = coins + wonAmount;
                            setCoins(nextCoins);
                            localStorage.setItem('water_sort_coins', String(nextCoins));
                            setClaimedReward(`🎉 REWARD SECURED! Received 🪙 ${wonAmount.toLocaleString()} Coins from the Lucky Spin!`);
                          }
                          setShowClaimModal(true);
                          setShowSpinModalManual(false);
                        };

                        claimAction();
                      }}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 font-display text-xs font-black uppercase text-center rounded-xl cursor-pointer border-b-2 border-amber-700 shadow active:translate-y-0.5 transition"
                    >
                      🎁 CLAIM REWARD
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🛒 GALACTIC CUSTOMIZATION MARKET MODAL CONTAINER */}
      <AnimatePresence>
        {showMarketModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-4 border-amber-400 rounded-3xl w-full max-w-xl h-[85vh] flex flex-col relative shadow-2xl overflow-hidden text-slate-800"
              id="galaxy-market-container"
            >
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-400 text-neutral-950 p-1.5 rounded-xl text-lg font-black font-mono">🎰</div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 font-display leading-none">GALAXY MARKET</h3>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider font-bold">Customize Shapes & border colors (10,000 Coins Each!)</p>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-400/20 text-amber-600 px-3.5 py-1.5 rounded-2xl flex items-center gap-1 font-black font-mono text-xs shadow-inner">
                  <span>🪙</span>
                  <span>{coins}</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-100 font-mono text-[9px] font-black border-b border-slate-200 flex-none overflow-x-auto">
                <button
                  onClick={() => { audio.playClick(); setMarketTab('vessels'); }}
                  className={`flex-1 min-w-[70px] py-3 text-center border-b-2 transition-all cursor-pointer ${
                    marketTab === 'vessels' ? 'border-amber-400 text-slate-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-850'
                  }`}
                >
                  🧪 SHAPES
                </button>
                <button
                  onClick={() => { audio.playClick(); setMarketTab('skins'); }}
                  className={`flex-1 min-w-[70px] py-3 text-center border-b-2 transition-all cursor-pointer ${
                    marketTab === 'skins' ? 'border-amber-400 text-slate-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-850'
                  }`}
                >
                  🌌 SKINS
                </button>
                <button
                  onClick={() => { audio.playClick(); setMarketTab('themes'); }}
                  className={`flex-1 min-w-[70px] py-3 text-center border-b-2 transition-all cursor-pointer ${
                    marketTab === 'themes' ? 'border-amber-400 text-slate-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-850'
                  }`}
                >
                  🎨 THEMES
                </button>
              </div>

              {/* Scrollable grid content */}
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin bg-white">
                {marketTab === 'vessels' ? (() => {
                  const demoVessel = MARKET_VESSELS.find((v) => v.id === selectedDemoVesselId) || MARKET_VESSELS[0];
                  return (
                    <div className="flex flex-col gap-4">
                      {/* Spectacular 3D Interactive Rotating Bottle Showcase Panel */}
                      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 border-4 border-amber-400 rounded-[28px] p-4 text-center relative overflow-hidden shadow-xl select-none flex flex-col items-center justify-center min-h-[300px]">
                        {/* Spacey grid line overlays */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                        <div className="absolute top-2 left-3 bg-amber-400/10 border border-amber-400/20 text-amber-300 font-mono text-[7px] tracking-widest font-black uppercase px-2 py-0.5 rounded-full">
                          3D PREVIEW MODEL
                        </div>
                        <div className="absolute top-2 right-3 text-[10px] animate-pulse">🛸</div>

                        {/* Large Rotating 3D Vessel Container */}
                        <div 
                          onClick={() => {
                            audio.playClick();
                            setIsVesselSpinning(true);
                            setTimeout(() => {
                              setIsVesselSpinning(false);
                            }, 1200);
                          }}
                          className={`w-40 h-52 flex items-center justify-center cursor-pointer transition-transform duration-500 relative z-10 ${
                            isVesselSpinning ? 'animate-3d-spin-fast' : 'animate-3d-rotate'
                          }`}
                          title="Click to spin 360°"
                        >
                          <Bottle
                            bottle={{
                              id: -888,
                              layers: [
                                { color: '#ec4899', colorName: 'pink', volume: 1.2 },
                                { color: '#22c55e', colorName: 'green', volume: 1.2 },
                                { color: '#06b6d4', colorName: 'cyan', volume: 1 },
                              ],
                              capacity: 4
                            }}
                            isSelected={false}
                            isHintSource={false}
                            isHintTarget={false}
                            onSelect={() => {}}
                            pourAngle={0}
                            pourOffset={{ x: 0, y: 0 }}
                            vesselStyle={selectedDemoVesselId}
                            isCompact={false}
                            isGiant={true}
                            isDarkTheme={true}
                          />
                        </div>

                        {/* Detailed specifications underneath for user instruction */}
                        <div className="relative z-10 mt-3 bg-black/60 border border-slate-800 rounded-2xl px-4 py-2 w-full max-w-xs text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-[14px]">{demoVessel.icon}</span>
                            <h4 className="text-[12px] font-black text-amber-300 uppercase tracking-widest">{demoVessel.name}</h4>
                          </div>
                          <p className="text-[8.5px] font-mono text-slate-300 mt-1 leading-relaxed">
                            {demoVessel.desc}
                          </p>
                          <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[7.5px] font-mono text-slate-400 uppercase tracking-wide">
                            <span>Capacity: 4 Layers</span>
                            <span>Fidelity: High 3D</span>
                          </div>
                        </div>
                        
                        <p className="text-[7.5px] font-mono text-amber-400/60 uppercase tracking-widest mt-2">
                          👆 CLICK VESSEL ABOVE TO SPIN 360° STYLE
                        </p>
                      </div>

                      {/* Main Vessels Grid Catalog */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                        {MARKET_VESSELS.map((v) => {
                          const isUnlocked = unlockedVessels.includes(v.id);
                          const isEquipped = activeVesselStyle === v.id;
                          const isSelectedDemo = selectedDemoVesselId === v.id;
                          return (
                            <div
                              key={v.id}
                              onClick={() => {
                                audio.playClick();
                                setSelectedDemoVesselId(v.id);
                              }}
                              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                                isSelectedDemo
                                  ? 'border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/20'
                                  : isEquipped 
                                  ? 'border-amber-400 bg-amber-500/5 shadow' 
                                  : isUnlocked 
                                  ? 'border-slate-100 bg-slate-50/50' 
                                  : 'border-slate-200/60 bg-slate-50/30 hover:border-slate-350'
                              }`}
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                {/* Dynamic Live Bottle Preview */}
                                <div className="w-12 h-20 bg-slate-950/90 rounded-xl flex items-center justify-center p-1 shadow-inner border border-slate-800 overflow-hidden flex-none">
                                  <Bottle
                                    bottle={{
                                      id: -999,
                                      layers: [
                                        { color: '#3b82f6', colorName: 'blue', volume: 1.2 },
                                        { color: '#eab308', colorName: 'yellow', volume: 1.2 },
                                        { color: '#ec4899', colorName: 'pink', volume: 1 },
                                      ],
                                      capacity: 4
                                    }}
                                    isSelected={false}
                                    isHintSource={false}
                                    isHintTarget={false}
                                    onSelect={() => {}}
                                    pourAngle={0}
                                    pourOffset={{ x: 0, y: 0 }}
                                    vesselStyle={v.id}
                                    isCompact={true}
                                    isDarkTheme={true}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider truncate">{v.name}</h4>
                                  <p className="text-[9px] text-slate-500 leading-tight mt-0.5 break-words line-clamp-2">{v.desc}</p>
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEquipVessel(v.id, v.cost, v.name);
                                }}
                                className={`flex-none px-3 py-1.5 rounded-xl font-black text-[9px] uppercase border font-mono transition-all cursor-pointer ${
                                  isEquipped
                                    ? 'bg-amber-400 text-neutral-950 border-amber-300'
                                    : isUnlocked
                                    ? 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500 shadow-xs'
                                }`}
                              >
                                {isEquipped ? 'ACTIVE' : isUnlocked ? 'EQUIP' : v.cost === 0 ? 'FREE' : `🪙 ${v.cost >= 1000 ? `${v.cost / 1000}K` : v.cost}`}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })() : marketTab === 'themes' ? (
                  <div className="space-y-3 pb-4 text-slate-800">
                    <div className="bg-amber-500/5 border border-amber-400/20 rounded-2xl p-3 mb-2 flex items-center gap-2 select-none">
                      <span className="text-sm">🎨</span>
                      <span className="text-[10px] font-black font-mono tracking-wide text-amber-700 uppercase leading-normal">
                        Unlock premium galaxy backgrounds (10,000 Coins Each)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {THEMES.map((theme) => {
                        const isActive = theme.id === activeTheme.id;
                        const isUnlocked = unlockedThemes.includes(theme.id);
                        return (
                          <div
                            key={theme.id}
                            className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                              isActive 
                                ? 'border-amber-400 bg-amber-500/5 shadow' 
                                : isUnlocked 
                                ? 'border-slate-100 bg-slate-50/50' 
                                : 'border-slate-200/60 bg-slate-50/30 hover:border-slate-350'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full shadow-inner bg-gradient-to-tr flex-none ${
                                theme.id === 'summer' ? 'from-amber-400 to-amber-100' :
                                theme.id === 'christmas' ? 'from-amber-900 to-amber-100' :
                                theme.id === 'pastel' ? 'from-sky-300 to-white' :
                                theme.id === 'stars' ? 'from-indigo-900 to-indigo-100' :
                                theme.id === 'pink' ? 'from-pink-300 to-orange-200' :
                                theme.id === 'volcanic' ? 'from-orange-600 to-neutral-900' :
                                theme.id === 'deepsea' ? 'from-cyan-500 to-slate-900' :
                                theme.id === 'aurora' ? 'from-emerald-400 to-indigo-900' :
                                theme.id === 'cyberpunk' ? 'from-pink-500 to-purple-900' :
                                'from-teal-400 to-teal-950'
                              }`} />
                              <div>
                                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">{theme.name.split(' (')[0]}</h4>
                                <p className="text-[8px] text-slate-400 font-mono font-bold mt-0.5 uppercase tracking-wide leading-none">
                                  {theme.tag}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleSelectTheme(theme)}
                              className={`px-3 py-1.5 rounded-xl font-black text-[9px] uppercase border font-mono transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-sm'
                                  : isUnlocked
                                  ? 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                                  : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500 shadow-xs'
                              }`}
                            >
                              {isActive ? 'ACTIVE' : isUnlocked ? 'EQUIP' : '🪙 10K'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  (() => {
                    const demoSkin = MARKET_SKINS.find((s) => s.id === selectedDemoSkinId) || MARKET_SKINS[0];
                    return (
                      <div className="flex flex-col gap-4">
                        {/* Spectacular 3D Interactive Rotating Bottle Showcase Panel */}
                        <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 border-4 border-cyan-400 rounded-[28px] p-4 text-center relative overflow-hidden shadow-xl select-none flex flex-col items-center justify-center min-h-[300px]">
                          {/* Spacey grid line overlays */}
                          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                          <div className="absolute top-2 left-3 bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 font-mono text-[7px] tracking-widest font-black uppercase px-2 py-0.5 rounded-full">
                            3D SKIN MODEL PREVIEW
                          </div>
                          <div className="absolute top-2 right-3 text-[10px] animate-pulse">✨</div>

                          {/* Large Rotating 3D Vessel Container */}
                          <div 
                            onClick={() => {
                              audio.playClick();
                              setIsVesselSpinning(true);
                              setTimeout(() => {
                                setIsVesselSpinning(false);
                              }, 1200);
                            }}
                            className={`w-40 h-52 flex items-center justify-center cursor-pointer transition-transform duration-500 relative z-10 ${
                              isVesselSpinning ? 'animate-3d-spin-fast' : 'animate-3d-rotate'
                            }`}
                            title="Click to spin 360°"
                          >
                            <Bottle
                              bottle={{
                                id: -777,
                                layers: [
                                  { color: '#ef4444', colorName: 'red', volume: 1.2 },
                                  { color: '#eab308', colorName: 'yellow', volume: 1.2 },
                                  { color: '#3b82f6', colorName: 'blue', volume: 1 },
                                ],
                                capacity: 4
                              }}
                              isSelected={false}
                              isHintSource={false}
                              isHintTarget={false}
                              onSelect={() => {}}
                              pourAngle={0}
                              pourOffset={{ x: 0, y: 0 }}
                              vesselStyle={activeVesselStyle}
                              skinGlowColor={demoSkin.id === 'skin_none' ? undefined : demoSkin.color}
                              isCompact={false}
                              isGiant={true}
                              isDarkTheme={true}
                            />
                          </div>

                          {/* Detailed specifications underneath for user instruction */}
                          <div className="relative z-10 mt-3 bg-black/60 border border-slate-800 rounded-2xl px-4 py-2 w-full max-w-xs text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: demoSkin.color }} />
                              <h4 className="text-[12px] font-black text-cyan-300 uppercase tracking-widest">{demoSkin.name}</h4>
                            </div>
                            <p className="text-[8.5px] font-mono text-slate-300 mt-1 leading-relaxed">
                              {demoSkin.id === 'skin_none' ? "Standard classic dark glass outlines" : `Premium glowing border shader: ${demoSkin.desc}`}
                            </p>
                            <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[7.5px] font-mono text-slate-400 uppercase tracking-wide">
                              <span>Glow Color: {demoSkin.color}</span>
                              <span>Fidelity: High 3D</span>
                            </div>
                          </div>
                          
                          <p className="text-[7.5px] font-mono text-cyan-400/60 uppercase tracking-widest mt-2">
                            👆 CLICK VESSEL ABOVE TO SPIN 360° SKIN STYLE
                          </p>
                        </div>

                        {/* ⚙️ Skin Systems Controller Gate */}
                        <div className="bg-slate-900 text-white rounded-2xl p-3.5 flex items-center justify-between select-none shadow border border-slate-800">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">🌌</span>
                            <div className="text-left">
                              <p className="text-[10px] font-black tracking-wider text-cyan-450 uppercase leading-none">BOTTLE AURA SKINS STATUS</p>
                              <p className="text-[8px] text-slate-400 font-mono mt-1 uppercase leading-none">Toggle whether outlines glow on/off</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[8.5px] font-mono font-bold uppercase text-slate-350">
                              {skinEnabled ? "SHADERS ON" : "SHADERS OFF"}
                            </span>
                            <button
                              onClick={() => {
                                audio.playClick();
                                const next = !skinEnabled;
                                setSkinEnabled(next);
                                localStorage.setItem('water_sort_skin_enabled', String(next));
                                setClaimedReward(next ? "Glowing skin borders successfully activated!" : "Glowing skin borders turned off. Standard dark borders restored.");
                                setShowClaimModal(true);
                              }}
                              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 relative focus:outline-none cursor-pointer flex items-center ${
                                skinEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                                  skinEnabled ? 'translate-x-[20px]' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {MARKET_SKINS.slice(skinPage * 12, (skinPage + 1) * 12).map((s) => {
                            const isUnlocked = unlockedSkins.includes(s.id);
                            const isEquipped = activeSkinId === s.id;
                            const isSelectedDemo = selectedDemoSkinId === s.id;
                            return (
                              <div
                                key={s.id}
                                onClick={() => {
                                  audio.playClick();
                                  setSelectedDemoSkinId(s.id);
                                }}
                                className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                                  isSelectedDemo
                                    ? 'border-cyan-400 bg-cyan-400/5 ring-2 ring-cyan-500/20'
                                    : isEquipped 
                                    ? 'border-cyan-400 bg-cyan-50/10 shadow' 
                                    : isUnlocked 
                                    ? 'border-slate-100 bg-slate-50/50' 
                                    : 'border-slate-200/60 bg-slate-50/30 hover:border-slate-350'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {/* Glowing Mini Bottle Preview of the Skin */}
                                  <div className="w-10 h-16 bg-slate-950/90 rounded-xl p-1 shadow-md border-2 border-slate-800 flex items-center justify-center relative flex-none overflow-hidden">
                                    <svg className="w-8 h-14 overflow-visible" viewBox="0 0 100 300">
                                      {/* Glass outline with the active glowing skin color */}
                                      <path
                                        d={
                                          activeVesselStyle === 'flask' ? "M 36,15 L 64,15 L 64,80 L 88,255 C 91,275 80,290 50,290 C 20,290 9,275 12,255 L 36,80 Z" :
                                          activeVesselStyle === 'beaker' ? "M 32,15 L 68,15 L 68,60 L 82,60 L 82,270 C 82,285 70,290 50,290 C 30,290 18,285 18,270 L 18,60 L 32,60 Z" :
                                          activeVesselStyle === 'hex' ? "M 35,15 L 65,15 L 65,55 L 82,90 L 82,240 L 65,290 L 35,290 L 18,240 L 18,90 L 35,55 Z" :
                                          activeVesselStyle === 'potion' ? "M 36,15 L 64,15 L 64,85 C 84,100 88,135 88,180 C 88,240 71,290 50,290 C 29,290 12,240 12,180 C 12,135 16,100 36,85 Z" :
                                          activeVesselStyle === 'square' ? "M 35,15 L 65,15 L 65,70 L 82,75 L 82,275 C 82,286 76,290 50,290 C 24,290 18,286 18,275 L 18,75 L 35,70 Z" :
                                          activeVesselStyle === 'decanter' ? "M 32,15 Q 50,28 68,15 L 62,80 C 82,95 86,130 86,180 Q 86,280 50,290 Q 14,280 14,180 C 14,130 18,95 38,80 Z" :
                                          activeVesselStyle === 'star' ? "M 34,15 L 66,15 L 66,70 C 85,90 90,130 84,180 L 84,260 C 84,280 65,290 50,290 C 35,290 16,280 16,260 L 16,180 C 10,130 15,90 34,70 Z" :
                                          activeVesselStyle === 'goblet' ? "M 22,15 L 78,15 L 82,110 L 64,170 Q 64,230 59,260 L 73,260 L 73,288 L 27,288 L 27,260 L 41,260 Q 36,230 36,170 L 18,110 Z" :
                                          activeVesselStyle === 'testtube' ? "M 32,15 L 68,15 L 68,245 C 68,274 58,290 50,290 C 42,290 32,274 32,245 Z" :
                                          "M 32,15 L 68,15 L 68,70 C 68,90 85,95 85,120 L 85,265 C 85,285 70,290 50,290 C 30,290 15,285 15,265 L 15,120 C 15,95 32,90 32,70 Z"
                                        }
                                        fill="rgba(30, 41, 59, 0.7)"
                                        stroke={s.color}
                                        strokeWidth="16"
                                        style={{ filter: `drop-shadow(0 0 6px ${s.color})` }}
                                      />
                                      {/* Glass highlight glare */}
                                      <path
                                        d="M 32,60 Q 38,65 38,120"
                                        fill="none"
                                        stroke="#ffffff"
                                        strokeWidth="10"
                                        opacity="0.3"
                                        strokeLinecap="round"
                                      />
                                      {/* Colorful segment layers filled with gradient inside to preview liquid content */}
                                      <path
                                        d={
                                          activeVesselStyle === 'flask' ? "M 18,205 L 82,205 L 88,255 C 91,275 80,290 50,290 C 20,290 9,275 12,255 Z" :
                                          activeVesselStyle === 'beaker' ? "M 18,185 L 82,185 L 82,270 C 82,285 70,290 50,290 C 30,290 18,285 18,270 Z" :
                                          activeVesselStyle === 'hex' ? "M 18,180 L 82,180 L 82,240 L 65,290 L 35,290 L 18,240 Z" :
                                          activeVesselStyle === 'potion' ? "M 20,180 L 80,180 C 80,230 71,290 50,290 C 29,290 20,230 20,180 Z" :
                                          activeVesselStyle === 'square' ? "M 18,185 L 82,185 L 82,275 C 82,286 76,290 50,290 C 24,290 18,286 18,275 Z" :
                                          activeVesselStyle === 'decanter' ? "M 25,180 L 75,180 C 75,250 50,290 50,290 C 50,290 25,250 25,180 Z" :
                                          activeVesselStyle === 'star' ? "M 21,180 L 79,180 L 79,260 C 79,280 65,290 50,290 C 35,290 21,280 21,260 Z" :
                                          activeVesselStyle === 'goblet' ? "M 41,200 L 59,200 L 59,260 L 73,260 L 73,288 L 27,288 L 27,260 L 41,260 Z" :
                                          activeVesselStyle === 'testtube' ? "M 32,180 L 68,180 L 68,245 C 68,274 58,290 50,290 C 42,290 32,274 32,245 Z" :
                                          "M 15,180 L 85,180 L 85,265 C 85,285 70,290 50,290 C 30,290 15,285 15,265 Z"
                                        }
                                        fill={s.color}
                                        opacity="0.85"
                                      />
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 className="text-[10px] font-black text-slate-800 uppercase leading-none">
                                      {s.name}
                                    </h4>
                                    <p className="text-[8px] text-slate-400 font-mono font-bold mt-1 uppercase tracking-widest leading-none">
                                      {s.id === 'skin_none' ? 'Standard' : `Code #${s.id.split('_')[1]}`}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 flex-none">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEquipSkin(s.id, s.color, s.cost || 0, s.name);
                                    }}
                                    className={`px-2.5 py-1.5 rounded-xl font-black text-[9px] uppercase border font-mono transition-all cursor-pointer ${
                                      isEquipped
                                        ? 'bg-cyan-400 text-neutral-950 border-cyan-300'
                                        : isUnlocked
                                        ? 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                                        : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500'
                                    }`}
                                  >
                                    {isEquipped 
                                      ? 'ACTIVE' 
                                      : isUnlocked 
                                      ? 'EQUIP' 
                                      : s.cost === 0
                                      ? 'FREE'
                                      : `🪙 ${s.cost >= 1000 ? `${s.cost / 1000}K` : s.cost}`
                                    }
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Skin pages pagination */}
                        <div className="flex items-center justify-between pt-2.5 font-mono text-[9px] font-black uppercase text-slate-500">
                          <button
                            disabled={skinPage === 0}
                            onClick={() => { audio.playClick(); setSkinPage(p => Math.max(0, p - 1)); }}
                            className={`px-3 py-1.5 rounded-xl border ${skinPage === 0 ? 'text-slate-300 cursor-not-allowed border-slate-100 bg-slate-50' : 'bg-slate-100 text-slate-700 cursor-pointer hover:bg-slate-200 border-slate-200'}`}
                          >
                            ◄ PREV
                          </button>
                          <span>PAGE {skinPage + 1} / 2 ({skinPage*12 + 1}-{Math.min(21, (skinPage+1)*12)} / 21)</span>
                          <button
                            disabled={skinPage === 1}
                            onClick={() => { audio.playClick(); setSkinPage(p => Math.min(1, p + 1)); }}
                            className={`px-3 py-1.5 rounded-xl border ${skinPage === 1 ? 'text-slate-300 cursor-not-allowed border-slate-100 bg-slate-50' : 'bg-slate-100 text-slate-700 cursor-pointer hover:bg-slate-200 border-slate-200'}`}
                          >
                            NEXT ►
                          </button>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex justify-end">
                          <button
                            onClick={() => {
                              audio.playClick();
                              setActiveSkinId('skin_none');
                              setActiveSkinGlowColor(undefined);
                              setSelectedDemoSkinId('skin_none');
                              localStorage.setItem('water_sort_active_skin_id', 'skin_none');
                              localStorage.removeItem('water_sort_active_skin_glow');
                              setClaimedReward("Classic border styles restored successfully!");
                              setShowClaimModal(true);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-250/60 text-slate-700 rounded-xl text-[9px] font-mono font-black uppercase cursor-pointer"
                          >
                            Reset to Standard Black Border
                          </button>
                        </div>
                      </div>
                    );
                  })())}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end select-none">
                <button
                  onClick={() => { audio.playClick(); setShowMarketModal(false); }}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black rounded-xl text-xs uppercase cursor-pointer border-b-4 border-amber-600 active:translate-y-0.5"
                >
                  CLOSE SHOP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* Main Content Body */}
      <main className={`flex-1 flex flex-col items-center justify-center ${status === 'home' ? 'p-0 w-full h-full' : 'p-3 sm:p-4'} z-20 overflow-hidden`}>
        
        <AnimatePresence mode="wait">
          
          {/* HOME SCREEN */}
          {status === 'home' && (() => {
            const spinRemaining = 86400000 - (currentTime - lastSpinTime);
            const giftRemaining = 43200000 - (currentTime - lastGiftTime);

            return (
              <>
                <motion.div
                  key="home"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="w-full h-full flex flex-col items-center justify-between py-5 sm:py-7 px-4 max-w-sm md:max-w-md mx-auto relative z-30 select-none"
                >
                {/* Home Header */}
                <div className="w-full flex items-center justify-between gap-3 p-1 relative select-none z-30">
                  {/* Coins Counter Bubble styled nicely */}
                  <div className="bg-gradient-to-b from-white/95 to-white/90 border-2 border-sky-350 text-[#0288d1] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 font-display font-black text-xs shadow-md select-none">
                    <span>🪙</span>
                    <span className="font-mono">{coins.toLocaleString()}</span>
                    <button
                      onClick={handleOpenSpinModalManual}
                      className="ml-1 w-5 h-5 bg-[#0288d1] hover:brightness-110 text-white flex items-center justify-center rounded-full text-[10px] cursor-pointer font-bold"
                      title="Get more coins"
                    >
                      +
                    </button>
                  </div>

                  {/* Top Right Actions */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        onClick={() => { audio.playClick(); setShowHomeSettingsMenu(true); }}
                        className="w-11 h-11 bg-gradient-to-b from-[#4fc3f7] to-[#0288d1] hover:brightness-110 text-white border-2 border-white ring-2 ring-[#028cda]/30 rounded-full flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all relative z-50"
                        title="Toggle Game Settings Menu"
                      >
                        <Settings className="w-5.5 h-5.5 drop-shadow-[0_1.5px_0_rgba(0,0,0,0.25)] stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Flanked Logo Row matching image 5 same to same */}
                <div className="w-full flex items-center justify-between gap-1 sm:gap-2.5 relative z-30 px-1 py-1">
                  {/* Left Widget: Lucky Spin Wheel Circle Button */}
                  <button
                    onClick={handleOpenSpinModalManual}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-purple-400 to-indigo-600 hover:brightness-110 active:scale-95 text-white flex flex-col items-center justify-center shadow-lg border-2 border-white/85 cursor-pointer transition-all relative shrink-0"
                    title="Lucky Spin Wheel"
                  >
                    <span className="text-xl sm:text-2xl animate-spin" style={{ animationDuration: '10s' }}>🎡</span>
                    <div className="absolute -bottom-1.5 bg-black/80 px-1.5 py-0.5 rounded-full text-[6.5px] sm:text-[7.5px] font-mono font-black text-yellow-350 border border-white/10 shadow-md whitespace-nowrap min-w-[50px] text-center">
                      {spinRemaining > 0 ? formatCooldown(spinRemaining) : "SPIN"}
                    </div>
                  </button>

                  {/* Centered Main Area containing Logo */}
                  <div className="flex-1 flex justify-center max-w-[300px] sm:max-w-[380px] md:max-w-[420px] select-none scale-112 sm:scale-120 transition-transform">
                    <svg viewBox="0 0 320 220" className="w-full h-auto drop-shadow-[0_12px_24px_rgba(30,58,138,0.35)] select-none overflow-visible">
                    <defs>
                      <linearGradient id="gradOrange" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                      <linearGradient id="gradGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#15803d" />
                      </linearGradient>
                      <linearGradient id="gradPink" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#be185d" />
                      </linearGradient>
                      <linearGradient id="gradBlueFill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0288d1" />
                        <stop offset="100%" stopColor="#01579b" />
                      </linearGradient>
                      <linearGradient id="gradCyanFill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#0288d1" stopOpacity="0.95" />
                      </linearGradient>
                      <linearGradient id="streamGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                      <linearGradient id="streamGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.15" />
                      </linearGradient>
                    </defs>

                    <g transform="translate(10, 10)">
                      {/* Tilted top-left floating game bottle pouring water down */}
                      <g transform="translate(45, 12) rotate(112)">
                        <rect x="-11" y="-41" width="30" height="74" rx="10" fill="#1e3a8a" opacity="0.15" />
                        <rect x="-10" y="-40" width="28" height="72" rx="9" fill="rgba(255, 255, 255, 0.25)" stroke="#1e40af" strokeWidth="3" />
                        <path d="M -5 -40 L -5 -46 L -7 -46 L -7 -49 L 15 -49 L 15 -46 L 13 -46 L 13 -40" fill="rgba(255, 255, 255, 0.4)" stroke="#1e40af" strokeWidth="2" strokeLinejoin="round" />
                        
                        {/* Fluid rushing down to the mouth to pour */}
                        <rect x="-8.5" y="-12" width="25" height="15" fill="url(#gradBlueFill)" />
                        <rect x="-8.5" y="3" width="25" height="10" fill="url(#gradCyanFill)" />
                        <path d="M -8.5 -12 L 16.5 -12 L 16.5 -48 L -8.5 -48 Z" fill="url(#gradCyanFill)" />
                        
                        <line x1="-6" y1="-30" x2="-6" y2="20" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                        <circle cx="10" cy="-25" r="2.5" fill="#ffffff" opacity="0.6" />
                      </g>

                      {/* Elegant upright glass style bottle catching the water at the bottom */}
                      <g transform="translate(176, 174)">
                        {/* Outer shadow/glow aura */}
                        <rect x="-15.5" y="-39.5" width="31" height="52" rx="11" fill="none" stroke="#2563eb" strokeWidth="4" opacity="0.12" />
                        
                        {/* Outer heavy glass bottle container shape */}
                        <rect x="-14" y="-38" width="28" height="49" rx="10" fill="rgba(255, 255, 255, 0.28)" stroke="#1e40af" strokeWidth="2.8" />
                        
                        {/* Bottleneck with glass rim & cork stopper */}
                        <path d="M -6 -38 L -6 -44 L -8 -44 L -8 -47 L 8 -47 L 8 -44 L 6 -44 L 6 -38" fill="rgba(255, 255, 255, 0.45)" stroke="#1e40af" strokeWidth="2" strokeLinejoin="round" />
                        
                        {/* Elegant wooden cork inside the bottleneck */}
                        <rect x="-4.5" y="-46.5" width="9" height="5" fill="#b45309" rx="1" />

                        {/* Colored liquid segments layers */}
                        {/* 1. Pink base layer at the very bottom */}
                        <path d="M -12.5 2 Q -12.5 9, -5 9 L 5 Q 12.5 9, 12.5 2 L 12.5 -5 L -12.5 -5 Z" fill="url(#gradPink)" />
                        
                        {/* 2. Green middle layer */}
                        <rect x="-12.5" y="-17" width="25" height="12" fill="url(#gradGreen)" stroke="#166534" strokeWidth="0.5" />
                        
                        {/* 3. Orange upper layer */}
                        <rect x="-12.5" y="-29" width="25" height="12" fill="url(#gradOrange)" stroke="#9a3412" strokeWidth="0.5" />
                        
                        {/* 4. Cyan top layer */}
                        <rect x="-12.5" y="-34.5" width="25" height="5.5" fill="url(#gradCyanFill)" />
                        
                        {/* Sparkly water bubbles inside the liquid blocks */}
                        <circle cx="-6" cy="3" r="1.5" fill="#ffffff" opacity="0.7" />
                        <circle cx="5" cy="-10" r="1.2" fill="#ffffff" opacity="0.6" />
                        <circle cx="-3" cy="-22" r="1.6" fill="#ffffff" opacity="0.8" />
                        <circle cx="4" cy="-28" r="1" fill="#ffffff" opacity="0.6" />

                        {/* Glossy glass reflection & bright specular highlight */}
                        <line x1="-9.5" y1="-33" x2="-9.5" y2="7" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
                        <circle cx="8" cy="-32" r="1.5" fill="#ffffff" opacity="0.4" />
                      </g>

                      {/* Highly-realistic active flowing water stream falling from bottle mouth into bottle neck */}
                      <path
                        d="M 88,52 Q 105,42 115,64 T 150,105 T 176,128"
                        fill="none"
                        stroke="url(#streamGrad1)"
                        strokeWidth="6.5"
                        strokeLinecap="round"
                      />
                      
                      {/* Static glistening white flow highlights (No CPU/GPU lag!) */}
                      <path
                        d="M 88,52 Q 105,42 115,64 T 150,105 T 176,128"
                        fill="none"
                        stroke="url(#streamGrad2)"
                        strokeWidth="3.8"
                        strokeLinecap="round"
                        strokeDasharray="14, 20"
                      />

                      {/* Static Droplets sliding down the streamline path */}
                      <circle cx="106" cy="53" r="3.2" fill="#67e8f9" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
                      <circle cx="138" cy="88" r="3.2" fill="#67e8f9" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
                      <circle cx="166" cy="118" r="3.2" fill="#67e8f9" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />

                      {/* Static high-fidelity splashing sparkles on impact */}
                      <circle cx="115" cy="64" r="3.5" fill="#22d3ee" stroke="#ffffff" strokeWidth="0.6" />
                      <circle cx="125" cy="56" r="2.2" fill="#22d3ee" stroke="#ffffff" strokeWidth="0.6" />
                      <circle cx="176" cy="128" r="3.2" fill="#22d3ee" stroke="#ffffff" strokeWidth="0.6" />
                      <circle cx="184" cy="118" r="2.5" fill="#22d3ee" stroke="#ffffff" strokeWidth="0.6" />

                      {/* Highly stylized outlines + overlapping bubble fonts exactly matching target image 5 */}
                      <text
                        x="160"
                        y="75"
                        textAnchor="middle"
                        fontSize="62"
                        fontWeight="900"
                        fontFamily="Fredoka, sans-serif"
                        fill="#1e40af"
                        stroke="#1e40af"
                        strokeWidth="13"
                        strokeLinejoin="round"
                        transform="rotate(-5, 160, 75)"
                      >
                        Water
                      </text>
                      <text
                        x="160"
                        y="75"
                        textAnchor="middle"
                        fontSize="62"
                        fontWeight="900"
                        fontFamily="Fredoka, sans-serif"
                        fill="#ffffff"
                        transform="rotate(-5, 160, 75)"
                      >
                        Water
                      </text>

                      <text
                        x="175"
                        y="134"
                        textAnchor="middle"
                        fontSize="54"
                        fontWeight="900"
                        fontFamily="Fredoka, sans-serif"
                        fill="#1e40af"
                        stroke="#1e40af"
                        strokeWidth="13"
                        strokeLinejoin="round"
                        transform="rotate(6, 175, 134)"
                      >
                        Sort
                      </text>
                      <text
                        x="175"
                        y="134"
                        textAnchor="middle"
                        fontSize="54"
                        fontWeight="900"
                        fontFamily="Fredoka, sans-serif"
                        fill="#ffffff"
                        transform="rotate(6, 175, 134)"
                      >
                        Sort
                      </text>

                      <text
                        x="195"
                        y="180"
                        textAnchor="middle"
                        fontSize="32"
                        fontWeight="900"
                        fontFamily="Fredoka, sans-serif"
                        fill="#1e40af"
                        stroke="#1e40af"
                        strokeWidth="9"
                        strokeLinejoin="round"
                        transform="rotate(-3, 195, 180)"
                      >
                        Puzzle
                      </text>
                      <text
                        x="195"
                        y="180"
                        textAnchor="middle"
                        fontSize="32"
                        fontWeight="900"
                        fontFamily="Fredoka, sans-serif"
                        fill="#ffffff"
                        transform="rotate(-3, 195, 180)"
                      >
                        Puzzle
                      </text>
                    </g>
                  </svg>
                  </div>

                  {/* Right Widget: Free Gift Circle Button */}
                  <button
                    onClick={handleHomeGift}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-rose-400 to-red-600 hover:brightness-110 active:scale-95 text-white flex flex-col items-center justify-center shadow-lg border-2 border-white/85 cursor-pointer transition-all relative shrink-0"
                    title="Claim Free Gift"
                  >
                    <Gift className="w-5.5 h-5.5 text-white drop-shadow" />
                    <div className="absolute -bottom-1.5 bg-black/80 px-1.5 py-0.5 rounded-full text-[6.5px] sm:text-[7.5px] font-mono font-black text-rose-250 border border-white/10 shadow-md whitespace-nowrap min-w-[50px] text-center">
                      {giftRemaining > 0 ? formatCooldown(giftRemaining) : "GIFT"}
                    </div>
                  </button>
                </div>

                {/* Middle Play / Shop Action Buttons block */}
                <div className="w-full flex flex-col gap-4 md:gap-5 px-2 select-none z-30 mt-1 max-w-sm md:max-w-md lg:max-w-lg mx-auto">
                  {/* 3D Glossy PLAY Button */}
                  <button
                    onClick={() => {
                      audio.playClick();
                      setGameSpeed(0.6);
                      setStatus('level-select');
                    }}
                    className="w-full flex items-center justify-center py-4 md:py-5 lg:py-6 bg-gradient-to-b from-[#4fc3f7] to-[#0288d1] hover:brightness-105 text-white border-b-[6px] md:border-b-[8px] border-[#01579b] rounded-[24px] md:rounded-[32px] font-display font-black text-2xl md:text-3xl lg:text-4xl shadow-[inset_0_4px_0_rgba(255,255,255,0.4),0_8px_16px_rgba(18,122,220,0.3)] active:translate-y-1 active:border-b-2 cursor-pointer transition uppercase tracking-wider text-center"
                    style={{ textShadow: '2.5px 2.5px 0px #01579b' }}
                  >
                    PLAY
                  </button>

                  {/* 3D Glossy SHOP Button */}
                  <button
                    onClick={() => {
                      audio.playClick();
                      setMarketOrigin('home');
                      setMarketTab('vessels');
                      setShowMarketModal(true);
                    }}
                    className="w-full flex items-center justify-center py-4 md:py-5 lg:py-6 bg-gradient-to-b from-[#a3e635] to-[#65a30d] hover:brightness-105 text-white border-b-[6px] md:border-b-[8px] border-[#3f6212] rounded-[24px] md:rounded-[32px] font-display font-black text-2xl md:text-3xl lg:text-4xl shadow-[inset_0_4px_0_rgba(255,255,255,0.4),0_8px_16px_rgba(101,163,13,0.35)] active:translate-y-1 active:border-b-2 cursor-pointer transition uppercase tracking-wider text-center"
                    style={{ textShadow: '2.5px 2.5px 0px #3f6212' }}
                  >
                    SHOP
                  </button>
                </div>

                {/* Powered By Galaxy Studio text as requested */}
                <div className="w-full text-center mt-3 select-none z-30 opacity-70">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-blue-900 uppercase font-black font-sans">
                    ⚡ POWERED BY GALAXY STUDIO ⚡
                  </span>
                </div>
              </motion.div>
            </>
          );
        })()}

          {/* LEVEL SELECT SCREEN */}
          {status === 'level-select' && (
            <motion.div
              key="level-select"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col items-center gap-4 py-2"
            >
              {/* Back to Home header bar */}
              <div className="w-full max-w-xl flex items-center justify-between px-2 select-none">
                <button
                  onClick={() => { audio.playClick(); setStatus('home'); }}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-750 text-white font-extrabold text-[10px] uppercase border-b-2 border-neutral-950 rounded-xl flex items-center gap-1.5 shadow active:translate-y-0.5 cursor-pointer transition"
                >
                  <Home className="w-3 h-3 text-amber-400" />
                  <span>HOME</span>
                </button>

                <div className="bg-neutral-955/40 px-3 py-1.5 rounded-xl border border-neutral-850 font-mono text-[10px] font-white text-yellow-400 font-black">
                  🪙 {coins}
                </div>
              </div>

              {/* Level Selector component itself is scrollable internally */}
              <div className="w-full max-h-[70vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <LevelSelector 
                  currentLevel={currentLevel} 
                  maxUnlockedLevel={maxUnlockedLevel}
                  onSelectLevel={handleStartGame} 
                />
              </div>

              <div className="mt-2 text-center select-none w-full">
                <span className="text-[9px] font-mono tracking-[0.2em] text-slate-450 uppercase font-black">
                  Powered By Galaxy Studio
                </span>
              </div>
            </motion.div>
          )}

          {/* PLAY SCREEN */}
          {status === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex-1 flex flex-col justify-between items-center gap-1.5 sm:gap-2.5 overflow-hidden"
            >
              {/* Stats Bar */}
              <div className="w-full max-w-xl flex-none">
                <Stats 
                  currentLevel={currentLevel} 
                  movesCount={movesCount} 
                  status={status} 
                  onBack={() => {
                    audio.playClick();
                    setStatus('level-select');
                  }}
                />
              </div>

              {/* Game Grid Plate - Borderless and transparent for an immersive full-screen experience */}
              <div className={`w-full max-w-xl border-0 bg-transparent relative transition-all duration-300 flex-1 flex items-center justify-center min-h-0 overflow-visible`}>

                {isGateLevel && centerTube ? (
                  <div className="flex flex-col items-center w-full py-2 z-10 relative">
                    {/* Main horizontal layout containing Left Column, Giant Center Bottle and Right Column */}
                    <div className="flex items-center justify-between w-full gap-2 sm:gap-4 px-1 sm:px-3">
                      
                      {/* LEFT COLUMN: stacked vertically */}
                      <div className="flex flex-col gap-1 sm:gap-2 flex-shrink-0">
                        {leftTubes.map((bottle) => {
                          const isSelected = selectedBottleId === bottle.id;
                          const isSourceOfAnim = pourSourceId === bottle.id;
                          const isTargetOfAnim = pourTargetId === bottle.id;
                          const isHintSource = hintDetails?.from === bottle.id;
                          const isHintTarget = hintDetails?.to === bottle.id;
                          const isStreamActiveOnThis = isStreamActive && isTargetOfAnim;
                          const bottleAnimatingLayers = isSourceOfAnim ? (animatingSourceLayers || undefined) : (isTargetOfAnim ? (animatingTargetLayers || undefined) : undefined);

                          return (
                            <div
                              id={`bottle-wrapper-${bottle.id}`}
                              key={bottle.id}
                              className="flex justify-center flex-shrink-0"
                            >
                              <Bottle
                                bottle={bottle}
                                isSelected={isSelected}
                                isHintSource={isHintActive && isHintSource}
                                isHintTarget={isHintActive && isHintTarget}
                                onSelect={handleSelectBottle}
                                pourAngle={isSourceOfAnim ? pourAngle : 0}
                                pourOffset={isSourceOfAnim ? pourOffset : { x: 0, y: 0 }}
                                isStreamActive={isStreamActiveOnThis}
                                streamColor={isStreamActiveOnThis ? streamColor : undefined}
                                vesselStyle={currentVesselStyle}
                                skinGlowColor={finalSkinGlowColor}
                                isCompact={true}
                                isDarkTheme={isDarkThemeActive}
                                animatingLayers={bottleAnimatingLayers}
                                isRightPour={pourOffset.x > 0}
                                width={gateBottleSize.compactWidth}
                                height={gateBottleSize.compactHeight}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* CENTER SPACE: Giant Heart Flask */}
                      <div 
                        className="flex-1 flex flex-col items-center justify-center py-4 px-2 bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent border border-pink-500/20 rounded-[35px] shadow-[0_0_24px_rgba(236,72,153,0.15)] relative"
                        style={{
                          minWidth: `${gateBottleSize.giantWidth + 24}px`,
                          minHeight: `${gateBottleSize.giantHeight + 36}px`,
                        }}
                      >
                        {/* Shiny animated pulsing heart tag */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-[7.5px] sm:text-[9px] px-3.5 py-1 rounded-full uppercase tracking-[0.15em] font-sans shadow-lg shadow-pink-500/40 border border-white/20 flex items-center gap-1 animate-pulse">
                          <span className="text-[9px]">💖</span>
                          <span>GATE VESSEL</span>
                        </div>
                        
                        {(() => {
                          const bottle = centerTube;
                          const isSelected = selectedBottleId === bottle.id;
                          const isSourceOfAnim = pourSourceId === bottle.id;
                          const isTargetOfAnim = pourTargetId === bottle.id;
                          const isHintSource = hintDetails?.from === bottle.id;
                          const isHintTarget = hintDetails?.to === bottle.id;
                          const isStreamActiveOnThis = isStreamActive && isTargetOfAnim;
                          const bottleAnimatingLayers = isSourceOfAnim ? (animatingSourceLayers || undefined) : (isTargetOfAnim ? (animatingTargetLayers || undefined) : undefined);

                          return (
                            <div id={`bottle-wrapper-${bottle.id}`} key={bottle.id} className="flex justify-center relative z-20">
                              <Bottle
                                bottle={bottle}
                                isSelected={isSelected}
                                isHintSource={isHintActive && isHintSource}
                                isHintTarget={isHintActive && isHintTarget}
                                onSelect={handleSelectBottle}
                                pourAngle={isSourceOfAnim ? pourAngle : 0}
                                pourOffset={isSourceOfAnim ? pourOffset : { x: 0, y: 0 }}
                                isStreamActive={isStreamActiveOnThis}
                                streamColor={isStreamActiveOnThis ? streamColor : undefined}
                                vesselStyle="heart" // FORCED heart shape
                                skinGlowColor={finalCenterSkinGlowColor}
                                isCompact={false}
                                isDarkTheme={isDarkThemeActive}
                                isGiant={true}
                                animatingLayers={bottleAnimatingLayers}
                                isRightPour={pourOffset.x > 0}
                                width={gateBottleSize.giantWidth}
                                height={gateBottleSize.giantHeight}
                              />
                            </div>
                          );
                        })()}
                      </div>

                      {/* RIGHT COLUMN: stacked vertically */}
                      <div className="flex flex-col gap-1 sm:gap-2 flex-shrink-0">
                        {rightTubes.map((bottle) => {
                          const isSelected = selectedBottleId === bottle.id;
                          const isSourceOfAnim = pourSourceId === bottle.id;
                          const isTargetOfAnim = pourTargetId === bottle.id;
                          const isHintSource = hintDetails?.from === bottle.id;
                          const isHintTarget = hintDetails?.to === bottle.id;
                          const isStreamActiveOnThis = isStreamActive && isTargetOfAnim;
                          const bottleAnimatingLayers = isSourceOfAnim ? (animatingSourceLayers || undefined) : (isTargetOfAnim ? (animatingTargetLayers || undefined) : undefined);

                          return (
                            <div
                              id={`bottle-wrapper-${bottle.id}`}
                              key={bottle.id}
                              className="flex justify-center flex-shrink-0"
                            >
                              <Bottle
                                bottle={bottle}
                                isSelected={isSelected}
                                isHintSource={isHintActive && isHintSource}
                                isHintTarget={isHintActive && isHintTarget}
                                onSelect={handleSelectBottle}
                                pourAngle={isSourceOfAnim ? pourAngle : 0}
                                pourOffset={isSourceOfAnim ? pourOffset : { x: 0, y: 0 }}
                                isStreamActive={isStreamActiveOnThis}
                                streamColor={isStreamActiveOnThis ? streamColor : undefined}
                                vesselStyle={currentVesselStyle}
                                skinGlowColor={finalSkinGlowColor}
                                isCompact={true}
                                isDarkTheme={isDarkThemeActive}
                                animatingLayers={bottleAnimatingLayers}
                                isRightPour={pourOffset.x > 0}
                                width={gateBottleSize.compactWidth}
                                height={gateBottleSize.compactHeight}
                              />
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    {/* BOTTOM ROW: stacked horizontally for any remains / empty tubes */}
                    {bottomTubes.length > 0 && (
                      <div className="flex justify-center flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3 w-full">
                        {bottomTubes.map((bottle) => {
                          const isSelected = selectedBottleId === bottle.id;
                          const isSourceOfAnim = pourSourceId === bottle.id;
                          const isTargetOfAnim = pourTargetId === bottle.id;
                          const isHintSource = hintDetails?.from === bottle.id;
                          const isHintTarget = hintDetails?.to === bottle.id;
                          const isStreamActiveOnThis = isStreamActive && isTargetOfAnim;
                          const bottleAnimatingLayers = isSourceOfAnim ? (animatingSourceLayers || undefined) : (isTargetOfAnim ? (animatingTargetLayers || undefined) : undefined);

                          return (
                            <div
                              id={`bottle-wrapper-${bottle.id}`}
                              key={bottle.id}
                              className="flex justify-center flex-shrink-0"
                            >
                              <Bottle
                                bottle={bottle}
                                isSelected={isSelected}
                                isHintSource={isHintActive && isHintSource}
                                isHintTarget={isHintActive && isHintTarget}
                                onSelect={handleSelectBottle}
                                pourAngle={isSourceOfAnim ? pourAngle : 0}
                                pourOffset={isSourceOfAnim ? pourOffset : { x: 0, y: 0 }}
                                isStreamActive={isStreamActiveOnThis}
                                streamColor={isStreamActiveOnThis ? streamColor : undefined}
                                vesselStyle={currentVesselStyle}
                                skinGlowColor={finalSkinGlowColor}
                                isCompact={true}
                                isDarkTheme={isDarkThemeActive}
                                animatingLayers={bottleAnimatingLayers}
                                isRightPour={pourOffset.x > 0}
                                width={gateBottleSize.compactWidth}
                                height={gateBottleSize.compactHeight}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : bottles.length >= 5 ? (
                  <div className={`flex flex-col ${bottles.length >= 6 ? 'gap-y-4 sm:gap-y-6' : 'gap-y-6'} w-full py-1`}>
                    {/* Row 1 Grid */}
                    <div className={`flex flex-wrap items-end justify-center ${bottles.length >= 6 ? 'gap-y-1 gap-x-1 sm:gap-x-2' : 'gap-y-2 gap-x-2 sm:gap-x-4'}`}>
                      {row1Tubes.map((bottle, idx) => {
                        const isSelected = selectedBottleId === bottle.id;
                        const isSourceOfAnim = pourSourceId === bottle.id;
                        const isTargetOfAnim = pourTargetId === bottle.id;
                        const isHintSource = hintDetails?.from === bottle.id;
                        const isHintTarget = hintDetails?.to === bottle.id;
                        const isStreamActiveOnThis = isStreamActive && isTargetOfAnim;
                        const bottleAnimatingLayers = isSourceOfAnim ? (animatingSourceLayers || undefined) : (isTargetOfAnim ? (animatingTargetLayers || undefined) : undefined);

                        return (
                          <div
                            id={`bottle-wrapper-${bottle.id}`}
                            key={bottle.id}
                            className="flex justify-center flex-shrink-0 transition-all duration-300"
                          >
                            <Bottle
                              bottle={bottle}
                              isSelected={isSelected}
                              isHintSource={isHintActive && isHintSource}
                              isHintTarget={isHintActive && isHintTarget}
                              onSelect={handleSelectBottle}
                              pourAngle={isSourceOfAnim ? pourAngle : 0}
                              pourOffset={isSourceOfAnim ? pourOffset : { x: 0, y: 0 }}
                              isStreamActive={isStreamActiveOnThis}
                              streamColor={isStreamActiveOnThis ? streamColor : undefined}
                              vesselStyle={currentVesselStyle}
                              skinGlowColor={finalSkinGlowColor}
                              isCompact={bottles.length >= 6}
                              isDarkTheme={isDarkThemeActive}
                              animatingLayers={bottleAnimatingLayers}
                              isRightPour={pourOffset.x > 0}
                              width={standardBottleSize.width}
                              height={standardBottleSize.height}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-[85%] mx-auto h-[1px] bg-white/5 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,transparent_80%)]" />

                    {/* Row 2 Grid */}
                    <div className={`flex flex-wrap items-end justify-center ${bottles.length >= 6 ? 'gap-y-1 gap-x-1 sm:gap-x-2' : 'gap-y-2 gap-x-2 sm:gap-x-4'}`}>
                      {row2Tubes.map((bottle, idx) => {
                        const isSelected = selectedBottleId === bottle.id;
                        const isSourceOfAnim = pourSourceId === bottle.id;
                        const isTargetOfAnim = pourTargetId === bottle.id;
                        const isHintSource = hintDetails?.from === bottle.id;
                        const isHintTarget = hintDetails?.to === bottle.id;
                        const isStreamActiveOnThis = isStreamActive && isTargetOfAnim;
                        const bottleAnimatingLayers = isSourceOfAnim ? (animatingSourceLayers || undefined) : (isTargetOfAnim ? (animatingTargetLayers || undefined) : undefined);

                        return (
                          <div
                            id={`bottle-wrapper-${bottle.id}`}
                            key={bottle.id}
                            className="flex justify-center flex-shrink-0 transition-all duration-300"
                          >
                            <Bottle
                              bottle={bottle}
                              isSelected={isSelected}
                              isHintSource={isHintActive && isHintSource}
                              isHintTarget={isHintActive && isHintTarget}
                              onSelect={handleSelectBottle}
                              pourAngle={isSourceOfAnim ? pourAngle : 0}
                              pourOffset={isSourceOfAnim ? pourOffset : { x: 0, y: 0 }}
                              isStreamActive={isStreamActiveOnThis}
                              streamColor={isStreamActiveOnThis ? streamColor : undefined}
                              vesselStyle={currentVesselStyle}
                              skinGlowColor={finalSkinGlowColor}
                              isCompact={bottles.length >= 6}
                              isDarkTheme={isDarkThemeActive}
                              animatingLayers={bottleAnimatingLayers}
                              isRightPour={pourOffset.x > 0}
                              width={standardBottleSize.width}
                              height={standardBottleSize.height}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  // Single Row Fallback centered perfectly
                  <div className={`flex flex-wrap items-end justify-center ${bottles.length >= 6 ? 'gap-x-1.5' : 'gap-x-2 sm:gap-x-3'} gap-y-4 py-3`}>
                    {bottles.map((bottle) => {
                      const isSelected = selectedBottleId === bottle.id;
                      const isSourceOfAnim = pourSourceId === bottle.id;
                      const isTargetOfAnim = pourTargetId === bottle.id;
                      const isHintSource = hintDetails?.from === bottle.id;
                      const isHintTarget = hintDetails?.to === bottle.id;
                      const isStreamActiveOnThis = isStreamActive && isTargetOfAnim;
                      const bottleAnimatingLayers = isSourceOfAnim ? (animatingSourceLayers || undefined) : (isTargetOfAnim ? (animatingTargetLayers || undefined) : undefined);

                      return (
                        <div
                          id={`bottle-wrapper-${bottle.id}`}
                          key={bottle.id}
                          className="flex justify-center flex-shrink-0"
                        >
                          <Bottle
                            bottle={bottle}
                            isSelected={isSelected}
                            isHintSource={isHintActive && isHintSource}
                            isHintTarget={isHintActive && isHintTarget}
                            onSelect={handleSelectBottle}
                            pourAngle={isSourceOfAnim ? pourAngle : 0}
                            pourOffset={isSourceOfAnim ? pourOffset : { x: 0, y: 0 }}
                            isStreamActive={isStreamActiveOnThis}
                            streamColor={isStreamActiveOnThis ? streamColor : undefined}
                            vesselStyle={currentVesselStyle}
                            skinGlowColor={finalSkinGlowColor}
                            isCompact={bottles.length >= 6}
                            isDarkTheme={isDarkThemeActive}
                            animatingLayers={bottleAnimatingLayers}
                            isRightPour={pourOffset.x > 0}
                            width={standardBottleSize.width}
                            height={standardBottleSize.height}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2-Level Interactive Tutorial Hand Guide */}
                {currentLevel <= 2 && status === 'playing' && tutorialCoords && (
                  <div className="absolute inset-0 pointer-events-none z-[45] overflow-visible">
                    <motion.div
                      className="absolute text-center flex flex-col items-center"
                      style={{
                        originX: 0.5,
                        originY: 0.5,
                      }}
                      animate={{
                        x: tutorialCoords.x - 50, // Center on bottle (width is 100px so offset is 50)
                        y: [tutorialCoords.y - 70, tutorialCoords.y - 45, tutorialCoords.y - 70],
                        rotate: [0, -10, 0]
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <span className="text-4xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] select-none">👇</span>
                      <span className="bg-gradient-to-r from-teal-500 via-emerald-500 to-green-600 text-white font-mono text-[8px] sm:text-[9.5px] font-black px-2.5 py-1 rounded-full border border-white tracking-wide uppercase shadow-[0_4px_12px_rgba(16,185,129,0.3)] whitespace-nowrap leading-none mt-1">
                        {tutorialCoords.label}
                      </span>
                    </motion.div>
                  </div>
                )}

                {/* Animated hand details */}
                {isHintActive && hintCoords && (
                  <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                      {!isExtraTubeHintActive && (
                        <motion.path
                          d={`M ${hintCoords.x1} ${hintCoords.y1 - 15} Q ${(hintCoords.x1 + hintCoords.x2)/2} ${Math.min(hintCoords.y1, hintCoords.y2) - 40} ${hintCoords.x2} ${hintCoords.y2 - 15}`}
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray="5 5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                        />
                      )}
                    </svg>

                    <motion.div
                      className="absolute text-2xl sm:text-3xl filter drop-shadow select-none text-center flex flex-col items-center"
                      style={{
                        originX: 0.5,
                        originY: 0.5,
                      }}
                      animate={{
                        x: isExtraTubeHintActive 
                          ? [hintCoords.x1 - 12, hintCoords.x1 - 12, hintCoords.x1 - 12]
                          : [hintCoords.x1 - 12, hintCoords.x2 - 12, hintCoords.x1 - 12],
                        y: isExtraTubeHintActive
                          ? [hintCoords.y1 - 45, hintCoords.y1 - 25, hintCoords.y1 - 45]
                          : [hintCoords.y1 - 30, hintCoords.y2 - 45, hintCoords.y1 - 30],
                        rotate: [0, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: isExtraTubeHintActive ? 1.0 : 1.8,
                        repeat: Infinity,
                        ease: isExtraTubeHintActive ? "easeInOut" : "easeOut"
                      }}
                    >
                      {isExtraTubeHintActive ? (
                        <div className="flex flex-col items-center">
                          <span className="text-3xl drop-shadow-lg">👇</span>
                          <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white font-sans text-[8px] font-black px-2 py-0.5 rounded-lg border border-white uppercase shadow-md leading-none mt-1 animate-pulse whitespace-nowrap">
                            TEST TUBE NEEDED! 🧪
                          </span>
                        </div>
                      ) : (
                        <span>👆</span>
                      )}
                    </motion.div>
                  </div>
                )}

                {/* 2-second delay transition overlay */}
                {isTransitioningToWin && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-50 rounded-[24px] select-none">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-14 h-14 bg-gradient-to-tr from-yellow-300 via-amber-400 to-amber-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20 animate-bounce">
                        🎉
                      </div>
                      <h2 className="text-white text-xl font-black font-display tracking-widest uppercase">
                        LEVEL SOLVED!
                      </h2>
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-1 text-amber-450 text-amber-450 text-amber-400 font-mono text-[10px] uppercase font-black tracking-wider bg-neutral-950/90 border border-neutral-800 px-3.5 py-1 rounded-full animate-pulse shadow-md">
                          <span>🪙</span>
                          <span>+50 Coins Credited!</span>
                        </div>
                        <div className="text-slate-400 font-mono text-[9px] uppercase font-bold tracking-wider">
                          Preparing Next Challenge...
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Clean layout modifiers: Text descriptions removed as requested */}
              <div className={`w-full max-w-xl h-auto p-2 md:p-2.5 border rounded-2xl md:rounded-3xl shadow-xl flex items-center justify-center gap-2 md:gap-3 ${activeTheme.containerBg} backdrop-blur-md flex-none`}>
                {/* 1. TUBE ACTION */}
                <button
                  id="booster-button-extra-tube"
                  onClick={() => {
                    audio.playClick();
                    setBoosterPrompt('tube');
                  }}
                  className="flex-1 h-10 md:h-12 flex items-center justify-center gap-1.2 sm:gap-1.5 text-[10px] md:text-[11.5px] uppercase font-black transition-all cursor-pointer border-b-2 rounded-xl md:rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-500 text-neutral-950 border-cyan-705 font-extrabold shadow hover:brightness-110 active:translate-y-0.5"
                  title="Unlock auxiliary Tube"
                >
                  <PlusCircle className="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[3.5]" />
                  <span>Extra</span>
                  <span className="text-[8px] md:text-[9.5px] opacity-80 font-mono">1k</span>
                </button>

                {/* 2. UNDO ACTION (Costs exactly 50 gold coins) */}
                <button
                  onClick={handleUndo}
                  className={`flex-1 h-10 md:h-12 flex items-center justify-center gap-1.2 sm:gap-1.5 text-[10px] md:text-[11.5px] uppercase font-black transition-all cursor-pointer border-b-2 rounded-xl md:rounded-2xl ${
                    history.length > 0
                      ? 'bg-amber-400 text-neutral-950 border-amber-600 shadow hover:brightness-110 active:translate-y-0.5'
                      : 'bg-neutral-800/40 text-neutral-500 border-neutral-800/10 opacity-40 cursor-not-allowed'
                  }`}
                  title="Spend 50 coins to Undo"
                >
                  <Undo className="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[3.5]" />
                  <span>Undo</span>
                  <span className="text-[8px] md:text-[9.5px] opacity-80 font-mono">50</span>
                </button>

                {/* 3. HINT ACTION */}
                <button
                  onClick={() => {
                    if (isHintActive) {
                      handleToggleHint();
                    } else {
                      audio.playClick();
                      setBoosterPrompt('hint');
                    }
                  }}
                  className={`flex-1 h-10 md:h-12 flex items-center justify-center gap-1.2 sm:gap-1.5 text-[10px] md:text-[11.5px] uppercase font-black border-b-2 rounded-xl md:rounded-2xl transition-all cursor-pointer ${
                    isHintActive
                      ? 'bg-emerald-500 text-white border-emerald-700 shadow animate-pulse'
                      : 'bg-amber-400 text-neutral-950 border-amber-600 shadow hover:brightness-110 active:translate-y-0.5'
                  }`}
                  title="Show visual hints"
                >
                  <HelpCircle className="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[3.5]" />
                  <span>{isHintActive ? 'Hide' : 'Hint'}</span>
                  {!isHintActive && <span className="text-[8px] md:text-[9.5px] opacity-80 font-mono">200</span>}
                </button>

                {/* 4. SKIP LEVEL ACTION */}
                <button
                  onClick={() => {
                    audio.playClick();
                    setBoosterPrompt('skip');
                  }}
                  className="flex-1 h-10 md:h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-550 text-white border-b-2 border-indigo-905 rounded-xl md:rounded-2xl flex items-center justify-center gap-1.2 sm:gap-1.5 text-[10px] md:text-[11.5px] uppercase font-black cursor-pointer shadow transition hover:brightness-110 active:translate-y-0.5"
                  title="Skip level"
                >
                  <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[3.5]" />
                  <span>Skip</span>
                  <span className="text-[8px] md:text-[9.5px] opacity-80 font-mono">2k</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* WIN SCREEN */}
          {status === 'won' && (
            <div className="fixed inset-0 bg-[#000000]/95 z-[999] flex items-center justify-center p-4 overflow-hidden select-none">
              {/* Fall-back falling confetti particles */}
              {Array.from({ length: 45 }).map((_, index) => {
                const colors = [
                  'bg-red-500', 'bg-blue-405', 'bg-yellow-405', 'bg-green-405', 
                  'bg-pink-505', 'bg-purple-505', 'bg-orange-405', 'bg-teal-405',
                  'bg-emerald-405', 'bg-amber-405'
                ];
                const color = colors[index % colors.length];
                const size = index % 2 === 0 ? 'w-2 h-4.5' : 'w-1.5 h-3.5';
                const left = (index * 2.2) % 100;
                const duration = 2.0 + (index % 5) * 0.6;
                const delay = (index % 4) * 0.4;
                const rotateValue = 180 + (index * 45) % 360;
                const xSway = (index % 3 === 0) ? 60 : (index % 3 === 1) ? -60 : 0;
                return (
                  <motion.div
                    key={index}
                    className={`absolute ${color} ${size} opacity-90 rounded-[1.5px] z-[5] pointer-events-none`}
                    initial={{ y: -50, x: `${left}vw`, rotate: 0 }}
                    animate={{ 
                      y: '110vh', 
                      x: `${left + (xSway / (typeof window !== 'undefined' ? window.innerWidth : 1000)) * 100}vw`,
                      rotate: rotateValue 
                    }}
                    transition={{
                      duration: duration,
                      delay: delay,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                );
              })}

              {currentLevel % 10 === 0 && !milestoneBonusClaimed ? (
                /* SPECIAL 10-LEVEL MILESTONE REWARD PANEL */
                <motion.div
                  key="milestone-won"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-md bg-gradient-to-b from-[#3E2723] to-[#1A0C00] border-4 border-[#FFA000] rounded-[32px] p-6 text-center relative z-10 shadow-[0_0_30px_rgba(255,160,0,0.5)] flex flex-col items-center"
                >
                  {/* Cute Chibi-Girl character looking over the banner */}
                  <div className="relative -mt-20 -mb-2 z-20 flex flex-col items-center">
                    {/* Hair back */}
                    <div className="absolute top-[2px] w-[95px] h-[95px] bg-[#3E1A00] rounded-full" />
                    
                    {/* Cute rounded ears */}
                    <div className="absolute top-[35px] left-[-6px] w-[18px] h-[18px] bg-[#FFE0B2] rounded-full border-2 border-[#3E1A00]" />
                    <div className="absolute top-[35px] right-[-6px] w-[18px] h-[18px] bg-[#FFE0B2] rounded-full border-2 border-[#3E1A00]" />
                    
                    {/* Face skin */}
                    <div className="w-[85px] h-[85px] bg-[#FFE0B2] rounded-full border-4 border-[#3E1A00] relative flex items-center justify-center overflow-hidden">
                      {/* Rosy cheeks */}
                      <div className="absolute bottom-[22px] left-[10px] w-4.5 h-3 bg-rose-400 rounded-full opacity-60 filter blur-[1px]" />
                      <div className="absolute bottom-[22px] right-[10px] w-4.5 h-3 bg-rose-400 rounded-full opacity-60 filter blur-[1px]" />
                      
                      {/* Big Anime Eyes */}
                      <div className="absolute top-[34px] left-[18px] w-[15px] h-[22px] bg-[#111827] rounded-full flex flex-col items-center justify-start pt-1.5 px-0.5 relative">
                        <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1" />
                        <div className="w-1 h-1 bg-white rounded-full absolute bottom-1 right-1" />
                      </div>
                      <div className="absolute top-[34px] right-[18px] w-[15px] h-[22px] bg-[#111827] rounded-full flex flex-col items-center justify-start pt-1.5 px-0.5 relative">
                        <div className="w-2 h-2 bg-white rounded-full absolute top-1 right-1" />
                        <div className="w-1 h-1 bg-white rounded-full absolute bottom-1 left-1" />
                      </div>
                      
                      {/* Cute smiling mouth */}
                      <div className="absolute bottom-[20px] w-4.5 h-2.5 border-b-[3px] border-[#3E1A00] rounded-b-full bg-[#EF4444]" />
                    </div>
                    
                    {/* Hair Bangs / Front hair */}
                    <div className="absolute top-[-3px] w-[90px] h-[34px] bg-[#3E1A00] rounded-b-xl border-x-4 border-t-4 border-[#3E1A00] flex justify-between px-2">
                      <div className="w-3 h-5 bg-[#3E1A00] rounded-b-md" />
                      <div className="w-4 h-6 bg-[#3E1A00] rounded-b-lg" />
                      <div className="w-3 h-5 bg-[#3E1A00] rounded-b-md" />
                    </div>
                    
                    {/* Cute pink headband with flower */}
                    <div className="absolute top-[-5px] w-[86px] h-3 bg-pink-500 rounded-full border-t border-pink-400" />
                    <div className="absolute top-[-9px] left-[15px] text-lg select-none">🌸</div>
                  </div>

                  {/* Title Banner Ribbon */}
                  <div className="relative w-full max-w-[310px] mx-auto z-10 mb-4">
                    {/* Left edge shadow tail */}
                    <div className="absolute left-[-10px] top-[10px] w-6 h-10 bg-[#0d5929] rounded-l -z-10" style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }} />
                    {/* Right edge shadow tail */}
                    <div className="absolute right-[-10px] top-[10px] w-6 h-10 bg-[#0d5929] rounded-r -z-10" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
                    
                    {/* Raised structural green display banner */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 border-y border-emerald-400/20 text-white px-6 py-2.5 rounded shadow-xl flex flex-col items-center justify-center font-display font-black leading-none uppercase">
                      <span className="text-[10px] font-black tracking-[0.25em] text-emerald-100">
                        🏆 MILESTONE REWARD 🏆
                      </span>
                      <span className="text-xl sm:text-2xl font-black tracking-[0.1em] mt-1.5 font-sans text-white">
                        LEVEL {currentLevel} CLEARED
                      </span>
                    </div>
                  </div>

                  {/* Level Progress Milestone Indicator Bar */}
                  <div className="w-full bg-black/40 border border-neutral-800/80 px-4 py-2 rounded-2xl flex items-center justify-between gap-1.5 mt-1 mb-4">
                    <span className="text-xs font-bold text-neutral-400">Level {currentLevel - 1}</span>
                    <div className="flex-1 mx-2 relative h-4 bg-neutral-850 rounded-full border border-neutral-800 p-0.5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-yellow-400 rounded-full w-[100%] shadow-[inset_0_1px_3px_rgba(255,255,255,0.4)]" />
                      <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-slate-100 font-mono tracking-widest uppercase">
                        {currentLevel} / {currentLevel} Milestone Hit!
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-400 flex items-center gap-0.5">
                      <span>⭐</span>
                      <span>{currentLevel + 1}</span>
                    </span>
                  </div>

                  {/* Baseline Coin rewards */}
                  <div className="bg-amber-400/10 border border-amber-400/35 text-amber-400 font-black text-[11px] font-mono px-4 py-2 rounded-full flex items-center gap-2 select-none tracking-widest uppercase mb-5 shadow-sm">
                    <span>🪙</span>
                    <span>BASE REWARD: +50 COINS RECEIVED!</span>
                  </div>

                  {/* INTERACTIVE BONUS GAME */}
                  {(currentLevel / 10) % 2 === 1 ? (
                    /* ODD MILESTONES: Pointer oscillation spin needle bonus game (50, 100, 150) */
                    <div className="w-full bg-black/60 border-2 border-neutral-800 rounded-2xl p-4.5 flex flex-col items-center relative shadow-inner">
                      <h3 className="text-amber-300 text-xs font-black tracking-widest uppercase mb-1 flex items-center gap-1.5">
                        <span className="animate-pulse">🎯</span>
                        <span>SPIN THE NEEDLE BONUS</span>
                        <span className="animate-pulse">🎯</span>
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-medium mb-5">
                        Time your tap perfectly to stop the needle on the center 150 Coin Jackpot!
                      </p>

                      {/* Moving Needle Container */}
                      <div className="w-full relative h-6 mb-2">
                        {/* Needle Indicator Triangle pointing down */}
                        <div 
                          className="absolute -top-1 transition-all duration-75 flex flex-col items-center transform -translate-x-1/2"
                          style={{ left: `${milestoneNeedleValue}%` }}
                        >
                          <span className="text-xl leading-none animate-bounce">👇</span>
                          <div className="w-2 h-2.5 bg-yellow-400 border border-amber-600 rounded-b-sm" />
                        </div>
                      </div>

                      {/* 3-region scale bar */}
                      <div className="w-full h-11 bg-neutral-900 rounded-xl flex overflow-hidden border border-neutral-800 mb-5 relative">
                        {/* Region 1: 50 coins (Left 35%) */}
                        <div className={`w-[35%] h-full flex flex-col items-center justify-center text-white ${!isMilestoneSpinning && milestoneNeedleValue < 35 ? 'bg-amber-500/30' : 'bg-orange-500/10'} border-r border-neutral-800 transition`}>
                          <span className="text-xs font-mono font-bold text-orange-400">50 Coins</span>
                          <span className="text-[8px] font-mono opacity-60">0 - 35%</span>
                        </div>

                        {/* Region 2: 150 coins (Center 30%) - THE JACKPOT! */}
                        <div className={`w-[30%] h-full flex flex-col items-center justify-center relative ${!isMilestoneSpinning && milestoneNeedleValue >= 35 && milestoneNeedleValue <= 65 ? 'bg-yellow-400/45' : 'bg-yellow-500/15'} border-r border-neutral-800 transition shadow-[inset_0_0_12px_rgba(234,179,8,0.25)]`}>
                          <span className="text-sm font-sans font-black text-yellow-300 tracking-wider flex items-center gap-0.5 animate-pulse">
                            <span>👑</span>
                            <span>150</span>
                          </span>
                          <span className="text-[7.5px] font-black text-amber-400 tracking-widest uppercase">JACKPOT</span>
                        </div>

                        {/* Region 3: 100 coins (Right 35%) */}
                        <div className={`w-[35%] h-full flex flex-col items-center justify-center text-white ${!isMilestoneSpinning && milestoneNeedleValue > 65 ? 'bg-cyan-500/30' : 'bg-cyan-500/10'} transition`}>
                          <span className="text-xs font-mono font-bold text-cyan-400">100 Coins</span>
                          <span className="text-[8px] font-mono opacity-60">65 - 100%</span>
                        </div>
                      </div>

                      {/* Game action buttons */}
                      {isMilestoneSpinning ? (
                        <button
                          onClick={() => {
                            setIsMilestoneSpinning(false);
                            
                            // Determine prize based on final needle position
                            let prize = 50;
                            if (milestoneNeedleValue >= 35 && milestoneNeedleValue <= 65) {
                              prize = 150;
                            } else if (milestoneNeedleValue > 65) {
                              prize = 100;
                            }
                            
                            setMilestoneClaimedBonus(prize);
                            setCoins((prev) => {
                              const next = prev + prize;
                              localStorage.setItem('water_sort_coins', String(next));
                              return next;
                            });
                            
                            playBonusSound('stop');
                          }}
                          className="w-full max-w-[200px] h-12 bg-gradient-to-b from-rose-500 to-red-600 text-white border-b-4 border-red-800 font-black rounded-full flex items-center justify-center gap-2 hover:scale-[1.03] transition-all cursor-pointer font-sans shadow-lg tracking-widest active:translate-y-0.5 text-xs animate-bounce"
                        >
                          <span>🛑 STOP THE SPIN</span>
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-3 w-full">
                          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 animate-pulse">
                            <span>🎉</span>
                            <span>CONGRATS! YOU WON +{milestoneClaimedBonus} COINS!</span>
                          </div>

                          <button
                            onClick={() => {
                              audio.playClick();
                              setMilestoneBonusClaimed(true);
                            }}
                            className="w-full max-w-[220px] h-12 bg-gradient-to-b from-[#FFCF00] to-[#E5AB00] text-slate-950 font-black rounded-full flex items-center justify-center gap-2 hover:scale-[1.03] transition-all cursor-pointer font-sans shadow-[0_0_20px_rgba(255,191,0,0.35)] tracking-wide active:translate-y-0.5 text-xs"
                          >
                            <span>COLLECT & CONTINUE</span>
                            <ArrowRight className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* EVEN MILESTONES: Mystery gift free coin box chest (100 Coins) */
                    <div className="w-full bg-black/60 border-2 border-neutral-800 rounded-2xl p-4.5 flex flex-col items-center relative shadow-inner">
                      <h3 className="text-amber-300 text-xs font-black tracking-widest uppercase mb-1 flex items-center gap-1.5">
                        <span>🎁</span>
                        <span>MYSTERY BONUS CHEST</span>
                        <span>🎁</span>
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-medium mb-5">
                        Open the mystery gift chest to claim your milestone reward!
                      </p>

                      {/* Gift Box / Chest container with custom animations */}
                      <div className="mb-6 relative h-28 flex items-center justify-center">
                        {!isMilestoneBoxOpened ? (
                          <motion.div
                            animate={{
                              scale: [1, 1.08, 0.96, 1.08, 1],
                              rotate: [0, -4, 4, -4, 0],
                            }}
                            transition={{
                              duration: 1.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="text-7xl cursor-pointer select-none relative filter drop-shadow-[0_4px_10px_rgba(245,158,11,0.3)]"
                            onClick={() => {
                              setIsMilestoneBoxOpened(true);
                              const prize = 100;
                              setMilestoneClaimedBonus(prize);
                              setCoins((prev) => {
                                const next = prev + prize;
                                localStorage.setItem('water_sort_coins', String(next));
                                return next;
                              });
                              playBonusSound('open');
                            }}
                          >
                            🎁
                            {/* Tap Indicator Pulse ring */}
                            <div className="absolute inset-0 bg-amber-400/20 rounded-full -z-10 animate-ping" />
                          </motion.div>
                        ) : (
                          <div className="relative flex flex-col items-center justify-center">
                            {/* Opened Box Animation */}
                            <motion.div
                              initial={{ scale: 0.5, rotate: -15 }}
                              animate={{ scale: 1.2, rotate: 0 }}
                              className="text-7xl select-none"
                            >
                              🎉
                            </motion.div>
                            
                            {/* Float up golden coin bubbles */}
                            <div className="absolute -top-6 flex gap-1.5 justify-center">
                              {Array.from({ length: 4 }).map((_, idx) => (
                                <motion.span
                                  key={idx}
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: -40, opacity: [0, 1, 1, 0] }}
                                  transition={{
                                    duration: 1.2,
                                    delay: idx * 0.15,
                                    repeat: Infinity,
                                  }}
                                  className="text-xl"
                                >
                                  🪙
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Game Actions */}
                      {!isMilestoneBoxOpened ? (
                        <button
                          onClick={() => {
                            setIsMilestoneBoxOpened(true);
                            const prize = 100;
                            setMilestoneClaimedBonus(prize);
                            setCoins((prev) => {
                              const next = prev + prize;
                              localStorage.setItem('water_sort_coins', String(next));
                              return next;
                            });
                            playBonusSound('open');
                          }}
                          className="w-full max-w-[200px] h-12 bg-gradient-to-b from-amber-400 to-yellow-500 text-slate-950 border-b-4 border-yellow-700 font-black rounded-full flex items-center justify-center gap-2 hover:scale-[1.03] transition-all cursor-pointer font-sans shadow-lg tracking-widest active:translate-y-0.5 text-xs"
                        >
                          <span>OPEN MYSTERY BOX 🎁</span>
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-3 w-full">
                          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 animate-pulse">
                            <span>🎁</span>
                            <span>FREE 100 COINS RECEIVED WITH JOY!</span>
                          </div>

                          <button
                            onClick={() => {
                              audio.playClick();
                              setMilestoneBonusClaimed(true);
                            }}
                            className="w-full max-w-[220px] h-12 bg-gradient-to-b from-[#FFCF00] to-[#E5AB00] text-slate-950 font-black rounded-full flex items-center justify-center gap-2 hover:scale-[1.03] transition-all cursor-pointer font-sans shadow-[0_0_20px_rgba(255,191,0,0.35)] tracking-wide active:translate-y-0.5 text-xs"
                          >
                            <span>COLLECT & CONTINUE</span>
                            <ArrowRight className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="won"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-sm flex flex-col items-center justify-center p-6 text-center relative z-10"
                >
                  {/* Glowing Crown SVG exactly like user image 2 */}
                  <div className="mb-4">
                    <svg className="w-[100px] h-[75px] drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-bounce" viewBox="0 0 100 80">
                      {/* Crown Main Surface */}
                      <path 
                        d="M10,70 L90,70 L85,45 L65,55 L50,30 L35,55 L15,45 Z" 
                        fill="url(#goldGrad)" 
                        stroke="#B45309" 
                        strokeWidth="2.5" 
                        strokeLinejoin="round"
                      />
                      
                      {/* Red diamond gems on primary tips */}
                      <circle cx="10" cy="45" r="4" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1" />
                      <circle cx="90" cy="45" r="4" fill="#EF4444" stroke="#7F1D1D" strokeWidth="1" />
                      
                      {/* Blue lapis stones on secondary valley folds */}
                      <circle cx="35" cy="55" r="3.5" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="1" />
                      <circle cx="65" cy="55" r="3.5" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="1" />
                      
                      {/* Royal Green Emerald at the peak center position */}
                      <circle cx="50" cy="30" r="5" fill="#10B981" stroke="#064E3B" strokeWidth="1" />
                      
                      {/* Crown bottom heavy support plate */}
                      <rect x="10" y="65" width="80" height="9" fill="#F59E0B" stroke="#B45309" strokeWidth="2" rx="1.5" />
                      {/* Colorful inset jewelry gems on base */}
                      <circle cx="20" cy="69.5" r="2.5" fill="#10B981" />
                      <circle cx="35" cy="69.5" r="2.5" fill="#EF4444" />
                      <circle cx="50" cy="69.5" r="3" fill="#3B82F6" />
                      <circle cx="65" cy="69.5" r="2.5" fill="#EF4444" />
                      <circle cx="80" cy="69.5" r="2.5" fill="#10B981" />

                      <defs>
                        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FFF4D0" />
                          <stop offset="20%" stopColor="#FBBF24" />
                          <stop offset="60%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Beautiful Golden 3-Star Rating Graphic */}
                  <div className="flex justify-center items-end gap-1.5 my-1.5 relative z-20">
                    {/* Star 1 (Left - tilted left) */}
                    <motion.svg
                      className="w-10 h-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.65)]"
                      viewBox="0 0 24 24"
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: -15, y: 3 }}
                      transition={{
                        type: "spring",
                        stiffness: 240,
                        damping: 11,
                        delay: 0.1,
                      }}
                    >
                      <defs>
                        <linearGradient id="starGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FFFBEB" />
                          <stop offset="35%" stopColor="#FBBF24" />
                          <stop offset="70%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z"
                        fill="url(#starGoldGrad)"
                        stroke="#B45309"
                        strokeWidth="1.2"
                      />
                    </motion.svg>

                    {/* Star 2 (Center - slightly larger & taller) */}
                    <motion.svg
                      className="w-13 h-13 drop-shadow-[0_0_22px_rgba(251,191,36,0.85)]"
                      viewBox="0 0 24 24"
                      initial={{ scale: 0, y: -15 }}
                      animate={{ scale: 1.15, y: -5 }}
                      transition={{
                        type: "spring",
                        stiffness: 240,
                        damping: 10,
                        delay: 0.25,
                      }}
                    >
                      <path
                        d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z"
                        fill="url(#starGoldGrad)"
                        stroke="#B45309"
                        strokeWidth="1.2"
                      />
                    </motion.svg>

                    {/* Star 3 (Right - tilted right) */}
                    <motion.svg
                      className="w-10 h-10 drop-shadow-[0_0_15px_rgba(251,191,36,0.65)]"
                      viewBox="0 0 24 24"
                      initial={{ scale: 0, rotate: 45 }}
                      animate={{ scale: 1, rotate: 15, y: 3 }}
                      transition={{
                        type: "spring",
                        stiffness: 240,
                        damping: 11,
                        delay: 0.4,
                      }}
                    >
                      <path
                        d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z"
                        fill="url(#starGoldGrad)"
                        stroke="#B45309"
                        strokeWidth="1.2"
                      />
                    </motion.svg>
                  </div>

                  {/* AWESOME Ribbon/Badge Banner component */}
                  <div className="relative w-full max-w-[280px] mx-auto select-none">
                    {/* Left edge shadow tail */}
                    <div className="absolute left-[-10px] top-[6px] w-6 h-10 bg-[#830B0F] rounded-l -z-10" style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }} />
                    {/* Right edge shadow tail */}
                    <div className="absolute right-[-10px] top-[6px] w-6 h-10 bg-[#830B0F] rounded-r -z-10" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
                    
                    {/* Raised structural red display banner */}
                    <div className="bg-gradient-to-r from-[#DF1D24] to-[#B31217] border-y border-red-500/20 text-white px-8 py-2.5 rounded shadow-xl flex items-center justify-center font-display font-black leading-none uppercase">
                      <span className="text-xl sm:text-2xl font-black tracking-[0.18em] translate-x-[0.09em] font-sans">
                        AWESOME
                      </span>
                    </div>
                  </div>

                  {/* Visual Two Finished Tube cylinders exactly matching user image 2 */}
                  <div className="flex justify-center items-end gap-6 my-7">
                    {/* Yellow Bottle Graphic */}
                    <div className="relative w-6 h-[72px] border-2 border-white/40 bg-white/5 rounded-b-full shadow-inner flex flex-col justify-end p-0.5 overflow-hidden">
                      <div className="w-full h-[95%] bg-gradient-to-t from-yellow-500 to-amber-300 rounded-b-full shadow-[inset_0_2px_10px_rgba(255,255,255,0.4)]" />
                      <div className="absolute top-[-3px] left-[-2px] right-[-2px] h-2 bg-neutral-900 border-2 border-white/40 rounded-full" />
                    </div>
                    
                    {/* Green Bottle Graphic */}
                    <div className="relative w-6 h-[72px] border-2 border-white/40 bg-white/5 rounded-b-full shadow-inner flex flex-col justify-end p-0.5 overflow-hidden">
                      <div className="w-full h-[95%] bg-gradient-to-t from-emerald-500 to-green-400 rounded-b-full shadow-[inset_0_2px_10px_rgba(255,255,255,0.4)]" />
                      <div className="absolute top-[-3px] left-[-2px] right-[-2px] h-2 bg-neutral-900 border-2 border-white/40 rounded-full" />
                    </div>
                  </div>

                  {/* Score details */}
                  <div className="text-white text-xs font-sans tracking-wide mt-1 font-medium filter drop-shadow">
                    Completed in <span className="font-extrabold text-white">{movesCount} steps</span>
                  </div>

                  <div className="text-[#FFAE00] text-[11px] font-black uppercase tracking-[0.25em] translate-x-[0.125em] mt-1.5 font-sans filter drop-shadow">
                    {movesCount <= 10 ? "EASY" : "HARD"}
                  </div>

                  <div className="mt-3.5 bg-amber-400/10 border border-amber-400/35 text-amber-400 font-black text-[10px] font-mono px-3.5 py-1.5 rounded-full flex items-center gap-1.5 select-none tracking-widest uppercase shadow-sm">
                    <span>🪙</span>
                    <span>+50 Coins Received!</span>
                  </div>

                  {/* Main Action buttons matching image flow */}
                  <div className="w-full flex flex-col items-center gap-3.5 mt-8 select-none">
                    {/* Primary Capsule Button NEXT -> */}
                    <button
                      onClick={handleNextLevel}
                      className="w-full max-w-[240px] h-13 bg-gradient-to-b from-[#FFCF00] to-[#E5AB00] text-slate-950 font-black rounded-full flex items-center justify-center gap-2 hover:scale-[1.03] transition-all cursor-pointer font-sans shadow-[0_0_20px_rgba(255,191,0,0.35)] tracking-wide active:translate-y-0.5"
                    >
                      <span className="text-xs font-black tracking-[0.2em] translate-x-[0.1em]">NEXT</span>
                      <ArrowRight className="w-4.5 h-4.5 stroke-[3]" />
                    </button>

                    {/* Secondary Capsule Button Restart This Level */}
                    <button
                      onClick={() => {
                        audio.playClick();
                        handleRestart();
                        setStatus('playing');
                      }}
                      className="w-full max-w-[190px] py-2 bg-neutral-900/60 hover:bg-neutral-850 text-slate-400 hover:text-white rounded-full flex items-center justify-center gap-1.5 cursor-pointer text-[9px] uppercase transition border border-neutral-800/80 active:translate-y-0.5"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-400" />
                      <span className="font-extrabold font-sans tracking-wider">Restart This Level</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

        </AnimatePresence>
      </main>

      {/* About Us and Codex Modal Overlay */}
      <PrivacyAboutModal 
        isOpen={showPrivacyPolicy} 
        onClose={() => setShowPrivacyPolicy(false)} 
        onOpenPrivacy={() => {
          setShowPrivacyPolicy(false);
          setShowPrivacyOnly(true);
        }}
      />

      {/* Official 1500 words Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyOnly}
        onClose={() => setShowPrivacyOnly(false)}
      />

      {/* Booster Coins/Ad Selection Modal Option Popups */}
      <AnimatePresence>
        {boosterPrompt !== null && (
          <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border-4 border-amber-400 rounded-3xl w-full max-w-sm p-6 text-center relative overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.2)]"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => { audio.playClick(); setBoosterPrompt(null); }}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-750 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer font-bold transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-14 h-14 mx-auto mb-3.5 bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 text-neutral-950 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg animate-pulse">
                {boosterPrompt === 'tube' ? '🧪' : boosterPrompt === 'hint' ? '💡' : '⏭️'}
              </div>

              <h3 className="text-lg font-black text-white font-display uppercase tracking-wide">
                {boosterPrompt === 'tube' ? 'UNLOCK EXTRA TUBE' :
                 boosterPrompt === 'hint' ? 'REVEAL STRATEGY HINT' :
                 'SKIP LEVEL'}
              </h3>

              <p className="my-3 mx-2 text-[11px] font-medium leading-relaxed text-slate-300 font-sans">
                {boosterPrompt === 'tube' ? 'Gain an auxiliary empty container vessel to expand your sorting moves catalog and exit congested state blocks.' :
                 boosterPrompt === 'hint' ? 'Construct a visual path projection showing the next certified valid fluid pour movement.' :
                 'Bypass the current color sorting puzzle entirely and automatically progress forward to the subsequent stage.'}
              </p>

              <div className="my-3 inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-950/90 border border-neutral-800 rounded-full font-mono text-[9px] text-amber-400 font-black">
                <span>Wallet Balance:</span>
                <span>🪙</span>
                <span>{coins}</span>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() => {
                    const price = boosterPrompt === 'hint' ? 200 : (boosterPrompt === 'tube' ? 1000 : 2000);
                    if (coins >= price) {
                      audio.playWin();
                      const nextCoins = coins - price;
                      setCoins(nextCoins);
                      localStorage.setItem('water_sort_coins', String(nextCoins));
                      setBoosterPrompt(null);

                      if (boosterPrompt === 'tube') {
                        handleAddBottle();
                      } else if (boosterPrompt === 'hint') {
                        handleToggleHint();
                      } else if (boosterPrompt === 'skip') {
                        audio.playWin();
                        setStatus('won');
                      }
                    } else {
                      audio.playInvalid();
                      setClaimedReward(`⚠️ INSUFFICIENT COIN WALLET BALANCE! You require exactly 🪙${price.toLocaleString()} gold coins. Claim your Free Daily Gift instead!`);
                      setShowClaimModal(true);
                    }
                  }}
                  className="w-full h-12 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black rounded-xl text-xs uppercase cursor-pointer border-b-4 border-amber-600 transition flex items-center justify-center gap-2"
                >
                  <span>SPEND 🪙 {boosterPrompt === 'hint' ? '200' : (boosterPrompt === 'tube' ? '1,000' : '2,000')} COINS</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Theme-Adaptive Cute Settings Dialog */}
      <AnimatePresence>
        {showHomeSettingsMenu && (
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-[4px] z-[99999] flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-[310px] p-5 rounded-[22px] flex flex-col gap-3 font-mono text-[10px] sm:text-[11px] font-bold shadow-2xl relative border-2 ${activeTheme.containerBg} ${activeTheme.textColor}`}
            >
              <button
                onClick={() => { audio.playClick(); setShowHomeSettingsMenu(false); }}
                className="absolute top-4 right-4 w-7.5 h-7.5 rounded-full bg-current/5 hover:bg-current/10 border border-current/10 flex items-center justify-center cursor-pointer transition"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="text-[12px] uppercase tracking-wider text-center font-black border-b border-current/15 pb-2.5 mb-1 flex items-center justify-center gap-2">
                <span>⚙️</span>
                <span>GAME SETTINGS</span>
                <span>⚙️</span>
              </div>

              {/* Restart Progress (level 1 start) */}
              <button
                onClick={() => {
                  audio.playClick();
                  setShowResetConfirmModal(true);
                }}
                className="w-full py-2 px-3 bg-current/5 hover:bg-current/10 border border-current/10 rounded-xl text-left flex items-center gap-3 cursor-pointer transition select-none"
              >
                <RotateCcw className="w-4 h-4 text-rose-500 flex-none" />
                <span>RESTART PROGRESS</span>
              </button>

              {/* Rules Tutorial */}
              <button
                onClick={() => {
                  audio.playClick();
                  setShowHomeSettingsMenu(false);
                  setShowHowToPlay(true);
                }}
                className="w-full py-2 px-3 bg-current/5 hover:bg-current/10 border border-current/10 rounded-xl text-left flex items-center gap-3 cursor-pointer transition select-none"
              >
                <Info className="w-4 h-4 text-blue-400 flex-none" />
                <span>RULES TUTORIAL</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={() => {
                  handleToggleSoundMute();
                }}
                className="w-full py-2 px-3 bg-current/5 hover:bg-current/10 border border-current/10 rounded-xl text-left flex items-center justify-between gap-3 cursor-pointer transition select-none"
              >
                <div className="flex items-center gap-3">
                  {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-400 flex-none" /> : <Volume2 className="w-4 h-4 text-emerald-400 flex-none" />}
                  <span>SOUND EFFECTS</span>
                </div>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${isSoundMuted ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                  {isSoundMuted ? "OFF" : "ON"}
                </span>
              </button>

              {/* Music Toggle */}
              <button
                onClick={() => {
                  handleToggleMusicMute();
                }}
                className="w-full py-2 px-3 bg-current/5 hover:bg-current/10 border border-current/10 rounded-xl text-left flex items-center justify-between gap-3 cursor-pointer transition select-none"
              >
                <div className="flex items-center gap-3">
                  <Music className={`w-4 h-4 flex-none ${isMusicMuted ? "text-rose-400" : "text-cyan-400 animate-pulse"}`} />
                  <span>BG MUSIC</span>
                </div>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${isMusicMuted ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                  {isMusicMuted ? "OFF" : "ON"}
                </span>
              </button>

              {/* Shapes & Skins trigger inside settings */}
              <button
                onClick={() => {
                  audio.playClick();
                  setMarketOrigin('settings');
                  setMarketTab('vessels');
                  setShowHomeSettingsMenu(false);
                  setShowMarketModal(true);
                }}
                className="w-full py-2 px-3 bg-current/5 hover:bg-current/10 border border-current/10 rounded-xl text-left flex items-center gap-3 cursor-pointer transition select-none"
              >
                <ShoppingBag className="w-4 h-4 text-cyan-400 flex-none" />
                <span>🛸 GALAXY MARKET SHOP</span>
              </button>

              {/* About Us Popup trigger */}
              <button
                onClick={() => {
                  audio.playClick();
                  setShowHomeSettingsMenu(false);
                  setShowPrivacyPolicy(true);
                }}
                className="w-full py-2 px-3 bg-current/5 hover:bg-current/10 border border-current/10 rounded-xl text-left flex items-center gap-3 cursor-pointer transition select-none"
              >
                <HelpCircle className="w-4 h-4 text-teal-400 flex-none" />
                <span>ABOUT US</span>
              </button>

              {/* Privacy Policy Popup trigger */}
              <button
                onClick={() => {
                  audio.playClick();
                  setShowHomeSettingsMenu(false);
                  setShowPrivacyOnly(true);
                }}
                className="w-full py-2 px-3 bg-current/5 hover:bg-current/10 border border-current/10 rounded-xl text-left flex items-center gap-3 cursor-pointer transition select-none"
              >
                <Lock className="w-4 h-4 text-purple-400 flex-none" />
                <span>PRIVACY POLICY</span>
              </button>

              <div className="pt-2 border-t border-current/15 flex justify-center">
                <button
                  onClick={() => { audio.playClick(); setShowHomeSettingsMenu(false); }}
                  className="px-5 py-2 font-black rounded-xl text-[10px] uppercase cursor-pointer bg-current/10 text-current transition-all select-none hover:bg-current/20 active:scale-95"
                >
                  CLOSE SETTINGS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* Restart Progress Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirmModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-[6px] z-[99999] flex items-center justify-center p-4 select-none text-slate-800">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border-4 border-amber-400 rounded-3xl w-full max-w-md overflow-hidden flex flex-col p-6 gap-4 relative shadow-[0_12px_45px_rgba(245,158,11,0.4)]"
            >
              <div className="text-center">
                <div className="inline-block bg-amber-500 text-white font-mono font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                  ⚠️ CONFIRMATION REQUIRED
                </div>
                <h2 className="text-xl font-black font-display text-amber-600 uppercase tracking-tight select-none">
                  Reset Progress Options
                </h2>
                <p className="text-[11px] text-slate-500 font-bold leading-normal mt-1 px-1">
                  Choose which part of your game progress you would like to reset.
                </p>
              </div>

              <div className="flex flex-col gap-3.5 my-1 overflow-y-auto max-h-[360px] pr-1">
                {/* 1. LEVEL RESET */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col gap-2">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase">
                      <span>🏆</span> Level Progress
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold mt-0.5">
                      Resets your gameplay back to <strong>Level 1</strong> and resets / awards you <strong>1,000 Coins</strong> to start fresh!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      audio.playWin();
                      setShowResetConfirmModal(false);
                      setShowHomeSettingsMenu(false);
                      setCurrentLevel(1);
                      setMaxUnlockedLevel(1);
                      setCoins(1000);
                      localStorage.setItem('water_sort_level', '1');
                      localStorage.setItem('water_sort_max_unlocked', '1');
                      localStorage.setItem('water_sort_coins', '1000');
                      setStatus('home');
                      setClaimedReward("🔄 LEVEL PROGRESS RESET!\nStarted cleanly from Level 1 with 1,000 Coins.");
                      setShowClaimModal(true);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-xl text-[10px] uppercase cursor-pointer border-b-2 border-orange-700 transition active:translate-y-0.5"
                  >
                    RESET LEVEL & GET 1000 COINS
                  </button>
                </div>

                {/* 2. SKIN RESET */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col gap-2">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase">
                      <span>🎨</span> Custom Skins
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold mt-0.5">
                      Locks all acquired skins and equips the default clear look.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      audio.playWin();
                      setShowResetConfirmModal(false);
                      setShowHomeSettingsMenu(false);
                      setUnlockedSkins(['skin_none']);
                      setActiveSkinId('skin_none');
                      setActiveSkinGlowColor(undefined);
                      localStorage.setItem('water_sort_unlocked_skins', JSON.stringify(['skin_none']));
                      localStorage.setItem('water_sort_active_skin_id', 'skin_none');
                      localStorage.removeItem('water_sort_active_skin_glow');
                      setClaimedReward("🔄 SKIN PROGRESS RESET!\nAll custom skins have been locked successfully.");
                      setShowClaimModal(true);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-black rounded-xl text-[10px] uppercase cursor-pointer border-b-2 border-blue-700 transition active:translate-y-0.5"
                  >
                    RESET CUSTOM SKINS
                  </button>
                </div>

                {/* 3. BOTTLE/VESSEL RESET */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col gap-2">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase">
                      <span>🧪</span> Bottle Vessels
                    </h3>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold mt-0.5">
                      Locks all unlocked bottle vessel shapes and equips the standard glass tube.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      audio.playWin();
                      setShowResetConfirmModal(false);
                      setShowHomeSettingsMenu(false);
                      setUnlockedVessels(['standard']);
                      setActiveVesselStyle('standard');
                      localStorage.setItem('water_sort_unlocked_vessels', JSON.stringify(['standard']));
                      localStorage.setItem('water_sort_active_vessel', 'standard');
                      setClaimedReward("🔄 BOTTLE SHAPES RESET!\nDefault testing tube style equipped & custom vessels locked.");
                      setShowClaimModal(true);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-black rounded-xl text-[10px] uppercase cursor-pointer border-b-2 border-indigo-700 transition active:translate-y-0.5"
                  >
                    RESET BOTTLE SHAPES
                  </button>
                </div>

                {/* 4. ALL GAME RESET */}
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-150 flex flex-col gap-2">
                  <div>
                    <h3 className="text-xs font-black text-rose-800 flex items-center gap-1.5 uppercase">
                      <span>🔥</span> RESET ALL GAME PROGRESS
                    </h3>
                    <p className="text-[10px] text-rose-700 leading-relaxed font-bold mt-0.5">
                      Wipes everything! Level resets to 1, Coins set to 1000, all skins and bottle vessels locked to standard defaults.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      audio.playCelebration();
                      setShowResetConfirmModal(false);
                      setShowHomeSettingsMenu(false);
                      
                      // Reset Levels
                      setCurrentLevel(1);
                      setMaxUnlockedLevel(1);
                      setCoins(1000);
                      localStorage.setItem('water_sort_level', '1');
                      localStorage.setItem('water_sort_max_unlocked', '1');
                      localStorage.setItem('water_sort_coins', '1000');
                      
                      // Reset Skins
                      setUnlockedSkins(['skin_none']);
                      setActiveSkinId('skin_none');
                      setActiveSkinGlowColor(undefined);
                      localStorage.setItem('water_sort_unlocked_skins', JSON.stringify(['skin_none']));
                      localStorage.setItem('water_sort_active_skin_id', 'skin_none');
                      localStorage.removeItem('water_sort_active_skin_glow');

                      // Reset Bottles/Vessels
                      setUnlockedVessels(['standard']);
                      setActiveVesselStyle('standard');
                      localStorage.setItem('water_sort_unlocked_vessels', JSON.stringify(['standard']));
                      localStorage.setItem('water_sort_active_vessel', 'standard');

                      setStatus('home');
                      setClaimedReward("🔥 ALL-IN-ONE SYSTEM RESET COMPLETE!\nClean restart initiated: Level 1, 1,000 Coins, locked skins, & default bottles.");
                      setShowClaimModal(true);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black rounded-xl text-[10px] uppercase cursor-pointer border-b-2 border-red-900 transition active:translate-y-0.5 animate-pulse"
                  >
                    🔥 YES, RESET EVERY PROGRESS
                  </button>
                </div>
              </div>

              <div className="mt-1">
                <button
                  onClick={() => {
                    audio.playClick();
                    setShowResetConfirmModal(false);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase cursor-pointer border-b-2 border-slate-300 transition active:translate-y-0.5 text-center block"
                >
                  NO, KEEP MY PROGRESS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



    </div>
  );
}
