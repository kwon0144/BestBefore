// Camera related interfaces

/**
 * Interface for camera state including stream, photos and detection results
 */
export interface CameraState {
    stream: MediaStream | null;
    photos: string[]; // Array of photos
    error: string | null;
    isAnalyzing: boolean;
    detections: ProduceDetections | null;
    submittedPhotos: string[]; // Store photos ready for submission
}

/**
 * Interface for produce detection results
 */
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