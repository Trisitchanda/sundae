import React from 'react';
import { formatCurrency } from '../utils/format';

export default function MoneyDisplay({ amount, size = 'md', className = '', type = 'neutral' }) {
  const isPositive = amount >= 0;
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl md:text-5xl',
    xl: 'text-6xl md:text-8xl',
  };

  const typeClasses = {
    neutral: 'text-ink',
    expense: 'text-coral',
    income: 'text-olive',
  };

  return (
    <div className={`num-tabular font-serif tracking-tight font-medium ${sizeClasses[size]} ${typeClasses[type]} ${className}`}>
      {formatCurrency(Math.abs(amount || 0))}
    </div>
  );
}
