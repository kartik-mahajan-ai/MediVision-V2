import { motion } from 'framer-motion';
import { Activity, Heart, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthPulseProps {
  status: 'normal' | 'warning' | 'critical' | 'idle';
  lastCheck?: string;
}

export function HealthPulse({ status, lastCheck }: HealthPulseProps) {
  const config = {
    normal: {
      color: 'bg-emerald-500',
      glow: 'shadow-emerald-500/40',
      icon: ShieldCheck,
      text: 'Vitals Clear',
      pulseSpeed: 3
    },
    warning: {
      color: 'bg-amber-500',
      glow: 'shadow-amber-500/40',
      icon: Activity,
      text: 'Action Needed',
      pulseSpeed: 1.5
    },
    critical: {
      color: 'bg-rose-500',
      glow: 'shadow-rose-500/40',
      icon: Activity,
      text: 'Clinical Risk',
      pulseSpeed: 0.8
    },
    idle: {
      color: 'bg-muted',
      glow: 'shadow-transparent',
      icon: Heart,
      text: 'Ready for Analysis',
      pulseSpeed: 5
    }
  };

  const current = config[status];
  const Icon = current.icon;

  return (
    <div className="relative group">
      {/* Background Pulse Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={cn("absolute rounded-full border border-current opacity-20", current.color.replace('bg-', 'text-'))}
            initial={{ width: 40, height: 40, opacity: 0.5 }}
            animate={{ 
              width: [40, 100], 
              height: [40, 100], 
              opacity: [0.5, 0] 
            }}
            transition={{
              duration: current.pulseSpeed,
              repeat: Infinity,
              delay: i * (current.pulseSpeed / 3),
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Main Pulse Container */}
      <div className="relative z-10 liquid-glass-card !w-[280px] !h-[180px] !p-6 flex flex-row items-center gap-5 overflow-visible">
        <div className="relative">
          <motion.div 
            className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl", current.color, current.glow)}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: current.pulseSpeed, repeat: Infinity }}
          >
            <Icon className="h-8 w-8 text-white" />
          </motion.div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-current p-0.5" style={{ color: current.color.split('-')[1] === 'emerald' ? '#10b981' : current.color.split('-')[1] === 'amber' ? '#f59e0b' : '#f43f5e' }}>
            <div className={cn("w-full h-full rounded-full animate-pulse", current.color)} />
          </div>
        </div>

        <div className="text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Health Pulse</p>
          <h3 className="text-xl font-bold tracking-tight mb-1">{current.text}</h3>
          {lastCheck && (
            <p className="text-xs text-muted-foreground">
              Last check: <span className="text-foreground/80">{lastCheck}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
