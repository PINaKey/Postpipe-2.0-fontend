"use client";

import React, { useRef, useEffect } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { cn } from "@/lib/utils";
import editIconData from "../../../public/logos/Edit.json";

interface AnimatedEditIconProps {
  className?: string;
}

export function AnimatedEditIcon({
  className,
}: AnimatedEditIconProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    // Find the closest wrapping button or element (which has class group/edit-btn)
    const parent = containerRef.current?.closest('button') || containerRef.current?.closest('.group\\/edit-btn');
    
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
        animationData={editIconData}
        loop={false}
        autoplay={false}
        onComplete={() => {
          isPlayingRef.current = false;
        }}
        // Black in light mode, white in dark mode via invert filter
        className="w-full h-full brightness-0 dark:invert transition-all duration-200"
      />
    </div>
  );
}
