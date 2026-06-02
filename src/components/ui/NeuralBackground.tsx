import React from 'react';
import { motion } from 'framer-motion';

export const NeuralBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Soft Aurora Layers — works in both light and dark */}
      <div className="absolute inset-0 opacity-20 dark:opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Synapse Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06] dark:opacity-10 text-foreground" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="synapse-grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="0" cy="0" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#synapse-grid)" />
      </svg>

      {/* Floating Macro Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-accent rounded-full opacity-20"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            scale: Math.random() * 2 
          }}
          animate={{ 
            y: [null, "-20px", "20px", null],
            opacity: [0.1, 0.4, 0.1]
          }}
          transition={{ 
            duration: 5 + Math.random() * 5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5
          }}
        />
      ))}

      {/* Grainy Texture for Organic Feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};
