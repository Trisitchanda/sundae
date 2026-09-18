import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, Target, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AiAnalyst({ insight, loading, error, generatedAt }) {
  if (!insight && !loading && !error) return null;

  return (
    <section className="border border-cream-secondary p-8 md:p-12 bg-cream-secondary/10 relative overflow-hidden group rounded-sm shadow-sm">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-1000">
        <Sparkles className="w-64 h-64 text-ink" />
      </div>

      <div className="relative z-10 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-yellow" />
            <h2 className="text-xs font-medium tracking-widest uppercase text-olive">Sundae AI Analyst</h2>
          </div>
          
          {loading ? (
             <div className="text-[10px] uppercase tracking-widest text-olive animate-pulse">
               Insights updating...
             </div>
          ) : generatedAt ? (
             <div className="text-[10px] uppercase tracking-widest text-olive">
               Updated {formatDistanceToNow(new Date(generatedAt), { addSuffix: true })}
             </div>
          ) : null}
        </div>

        {error && (
          <div className="space-y-4 mb-8">
            <p className="text-coral font-medium flex items-center"><AlertCircle className="w-4 h-4 mr-2"/> {error}</p>
          </div>
        )}

        {loading && !insight && (
          <div className="space-y-6">
            <div className="h-12 w-3/4 bg-cream-secondary/40 animate-pulse rounded-sm"></div>
            <div className="h-4 w-1/2 bg-cream-secondary/40 animate-pulse rounded-sm"></div>
            <div className="h-4 w-2/3 bg-cream-secondary/40 animate-pulse rounded-sm"></div>
          </div>
        )}

        {insight && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`space-y-12 ${loading ? 'opacity-50 grayscale' : ''}`}>
            
            {/* Summary */}
            <div className="space-y-6">
              <h3 className="font-serif text-3xl md:text-4xl text-ink tracking-tight leading-snug">
                "{insight.summary}"
              </h3>
            </div>

          </motion.div>
        )}
      </div>
    </section>
  );
}
