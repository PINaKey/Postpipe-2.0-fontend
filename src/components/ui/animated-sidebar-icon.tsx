"use client";

import React, { useRef, useEffect } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { cn } from "@/lib/utils";

interface AnimatedSidebarIconProps {
  animationData: any;
  className?: string;
}

export function AnimatedSidebarIcon({
  animationData,
  className,
}: AnimatedSidebarIconProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    // Find the closest sidebar link row (which has the group/sidebar class)
    const parent = containerRef.current?.closest('a') || containerRef.current?.closest('.group\\/sidebar');
    
    if (!parent) return;

    const handleMouseEnter = () => {
      if (!isPlayingRef.current) {
        isPlayingRef.current = true;
        lottieRef.current?.goToAndPlay(0, true);
      }
    };

    parent.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      parent.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  const handleMouseEnterFallback = () => {
    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      lottieRef.current?.goToAndPlay(0, true);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-center justify-center cursor-pointer",
        className
      )}
      onMouseEnter={handleMouseEnterFallback}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={false}
        onComplete={() => {
          isPlayingRef.current = false;
        }}
        // Force the icon to be dark in light mode and white in dark mode via CSS filters
        className="w-full h-full brightness-0 dark:invert transition-all duration-200"
      />
    </div>
  );
}
