'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface SystemControlsContextType {
    emergencyStop: boolean;
    automationsStopped: boolean;
    loading: boolean;
    refreshControls: () => Promise<void>;
}

const SystemControlsContext = createContext<SystemControlsContextType | undefined>(undefined);

export function SystemControlsProvider({ children }: { children: ReactNode }) {
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

    return (
        <SystemControlsContext.Provider value={{
            emergencyStop,
            automationsStopped,
            loading,
            refreshControls: fetchControls
        }}>
            {children}
        </SystemControlsContext.Provider>
    );
}

export function useSystemControlsContext() {
    const context = useContext(SystemControlsContext);
    if (context === undefined) {
        throw new Error('useSystemControlsContext must be used within a SystemControlsProvider');
    }
    return context;
}
