import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isCtaHovering, setIsCtaHovering] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia("(hover: none)").matches) return;
    // Disable on prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('interactive')
      ) {
        if (target.classList.contains('cta-interactive') || target.closest('.cta-interactive')) {
          setIsCtaHovering(true);
          setIsHovering(false);
        } else {
          setIsHovering(true);
          setIsCtaHovering(false);
        }
      } else {
        setIsHovering(false);
        setIsCtaHovering(false);
      }
    };

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  const variants = {
    default: {
      x: mousePosition.x - 6,
      y: mousePosition.y - 6,
      scale: 1,
      backgroundColor: "var(--sundae-ink)",
    },
    hover: {
      x: mousePosition.x - 12,
      y: mousePosition.y - 12,
      scale: 2,
      backgroundColor: "transparent",
      border: "1px solid var(--sundae-ink)",
    },
    cta: {
      x: mousePosition.x - 24,
      y: mousePosition.y - 24,
      scale: 4,
      backgroundColor: "var(--sundae-yellow)",
      mixBlendMode: "difference"
    }
  };

  if (window.matchMedia("(hover: none)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-50 mix-blend-difference"
      variants={variants}
      animate={isCtaHovering ? "cta" : isHovering ? "hover" : "default"}
      transition={{
        type: "spring",
        stiffness: 700,
        damping: 40,
        mass: 0.5
      }}
    />
  );
}
