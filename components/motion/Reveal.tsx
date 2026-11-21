"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";

/*
 * Scroll-triggered entrance animations for the public pages.
 * With prefers-reduced-motion everything renders in place, with no movement.
 */

const EASE = [0.22, 1, 0.36, 1] as const; // --ease-smooth

const VIEWPORT = { once: true, margin: "0px 0px -80px 0px" } as const;

type TRevealTag = "div" | "section" | "li" | "ul" | "header";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  // distance in px the content rises while fading in
  y?: number;
  as?: TRevealTag;
};

export function Reveal({ children, className, delay = 0, y = 24, as = "div" }: RevealProps) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  if (reduceMotion) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </Component>
  );
}

const staggerParent = (stagger: number): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

type StaggerProps = {
  children: ReactNode;
  className?: string;
  // seconds between children
  stagger?: number;
  as?: "div" | "ul" | "ol";
};

/*
 * Wrap a list in <Stagger> and each item in <StaggerItem>: items fade up one by one.
 */
export function Stagger({ children, className, stagger = 0.06, as = "div" }: StaggerProps) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  if (reduceMotion) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={staggerParent(stagger)}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  if (reduceMotion) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Component className={className} variants={staggerChild}>
      {children}
    </Component>
  );
}
