import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import {
    Upload,
    MessageSquare,
    BarChart2,
    CheckCircle,
    ArrowRight,
    Stethoscope,
    Brain,
    Zap,
    Shield
} from 'lucide-react';

export default function Features() {
    const features = [
        {
            icon: Upload,
            title: 'AI X-Ray Analysis',
            description: 'Upload chest X-rays and receive instant AI-powered diagnostic insights with detailed confidence scores for each condition.',
            image: '/images/feature_xray_scan_1769245475435.png',
            benefits: [
                'Detects COVID-19, Pneumonia, Lung Opacity',
                'Results in under 3 seconds',
                'AI-powered analysis',
                'Confidence scores for transparency'
            ],
            link: '/xray-analysis',
            color: 'bg-blue-500'
        },
        {
            icon: MessageSquare,
            title: 'Medical AI Assistant',
            description: 'Get instant answers to medical questions from our intelligent AI chatbot trained on extensive medical literature.',
            image: '/images/feature_chatbot_1769245495974.png',
            benefits: [
                '24/7 availability',
                'Evidence-based responses',
                'Explains X-ray results',
                'Symptom guidance'
            ],
            link: '/chat',
            color: 'bg-green-500'
        },
        {
            icon: BarChart2,
            title: 'Analytics Dashboard',
            description: 'Track your diagnostic history with comprehensive analytics. Visualize patterns and monitor trends over time.',
            image: '/images/feature_analytics_1769245511189.png',
            benefits: [
                'Complete analysis history',
                'Visual trend reports',
                'Export to PDF/CSV',
                'Activity tracking'
            ],
            link: '/dashboard',
            color: 'bg-purple-500'
        },
        {
            icon: Stethoscope,
            title: 'Symptom Checker',
            description: 'Enter your symptoms and receive AI-powered risk assessment with recommended next steps.',
            image: '/images/ai_neural_network_1769245552853.png',
            benefits: [
                'Comprehensive symptom input',
                'Risk level assessment',
                'Recommended actions',
                'Medical guidance'
            ],
            link: '/symptom-checker',
            color: 'bg-orange-500'
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero */}
            <section className="pt-32 pb-16 bg-gradient-to-b from-muted/50 to-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Powerful Features for Modern Healthcare
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8">
                            AI-powered diagnostic tools designed to help healthcare professionals
                            make faster, more accurate decisions.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Button asChild size="lg">
                                <Link to="/register">
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link to="/xray-analysis">Live Demo</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className={`grid lg:grid-cols-2 gap-12 items-center py-16 ${index !== 0 ? 'border-t border-border' : ''}`}
                        >
                            <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                                    <feature.icon className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold mb-4">{feature.title}</h2>
                                <p className="text-lg text-muted-foreground mb-6">{feature.description}</p>

                                <ul className="space-y-3 mb-8">
                                    {feature.benefits.map((benefit) => (
                                        <li key={benefit} className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button asChild>
                                    <Link to={feature.link}>
                                        Try {feature.title}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>

                            <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                                <div className="rounded-2xl overflow-hidden border border-border shadow-lg bg-card">
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-auto"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-20 bg-primary">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
                        Ready to experience the future of diagnostics?
                    </h2>
                    <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                        Join thousands of healthcare professionals using MediVision.
                    </p>
                    <Button asChild size="lg" variant="secondary">
                        <Link to="/register">
                            Create Free Account
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>

            <Footer />
        </div>
    );
}
