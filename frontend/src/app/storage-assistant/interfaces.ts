// Interface for camera state
export interface CameraState {
    stream: MediaStream | null;
    photos: string[]; // Array of photos
    error: string | null;
    isAnalyzing: boolean;
    detections: ProduceDetections | null;
    submittedPhotos: string[]; // Store photos ready for submission
}

// Interface for produce detection results
export interface ProduceDetections {
    success: boolean;
    detections: Array<{
        class: string;
        confidence: number;
        bbox: number[];
    }>;
    produce_counts: {
        [key: string]: number;
    };
    total_items: number;
}

// Interface for storage recommendation
export interface StorageRecommendation {
    fridge: string[]; // Items recommended for fridge
    pantry: string[]; // Items recommended for pantry
}

// Interface for calendar selection
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

// Interface for API response types
export interface FoodTypesResponse {
    food_types: string[];
}

export interface StorageAdviceResponse {
    method: number;
    storage_time: number;
}

export interface CalendarResponse {
    calendar_url: string;
} 