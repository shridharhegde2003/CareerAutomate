// frontend/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardHeader } from "@/components/dashboard-header";
import { supabase } from "@/lib/supabase";
import { ArrowRight, FileText, Settings } from "lucide-react";

// TODO: Import AI service functions when AI-Service microservice is implemented
// import { analyzeSkillGaps } from "@/lib/api-services";

interface DashboardStats {
  jobSearchActive: boolean;
  certificatesCount: number;
  projectsCount: number;
  resumeVersions: number;
  skillGapAlerts: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    jobSearchActive: true,
    certificatesCount: 0,
    projectsCount: 0,
    resumeVersions: 0,
    skillGapAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: jobStatus } = await supabase
        .from('job_search_status')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { count: certsCount } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('verified', true);

      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: resumesCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('document_type', 'resume');

      // Fetch skill gaps count
      // TODO: Replace with AI-Service call for real-time skill gap analysis
      // Currently fetching from database, but should call AI-Service to analyze
      // user skills vs job market requirements using LLM
      const { count: skillGapsCount } = await supabase
        .from('skill_gaps')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'Open');

      /*
      TODO: When AI-Service is implemented, replace above with:
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('skills, career_preferences')
        .eq('id', user.id)
        .single();
      
      const skillAnalysis = await analyzeSkillGaps({
        userId: user.id,
        currentSkills: profile.skills,
        targetRole: profile.career_preferences.preferred_roles[0]
      });
      
      const skillGapsCount = skillAnalysis.skill_gaps.length;
      */

      setStats({
        jobSearchActive: jobStatus?.is_active ?? true,
        certificatesCount: certsCount ?? 0,
        projectsCount: projectsCount ?? 0,
        resumeVersions: resumesCount ?? 0,
        skillGapAlerts: skillGapsCount ?? 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleJobSearch = async (checked: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('job_search_status')
        .upsert({ user_id: user.id, is_active: checked });

      setStats({ ...stats, jobSearchActive: checked });
    } catch (error) {
      console.error('Error toggling job search:', error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <DashboardNav />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Job Search Status</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {stats.jobSearchActive ? 'Active' : 'Inactive'}
                        </span>
                        <Switch
                          checked={stats.jobSearchActive}
                          onCheckedChange={toggleJobSearch}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <span className="text-sm text-muted-foreground">Verified Certificates</span>
                      <div className="text-4xl font-bold mt-2">{stats.certificatesCount}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <span className="text-sm text-muted-foreground">Projects Synced</span>
                      <div className="text-4xl font-bold mt-2">{stats.projectsCount}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <span className="text-sm text-muted-foreground">Resume Versions</span>
                      <div className="text-4xl font-bold mt-2">
                        {stats.resumeVersions}<span className="text-lg text-muted-foreground">/10</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <span className="text-sm text-muted-foreground">Skill Gap Alerts</span>
                      <div className="text-4xl font-bold mt-2 text-red-500">{stats.skillGapAlerts}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => router.push('/projects')} className="gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Go to Projects
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/reports')} className="gap-2">
                    <FileText className="w-4 h-4" />
                    View Reports
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/settings')} className="gap-2">
                    <Settings className="w-4 h-4" />
                    Manage Job Search
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
