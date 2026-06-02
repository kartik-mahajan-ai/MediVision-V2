import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, X, FileImage, Stethoscope, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { chatAPI } from '@/lib/api';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function ClinicalPulseFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [latestData, setLatestData] = useState<{ xray: any, symptom: any } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const context = await chatAPI.getContext();
        setLatestData({
          xray: context.xrays?.[0],
          symptom: context.symptoms?.[0]
        });
      } catch (err) {
        console.error("FAB Error:", err);
      }
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] sm:hidden">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-16 right-0 w-[calc(100vw-3rem)] max-w-sm liquid-glass-card !h-auto !p-6 shadow-2xl border-primary/20"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-bold">Clinical Pulse</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded-full">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                {latestData?.xray ? (
                  <Link to="/xray-analysis" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <FileImage className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Latest X-Ray</p>
                      <p className="text-sm font-medium truncate">{latestData.xray.prediction.replace('_', ' ')} • {latestData.xray.confidence}%</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : null}

                {latestData?.symptom ? (
                  <Link to="/symptom-checker" onClick={() => setIsOpen(false)} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Symptom Assessment</p>
                      <p className="text-sm font-medium truncate">{latestData.symptom.risk_level} Risk • {format(new Date(latestData.symptom.created_at), 'MMM d')}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : null}
              </div>

              {!latestData?.xray && !latestData?.symptom && (
                <div className="text-center py-6 text-muted-foreground italic text-sm">
                  No recent health data found.
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500",
          isOpen ? "bg-muted text-foreground rotate-90" : "bg-primary text-white shadow-primary/30"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
