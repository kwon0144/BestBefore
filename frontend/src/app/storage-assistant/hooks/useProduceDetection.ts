/**
 * Produce Detection Custom Hook
 * 
 * This hook provides functionality to detect produce items from uploaded photos
 * by making API calls to the backend detection service.
 * 
 * Features:
 * - Handles the API call to detect produce in uploaded photos
 * - Manages loading and error states
 * - Returns the detection results
 * - Provides a clean interface for components to submit photos
 */

import { useState } from "react";
import axios from "axios";
import { config } from "@/config";

// Define the response type from the API
interface DetectionResponse {
    detectedItems: Array<{
        name: string;
        confidence: number;
        expiryDate?: string;
    }>;
}

interface UseProduceDetectionReturn {
    submitPhotos: (photos: string[]) => Promise<DetectionResponse | null>;
    results: DetectionResponse | null;
    loading: boolean;
    error: string | null;
}

export function useProduceDetection(): UseProduceDetectionReturn {
    const [results, setResults] = useState<DetectionResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Submit photos to the produce detection API
     * 
     * @param photos - Array of base64 encoded photo strings
     * @returns The detection results or null if an error occurred
     */
    const submitPhotos = async (photos: string[]): Promise<DetectionResponse | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post<DetectionResponse>(`${config.apiUrl}/api/detect-produce/`, {
                images: photos
            });

            setResults(response.data);
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to detect produce';
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        submitPhotos,
        results,
        loading,
        error
    };
} 