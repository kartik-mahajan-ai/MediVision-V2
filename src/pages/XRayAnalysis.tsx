import { useState, useCallback, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { xrayAPI } from '@/lib/api';
import {
  Upload,
  FileImage,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Check,
  Brain,
  Activity,
  Files,
  Zap,
  MessageSquare,
  CircleDot,
  Circle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
//  Types
// ============================================================
interface PredictionResult {
  prediction: 'covid19' | 'non_covid' | 'normal' | 'inconclusive';
  confidence: number;
  allPredictions: {
    covid19: number;
    non_covid: number;
    normal: number;
  };
  heatmapImage?: string;
  heatmaps?: Record<string, string>;
  claheImage?: string;
  predictedMask?: string;
  aiOverride?: boolean;
  overrideReason?: string;
  agentData?: any;
}

interface RejectionResult {
  rejected: true;
  reason: string;
}

interface PipelineStep {
  id: number;
  label: string;
  detail?: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  duration?: number;
}

// ============================================================
//  Constants
// ============================================================
const INITIAL_STEPS: PipelineStep[] = [
  { id: 1, label: 'Image Decoding', status: 'pending' },
  { id: 2, label: 'Input Validation', status: 'pending' },
  { id: 3, label: 'CLAHE Preprocessing', status: 'pending' },
  { id: 4, label: 'DenseNet201 Inference', status: 'pending' },
  { id: 5, label: 'Grad-CAM Visualization', status: 'pending' },
  { id: 6, label: 'Diagnostic Cross-Validation', status: 'pending' },
  { id: 7, label: 'Confidence Calibration', status: 'pending' },
  { id: 8, label: 'Final Clinical Synthesis', status: 'pending' },
];

const predictionInfo: Record<string, { label: string; color: string; bgColor: string; icon: typeof CheckCircle; description: string }> = {
  normal: {
    label: 'Normal',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: CheckCircle,
    description: 'No significant abnormalities detected.',
  },
  covid19: {
    label: 'COVID-19',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    icon: XCircle,
    description: 'Pattern consistent with COVID-19 pneumonia.',
  },
  non_covid: {
    label: 'Non-COVID',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    icon: AlertTriangle,
    description: 'Signs of non-COVID infection (e.g., bacterial or viral pneumonia).',
  },
  inconclusive: {
    label: 'Inconclusive / Review Required',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    icon: ShieldAlert,
    description: 'Automated secondary validation suggests high probability of diagnostic ambiguity. Findings require specialist correlation.',
  },
};

// ============================================================
//  Analysis Pipeline Component (Vertical Timeline)
// ============================================================
function AnalysisPipeline({ steps }: { steps: PipelineStep[] }) {
  const completedCount = steps.filter(s => s.status === 'complete').length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold tracking-tight">DenseNet201 Analysis Pipeline</h3>
          <p className="text-xs text-muted-foreground">Processing your chest X-ray...</p>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="relative pl-6 space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              {/* Vertical connecting line */}
              {!isLast && (
                <div
                  className={cn(
                    'absolute left-[-18px] top-[22px] w-[2px] h-[calc(100%-4px)] transition-colors duration-500',
                    step.status === 'complete' ? 'bg-emerald-400' :
                      step.status === 'running' ? 'bg-primary/40' :
                        'bg-border border-dashed'
                  )}
                  style={step.status === 'pending' ? {
                    backgroundImage: 'repeating-linear-gradient(to bottom, hsl(var(--border)) 0px, hsl(var(--border)) 4px, transparent 4px, transparent 8px)',
                    backgroundColor: 'transparent'
                  } : undefined}
                />
              )}

              {/* Step dot indicator */}
              <div className="absolute left-[-24px] top-[6px]">
                {step.status === 'complete' ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="w-[14px] h-[14px] rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/50"
                  >
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  </motion.div>
                ) : step.status === 'running' ? (
                  <div className="relative">
                    <div className="absolute inset-0 w-[14px] h-[14px] rounded-full bg-primary/30 animate-ping" />
                    <div className="relative w-[14px] h-[14px] rounded-full bg-primary border-2 border-primary shadow-sm shadow-primary/50" />
                  </div>
                ) : step.status === 'error' ? (
                  <div className="w-[14px] h-[14px] rounded-full bg-destructive flex items-center justify-center">
                    <XCircle className="h-2.5 w-2.5 text-white" />
                  </div>
                ) : (
                  <div className="w-[14px] h-[14px] rounded-full border-2 border-muted-foreground/30 bg-background" />
                )}
              </div>

              {/* Step content */}
              <div
                className={cn(
                  'py-2.5 pl-2 rounded-lg transition-all duration-300',
                  step.status === 'running' && 'bg-primary/[0.03]',
                  step.status === 'complete' && 'bg-emerald-500/[0.02]',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'text-sm font-medium transition-colors',
                    step.status === 'complete' ? 'text-emerald-600 dark:text-emerald-400' :
                      step.status === 'running' ? 'text-foreground' :
                        step.status === 'error' ? 'text-destructive' :
                          'text-muted-foreground'
                  )}>
                    {step.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {step.status === 'running' && (
                      <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                    )}
                    {step.duration !== undefined && (
                      <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                        {step.duration}s
                      </span>
                    )}
                  </div>
                </div>
                {step.detail && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={cn(
                      'text-xs mt-0.5',
                      step.status === 'running'
                        ? 'text-muted-foreground animate-pulse'
                        : 'text-muted-foreground/70'
                    )}
                  >
                    {step.detail}
                  </motion.p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5 pt-2">
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-emerald-500 relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{completedCount} of {steps.length} steps complete</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
//  Main Component
// ============================================================
export default function XRayAnalysis() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [rejection, setRejection] = useState<RejectionResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const [heatmapOpacity, setHeatmapOpacity] = useState(80);
  const [viewMode, setViewMode] = useState<'original' | 'clahe' | 'mask' | 'vision'>('vision');
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [showPipeline, setShowPipeline] = useState(false);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setRejection(null);
    setShowPipeline(false);
    setPipelineSteps([]);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFileChange(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const analyzeImage = async () => {
    if (!file || !user) return;
    setAnalyzing(true);
    setResult(null);
    setRejection(null);
    setShowPipeline(true);
    setPipelineSteps(INITIAL_STEPS.map(s => ({ ...s })));

    try {
      // Convert image to base64
      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Use streaming endpoint
      const response = await xrayAPI.uploadStream({
        image_data: imageData,
        notes: notes || undefined,
      });

      if (!response.body) {
        throw new Error('Stream body is null');
      }

      const streamReader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await streamReader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // Keep incomplete event in buffer

        for (const event of events) {
          const lines = event.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));

                if (data.type === 'progress') {
                  setPipelineSteps(prev =>
                    prev.map(step => {
                      if (step.id === data.step) {
                        return {
                          ...step,
                          status: data.status,
                          detail: data.detail || step.detail,
                          duration: data.duration !== undefined ? data.duration : step.duration,
                        };
                      }
                      // If this step just started running, mark previous ones as complete if needed
                      if (data.status === 'running' && step.id < data.step && step.status !== 'complete') {
                        return { ...step, status: 'complete' };
                      }
                      return step;
                    })
                  );
                } else if (data.type === 'result') {
                  const predData = data.data;
                  const predictionResult: PredictionResult = {
                    prediction: predData.prediction as PredictionResult['prediction'],
                    confidence: predData.confidence,
                    allPredictions: predData.all_predictions,
                    heatmapImage: predData.heatmap_image,
                    heatmaps: predData.heatmaps,
                    claheImage: predData.clahe_image,
                    predictedMask: predData.predicted_mask,
                    aiOverride: predData.ai_override,
                    overrideReason: predData.override_reason,
                    agentData: predData.agent_data,
                  };

                  // Short delay for the final step animation to complete
                  setTimeout(() => {
                    setResult(predictionResult);
                    setShowPipeline(false);
                    toast.success('Analysis complete!');
                  }, 800);
                } else if (data.type === 'rejected') {
                  // Phase 1C: Image was rejected by input validation
                  setRejection({ rejected: true, reason: data.reason });
                  toast.error('Image rejected: Not a valid X-ray');
                  setTimeout(() => {
                    setShowPipeline(false);
                  }, 1500);
                } else if (data.type === 'error') {
                  toast.error(data.message || 'Analysis failed');
                  setShowPipeline(false);
                }
              } catch (e) {
                // Not valid JSON, skip
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze. Please try again.');
      setShowPipeline(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setRejection(null);
    setNotes('');
    setViewMode('vision');
    setShowPipeline(false);
    setPipelineSteps([]);
  };

  const resultInfo = result ? predictionInfo[result.prediction as keyof typeof predictionInfo] || { label: 'Inconclusive', color: 'text-purple-500', bg: 'bg-purple-100', badge: 'bg-purple-100 text-purple-700', icon: AlertTriangle, description: 'Automated validation was inconclusive.' } : null;
  const ResultIcon = resultInfo?.icon || Info;

  const displayHeatmapUrl = result?.heatmaps?.[result.prediction] ||
    (result?.heatmaps && result?.allPredictions ? result.heatmaps[Object.keys(result.allPredictions).reduce((a, b) => result.allPredictions![a as keyof typeof result.allPredictions] > result.allPredictions![b as keyof typeof result.allPredictions] ? a : b)] : undefined) ||
    (result?.heatmaps ? Object.values(result.heatmaps)[0] : undefined) ||
    result?.heatmapImage;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">X-Ray Analysis</h1>
            <p className="text-muted-foreground">Upload chest X-rays for AI-assisted analysis</p>
          </div>
        </div>

        {/* Compact Disclaimer */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20">
          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Educational Tool:</strong> AI findings require verification by a qualified healthcare professional.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload */}
          <Card className="liquid-glass-premium border-none shadow-none">
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>Drag and drop or click to upload</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence mode="wait">
                {!preview ? (
                  <motion.div
                    key="upload-zone"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      'upload-zone-premium group cursor-pointer h-64 flex flex-col items-center justify-center p-6 text-center',
                      dragging && 'dragging ripple-effect'
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    />

                    <div className="relative mb-4">
                      <div className={cn(
                        "absolute inset-0 bg-primary/20 blur-xl rounded-full transition-all duration-500",
                        dragging ? "scale-150 opacity-100" : "scale-100 opacity-0"
                      )} />
                      <div className="relative p-4 rounded-2xl bg-muted border border-border/50 group-hover:border-primary/50 transition-colors">
                        <Upload className={cn("h-8 w-8 transition-colors", dragging ? "text-primary" : "text-muted-foreground")} />
                      </div>
                    </div>

                    <p className="font-bold text-lg mb-1 tracking-tight">
                      {dragging ? "Release to Analyze" : "Drop X-ray here"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      JPEG, PNG, DICOM (max 10MB)
                    </p>

                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      <span className="flex items-center gap-1.5 border border-border/50 px-2 py-1 rounded-md">
                        <Check className="h-3 w-3 text-emerald-500" />PA/AP
                      </span>
                      <span className="flex items-center gap-1.5 border border-border/50 px-2 py-1 rounded-md">
                        <Check className="h-3 w-3 text-emerald-500" />NO BLUR
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview-zone"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="space-y-4">
                      {(result?.heatmapImage || result?.heatmaps) ? (
                        <div className="space-y-4">
                          {/* Segmented Control & Actions */}
                          <div className="flex flex-col xl:flex-row items-center justify-between gap-3 w-full">
                            <div className="flex w-full xl:w-auto bg-muted/60 p-1 rounded-xl border border-border/50 overflow-hidden">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn("flex-1 h-8 rounded-lg transition-all duration-300", viewMode === 'original' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                                onClick={() => setViewMode('original')}
                              >
                                <FileImage className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
                                Original
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn("flex-1 h-8 rounded-lg transition-all duration-300", viewMode === 'clahe' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                                onClick={() => setViewMode('clahe')}
                              >
                                <Zap className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
                                Enhanced
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn("flex-1 h-8 rounded-lg transition-all duration-300", viewMode === 'mask' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                                onClick={() => setViewMode('mask')}
                              >
                                <Circle className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
                                AI Mask
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn("flex-1 h-8 rounded-lg transition-all duration-300", viewMode === 'vision' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-primary")}
                                onClick={() => setViewMode('vision')}
                              >
                                <Brain className="w-4 h-4 mr-1.5 hidden sm:inline-block" />
                                Grad-CAM
                              </Button>
                            </div>

                            <Button
                              size="sm"
                              className="bg-primary/10 text-primary w-full xl:w-auto hover:bg-primary hover:text-white transition-all group rounded-xl shrink-0"
                              onClick={() => window.location.href = `/chat?context=last_analysis&prediction=${result.prediction}`}
                            >
                              <MessageSquare className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                              Discuss Result
                            </Button>
                          </div>

                          {/* Main Viewport */}
                          <div className="rounded-2xl overflow-hidden bg-slate-950/5 relative aspect-square border border-border/50 shadow-inner group">
                            <div className="relative w-full h-full">
                                {viewMode === 'original' && (
                                  <motion.img 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    src={preview!} alt="Original" className="w-full h-full object-contain absolute inset-0" />
                                )}
                                {viewMode === 'clahe' && (
                                  <motion.img 
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    src={result.claheImage || preview!} alt="CLAHE Preprocessed" className="w-full h-full object-contain absolute inset-0 bg-black" />
                                )}
                                {viewMode === 'mask' && (
                                  <motion.img 
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    src={result.predictedMask || preview!} alt="AI Segmentation Mask" className="w-full h-full object-contain absolute inset-0 bg-black" />
                                )}
                                {viewMode === 'vision' && (
                                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black">
                                    <img src={result.claheImage || preview!} alt="CLAHE" className="w-full h-full object-contain absolute inset-0 opacity-50" />
                                    <img
                                      src={displayHeatmapUrl}
                                      alt="Grad-CAM Vision"
                                      className="w-full h-full object-contain absolute inset-0 mix-blend-screen transition-opacity duration-300 pointer-events-none"
                                      style={{ opacity: heatmapOpacity / 100 }}
                                    />
                                    {/* Opacity slider strictly for vision tab */}
                                    <div className="absolute bottom-4 left-4 right-4 max-w-xs mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                      <div className="bg-background/90 backdrop-blur-md rounded-xl p-2.5 border border-border/50 shadow-xl flex items-center gap-3">
                                        <Zap className="h-4 w-4 text-primary ml-1 shrink-0" />
                                        <div className="flex-1 px-1">
                                          <input
                                            type="range" min="0" max="100" value={heatmapOpacity}
                                            onChange={(e) => setHeatmapOpacity(parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                          />
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground w-8 text-right">{heatmapOpacity}%</span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                            </div>
                          </div>

                          {/* Class Activation Maps Row - Pathological Focus */}
                          {result.heatmaps && (
                            <div className="pt-3 border-t border-border">
                              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center justify-between">
                                <span className="flex items-center gap-1.5"><Brain className="h-3 w-3" /> Class Activation Maps</span>
                                <span className="font-normal normal-case text-[10px]">Per-Class Localization</span>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                {Object.entries(result.heatmaps).map(([key, src]) => {
                                  const isActive = key === result.prediction;
                                  return (
                                    <div key={key} className={cn(
                                      "space-y-2 rounded-xl border p-1.5 transition-all duration-300", 
                                      isActive ? "border-primary/40 bg-primary/[0.03] shadow-sm transform scale-[1.02]" : "border-border/60 bg-muted/20 hover:bg-muted/40"
                                    )}>
                                      <div className="rounded-lg overflow-hidden bg-black/5 aspect-square relative group">
                                        <img src={src} alt={key} className="w-full h-full object-contain absolute" />
                                        {isActive && (
                                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                                            <Check className="h-2.5 w-2.5" />
                                          </div>
                                        )}
                                      </div>
                                      <div className={cn(
                                        "text-[10px] text-center font-bold uppercase tracking-wider pb-0.5", 
                                        isActive ? "text-primary" : "text-muted-foreground"
                                      )}>
                                        {predictionInfo[key as keyof typeof predictionInfo]?.label || key}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-2xl overflow-hidden bg-muted aspect-square border border-border/50">
                          <img src={preview!} alt="X-ray preview" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm px-1">

                      <span className="text-muted-foreground flex items-center gap-2">
                        <FileImage className="h-4 w-4" />
                        {file?.name}
                      </span>
                      <Button variant="ghost" size="sm" onClick={resetAnalysis}>Remove</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-sm font-medium">Clinical Notes (Optional)</label>
                <Textarea
                  placeholder="Add relevant patient history or observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                onClick={analyzeImage}
                disabled={!file || analyzing}
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing... please wait
                  </>
                ) : (
                  <>
                    <FileImage className="h-4 w-4 mr-2" />
                    Analyze X-Ray
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results / Pipeline */}
          <Card className="card-simple">
            <CardHeader>
              <CardTitle>{showPipeline ? 'Analysis Pipeline' : 'Analysis Results'}</CardTitle>
              <CardDescription>{showPipeline ? 'Real-time model processing' : 'AI-generated findings'}</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {showPipeline ? (
                  <motion.div
                    key="pipeline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <AnalysisPipeline steps={pipelineSteps} />
                  </motion.div>
                ) : rejection ? (
                  <motion.div
                    key="rejected"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-6 rounded-xl bg-destructive/5 border border-destructive/20 text-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                        <XCircle className="h-7 w-7 text-destructive" />
                      </div>
                      <h3 className="text-lg font-bold text-destructive">Image Rejected</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">{rejection.reason}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Tip:</strong> Upload a standard PA/AP chest X-ray in grayscale. Color photographs, CT scans, and non-medical images will be rejected.
                      </p>
                    </div>
                    <Button variant="outline" className="w-full" onClick={resetAnalysis}>
                      Try Another Image
                    </Button>
                  </motion.div>
                ) : !result ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground"
                  >
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Activity className="h-8 w-8 opacity-20" />
                    </div>
                    <p>Upload and analyze an image to see medical findings</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Primary Finding Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">Primary Finding</h3>
                      <div className={cn(
                        'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                        result.prediction === 'normal' ? 'bg-emerald-500/10 text-emerald-500' :
                          result.prediction === 'non_covid' ? 'bg-amber-500/10 text-amber-600' :
                            result.prediction === 'inconclusive' ? 'bg-purple-500/10 text-purple-600' :
                              'bg-destructive/10 text-destructive'
                      )}>
                        {resultInfo?.label || result.prediction.replace('_', ' ')}
                      </div>
                    </div>

                    {/* Secondary Validation UI hidden as requested. Logic remains in background for synthesis. */}

                    {/* Description (Hide basic description if overridden) */}
                    {!result.aiOverride ? (
                      <p className="text-sm text-muted-foreground">
                        {resultInfo?.description}
                      </p>
                    ) : (
                      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 space-y-2.5">
                        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-semibold text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Clinical Review</span>
                        </div>
                        <p className="text-sm text-purple-900 dark:text-purple-200 leading-relaxed">
                          {result.overrideReason || "The statistical confidence limits did not reach the required threshold for a definitive clinical diagnosis. Manual oversight is required."}
                        </p>
                      </div>
                    )}

                    {/* Confidence Gauge */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-tighter text-[10px]">Primary Feature Match Probability</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{result.confidence}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          className={cn(
                            "h-full transition-all",
                            result.aiOverride ? "bg-purple-500" :
                              result.confidence > 80 ? "bg-emerald-500" : result.confidence > 50 ? "bg-amber-500" : "bg-destructive"
                          )}
                        />
                      </div>
                    </div>

                    {/* Grad-CAM explanation */}
                    {(result.heatmapImage || result.heatmaps) && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-2.5">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-semibold text-sm">
                          <Zap className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                          <span>Visual Diagnostic Insights</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          The <span className="text-slate-900 dark:text-slate-200 font-medium font-mono text-[10px] uppercase tracking-wider bg-slate-200/50 dark:bg-slate-800 px-1 rounded">Luminosity Heatmap</span> highlights the biological patterns and anomalous features identified during the architectural feature extraction phase.
                        </p>
                      </div>
                    )}

                    {/* All Predictions */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Statistical Distribution</h4>
                      {Object.entries(result.allPredictions)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([key, value]) => {
                          const info = predictionInfo[key as keyof typeof predictionInfo];
                          if (!info) return null;
                          return (
                            <div key={key} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{info.label}</span>
                                <span className="text-muted-foreground">{value as number}%</span>
                              </div>
                              <div className="confidence-bar">
                                <div
                                  className={cn('confidence-fill', {
                                    'bg-green-500': key === 'normal',
                                    'bg-red-500': key === 'covid19',
                                    'bg-amber-500': key === 'non_covid',
                                  })}
                                  style={{ width: `${value}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Educational Note */}
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Note:</strong> These results are for educational purposes.
                        Clinical correlation and professional interpretation are essential.
                      </p>
                    </div>

                    <Button variant="outline" className="w-full" onClick={resetAnalysis}>
                      Analyze Another Image
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
