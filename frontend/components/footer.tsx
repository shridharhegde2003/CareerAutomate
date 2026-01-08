"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function Footer() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (modal: string) => {
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <footer className="relative border-t-2 border-blue-500/20 dark:border-blue-500/30 bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-slate-950">
        {/* Background decorative elements with better visibility */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl opacity-40 dark:opacity-25" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl opacity-40 dark:opacity-25" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          {/* Main footer content */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
            {/* Brand section */}
            <div className="sm:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://i.postimg.cc/1RvV7gcX/CA_logo_banner_transparent.png"
                  alt="CareerAutomate"
                  className="h-10 object-contain"
                />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                Your AI-powered career growth platform. Automate job applications, optimize resumes, and showcase your
                GitHub projects all in one place.
              </p>
            </div>

            {/* Features Links */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Features</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button
                    onClick={() => openModal('features')}
                    className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Our Features
                  </button>
                </li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">About</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button
                    onClick={() => openModal('about')}
                    className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    About Us
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button
                    onClick={() => openModal('privacy')}
                    className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openModal('terms')}
                    className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openModal('contact')}
                    className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider with gradient */}
          <div className="relative mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 dark:via-blue-500/40 to-transparent" />
          </div>

          {/* Footer bottom */}
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-muted-foreground gap-4">
            <p>&copy; 2025 CareerAutoMate. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Features Modal */}
      <Dialog open={activeModal === 'features'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Our Features</DialogTitle>
            <DialogDescription>What CareerAutomate offers you</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">🚀 AI-Powered Resume Generation</h3>
              <p className="text-sm text-muted-foreground">Automatically generate tailored, ATS-friendly resumes based on your profile and job descriptions. Our AI analyzes job requirements and highlights your most relevant skills.</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">📂 GitHub Project Showcase</h3>
              <p className="text-sm text-muted-foreground">Connect your GitHub account to automatically sync and showcase your projects. Get AI-generated first-person descriptions that highlight your contributions and technical skills.</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">🎯 Smart Job Matching</h3>
              <p className="text-sm text-muted-foreground">Our intelligent matching algorithm finds jobs that align with your skills, experience, and career preferences. Get personalized job recommendations delivered to you.</p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
              <h3 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">📊 Application Tracking</h3>
              <p className="text-sm text-muted-foreground">Track all your job applications in one place. Monitor application status, interview schedules, and get insights on your job search progress.</p>
            </div>
            <div className="p-4 bg-pink-50 dark:bg-pink-950/30 rounded-lg">
              <h3 className="font-semibold text-pink-700 dark:text-pink-300 mb-2">🎥 Project Video Demos</h3>
              <p className="text-sm text-muted-foreground">Record and upload video demonstrations of your projects. Showcase your work in action and make a lasting impression on potential employers.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* About Modal */}
      <Dialog open={activeModal === 'about'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">About Us</DialogTitle>
            <DialogDescription>Meet the team behind CareerAutomate</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">🎓 A College Project</h3>
              <p className="text-muted-foreground mb-4">
                CareerAutomate is a Mini Project developed by students pursuing <strong>Master of Computer Applications (MCA)</strong>.
              </p>
              <p className="text-muted-foreground mb-4">
                Our goal is to simplify the job search process for fresh graduates and experienced professionals alike, using the power of Artificial Intelligence and modern web technologies.
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <h3 className="font-semibold mb-2">💻 Technology Stack</h3>
              <p className="text-sm text-muted-foreground">
                Built with Next.js, FastAPI, Supabase, AWS Lambda, and integrated with Google Gemini AI for intelligent features.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Modal */}
      <Dialog open={activeModal === 'privacy'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Privacy Policy</DialogTitle>
            <DialogDescription>Last updated: December 2025</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4 text-sm text-muted-foreground">
            <section>
              <h3 className="font-semibold text-foreground mb-2">1. Information We Collect</h3>
              <p>We collect information you provide directly, including your name, email address, profile details, educational background, skills, and career preferences. We also collect your GitHub repository information when you connect your account.</p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">2. How We Use Your Information</h3>
              <p>Your information is used solely to provide our services: generating resumes, matching jobs, and showcasing your projects. We use AI to analyze and improve your profile presentation.</p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">3. Data Protection</h3>
              <p className="font-medium text-green-600 dark:text-green-400">✓ We do NOT sell your personal data to third parties.</p>
              <p className="font-medium text-green-600 dark:text-green-400">✓ We do NOT share your information with advertisers.</p>
              <p className="font-medium text-green-600 dark:text-green-400">✓ Your data is encrypted and stored securely.</p>
              <p className="font-medium text-green-600 dark:text-green-400">✓ Government ID documents are stored in private, secure storage.</p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">4. Third-Party Services</h3>
              <p>We integrate with GitHub for project syncing and Google for authentication. These services have their own privacy policies. We only access the minimum required information from these services.</p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">5. Your Rights</h3>
              <p>You have the right to access, update, or delete your personal information at any time. You can revoke third-party connections from your settings page.</p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">6. Contact</h3>
              <p>For privacy-related inquiries, contact us at: <a href="mailto:friendzone108108@gmail.com" className="text-blue-600 hover:underline">friendzone108108@gmail.com</a></p>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms Modal */}
      <Dialog open={activeModal === 'terms'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Terms of Service</DialogTitle>
            <DialogDescription>Last updated: December 2025</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4 text-sm text-muted-foreground">
            <section>
              <h3 className="font-semibold text-foreground mb-2">1. Acceptance of Terms</h3>
              <p>By accessing and using CareerAutomate, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">2. Description of Service</h3>
              <p>CareerAutomate provides AI-powered career tools including resume generation, GitHub project showcase, and job matching services. This is an educational project and services may be modified or discontinued.</p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">3. User Responsibilities</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Provide accurate and truthful information</li>
                <li>Keep your account credentials secure</li>
                <li>Use the service for lawful purposes only</li>
                <li>Not misuse or attempt to exploit the platform</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">4. Intellectual Property</h3>
              <p>Content you create (resumes, profiles) belongs to you. The CareerAutomate platform, design, and AI models are the property of the development team.</p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">5. Limitation of Liability</h3>
              <p>CareerAutomate is provided "as is" without warranties. We are not responsible for job application outcomes or third-party service issues.</p>
            </section>
            <section>
              <h3 className="font-semibold text-foreground mb-2">6. Changes to Terms</h3>
              <p>We may update these terms periodically. Continued use of the service after changes constitutes acceptance of the new terms.</p>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={activeModal === 'contact'} onOpenChange={closeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Contact Us</DialogTitle>
            <DialogDescription>Get in touch with our team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg text-center">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-semibold text-lg mb-2">Email Us</h3>
              <a
                href="mailto:friendzone108108@gmail.com"
                className="text-blue-600 dark:text-blue-400 hover:underline text-lg font-medium"
              >
                friendzone108108@gmail.com
              </a>
              <p className="text-sm text-muted-foreground mt-3">
                We typically respond within 24-48 hours.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
