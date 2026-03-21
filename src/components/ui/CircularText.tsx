"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CircularText - SVG + CSS animation で回転する円形テキスト
 * IntersectionObserver でビューポートに入った時にスケールインする
 */

interface CircularTextProps {
  text: string;
  spinDuration?: number;
  className?: string;
}

export function CircularText({ text, spinDuration = 20, className = "" }: CircularTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`animate-spin-slow transition-[scale,opacity] duration-[1500ms] ease-out ${
        isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
      } ${className}`}
      style={{ animationDuration: `${spinDuration}s` }}
    >
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <path
            id="circularTextPath"
            d="M 100,100 m -80,0 a 80,80 0 1,1 160,0 a 80,80 0 1,1 -160,0"
            fill="none"
          />
        </defs>
        <text className="fill-current" fontSize="15.5" fontWeight="600" letterSpacing="2">
          <textPath href="#circularTextPath" textLength={Math.round(2 * Math.PI * 80)}>
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
