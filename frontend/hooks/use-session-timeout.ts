"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes in milliseconds
const WARNING_BEFORE_TIMEOUT_MS = 2 * 60 * 1000; // Show warning 2 minutes before timeout

interface UseSessionTimeoutOptions {
    onWarning?: () => void;
    onTimeout?: () => void;
    enabled?: boolean;
}

export function useSessionTimeout(options: UseSessionTimeoutOptions = {}) {
    const { onWarning, onTimeout, enabled = true } = options;
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const warningRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    const handleLogout = useCallback(async () => {
        console.log('Session timeout - logging out user');
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }

        if (onTimeout) {
            onTimeout();
        } else {
            router.push('/login?session_expired=true');
        }
    }, [onTimeout, router]);

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();

        // Clear existing timers
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (warningRef.current) {
            clearTimeout(warningRef.current);
        }

        if (!enabled) return;

        // Set warning timer (2 minutes before timeout)
        if (onWarning) {
            warningRef.current = setTimeout(() => {
                onWarning();
            }, SESSION_TIMEOUT_MS - WARNING_BEFORE_TIMEOUT_MS);
        }

        // Set timeout timer (15 minutes)
        timeoutRef.current = setTimeout(() => {
            handleLogout();
        }, SESSION_TIMEOUT_MS);
    }, [enabled, handleLogout, onWarning]);

    useEffect(() => {
        if (!enabled) return;

        // Activity events to track
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'keydown',
            'scroll',
            'touchstart',
            'click',
            'wheel'
        ];

        // Throttle the reset to avoid too many calls
        let throttleTimer: NodeJS.Timeout | null = null;
        const throttledReset = () => {
            if (throttleTimer) return;
            throttleTimer = setTimeout(() => {
                throttleTimer = null;
                resetTimer();
            }, 1000); // Throttle to once per second
        };

        // Add event listeners
        events.forEach(event => {
            document.addEventListener(event, throttledReset, { passive: true });
        });

        // Initialize timer
        resetTimer();

        // Cleanup
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, throttledReset);
            });
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (warningRef.current) {
                clearTimeout(warningRef.current);
            }
            if (throttleTimer) {
                clearTimeout(throttleTimer);
            }
        };
    }, [enabled, resetTimer]);

    return {
        resetTimer,
        getRemainingTime: () => {
            const elapsed = Date.now() - lastActivityRef.current;
            return Math.max(0, SESSION_TIMEOUT_MS - elapsed);
        }
    };
}
