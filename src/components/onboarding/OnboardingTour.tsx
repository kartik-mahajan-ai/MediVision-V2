import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useOnboarding, onboardingSteps } from '@/hooks/useOnboarding';
import { X, ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react';

export function OnboardingTour() {
    const {
        isOnboardingActive,
        currentStep,
        currentStepData,
        totalSteps,
        nextStep,
        prevStep,
        skipOnboarding,
    } = useOnboarding();

    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    // Find and highlight target element
    useEffect(() => {
        if (!isOnboardingActive || !currentStepData?.target) {
            setTargetRect(null);
            return;
        }

        const findTarget = () => {
            const target = document.querySelector(currentStepData.target!);
            if (target) {
                setTargetRect(target.getBoundingClientRect());
                // Scroll into view if needed
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                setTargetRect(null);
            }
        };

        findTarget();

        // Re-find on resize
        window.addEventListener('resize', findTarget);
        return () => window.removeEventListener('resize', findTarget);
    }, [isOnboardingActive, currentStepData]);

    if (!isOnboardingActive || !currentStepData) return null;

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    return (
        <AnimatePresence>
            {isOnboardingActive && (
                <>
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                        onClick={skipOnboarding}
                    />

                    {/* Spotlight Cutout (if target exists) */}
                    {targetRect && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed z-[101] pointer-events-none"
                            style={{
                                top: targetRect.top - 8,
                                left: targetRect.left - 8,
                                width: targetRect.width + 16,
                                height: targetRect.height + 16,
                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                                borderRadius: '12px',
                            }}
                        >
                            {/* Spotlight glow effect */}
                            <div
                                className="absolute inset-0 rounded-xl animate-pulse"
                                style={{
                                    boxShadow: '0 0 20px hsl(221 83% 53% / 0.5), 0 0 40px hsl(221 83% 53% / 0.3)',
                                }}
                            />
                        </motion.div>
                    )}

                    {/* Tour Dialog */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed z-[102] bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md mx-4"
                    >
                        <div className="glass-card p-6 mx-4">
                            {/* Close Button */}
                            <button
                                onClick={skipOnboarding}
                                className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted transition-colors"
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                    <span>Step {currentStep + 1} of {totalSteps}</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-primary rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1">
                                            {currentStepData.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {currentStepData.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                                <div className="flex items-center gap-2">
                                    {!isFirstStep && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={prevStep}
                                            className="h-9"
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Back
                                        </Button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {!isLastStep && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={skipOnboarding}
                                            className="h-9 text-muted-foreground"
                                        >
                                            Skip Tour
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        onClick={nextStep}
                                        className="h-9"
                                    >
                                        {isLastStep ? (
                                            <>
                                                <Check className="h-4 w-4 mr-1" />
                                                Get Started
                                            </>
                                        ) : (
                                            <>
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Step Indicators */}
                            <div className="flex items-center justify-center gap-1.5 mt-4">
                                {onboardingSteps.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-1.5 rounded-full transition-all ${index === currentStep
                                                ? 'w-4 bg-primary'
                                                : index < currentStep
                                                    ? 'w-1.5 bg-primary/50'
                                                    : 'w-1.5 bg-muted'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
