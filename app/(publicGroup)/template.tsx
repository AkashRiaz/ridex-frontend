"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/*
 * Page transition for public pages: a short fade + rise on every route change.
 * (A template remounts on navigation; a layout would not.)
 * Search-param changes, like filters on /listings, don't remount it.
 * With reduced motion the page simply appears.
 */
export default function PublicTemplate({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
