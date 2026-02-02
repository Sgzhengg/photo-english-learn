// =============================================================================
// PhotoEnglish - Onboarding Page
// =============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/lib/api';
import { OnboardingPage as OnboardingPageUI } from '@/sections/foundation/OnboardingPage';
import type { UserPreferences, OnboardingStep } from '@/sections/foundation/types';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(0);
  const [preferences, setPreferences] = useState<UserPreferences>({
    englishLevel: 'intermediate',
    dailyGoal: '20',
  });

  // If user already completed onboarding, redirect to main app
  useEffect(() => {
    if (user?.hasCompletedOnboarding) {
      navigate('/app/photo-capture');
    }
  }, [user, navigate]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as OnboardingStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((currentStep - 1) as OnboardingStep);
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  const handleComplete = async () => {
    try {
      // Save user preferences
      const response = await userApi.updatePreferences(preferences);

      if (response.success) {
        // Refresh user data
        await refreshUser();

        // Navigate to main app
        navigate('/app/photo-capture');
      } else {
        console.error('Failed to save preferences:', response.error);
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const handleUpdatePreferences = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
  };

  return (
    <OnboardingPageUI
      currentStep={currentStep}
      preferences={preferences}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSkip={handleSkip}
      onComplete={handleComplete}
      onUpdatePreferences={handleUpdatePreferences}
    />
  );
}
