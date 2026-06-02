import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MedicalDisclaimerProps {
  variant?: 'default' | 'compact' | 'banner';
}

export const MedicalDisclaimer = ({ variant = 'default' }: MedicalDisclaimerProps) => {
  if (variant === 'compact') {
    return (
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <AlertTriangle className="h-3 w-3 text-warning" />
        For educational purposes only. Consult a healthcare professional for medical advice.
      </p>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-warning/10 border-b border-warning/20 px-4 py-2">
        <p className="text-xs text-center text-warning font-medium flex items-center justify-center gap-2">
          <AlertTriangle className="h-3 w-3" />
          This AI tool is for educational purposes only and does not replace professional medical consultation.
        </p>
      </div>
    );
  }

  return (
    <Alert className="border-warning/30 bg-warning/5">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertTitle className="text-warning">Medical Disclaimer</AlertTitle>
      <AlertDescription className="text-muted-foreground">
        MediVision Buddy is an AI-powered educational tool designed to assist healthcare professionals and students. 
        It does not provide medical diagnoses and should not be used as a substitute for professional medical advice, 
        diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions.
      </AlertDescription>
    </Alert>
  );
};
