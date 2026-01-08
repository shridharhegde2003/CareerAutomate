// frontend/app/onboarding/page.tsx
"use client";

import { OnboardingForm } from "@/components/onboarding-form";

export default function OnboardingPage() {
  // The OnboardingForm component now handles the redirect check internally
  // It will redirect to /dashboard if onboarding is already completed
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <OnboardingForm />
    </div>
  );
}
