'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const getBaseSection = (path: string) => path.split('/')[1] || '';

export function NavigationSplash() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const router = useRouter();

  // Track previous pathname to determine if we changed major sections
  const prevPathnameRef = useRef(pathname);
  const pendingNavRef = useRef<string | null>(null);

  // Global click listener to intercept link clicks BEFORE Next.js navigation starts
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Allow ctrl/cmd clicks to open in new tab normally
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href && !target.hasAttribute('download')) {
        try {
          const url = new URL(target.href);
          if (url.origin === window.location.origin) {
            const currBase = getBaseSection(pathname);
            const nextBase = getBaseSection(url.pathname);
            
            // Trigger splash if moving to a different major section (excluding home)
            if (nextBase !== '' && currBase !== nextBase) {
              e.preventDefault(); // Stop Next.js Link from navigating instantly
              e.stopPropagation();

              pendingNavRef.current = nextBase;
              setIsVisible(true);
              
              // Allow React to paint the splash screen before pushing the route
              setTimeout(() => {
                router.push(url.pathname + url.search + url.hash);
              }, 10);
              
              // Hide after animation duration, revealing either the new page or Next.js loading skeleton
              setTimeout(() => {
                setIsVisible(false);
              }, 1800);
            }
          }
        } catch (error) {
          // ignore invalid URLs
        }
      }
    };

    // Use capture phase to ensure it runs before Next.js Link handler
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname, router]);

  // Fallback for programmatic navigation (router.push) or back/forward buttons
  useEffect(() => {
    const prevPathname = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    
    const prevBase = getBaseSection(prevPathname);
    const currBase = getBaseSection(pathname);

    // No splash when navigating to the main home page or same section
    if (currBase === '' || prevBase === currBase) {
      return;
    }

    // If this navigation was already caught by the click listener, clear the pending state
    if (pendingNavRef.current === currBase) {
      pendingNavRef.current = null;
      return;
    }

    // Trigger splash for uncaught navigation (e.g. after login router.push)
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1800); 
    
    return () => clearTimeout(timer);
  }, [pathname, isInitialLoad]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-xl"
        >
          {/* Main Container that slides to the left */}
          <motion.div
            initial={{ x: 140 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
            className="flex items-center gap-8"
          >
            {/* Logo Wipes In */}
            <motion.div
              initial={{ clipPath: "inset(0 100% 0 0)", filter: "blur(8px)" }}
              animate={{ clipPath: "inset(0 0% 0 0)", filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="drop-shadow-2xl shrink-0"
            >
              <svg viewBox="0 0 500 500" width="140" height="140">
                <path
                  fillRule="evenodd"
                  d="m105 9l338.9 57.7c-292.3 108.5-331 394.6-331.6 429.2z"
                  fill="#ffffff"
                />
              </svg>
            </motion.div>

            {/* Text Emerges */}
            <motion.div
              initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0, x: -40 }}
              animate={{ clipPath: "inset(0 -10% 0 0)", opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-6xl font-black tracking-[0.15em] text-white">
                POSTPIPE
              </h1>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
