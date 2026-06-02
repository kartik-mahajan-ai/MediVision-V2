import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
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
                    <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                    <p className="text-muted-foreground mb-8">Last updated: February 2, 2026</p>

                    <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                MediVision ("we," "our," or "us") is committed to protecting your privacy. This Privacy
                                Policy explains how we collect, use, disclose, and safeguard your information when you
                                use our educational medical AI platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                            <h3 className="text-lg font-medium mt-4 mb-2">Personal Information</h3>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>Name and email address when you create an account</li>
                                <li>Profile information you choose to provide</li>
                                <li>Authentication credentials</li>
                            </ul>

                            <h3 className="text-lg font-medium mt-4 mb-2">Usage Data</h3>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>X-ray images you upload for analysis (educational purposes)</li>
                                <li>Symptom information you enter</li>
                                <li>Chat conversations with our AI assistant</li>
                                <li>Usage patterns and feature interactions</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>To provide and maintain our educational Service</li>
                                <li>To process and analyze uploaded X-ray images</li>
                                <li>To improve our AI models and Service quality</li>
                                <li>To communicate with you about your account</li>
                                <li>To ensure security and prevent fraud</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We implement appropriate technical and organizational security measures to protect your
                                personal information. However, no method of transmission over the Internet is 100% secure,
                                and we cannot guarantee absolute security.
                            </p>
                            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mt-4">
                                <p className="text-sm">
                                    🔒 Your data is stored securely using Supabase with row-level security policies.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">5. Medical Data Notice</h2>
                            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-4">
                                <p className="text-sm font-medium text-warning-foreground">
                                    ⚠️ Important: This is an educational platform, not a healthcare provider.
                                </p>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                While we take data security seriously, MediVision is not a covered entity under HIPAA.
                                Do not upload real patient medical data. This platform is intended for educational and
                                learning purposes only.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We retain your personal information for as long as your account is active or as needed
                                to provide you services. You may request deletion of your account and associated data
                                at any time.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
                            <p className="text-muted-foreground leading-relaxed mb-3">
                                Depending on your location, you may have the following rights:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li>Access your personal data</li>
                                <li>Correct inaccurate data</li>
                                <li>Request deletion of your data</li>
                                <li>Object to processing of your data</li>
                                <li>Data portability</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">8. Third-Party Services</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We may use third-party services for authentication, data storage, and AI processing.
                                These services have their own privacy policies governing the use of your information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of any changes
                                by posting the new Privacy Policy on this page and updating the "Last updated" date.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us through our
                                support channels.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
