"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link href="/">
                    <Button variant="ghost" className="mb-8">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 md:p-12">
                    <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
                    <p className="text-muted-foreground mb-8">Last updated: December 2025</p>

                    <div className="space-y-6 text-muted-foreground">
                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
                            <p>By accessing and using CareerAutomate, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
                            <p>CareerAutomate provides AI-powered career tools including:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Automated resume generation and optimization</li>
                                <li>GitHub project showcase and AI-generated descriptions</li>
                                <li>Job matching and application tracking</li>
                                <li>Profile management and career preference settings</li>
                            </ul>
                            <p className="mt-2">This is an educational project and services may be modified or discontinued at any time.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">3. User Responsibilities</h2>
                            <p>As a user of CareerAutomate, you agree to:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Provide accurate and truthful information in your profile</li>
                                <li>Keep your account credentials secure and confidential</li>
                                <li>Use the service for lawful purposes only</li>
                                <li>Not misuse, exploit, or attempt to harm the platform</li>
                                <li>Not upload malicious content or attempt unauthorized access</li>
                                <li>Respect intellectual property rights of others</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">4. Account Registration</h2>
                            <p>You must provide a valid email address and accurate information to create an account. You are responsible for all activities under your account. Multiple accounts per person are not permitted.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">5. Intellectual Property</h2>
                            <p>Content you create (resumes, profiles, descriptions) belongs to you. The CareerAutomate platform, design, branding, and AI models are the property of the development team. You may not copy, modify, or distribute our platform without permission.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">6. AI-Generated Content</h2>
                            <p>Our AI generates resume content and project descriptions based on your input. While we strive for accuracy, you are responsible for reviewing and verifying AI-generated content before use. We are not liable for any inaccuracies in AI outputs.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">7. Third-Party Integrations</h2>
                            <p>CareerAutomate integrates with third-party services (GitHub, Google). Your use of these integrations is subject to their respective terms of service. We are not responsible for third-party service availability or changes.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
                            <p>CareerAutomate is provided "as is" without warranties of any kind. We are not responsible for:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Job application outcomes or employment decisions</li>
                                <li>Third-party service issues or data breaches</li>
                                <li>Loss of data due to technical failures</li>
                                <li>Any indirect, incidental, or consequential damages</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">9. Termination</h2>
                            <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from your settings page.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">10. Changes to Terms</h2>
                            <p>We may update these terms periodically. Continued use of the service after changes constitutes acceptance of the new terms. We will notify users of significant changes via email.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">11. Contact</h2>
                            <p>For questions about these terms, contact us at: <a href="mailto:friendzone108108@gmail.com" className="text-blue-600 hover:underline">friendzone108108@gmail.com</a></p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
