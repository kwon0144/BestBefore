/**
 * StorageAssistantStepper Component
 * 
 * A reusable stepper component that displays the progress through the storage assistant workflow.
 * It shows four main steps: Grocery Scanner, Storage Recommendations, Reminder Setup, and Calendar Import.
 * The stepper allows users to navigate between steps and visually track their progress.
 */

import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';

// Define the steps in the storage assistant workflow
const steps = ['Grocery Scanner', 'Storage Recommendations', 'Reminder Setup', 'Calendar Import'];

/**
 * Props interface for the StorageAssistantStepper component
 * @property {number} currentStep - The currently active step (0-based index)
 * @property {(step: number) => void} [onStepClick] - Optional callback function when a step is clicked
 */
interface StorageAssistantStepperProps {
    currentStep: number;
    onStepClick?: (step: number) => void;
}

/**
 * StorageAssistantStepper Component
 * 
 * @param {StorageAssistantStepperProps} props - Component props
 * @returns {JSX.Element} A Material-UI Stepper component with custom styling
 */
export default function StorageAssistantStepper({ currentStep, onStepClick }: StorageAssistantStepperProps) {
    /**
     * Handles step click events
     * @param {number} step - The index of the clicked step
     */
    const handleStepClick = (step: number) => {
        if (onStepClick) {
            onStepClick(step);
        }
    };

    return <div>
        <Stepper 
            nonLinear // Allows clicking on any step regardless of completion status
            activeStep={currentStep} // Sets the currently active step
            alternativeLabel // Places the label below the step icon
            sx={{
                // Custom styling for the stepper
                '& .MuiStepLabel-root .Mui-completed': {
                    color: '#0d9488', // Teal color for completed steps
                },
                '& .MuiStepLabel-root .Mui-active': {
                    color: '#0d9488', // Teal color for the active step
                },
                '& .MuiStepLabel-root .MuiStepIcon-text': {
                    color: 'white', // White text color inside step icons
                }
            }}
        >
        {steps.map((label, index) => (
            <Step 
                key={label} 
                completed={index < currentStep} // Marks steps as completed if they come before the current step
            >
                <StepButton 
                    onClick={() => handleStepClick(index)}
                    disabled={false} // Allows clicking on any step
                >
                    {label}
                </StepButton>
            </Step>
        ))}
        </Stepper>
    </div>
}