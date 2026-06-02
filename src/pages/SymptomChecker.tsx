import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { symptomsAPI } from '@/lib/api';
import {
  Stethoscope,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Search,
  Shield,
  Brain,
  Activity,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const symptomCategories = [
  {
    category: 'Respiratory',
    icon: '🫁',
    symptoms: [
      { id: 'cough', label: 'Cough (dry or productive)' },
      { id: 'shortness_of_breath', label: 'Shortness of breath' },
      { id: 'chest_pain', label: 'Chest pain or tightness' },
      { id: 'wheezing', label: 'Wheezing' },
      { id: 'rapid_breathing', label: 'Rapid breathing' },
    ],
  },
  {
    category: 'Systemic / General',
    icon: '🌡️',
    symptoms: [
      { id: 'fever', label: 'Fever (>38°C / 100.4°F)' },
      { id: 'chills', label: 'Chills or rigors' },
      { id: 'fatigue', label: 'Fatigue or weakness' },
      { id: 'body_aches', label: 'Body aches or muscle pain' },
      { id: 'night_sweats', label: 'Night sweats' },
    ],
  },
  {
    category: 'Head & Throat',
    icon: '🗣️',
    symptoms: [
      { id: 'headache', label: 'Headache' },
      { id: 'sore_throat', label: 'Sore throat' },
      { id: 'loss_of_taste_smell', label: 'Loss of taste or smell' },
    ],
  },
  {
    category: 'Gastrointestinal',
    icon: '🩺',
    symptoms: [
      { id: 'nausea', label: 'Nausea or vomiting' },
      { id: 'diarrhea', label: 'Diarrhea' },
    ],
  },
];

interface AnalysisResult {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  possibleConditions: string[];
  recommendations: string[];
  urgency: string;
  featureImportance?: Array<{ name: string; impact: number }>;
}

const riskInfo: Record<string, { label: string; color: string; bgColor: string; icon: typeof CheckCircle2; borderColor: string }> = {
  low: {
    label: 'Low Risk',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
    icon: CheckCircle2,
  },
  moderate: {
    label: 'Moderate Risk',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    icon: AlertTriangle,
  },
  high: {
    label: 'High Risk',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30',
    icon: AlertCircle,
  },
  critical: {
    label: 'Critical - Seek Emergency Care',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/50',
    icon: XCircle,
  },
};

export default function SymptomChecker() {
  const { user } = useAuth();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Respiratory', 'Systemic / General']);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((s) => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  // Filter symptoms based on search
  const filteredCategories = symptomCategories.map(category => ({
    ...category,
    symptoms: category.symptoms.filter(symptom =>
      symptom.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.symptoms.length > 0);

  const [analysisStatus, setAnalysisStatus] = useState('');

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }

    if (!user) return;

    setAnalyzing(true);
    setAnalysisStatus('Initializing AI Engine...');

    try {
      await new Promise(r => setTimeout(r, 800));
      setAnalysisStatus('Normalizing Symptom Features...');
      
      await new Promise(r => setTimeout(r, 600));
      setAnalysisStatus('Running Random Forest Inference...');

      // Direct API call to the backend which now uses the Python AI
      const response = await symptomsAPI.create({
        symptoms: selectedSymptoms,
        additional_info: additionalInfo,
      });

      await new Promise(r => setTimeout(r, 600));
      setAnalysisStatus('Calculating Feature Impact...');

      // Map backend response to frontend format
      const analysisResult: AnalysisResult = {
        riskLevel: response.analysis_result.riskLevel,
        possibleConditions: response.analysis_result.possibleConditions,
        recommendations: response.analysis_result.recommendations,
        urgency: response.analysis_result.urgency,
        featureImportance: response.analysis_result.featureImportance,
      };

      await new Promise(r => setTimeout(r, 400));
      setResult(analysisResult);
      toast.success('AI Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze symptoms. Please try again.');
    } finally {
      setAnalyzing(false);
      setAnalysisStatus('');
    }
  };

  const resetAnalysis = () => {
    setSelectedSymptoms([]);
    setAdditionalInfo('');
    setResult(null);
  };

  const risk = result ? riskInfo[result.riskLevel] : null;
  const RiskIcon = risk?.icon || AlertCircle;

  return (
    <DashboardLayout title="Symptom Checker">
      <div className="relative">
        <AnimatePresence>
          {analyzing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-overlay"
            >
              <motion.div 
                initial={{ scale: 0.8, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="liquid-glass-card"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                  <div className="relative bg-primary/10 p-4 rounded-2xl border border-primary/20">
                    <Brain className="h-10 w-10 text-primary animate-pulse" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  AI Vision Processing
                </h3>
                
                <p className="text-sm text-muted-foreground font-medium h-6 flex items-center justify-center">
                  {analysisStatus}
                </p>

                <div className="mt-8 w-48 space-y-1">
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      animate={{ 
                        width: ["0%", "30%", "60%", "90%", "100%"] 
                      }}
                      transition={{ 
                        duration: 3,
                        times: [0, 0.2, 0.5, 0.8, 1],
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                  <div className="flex justify-between px-1">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Neural Engine</span>
                    <span className="text-[10px] text-primary font-bold">ACTIVE</span>
                  </div>
                </div>

                {/* Liquid ambient dots */}
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-accent/10 rounded-full blur-3xl" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-5xl mx-auto space-y-6">
          {/* Compact Disclaimer */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20">
            <Shield className="h-4 w-4 text-warning flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Educational Tool:</strong> This assessment is for informational purposes only and does not constitute medical advice.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Symptom Selection */}
            <Card className="card-simple">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Select Your Symptoms
                </CardTitle>
                <CardDescription>
                  Check all symptoms you are currently experiencing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search symptoms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Collapsible Categories */}
                <div className="space-y-3">
                  {(searchQuery ? filteredCategories : symptomCategories).map((category) => (
                    <div key={category.category} className="border border-border rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                        onClick={() => toggleCategory(category.category)}
                      >
                        <span className="flex items-center gap-2 font-medium text-sm">
                          <span>{category.icon}</span>
                          {category.category}
                        </span>
                        {expandedCategories.includes(category.category) ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      {(expandedCategories.includes(category.category) || searchQuery) && (
                        <div className="p-3 space-y-2">
                          {category.symptoms.map((symptom) => (
                            <div
                              key={symptom.id}
                              className={cn(
                                'flex items-center space-x-3 p-2.5 rounded-lg border transition-colors cursor-pointer',
                                selectedSymptoms.includes(symptom.id)
                                  ? 'border-primary bg-primary/5'
                                  : 'border-transparent hover:bg-muted/50'
                              )}
                              onClick={() => toggleSymptom(symptom.id)}
                            >
                              <Checkbox
                                id={symptom.id}
                                checked={selectedSymptoms.includes(symptom.id)}
                                onCheckedChange={() => toggleSymptom(symptom.id)}
                              />
                              <Label
                                htmlFor={symptom.id}
                                className="flex-1 cursor-pointer text-sm"
                              >
                                {symptom.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Additional Information (Optional)</Label>
                  <Textarea
                    placeholder="Any other symptoms, relevant medical history, or context..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={analyzeSymptoms}
                    disabled={selectedSymptoms.length === 0 || analyzing}
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {analysisStatus || 'Analyzing...'}
                      </>
                    ) : (
                      <>
                        Analyze Symptoms
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                  {selectedSymptoms.length > 0 && (
                    <Button variant="outline" size="lg" onClick={resetAnalysis}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {selectedSymptoms.length > 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="card-simple">
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  AI-generated assessment based on your symptoms
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!result ? (
                  <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                      <div className="relative w-20 h-20 rounded-2xl bg-muted border border-border/50 flex items-center justify-center">
                        <Stethoscope className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Ready for Analysis</h3>
                    <p className="max-w-[280px] mx-auto text-sm text-muted-foreground leading-relaxed">
                      Select your symptoms from the list to see a neural risk assessment and clinical recommendations.
                    </p>
                    <div className="mt-8 grid grid-cols-2 gap-3 max-w-[320px] mx-auto">
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/20">
                        <Activity className="h-4 w-4 text-primary/60 mx-auto mb-2" />
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Risk Level</p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/20">
                        <Sparkles className="h-4 w-4 text-accent/60 mx-auto mb-2" />
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">AI Insights</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Risk Level */}
                    <div className={cn('p-6 rounded-xl text-center border', risk?.bgColor, risk?.borderColor)}>
                      <RiskIcon className={cn('h-12 w-12 mx-auto mb-3', risk?.color)} />
                      <h3 className={cn('text-xl font-semibold mb-2', risk?.color)}>
                        {risk?.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">{result.urgency}</p>
                    </div>

                    {/* Critical Warning */}
                    {result.riskLevel === 'critical' && (
                      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                        <p className="text-sm font-medium text-destructive flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          This assessment suggests a potentially serious condition. Please seek immediate medical attention.
                        </p>
                      </div>
                    )}

                    {/* Possible Conditions */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-3">
                        Possible Conditions (Educational)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.possibleConditions.map((condition, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 rounded-full bg-muted text-sm font-medium"
                          >
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-3">
                        Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* AI Reasoning Visualization */}
                    {result.featureImportance && result.featureImportance.length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            AI Reasoning (Feature Impact)
                          </h4>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            Internal Model Logic
                          </span>
                        </div>
                        <div className="space-y-3">
                          {result.featureImportance.map((feature, index) => {
                            let label = "Supporting Factor";
                            let barColor = "bg-primary/60";
                            
                            if (index === 0 && feature.impact > 40) {
                              label = "Primary Driver";
                              barColor = "bg-primary";
                            } else if (feature.impact > 25) {
                              label = "Significant Factor";
                              barColor = "bg-primary/80";
                            }

                            return (
                              <div key={index} className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                  <span className="font-medium flex items-center gap-1.5">
                                    {feature.name}
                                    <span className={cn(
                                      "px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase",
                                      label === "Primary Driver" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    )}>
                                      {label}
                                    </span>
                                  </span>
                                  <span className="text-muted-foreground font-mono">{feature.impact}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={cn("h-full transition-all duration-1000 ease-out", barColor)}
                                    style={{ width: `${feature.impact}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">
                          *This visualization shows which of your reported symptoms most influenced the AI's classification.
                        </p>
                      </div>
                    )}

                    {/* Disclaimer */}
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Note:</strong> This assessment is for educational purposes only.
                        It is not a diagnosis. Always consult a healthcare professional for medical advice.
                      </p>
                    </div>

                    <Button variant="outline" className="w-full" onClick={resetAnalysis}>
                      Start New Assessment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
