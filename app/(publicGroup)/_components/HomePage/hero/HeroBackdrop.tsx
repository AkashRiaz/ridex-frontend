"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { siteConfig } from "@/lib/siteConfig";

/*
 * Hero background + parallax.
 * - background layers move slower than the page; the content drifts up and fades
 * - optional ride video (NEXT_PUBLIC_HERO_VIDEO_URL), only on wide screens without
 *   reduced motion, so phones never download it
 */
export function HeroBackdrop({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [showVideo, setShowVideo] = useState(false);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    if (!siteConfig.heroVideoUrl || reduceMotion) return;

    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setShowVideo(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [reduceMotion]);

  const still = Boolean(reduceMotion);

  return (
    <div ref={ref} className="relative isolate overflow-hidden">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={still ? undefined : { y: backgroundY }}
      >
        {/* warm + cool glows */}
        <motion.div
          className="absolute -left-40 -top-40 size-[38rem] rounded-full bg-hero-glow-1 blur-3xl"
          style={still ? undefined : { scale: glowScale }}
        />
        <div className="absolute -right-32 top-24 size-[30rem] rounded-full bg-hero-glow-2 blur-3xl" />

        {/* road grid that fades out at the edges */}
        <div
          className="absolute inset-0 opacity-[0.07] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* speed lines */}
        <div className="absolute inset-x-0 top-1/2 h-48 -translate-y-1/2 overflow-hidden motion-reduce:hidden">
          {[18, 42, 66, 84].map((top, index) => (
            <span
              key={top}
              className="absolute left-0 h-px w-1/3 animate-speed-line bg-gradient-to-r from-transparent via-primary/60 to-transparent"
              style={{ top: `${top}%`, animationDelay: `${index * 0.8}s` }}
            />
          ))}
        </div>

        {showVideo && (
          <video
            className="absolute inset-0 size-full object-cover opacity-30 dark:opacity-25"
            src={siteConfig.heroVideoUrl}
            poster={siteConfig.heroPosterUrl || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}

        {/* blend into the page below */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </motion.div>

      <motion.div style={still ? undefined : { y: contentY, opacity: contentOpacity }}>{children}</motion.div>
    </div>
  );
}
