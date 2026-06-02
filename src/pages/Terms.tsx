import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
    return (
        <div className="min-h-screen bg-muted/30">
            {/* Header */}
            <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-card rounded-xl border border-border p-8 md:p-12">
                    <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
                    <p className="text-muted-foreground mb-8">Last updated: February 2, 2026</p>

                    <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                By accessing and using MediVision ("the Service"), you accept and agree to be bound by these
                                Terms of Service. If you do not agree to these terms, please do not use the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">2. Educational Purpose Disclaimer</h2>
                            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-4">
                                <p className="text-sm font-medium text-warning-foreground">
                                    ⚠️ IMPORTANT: MediVision is an educational tool designed for learning purposes only.
                                </p>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                The AI-powered diagnostic features, including X-ray analysis and symptom checking, are
                                intended for educational and informational purposes only. They are NOT substitutes for
                                professional medical advice, diagnosis, or treatment.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">3. No Medical Advice</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                MediVision does not provide medical advice. The information provided by the Service
                                should not be used for diagnosing or treating any health problem or disease. Always
                                consult with a qualified healthcare professional before making any health-related decisions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">4. Limitation of Liability</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                To the fullest extent permitted by law, MediVision and its creators shall not be liable
                                for any direct, indirect, incidental, special, consequential, or punitive damages arising
                                out of your use of or inability to use the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">5. AI Accuracy Disclaimer</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                While our AI models are trained on medical datasets, they may produce inaccurate,
                                incomplete, or misleading results. Confidence scores provided are estimates and should
                                not be interpreted as certainty. Always verify AI-generated insights with qualified
                                medical professionals.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">6. User Responsibilities</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>You must be at least 18 years old to use this Service</li>
                                <li>You are responsible for maintaining the confidentiality of your account</li>
                                <li>You agree not to use the Service for any unlawful purpose</li>
                                <li>You understand that uploaded images may be processed by AI systems</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">7. Modifications to Service</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We reserve the right to modify or discontinue the Service at any time without prior notice.
                                We shall not be liable to you or any third party for any modification, suspension, or
                                discontinuance of the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                If you have any questions about these Terms, please contact us through our support channels.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
