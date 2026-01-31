import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface SystemControls {
    emergencyStop: boolean;
    automationsStopped: boolean;
    loading: boolean;
}

/**
 * Hook to check system control status
 * - emergencyStop: If true, users cannot login (show maintenance page)
 * - automationsStopped: If true, automation buttons should be disabled
 */
export function useSystemControls(): SystemControls {
    const [emergencyStop, setEmergencyStop] = useState(false);
    const [automationsStopped, setAutomationsStopped] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchControls = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('system_controls')
                .select('control_key, control_value');

            if (error) {
                console.error('Error fetching system controls:', error);
                return;
            }

            data?.forEach((control) => {
                if (control.control_key === 'emergency_stop') {
                    setEmergencyStop(control.control_value === true);
                }
                if (control.control_key === 'automations_stopped') {
                    setAutomationsStopped(control.control_value === true);
                }
            });
        } catch (error) {
            console.error('Error in fetchControls:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchControls();

        // Refresh every 30 seconds to catch admin changes
        const interval = setInterval(fetchControls, 30000);
        return () => clearInterval(interval);
    }, [fetchControls]);

    return { emergencyStop, automationsStopped, loading };
}

/**
 * Standalone function to check system controls (for use outside React components)
 */
export async function checkSystemControls(): Promise<{ emergencyStop: boolean; automationsStopped: boolean }> {
    try {
        const { data, error } = await supabase
            .from('system_controls')
            .select('control_key, control_value');

        if (error) {
            console.error('Error checking system controls:', error);
            return { emergencyStop: false, automationsStopped: false };
        }

        let emergencyStop = false;
        let automationsStopped = false;

        data?.forEach((control) => {
            if (control.control_key === 'emergency_stop') {
                emergencyStop = control.control_value === true;
            }
            if (control.control_key === 'automations_stopped') {
                automationsStopped = control.control_value === true;
            }
        });

        return { emergencyStop, automationsStopped };
    } catch (error) {
        console.error('Error in checkSystemControls:', error);
        return { emergencyStop: false, automationsStopped: false };
    }
}
