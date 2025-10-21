'use client';

// Stepwise registration form component - better UX with progressive steps

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { RegistrationData } from '@/types/auth';
import SocialLoginButtons from './SocialLoginButtons';

interface StepwiseRegisterFormProps {
  onSuccess?: () => void;
}

interface SocialLoginSuccessHandler {
  (): void;
}

interface EmailStepData {
  email: string;
}

interface PasswordStepData {
  password: string;
  confirmPassword: string;
}

interface ProfileStepData {
  name: string;
  phone?: string;
  agreeToTerms: boolean;
  marketingConsent?: boolean;
}

type RegistrationStep = 'email' | 'password' | 'profile';

export default function StepwiseRegisterForm({ onSuccess }: StepwiseRegisterFormProps) {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationData, setRegistrationData] = useState<Partial<RegistrationData>>({});
  
  const { register: registerUser, isLoading } = useAuth();

  // Email step form
  const emailForm = useForm<EmailStepData>({
    defaultValues: { email: '' }
  });

  // Password step form
  const passwordForm = useForm<PasswordStepData>({
    defaultValues: { password: '', confirmPassword: '' }
  });

  // Profile step form
  const profileForm = useForm<ProfileStepData>({
    defaultValues: {
      name: '',
      phone: '',
      agreeToTerms: false,
      marketingConsent: false,
    }
  });

  const handleEmailSubmit: SubmitHandler<EmailStepData> = (data) => {
    setRegistrationData(prev => ({ ...prev, ...data }));
    setCurrentStep('password');
  };

  const handlePasswordSubmit: SubmitHandler<PasswordStepData> = (data) => {
    setRegistrationData(prev => ({ ...prev, ...data }));
    setCurrentStep('profile');
  };

  const handleProfileSubmit: SubmitHandler<ProfileStepData> = async (data) => {
    try {
      const finalData: RegistrationData = {
        email: registrationData.email!,
        password: registrationData.password!,
        confirmPassword: registrationData.confirmPassword!,
        name: data.name,
        phone: data.phone,
        agreeToTerms: data.agreeToTerms,
        marketingConsent: data.marketingConsent,
      };

      await registerUser(finalData);
      onSuccess?.();
    } catch (error: any) {
      // Handle registration error
      console.error('Registration failed:', error);
    }
  };

  const goBack = () => {
    if (currentStep === 'password') {
      setCurrentStep('email');
    } else if (currentStep === 'profile') {
      setCurrentStep('password');
    }
  };

  const handleSocialLoginSuccess = () => {
    onSuccess?.();
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'email':
        return 'Sign up';
      case 'password':
        return 'Create password';
      case 'profile':
        return 'Complete profile';
      default:
        return 'Sign up';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 'email':
        return 'Enter your email to get started';
      case 'password':
        return 'Choose a secure password';
      case 'profile':
        return 'Tell us a bit about yourself';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          {currentStep !== 'email' && (
            <button
              type="button"
              onClick={goBack}
              className="absolute left-0 p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
          )}
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {getStepTitle()}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          {getStepSubtitle()}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex space-x-2">
        <div className={`flex-1 h-1 rounded-full ${currentStep === 'email' ? 'bg-blue-600' : 'bg-blue-600'}`}></div>
        <div className={`flex-1 h-1 rounded-full ${currentStep === 'password' || currentStep === 'profile' ? 'bg-blue-600' : 'bg-neutral-200'}`}></div>
        <div className={`flex-1 h-1 rounded-full ${currentStep === 'profile' ? 'bg-blue-600' : 'bg-neutral-200'}`}></div>
      </div>

      {/* Email Step */}
      {currentStep === 'email' && (
        <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...emailForm.register('email', {
                required: 'Please enter your email address',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              })}
              className={`
                w-full px-4 py-3 border rounded-lg shadow-sm placeholder-neutral-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100
                ${emailForm.formState.errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-neutral-300'}
              `}
              placeholder="Your email address"
            />
            {emailForm.formState.errors.email && (
              <p className="mt-2 text-sm text-red-600">{emailForm.formState.errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue
          </button>

          {/* Social Login Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300 dark:border-neutral-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                  Or
                </span>
              </div>
            </div>

            <div className="mt-4">
              <SocialLoginButtons onSuccess={handleSocialLoginSuccess} />
            </div>
          </div>
        </form>
      )}

      {/* Password Step */}
      {currentStep === 'password' && (
        <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...passwordForm.register('password', {
                  required: 'Please enter a password',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain uppercase, lowercase letters and numbers',
                  },
                })}
                className={`
                  w-full px-4 py-3 pr-12 border rounded-lg shadow-sm placeholder-neutral-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100
                  ${passwordForm.formState.errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-neutral-300'}
                `}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-neutral-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-neutral-400" />
                )}
              </button>
            </div>
            {passwordForm.formState.errors.password && (
              <p className="mt-2 text-sm text-red-600">{passwordForm.formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...passwordForm.register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === passwordForm.watch('password') || 'Passwords do not match',
                })}
                className={`
                  w-full px-4 py-3 pr-12 border rounded-lg shadow-sm placeholder-neutral-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100
                  ${passwordForm.formState.errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-neutral-300'}
                `}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-neutral-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-neutral-400" />
                )}
              </button>
            </div>
            {passwordForm.formState.errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue
          </button>
        </form>
      )}

      {/* Profile Step */}
      {currentStep === 'profile' && (
        <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...profileForm.register('name', {
                required: 'Please enter your name',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
              className={`
                w-full px-4 py-3 border rounded-lg shadow-sm placeholder-neutral-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100
                ${profileForm.formState.errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-neutral-300'}
              `}
              placeholder="Enter your full name"
            />
            {profileForm.formState.errors.name && (
              <p className="mt-2 text-sm text-red-600">{profileForm.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Phone Number <span className="text-neutral-400">(Optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              {...profileForm.register('phone', {
                pattern: {
                  value: /^[+]?[\d\s\-\(\)]+$/,
                  message: 'Please enter a valid phone number',
                },
              })}
              className={`
                w-full px-4 py-3 border rounded-lg shadow-sm placeholder-neutral-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100
                ${profileForm.formState.errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-neutral-300'}
              `}
              placeholder="Enter your phone number"
            />
            {profileForm.formState.errors.phone && (
              <p className="mt-2 text-sm text-red-600">{profileForm.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start">
              <input
                id="agreeToTerms"
                type="checkbox"
                {...profileForm.register('agreeToTerms', {
                  required: 'Please agree to Terms of Service and Privacy Policy',
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded mt-0.5"
              />
              <label htmlFor="agreeToTerms" className="ml-3 block text-sm text-neutral-700 dark:text-neutral-300">
                I agree to the{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-500" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
              </label>
            </div>
            {profileForm.formState.errors.agreeToTerms && (
              <p className="text-sm text-red-600">{profileForm.formState.errors.agreeToTerms.message}</p>
            )}

            <div className="flex items-start">
              <input
                id="marketingConsent"
                type="checkbox"
                {...profileForm.register('marketingConsent')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded mt-0.5"
              />
              <label htmlFor="marketingConsent" className="ml-3 block text-sm text-neutral-700 dark:text-neutral-300">
                I would like to receive property recommendations and market updates
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${isLoading 
                ? 'bg-neutral-400 cursor-not-allowed text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
