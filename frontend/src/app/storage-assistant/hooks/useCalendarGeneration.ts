/**
 * Calendar Generation Custom Hook
 * 
 * This hook provides functionality to generate calendar links for expiration reminders
 * by making API calls to the backend calendar generation service.
 * 
 * Features:
 * - Handles the API call to generate calendar links
 * - Manages loading and error states
 * - Returns the generated calendar URL
 * - Provides a clean interface for components to generate reminders
 */

import { useState } from "react";
import axios from "axios";
import { config } from "@/config";
// Define the types for the hook
interface CalendarItem {
    name: string;
    expiry_date: string | number; // Allow both string and number types
    id?: number; // Make id optional to match the actual data
    [key: string]: any; // Allow other properties
}

interface CalendarOptions {
    reminderDays: number;
    reminderTime: string;
}

interface CalendarRequest {
    items: Array<{
        name: string;
        expiry_date: string | number; // Allow both string and number types
        id?: number;
        reminder_days: number;
        reminder_time: string;
        [key: string]: any;
    }>;
    reminder_days: number;
    reminder_time: string;
}

interface CalendarResponse {
    calendar_url: string;
    success?: boolean; // Make success optional since it might not be in the response
}

interface UseCalendarGenerationReturn {
    generateCalendar: (items: CalendarItem[], options: CalendarOptions) => Promise<string | null>;
    calendarUrl: string | null;
    loading: boolean;
    error: string | null;
}

export function useCalendarGeneration(): UseCalendarGenerationReturn {
    const [calendarUrl, setCalendarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Generate a calendar link for expiration reminders
     * 
     * @param items - Array of items with expiry dates
     * @param options - Reminder options (days before, time)
     * @returns The generated calendar URL or null if an error occurred
     */
    const generateCalendar = async (
        items: CalendarItem[],
        options: CalendarOptions
    ): Promise<string | null> => {
        if (items.length === 0) {
            setError("No items selected for calendar generation");
            return null;
        }

        setLoading(true);
        setError(null);

        try {

            const requestData: CalendarRequest = {
                items: items.map(item => ({
                    ...item,
                    reminder_days: options.reminderDays,
                    reminder_time: options.reminderTime
                })),
                reminder_days: options.reminderDays,
                reminder_time: options.reminderTime
            };

            const response = await axios.post<CalendarResponse>(
                `${config.apiUrl}/api/generate_calendar/`,
                requestData
            );

            // Check if the response has calendar_url
            if (!response.data.calendar_url) {
                throw new Error("Response is missing calendar URL");
            }

            setCalendarUrl(response.data.calendar_url);
            return response.data.calendar_url;
        } catch (err) {
            console.error('Calendar generation error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate calendar';
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        generateCalendar,
        calendarUrl,
        loading,
        error
    };
} 