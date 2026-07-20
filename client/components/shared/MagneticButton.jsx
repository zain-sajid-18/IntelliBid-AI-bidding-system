"use client";

import { useRef } from "react";

/**
 * A button that slightly "magnetises" toward the cursor on hover.
 * @param {{ children: React.ReactNode, className?: string, bg?: string, onClick?: () => void }} props
 */
export function MagneticButton({
  children,
  className = "",
  bg = "var(--electric)",
  onClick,
}) {
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={`relative inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-[var(--ink)] px-7 py-4 font-display text-base font-black uppercase tracking-tight text-[var(--ink)] shadow-[6px_6px_0_0_var(--ink)] transition-[box-shadow] duration-200 will-change-transform hover:shadow-[2px_2px_0_0_var(--ink)] ${className}`}
      style={{ background: bg }}
    >
      {children}
    </button>
  );
}
