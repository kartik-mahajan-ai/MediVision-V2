import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useStats, formatStatNumber } from '@/hooks/useStats';
import {
    Brain,
    Shield,
    Users,
    Award,
    Heart,
    Globe,
    Lightbulb,
    ArrowRight,
    Activity,
    Stethoscope
} from 'lucide-react';

export default function About() {
    const { stats, loading: isLoading } = useStats();
    const users = stats.profiles;
    const xraysAnalyzed = stats.xray_analyses;
    const symptomChecks = stats.symptom_checks;

    const values = [
        {
            icon: Heart,
            title: 'Patient-First',
            description: 'Every feature is designed with patient outcomes in mind.'
        },
        {
            icon: Shield,
            title: 'Privacy & Security',
            description: 'HIPAA-compliant with enterprise-grade data protection.'
        },
        {
            icon: Lightbulb,
            title: 'Innovation',
            description: 'Continuously improving our AI models with latest research.'
        },
        {
            icon: Globe,
            title: 'Accessibility',
            description: 'Making advanced diagnostics available worldwide.'
        }
    ];

    const team = [
        {
            name: 'Dr. Sarah Mitchell',
            role: 'Chief Medical Officer',
            image: '/images/doctor_avatar_1_1769245567106.png',
            bio: 'Board-certified radiologist with 15+ years of experience.'
        },
        {
            name: 'Dr. James Chen',
            role: 'Head of AI Research',
            image: '/images/doctor_avatar_2_1769245584526.png',
            bio: 'Former Google Health researcher, PhD in Medical AI.'
        },
        {
            name: 'Dr. Emma Rodriguez',
            role: 'Clinical Director',
            image: '/images/doctor_avatar_3_1769245600071.png',
            bio: 'Pulmonologist specializing in diagnostic imaging.'
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero */}
            <section className="pt-32 pb-20 bg-gradient-to-b from-muted/50 to-background">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">
                                About MediVision
                            </h1>
                            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                                We're on a mission to transform medical diagnostics with artificial intelligence,
                                making advanced healthcare technology accessible to professionals worldwide.
                            </p>
                            <p className="text-muted-foreground mb-8 leading-relaxed">
                                Founded by healthcare professionals and AI researchers, MediVision combines
                                deep medical expertise with cutting-edge machine learning to help doctors
                                make faster, more accurate diagnoses.
                            </p>
                            <Button asChild size="lg">
                                <Link to="/register">
                                    Join Us
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        <div>
                            <img
                                src="/images/doctor_using_tablet_1769245535367.png"
                                alt="Doctor using MediVision"
                                className="rounded-2xl border border-border shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-primary">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {/* Registered Users */}
                        <div>
                            <div className="text-4xl font-bold text-primary-foreground">
                                {isLoading ? (
                                    <Skeleton className="h-10 w-20 mx-auto bg-primary-foreground/20" />
                                ) : (
                                    <>
                                        <AnimatedCounter
                                            value={users}
                                            formatFn={formatStatNumber}
                                        />
                                    </>
                                )}
                            </div>
                            <div className="text-primary-foreground/80 mt-1 flex items-center justify-center gap-1">
                                <Users className="h-4 w-4" />
                                Registered Users
                            </div>
                        </div>

                        {/* X-Rays Analyzed */}
                        <div>
                            <div className="text-4xl font-bold text-primary-foreground">
                                {isLoading ? (
                                    <Skeleton className="h-10 w-24 mx-auto bg-primary-foreground/20" />
                                ) : (
                                    <AnimatedCounter
                                        value={xraysAnalyzed}
                                        formatFn={formatStatNumber}
                                    />
                                )}
                            </div>
                            <div className="text-primary-foreground/80 mt-1 flex items-center justify-center gap-1">
                                <Activity className="h-4 w-4" />
                                X-Rays Analyzed
                            </div>
                        </div>

                        {/* Symptom Checks */}
                        <div>
                            <div className="text-4xl font-bold text-primary-foreground">
                                {isLoading ? (
                                    <Skeleton className="h-10 w-20 mx-auto bg-primary-foreground/20" />
                                ) : (
                                    <AnimatedCounter
                                        value={symptomChecks}
                                        formatFn={formatStatNumber}
                                    />
                                )}
                            </div>
                            <div className="text-primary-foreground/80 mt-1 flex items-center justify-center gap-1">
                                <Stethoscope className="h-4 w-4" />
                                Symptom Checks
                            </div>
                        </div>

                        {/* AI Availability - Static */}
                        <div>
                            <div className="text-4xl font-bold text-primary-foreground">24/7</div>
                            <div className="text-primary-foreground/80 mt-1 flex items-center justify-center gap-1">
                                <Shield className="h-4 w-4" />
                                AI Availability
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            To empower healthcare professionals with AI-powered diagnostic tools that
                            enhance clinical decision-making, improve patient outcomes, and make
                            world-class diagnostics accessible to medical practitioners everywhere.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <img
                                src="/images/ai_neural_network_1769245552853.png"
                                alt="AI Neural Network"
                                className="rounded-2xl border border-border shadow-lg"
                            />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-6">Powered by Advanced AI</h3>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                Our deep learning models are trained on millions of medical images from
                                leading healthcare institutions, achieving state-of-the-art accuracy in
                                detecting chest conditions including COVID-19, pneumonia, and lung opacities.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: Brain, label: 'Deep Learning' },
                                    { icon: Shield, label: 'HIPAA Compliant' },
                                    { icon: Award, label: 'Peer Reviewed' },
                                    { icon: Users, label: `${formatStatNumber(users)} Users` }
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                        <item.icon className="h-5 w-5 text-primary" />
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
                        <p className="text-lg text-muted-foreground">
                            The principles that guide everything we do.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value) => (
                            <div key={value.title} className="bg-card rounded-xl border border-border p-6 text-center">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <value.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">{value.title}</h3>
                                <p className="text-sm text-muted-foreground">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Leadership Team</h2>
                        <p className="text-lg text-muted-foreground">
                            Meet the experts behind MediVision.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {team.map((member) => (
                            <div key={member.name} className="text-center">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-border"
                                />
                                <h3 className="font-semibold text-lg">{member.name}</h3>
                                <p className="text-primary text-sm mb-2">{member.role}</p>
                                <p className="text-muted-foreground text-sm">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">Join Us in Transforming Healthcare</h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Whether you're a healthcare professional or a medical student,
                        MediVision is here to support your diagnostic journey.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Button asChild size="lg">
                            <Link to="/register">Get Started Free</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link to="/features">View Features</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
