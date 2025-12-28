import { supabase } from "@/lib/supabase";

const ONBOARDING_API_URL = (process.env.NEXT_PUBLIC_ONBOARDING_SERVICE_URL || "https://c3a24cwqti.execute-api.ap-south-1.amazonaws.com/Prod") + "/v1/onboarding";

export interface UserProfile {
    id: string;
    full_name?: string;
    date_of_birth?: string;
    secondary_email?: string;
    address?: string;
    linkedin_url?: string;
    github_username?: string;
    skills?: string[];
    career_preferences?: any;
    education?: any;
    onboarding_completed?: boolean;
    profile_photo_url?: string;
    govt_id_url?: string;
    phone_number?: string;
    api_keys?: any;
}

export const OnboardingService = {
    async getProfile(): Promise<UserProfile | null> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error("No access token found");

        const response = await fetch(ONBOARDING_API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }

        return await response.json();
    },

    async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error("No access token found");

        const response = await fetch(ONBOARDING_API_URL, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${session.access_token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(profileData),
        });

        if (!response.ok) {
            throw new Error(`Failed to update profile: ${response.statusText}`);
        }

        return await response.json();
    }
};
