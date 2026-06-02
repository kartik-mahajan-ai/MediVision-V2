import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

const ONBOARDING_KEY = 'medivision_onboarding_completed';

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    target?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const onboardingSteps: OnboardingStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to MediVision AI 🩺',
        description: "Your intelligent partner for advanced medical diagnostics. Let's explore how our AI empowers your clinical decision-making.",
    },
    {
        id: 'xray-upload',
        title: 'AI-Powered Radiology',
        description: 'Upload chest X-rays to generate instant, heatmap-enhanced analysis. Our computer vision models detect conditions like Pneumonia and COVID-19 with high precision.',
        target: '[data-tour="xray-action"]',
        position: 'bottom',
    },
    {
        id: 'symptom-checker',
        title: 'Intelligent Symptom Assessment',
        description: 'Analyze clinical symptoms using our advanced rule-based engine. Get fast, reliable risk assessments and triage recommendations.',
        target: '[data-tour="symptom-action"]',
        position: 'bottom',
    },
    {
        id: 'chat-assistant',
        title: 'Clinical AI Assistant',
        description: 'Your 24/7 medical research companion. Ask complex clinical questions, research rare conditions, and get evidence-based insights instantly.',
        target: '[data-tour="chat-action"]',
        position: 'bottom',
    },
    {
        id: 'dashboard-stats',
        title: 'Insight Analytics Dashboard',
        description: 'Monitor your diagnostic accuracy and track patient analysis history. Visualized metrics help you stay on top of your clinical workflow.',
        target: '[data-tour="stats"]',
        position: 'bottom',
    },
    {
        id: 'disclaimer',
        title: 'Research & Educational Use ⚠️',
        description: 'MediVision uses advanced AI for support only. It does not replace professional medical diagnosis. Always check with a qualified doctor.',
    },
];

interface OnboardingContextType {
    isOnboardingActive: boolean;
    currentStep: number;
    currentStepData: OnboardingStep | null;
    totalSteps: number;
    startOnboarding: () => void;
    endOnboarding: () => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    skipOnboarding: () => void;
    resetOnboarding: () => void;
    hasCompletedOnboarding: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [isOnboardingActive, setIsOnboardingActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);

    useEffect(() => {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        setHasCompletedOnboarding(completed === 'true');
    }, []);

    // Auto-start logic removed from here to prevent landing page freezes.
    // It should be handled by the Dashboard component.

    const startOnboarding = useCallback(() => {
        setCurrentStep(0);
        setIsOnboardingActive(true);
    }, []);

    const endOnboarding = useCallback(() => {
        setIsOnboardingActive(false);
        setHasCompletedOnboarding(true);
        localStorage.setItem(ONBOARDING_KEY, 'true');
    }, []);

    const nextStep = useCallback(() => {
        if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            endOnboarding();
        }
    }, [currentStep, endOnboarding]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    }, [currentStep]);

    const goToStep = useCallback((step: number) => {
        if (step >= 0 && step < onboardingSteps.length) {
            setCurrentStep(step);
        }
    }, []);

    const skipOnboarding = useCallback(() => {
        endOnboarding();
    }, [endOnboarding]);

    const resetOnboarding = useCallback(() => {
        localStorage.removeItem(ONBOARDING_KEY);
        setHasCompletedOnboarding(false);
        setCurrentStep(0);
    }, []);

    const value: OnboardingContextType = {
        isOnboardingActive,
        currentStep,
        currentStepData: isOnboardingActive ? onboardingSteps[currentStep] : null,
        totalSteps: onboardingSteps.length,
        startOnboarding,
        endOnboarding,
        nextStep,
        prevStep,
        goToStep,
        skipOnboarding,
        resetOnboarding,
        hasCompletedOnboarding,
    };

    return (
        <OnboardingContext.Provider value={value}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding(): OnboardingContextType {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
}
