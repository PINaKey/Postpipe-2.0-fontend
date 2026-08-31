"use client";

import Lanyard from "./lanyard";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useState, useEffect } from "react";

const makers = [
  { name: "Sourodip", role: "Founder", username: "sourodip-1", color: "#10b981" },
  { name: "Pinaki", role: "Core Dev", username: "PINaKey", color: "#3b82f6" },
  { name: "Soyam", role: "Developer", username: "yo-soyam", color: "#f59e0b" },
  { name: "Souvik", role: "Developer", username: "souvikvos", color: "#8b5cf6" },
];

const encodeBase64 = (str: string) => {
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(str)));
  }
  return Buffer.from(str, 'utf8').toString('base64');
};

const lanyardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="30" viewBox="0 0 150 30" fill="none">
  <rect width="150" height="30" fill="#18181b"/>
  <svg x="15" y="5" width="20" height="20" viewBox="0 0 500 500">
    <path fill-rule="evenodd" d="m105 9l338.9 57.7c-292.3 108.5-331 394.6-331.6 429.2z" fill="#ffffff"/>
  </svg>
  <text x="45" y="20" font-family="'Space Grotesk', sans-serif" font-size="15" font-weight="900" letter-spacing="-0.5" fill="white">postpipe</text>
</svg>`;
const customLanyardBase64 = `data:image/svg+xml;base64,${encodeBase64(lanyardSvg)}`;

const photoMap: Record<string, string> = {
  'Sourodip': '/Sourodip.png',
  'Pinaki': '/pinaki.jpeg',
  'Soyam': '/soyam.png',
  'Souvik': '/souvik.jpeg'
};

export function LanyardMakers() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <section id="makers" className="relative w-full overflow-hidden bg-zinc-950 md:h-[100vh] md:min-h-[800px] h-[550px] py-10 md:py-0">

      {/* Background Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-0 px-4 pointer-events-none opacity-40">
        <h2 className="font-headline text-5xl md:text-8xl font-black mb-6 text-white tracking-tighter">
          Meet the Makers
        </h2>
        <p className="text-zinc-400 text-lg md:text-2xl max-w-2xl mx-auto text-center font-medium">
          Built by developers, for developers. We are passionate about open source and creating tools that empower the community.
        </p>
      </div>

      {/* 3D Lanyards Container (Desktop Only) */}
      <div className="hidden md:block absolute inset-0 pointer-events-auto z-10 cursor-grab active:cursor-grabbing touch-none">
        <Lanyard
          position={[0, 0, 22]}
          gravity={[0, -40, 0]}
          items={makers.map((maker, idx) => {
            const initial = maker.name.charAt(0);
            const backLabel = maker.name === 'Sourodip' ? '&lt;/founder&gt;' : '&lt;/dev&gt;';

            const frontSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" fill="none">
              <rect width="400" height="600" rx="40" fill="#18181b"/>
              <rect x="20" y="20" width="360" height="560" rx="20" stroke="#27272a" stroke-width="4"/>
              
              <!-- Blank area for WebGL photo injection, or default avatar for others -->
              ${!!photoMap[maker.name]
                ? `<rect x="100" y="80" width="200" height="200" rx="100" fill="#18181b"/>`
                : `<rect x="100" y="80" width="200" height="200" rx="100" fill="${maker.color}15"/>
                   <circle cx="200" cy="180" r="100" stroke="${maker.color}40" stroke-width="2"/>
                   <text x="200" y="210" font-family="sans-serif" font-size="90" font-weight="900" fill="${maker.color}" text-anchor="middle">${initial}</text>`
              }

              <text x="200" y="380" font-family="monospace" font-size="46" font-weight="bold" fill="white" text-anchor="middle">${maker.name}</text>
              <text x="200" y="430" font-family="monospace" font-size="24" fill="#a1a1aa" text-anchor="middle">${maker.role}</text>
              <text x="200" y="520" font-family="monospace" font-size="20" fill="#52525b" text-anchor="middle">github.com/${maker.username}</text>
            </svg>`;

            const backSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" fill="none">
              <rect width="400" height="600" rx="40" fill="#000000"/>
              <svg x="125" y="170" width="150" height="150" viewBox="0 0 500 500">
                <path fill-rule="evenodd" d="m105 9l338.9 57.7c-292.3 108.5-331 394.6-331.6 429.2z" fill="#ffffff"/>
              </svg>
              <text x="200" y="420" font-family="monospace" font-size="32" font-weight="bold" fill="white" text-anchor="middle">postpipe.in</text>
              <text x="200" y="470" font-family="monospace" font-size="24" fill="#a1a1aa" text-anchor="middle">${backLabel}</text>
            </svg>`;

            const frontBase64 = `data:image/svg+xml;base64,${encodeBase64(frontSvg)}`;
            const backBase64 = `data:image/svg+xml;base64,${encodeBase64(backSvg)}`;

            // Spacing them out slightly tighter to keep outer cards away from the screen edge
            const anchorX = isMobile ? (idx - 1.5) * 1.5 : (idx - 1.5) * 3.2;
            
            // Push outer cards back in Z depth on mobile so they overlap behind
            const anchorZ = isMobile && (idx === 0 || idx === 3) ? -1.5 : 0;
            
            // Anchor them all exactly at the same invisible horizontal line off-screen
            const anchorY = 5;

            // First and last cards get longer ropes so they hang lower
            const isLong = idx === 0 || idx === 3;
            const ropeLength = isLong ? 1.3 : 1;
            const logoRepeats = isLong ? 3 : 2;

            return {
              frontImage: frontBase64,
              backImage: backBase64,
              lanyardImage: customLanyardBase64,
              photoImage: photoMap[maker.name] || null,
              anchorX: anchorX,
              anchorY: anchorY,
              anchorZ: anchorZ,
              ropeLength: ropeLength,
              logoRepeats: logoRepeats,
              username: maker.username
            };
          })}
        />
      </div>

      {/* Drop Zone UI (rendered behind canvas, z-0) */}
      <div className="hidden md:flex absolute inset-0 pointer-events-none z-0 items-end justify-center pb-8">
        <DropZone />
      </div>

      {/* Mobile Orbit Container (Mobile Only) */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center md:hidden pointer-events-auto">
        <MobileMakersOrbit />
      </div>
    </section>
  );
}

function MobileMakersOrbit() {
  return (
    <div className="relative w-[320px] h-[320px] flex items-center justify-center mt-12">
      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-orbit {
          animation: orbit 25s linear infinite;
        }
        .animate-orbit-reverse {
          animation: orbit-reverse 25s linear infinite;
        }
      `}</style>
      
      {/* Center Logo */}
      <div className="absolute z-20 w-20 h-20 bg-zinc-900 rounded-full border border-zinc-800 flex items-center justify-center shadow-xl">
        <svg width="40" height="40" viewBox="0 0 500 500">
          <path fillRule="evenodd" d="m105 9l338.9 57.7c-292.3 108.5-331 394.6-331.6 429.2z" fill="#ffffff"/>
        </svg>
      </div>
      
      {/* Orbit Track */}
      <div className="absolute w-[200px] h-[200px] border border-zinc-800/60 rounded-full border-dashed"></div>
      
      {/* Orbiting Nodes */}
      <div className="absolute inset-0 animate-orbit">
        {makers.map((maker, idx) => {
          const angle = (idx * 360) / makers.length;
          const avatarSrc = photoMap[maker.name];
          const initial = maker.name.charAt(0);
          
          return (
            <div 
              key={idx}
              className="absolute top-1/2 left-1/2 w-0 h-0"
              style={{ transform: `rotate(${angle}deg) translateY(-100px) rotate(-${angle}deg)` }}
            >
              {/* Counter-rotate the dynamic CSS animation to keep content upright */}
              <div className="w-full h-full animate-orbit-reverse">
                {/* Avatar Link */}
                <a 
                  href={`https://github.com/${maker.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-700 bg-zinc-900 flex items-center justify-center shadow-lg hover:border-zinc-400 transition-colors pointer-events-auto"
                >
                  {avatarSrc ? (
                    <img 
                      src={avatarSrc} 
                      alt={maker.name} 
                      className={`w-full h-full object-cover`} 
                    />
                  ) : (
                    <span style={{ color: maker.color }} className="text-2xl font-bold font-sans">{initial}</span>
                  )}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DropZone() {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleHover = (e: any) => setIsHovered(e.detail);
    window.addEventListener('scan-zone-hover', handleHover);
    return () => window.removeEventListener('scan-zone-hover', handleHover);
  }, []);

  return (
    <div 
      className={`w-72 h-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
        isHovered 
          ? 'border-zinc-300 bg-zinc-800/50 scale-105 shadow-[0_0_30px_rgba(255,255,255,0.12)] backdrop-blur-md' 
          : 'border-zinc-700/80 bg-zinc-950/40 backdrop-blur-sm'
      }`}
    >
      <svg className={`w-6 h-6 mb-2 transition-colors duration-300 ${isHovered ? 'text-white' : 'text-zinc-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
      <span className={`font-bold tracking-widest uppercase text-xs transition-colors duration-300 ${isHovered ? 'text-white' : 'text-zinc-400'}`}>
        Scan Identity
      </span>
      <span className={`text-[10px] mt-1 font-medium transition-colors duration-300 ${isHovered ? 'text-zinc-300' : 'text-zinc-600'}`}>
        {isHovered ? 'Release to view GitHub' : 'Drag ID card here to view GitHub'}
      </span>
    </div>
  );
}
