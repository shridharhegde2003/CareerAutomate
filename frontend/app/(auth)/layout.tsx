// frontend/app/(auth)/layout.tsx
import Link from "next/link";
import { Briefcase } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
            {/* Header with branding */}
            <header className="w-full py-6 px-8">
                <Link href="/" className="flex items-center gap-2 w-fit">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                        <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        CareerAutomate
                    </span>
                </Link>
            </header>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center p-4">
                {children}
            </main>

            {/* Footer */}
            <footer className="py-4 text-center text-sm text-muted-foreground">
                © 2025 CareerAutomate. All rights reserved.
            </footer>
        </div>
    );
}
