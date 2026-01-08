"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
                    <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                    <p className="text-muted-foreground mb-8">Last updated: December 2025</p>

                    <div className="space-y-6 text-muted-foreground">
                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
                            <p>We collect information you provide directly, including your name, email address, profile details, educational background, skills, and career preferences. We also collect your GitHub repository information when you connect your account.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
                            <p>Your information is used solely to provide our services: generating resumes, matching jobs, and showcasing your projects. We use AI to analyze and improve your profile presentation.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Protection</h2>
                            <div className="space-y-2">
                                <p className="font-medium text-green-600 dark:text-green-400">✓ We do NOT sell your personal data to third parties.</p>
                                <p className="font-medium text-green-600 dark:text-green-400">✓ We do NOT share your information with advertisers.</p>
                                <p className="font-medium text-green-600 dark:text-green-400">✓ Your data is encrypted and stored securely.</p>
                                <p className="font-medium text-green-600 dark:text-green-400">✓ Government ID documents are stored in private, secure storage.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">4. Third-Party Services</h2>
                            <p>We integrate with GitHub for project syncing and Google for authentication. These services have their own privacy policies. We only access the minimum required information from these services.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Storage</h2>
                            <p>Your data is stored securely on Supabase servers. Profile photos are stored in public storage for display purposes. Government IDs are stored in private, access-controlled storage and are never publicly accessible.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Rights</h2>
                            <p>You have the right to:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Access your personal information at any time</li>
                                <li>Update or correct your information</li>
                                <li>Delete your account and associated data</li>
                                <li>Revoke third-party connections from your settings</li>
                                <li>Export your data in a portable format</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">7. Cookies</h2>
                            <p>We use essential cookies for authentication and session management. We do not use tracking cookies or third-party analytics that collect personal information.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">8. Contact</h2>
                            <p>For privacy-related inquiries, contact us at: <a href="mailto:friendzone108108@gmail.com" className="text-blue-600 hover:underline">friendzone108108@gmail.com</a></p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
