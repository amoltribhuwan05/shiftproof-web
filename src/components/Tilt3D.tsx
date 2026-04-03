"use client";

import { useRef, MouseEvent, ReactNode } from "react";

interface Tilt3DProps {
  children: ReactNode;
  className?: string;
  intensity?: number; // degrees of max tilt, default 10
  lift?: number;      // px of Z lift on hover, default 12
}

export default function Tilt3D({
  children,
  className = "",
  intensity = 10,
  lift = 12,
}: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;   // –0.5 → 0.5
    const y = (e.clientY - top) / height - 0.5;   // –0.5 → 0.5
    el.style.transform = `perspective(700px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) translateZ(${lift}px)`;
    el.style.transition = "transform 0.08s ease-out";
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform =
      "perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    el.style.transition = "transform 0.4s ease";
  }

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      {children}
    </div>
  );
}
