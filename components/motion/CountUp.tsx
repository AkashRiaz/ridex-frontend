"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

const formatter = new Intl.NumberFormat("en-US");

/*
 * Counts from 0 to `value` the first time it scrolls into view.
 * Screen readers get the final number at once; reduced motion skips the count.
 */
export function CountUp({
  value,
  suffix = "",
  duration = 1.4,
  className,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || reduceMotion) return;

    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [inView, reduceMotion, value, duration]);

  const shown = reduceMotion ? value : display;
  const label = `${formatter.format(value)}${suffix}`;

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">
        {formatter.format(shown)}
        {suffix}
      </span>
    </span>
  );
}
