import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';

const steps = ['Grocery Scanner', 'Storage Recommendations', 'Calendar Export'];

interface StorageAssistantStepperProps {
    currentStep: number;
    onStepClick?: (step: number) => void;
}

export default function StorageAssistantStepper({ currentStep, onStepClick }: StorageAssistantStepperProps) {
    const handleStepClick = (step: number) => {
        // Only allow navigation to previous steps
        if (step < currentStep && onStepClick) {
            onStepClick(step);
        }
    };

    return <div>
        <Stepper 
            activeStep={currentStep} 
            alternativeLabel
            sx={{
                '& .MuiStepLabel-root .Mui-completed': {
                    color: '#0d9488', // completed step color
                },
                '& .MuiStepLabel-root .Mui-active': {
                    color: '#0d9488', // active step color
                },
                '& .MuiStepLabel-root .MuiStepIcon-text': {
                    color: 'white', // text color inside the step icon
                }
            }}
        >
        {steps.map((label, index) => (
            <Step key={label} completed={index < currentStep}>
                <StepButton 
                    onClick={() => handleStepClick(index)}
                    disabled={index > currentStep}
                >
                    {label}
                </StepButton>
            </Step>
        ))}
        </Stepper>
    </div>
}