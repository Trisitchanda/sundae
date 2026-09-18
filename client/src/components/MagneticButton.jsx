import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function MagneticButton({
  children,
  className,
  onClick,
  type = 'button',
  disabled = false,
  isCta = false
}) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    // Magnetic pull limits (max 7px for subtle movement)
    const factor = isCta ? 0.15 : 0.1;
    setPosition({ 
      x: Math.max(-7, Math.min(7, middleX * factor)), 
      y: Math.max(-7, Math.min(7, middleY * factor)) 
    });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  
  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 350, damping: 15, mass: 0.5 }}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={twMerge(
        clsx(
          "relative flex justify-center items-center rounded-sm transition-colors overflow-hidden",
          isCta ? "cta-interactive" : "",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )
      )}
    >
      <span className="relative z-10 flex items-center justify-center pointer-events-none">
        {children}
      </span>
    </motion.button>
  );
}
