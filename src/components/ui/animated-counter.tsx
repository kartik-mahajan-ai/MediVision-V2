import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    formatFn?: (value: number) => string;
    className?: string;
}

export function AnimatedCounter({
    value,
    duration = 2000,
    formatFn = (v) => v.toString(),
    className = '',
}: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    animateValue(0, value, duration);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [value, duration, hasAnimated]);

    // Update if value changes after initial animation
    useEffect(() => {
        if (hasAnimated) {
            setDisplayValue(value);
        }
    }, [value, hasAnimated]);

    const animateValue = (start: number, end: number, animDuration: number) => {
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / animDuration, 1);

            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (end - start) * easeOut);

            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    };

    return (
        <span ref={ref} className={className}>
            {formatFn(displayValue)}
        </span>
    );
}
