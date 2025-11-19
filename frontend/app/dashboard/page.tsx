// frontend/app/dashboard/page.tsx
"use client";

import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-4xl font-bold mb-4">Welcome to your Dashboard</h1>
      <p className="text-muted-foreground mb-8">This is your authenticated space. More features coming soon!</p>
      <Button variant="outline">Sign Out</Button>
    </div>
  );
}
