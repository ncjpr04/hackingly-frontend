'use client';

import { useState } from 'react';
import { InputForm } from '@/components/input-form';
import { ResultDisplay } from '@/components/result-display';
import { ProgressSteps } from '@/components/progress-steps';
import { AnalysisResult } from '@/lib/types';

export default function AnalyzePage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setCurrentStep(2);
    setIsLoading(false);
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setAnalysisResult(null);
    setIsLoading(false);
  };

  const handleAnalysisStart = () => {
    setIsLoading(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ProgressSteps currentStep={currentStep} />
        
        <div className="mt-12">
          {currentStep === 1 && (
            <InputForm onComplete={handleInputComplete} onAnalysisStart={handleAnalysisStart} />
          )}
          
          {currentStep === 2 && (
            <ResultDisplay 
              result={analysisResult}
              isLoading={isLoading}
              onStartOver={handleStartOver}
            />
          )}
        </div>
      </div>
    </div>
  );
}