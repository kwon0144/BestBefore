// Calendar related interfaces

/**
 * Interface for calendar item selection and reminder settings
 */
export interface CalendarSelection {
    selectedItems: Array<{
        name: string;
        quantity: number;
        expiry_date: number;  // Changed from string to number
        reminder_days: number;
        reminder_time: string;
    }>;
    calendarLink: string | null;
    reminderDays: number;
    reminderTime: string;
}

/**
 * Interface for calendar API response
 */
export interface CalendarResponse {
    calendar_url: string;
    success?: boolean; // Make success optional
} 