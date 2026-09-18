import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function AnimatedNumber({ value, prefix = '', suffix = '', className = '' }) {
  const [internalValue, setInternalValue] = useState(value);
  const springValue = useSpring(value, {
    stiffness: 100,
    damping: 30,
    mass: 1
  });

  const displayValue = useTransform(springValue, (current) => {
    const isNegative = current < 0;
    const absValue = Math.abs(Math.round(current));
    return `${isNegative ? '-' : ''}${prefix}${absValue.toLocaleString('en-IN')}${suffix}`;
  });

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  // If user prefers reduced motion, just show the hard value
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <motion.span className={`num-tabular ${className}`}>
      {prefersReducedMotion ? (
        `${value < 0 ? '-' : ''}${prefix}${Math.abs(Math.round(value)).toLocaleString('en-IN')}${suffix}`
      ) : displayValue}
    </motion.span>
  );
}
