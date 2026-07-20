"use client";

import { useEffect, useRef } from "react";

export function LiquidCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mx = window.innerWidth / 2,
      my = window.innerHeight / 2;
    let rx = mx,
      ry = my;
    let raf = 0;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current)
        dotRef.current.style.transform = `translate3d(${mx - 6}px, ${my - 6}px, 0)`;
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ringRef.current)
        ringRef.current.style.transform = `translate3d(${rx - 22}px, ${ry - 22}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-11 w-11 rounded-full border-[3px] border-[var(--ink)] mix-blend-difference md:block"
        style={{
          background: "color-mix(in oklab, var(--electric) 20%, transparent)",
        }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[101] hidden h-3 w-3 rounded-full bg-[var(--hotpink)] md:block"
      />
    </>
  );
}
