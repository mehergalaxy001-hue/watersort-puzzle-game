/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const BarShelf: React.FC = () => {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col select-none relative mb-2" id="bar-shelf-wrapper">
      {/* Background Shelf Cabinet silhouette for high-fidelity depth */}
      <div className="h-10 w-full bg-[#1e1411]/70 border-b border-[#2b1f1c] flex items-center justify-around px-4 opacity-40 absolute -top-8 left-0 right-0 rounded-t-xl overflow-hidden z-0">
        <div className="w-4 h-6 bg-[#3b2d2a] rounded-sm" />
        <div className="w-3 h-5 bg-[#4c3b38] rounded-sm" />
        <div className="w-5 h-7 bg-[#2f221f] rounded-sm" />
        <div className="w-3 h-6 bg-[#4c3b38] rounded-sm" />
        <div className="w-4 h-5 bg-[#3b2d2a] rounded-sm" />
      </div>

      {/* Main Vector Drink Shelf Canvas */}
      <div className="w-full h-24 bg-gradient-to-b from-[#16121a]/20 to-[#0e0a12]/50 rounded-2xl relative flex items-end justify-around px-3 pb-1.5 z-10 overflow-visible border border-white/5 shadow-inner">
        
        {/* Drink 1: Chocolate Milk Glass Bottle */}
        <div className="relative w-11 h-20 flex flex-col items-center justify-end group transition-transform hover:scale-110 duration-300">
          <svg viewBox="0 0 40 80" className="w-10 h-20 drop-shadow-md">
            {/* Liquid Fill */}
            <path d="M 8,28 L 32,28 L 34,70 C 34,74 30,76 20,76 C 10,76 6,74 6,70 Z" fill="#92400e" />
            <path d="M 8,42 L 32,42 L 34,70 C 34,74 30,76 20,76 C 10,76 6,74 6,70 Z" fill="#78350f" opacity="0.8" />
            
            {/* Orange Label */}
            <rect x="7" y="44" width="26" height="15" fill="#f97316" rx="1.5" />
            {/* Chocolate Chunk on Label */}
            <rect x="15" y="48" width="10" height="7" fill="#451a03" rx="1" transform="rotate(15 20 51)" />
            
            {/* Bottle Glass Body */}
            <path d="M 14,12 L 26,12 L 26,20 L 33,26 L 33,70 C 33,75 29,78 20,78 C 11,78 7,75 7,70 L 7,26 L 14,20 Z" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeLinejoin="round" />
            <path d="M 12,12 L 28,12" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Wooden Cork Stopper */}
            <path d="M 15,4 L 25,4 L 24,12 L 16,12 Z" fill="#b45309" />
            
            {/* Specular highlight */}
            <path d="M 10,28 L 10,68" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
          </svg>
        </div>

        {/* Drink 2: Blueberry Slushie / Bubble Tea with green straw */}
        <div className="relative w-12 h-20 flex flex-col items-center justify-end group transition-transform hover:scale-110 duration-300">
          {/* Floating Blueberries next to slushie cup */}
          <div className="absolute -bottom-1 -right-1 z-20 flex gap-0.5 pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-700 border border-blue-900 shadow-sm flex items-center justify-center">
              <div className="w-0.5 h-0.5 bg-blue-400 rounded-full" />
            </div>
            <div className="w-2 h-2 rounded-full bg-blue-800 border border-blue-900 shadow-sm flex items-center justify-center translate-y-0.5">
              <div className="w-0.5 h-0.5 bg-blue-400 rounded-full" />
            </div>
          </div>
          
          <svg viewBox="0 0 45 80" className="w-12 h-20 drop-shadow-md overflow-visible">
            {/* Green Straw behind lid */}
            <line x1="22" y1="2" x2="19" y2="35" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
            
            {/* Ice and Slushie Blue Fill */}
            <path d="M 9,25 L 36,25 L 31,70 C 31,73 28,75 22.5,75 C 17,75 14,73 14,70 Z" fill="#0284c7" />
            <path d="M 9,38 L 36,38 L 31,70 C 31,73 28,75 22.5,75 C 17,75 14,73 14,70 Z" fill="#0369a1" opacity="0.8" />
            
            {/* Whipped Foam / Slush Dome under Lid */}
            <path d="M 9,25 C 9,15 36,15 36,25 Z" fill="#bae6fd" opacity="0.85" />
            
            {/* Cup Body */}
            <path d="M 8,24 L 37,24 L 32,71 C 32,74.5 28.5,76.5 22.5,76.5 C 16.5,76.5 13,74.5 13,71 Z" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinejoin="round" />
            
            {/* Domed Lid Rim */}
            <path d="M 6,24 C 6,24 10,13 22.5,13 C 35,13 39,24 39,24 Z" fill="none" stroke="#ffffff" strokeWidth="1.8" />
            <line x1="5" y1="24" x2="40" y2="24" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

            {/* Gloss shine */}
            <path d="M 12,28 L 16,68" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </svg>
        </div>

        {/* Drink 3: Purple Grape Slush Cup with purple sleeve */}
        <div className="relative w-11 h-20 flex flex-col items-center justify-end group transition-transform hover:scale-110 duration-300">
          <svg viewBox="0 0 40 80" className="w-10 h-20 drop-shadow-md">
            {/* Grape Liquid Fill */}
            <path d="M 9,25 L 31,25 L 28,71 C 28,74 25,75 20,75 C 15,75 12,74 12,71 Z" fill="#7c3aed" />
            <path d="M 9,45 L 31,45 L 28,71 C 28,74 25,75 20,75 C 15,75 12,74 12,71 Z" fill="#6d28d9" opacity="0.8" />
            
            {/* Grape Textured Sleeve */}
            <path d="M 10,32 L 30,32 L 28,52 L 12,52 Z" fill="#4c1d95" rx="1.5" />
            
            {/* Grape Icon on Sleeve */}
            <circle cx="18" cy="40" r="2.2" fill="#a78bfa" />
            <circle cx="22" cy="40" r="2.2" fill="#a78bfa" />
            <circle cx="20" cy="43.5" r="2.2" fill="#a78bfa" />
            <path d="M 19,37 L 21,35" stroke="#4ade80" strokeWidth="1" />
            
            {/* Cup Outline */}
            <path d="M 8,24 L 32,24 L 29,72 C 29,75 26,77 20,77 C 14,77 11,75 11,72 Z" fill="none" stroke="#f1f5f9" strokeWidth="2" strokeLinejoin="round" />
            <line x1="7" y1="24" x2="33" y2="24" stroke="#f1f5f9" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Straw */}
            <line x1="16" y1="6" x2="22" y2="24" stroke="#a78bfa" strokeWidth="2" />
            
            {/* White highlights */}
            <path d="M 13,26 L 15,68" stroke="#ffffff" strokeWidth="1.2" opacity="0.35" />
          </svg>
        </div>

        {/* Drink 4: Lemon Soda Can */}
        <div className="relative w-11 h-20 flex flex-col items-center justify-end group transition-transform hover:scale-110 duration-300">
          <svg viewBox="0 0 40 80" className="w-9 h-19.5 drop-shadow-md">
            {/* Soda Can Body */}
            <rect x="7" y="10" width="26" height="61" rx="4" fill="#a1a1aa" />
            
            {/* Yellow Lemon Sleeve */}
            <rect x="7" y="19" width="26" height="38" fill="#facc15" />
            
            {/* Lemon Slice Logo in Center */}
            <circle cx="20" cy="38" r="8" fill="#eab308" stroke="#ffffff" strokeWidth="1.2" />
            <path d="M 20,30 L 20,46 M 12,38 L 28,38" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
            
            {/* Silver Can Top Rim & Bottom Rim */}
            <rect x="9" y="8" width="22" height="3" fill="#d4d4d8" rx="0.5" />
            <rect x="9" y="70" width="22" height="3" fill="#d4d4d8" rx="0.5" />
            
            {/* Glossy specular can reflection */}
            <rect x="10" y="10" width="4" height="61" fill="#ffffff" opacity="0.25" />
          </svg>
        </div>

      </div>

      {/* Heavy 3D Wooden Countertop Counter Rail */}
      <div className="w-full h-4.5 bg-gradient-to-b from-[#854d0e] via-[#713f12] to-[#451a03] rounded-full border-b-[4px] border-[#3f1e08] shadow-[0_6px_14px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center relative">
        {/* Subtle wooden texture highlights */}
        <div className="absolute inset-x-6 top-1 h-0.5 bg-white/20 rounded-full filter blur-[0.5px]" />
        {/* Supporting table legs/pegs shadow effect */}
        <div className="absolute -bottom-2 left-6 w-5 h-2.5 bg-[#2d1506] rounded-sm" />
        <div className="absolute -bottom-2 right-6 w-5 h-2.5 bg-[#2d1506] rounded-sm" />
      </div>
    </div>
  );
};
