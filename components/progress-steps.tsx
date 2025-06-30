'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStepsProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: 'Input', description: 'Upload or provide profile data' },
  { id: 2, name: 'Results', description: 'View insights and recommendations' },
];

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative max-w-md mx-auto">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
        
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted && "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white",
                  isCurrent && "border-blue-600 bg-white text-blue-600 shadow-lg scale-110",
                  !isCompleted && !isCurrent && "border-gray-300 bg-white text-gray-400"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>
              
              <div className="mt-3 text-center">
                <p className={cn(
                  "text-sm font-medium",
                  (isCurrent || isCompleted) ? "text-gray-900" : "text-gray-500"
                )}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-24">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}