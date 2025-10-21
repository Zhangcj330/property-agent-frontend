'use client';

// Unified authentication modal component - includes login and registration functionality

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from './LoginForm';
import StepwiseRegisterForm from './StepwiseRegisterForm';
import SocialLoginButtons from './SocialLoginButtons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  onSuccess
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  const { isAuthenticated, error: authError, clearError } = useAuth();

  // 认证成功后关闭弹窗
  useEffect(() => {
    if (isAuthenticated) {
      onSuccess?.();
      onClose();
    }
  }, [isAuthenticated, onSuccess, onClose]);

  // 当 initialMode 变化时更新 mode（仅在模态框打开时）
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // 重置状态当弹窗关闭时
  useEffect(() => {
    if (!isOpen) {
      clearError();
    }
  }, [isOpen, clearError]);

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    clearError();
  };

  const handleSocialLoginSuccess = () => {
    onSuccess?.();
    onClose();
  };

  // 当模态框关闭时，延迟重置状态以确保动画完成
  const handleClose = () => {
    onClose();
    // 延迟重置状态，避免在关闭动画期间重置
    setTimeout(() => {
      setMode(initialMode);
    }, 300); // 匹配 Transition 的持续时间
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-neutral-900 dark:text-neutral-100"
                  >
                    {mode === 'login' && 'Sign In'}
                    {mode === 'register' && 'Create Account'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Error Display */}
                {authError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                    {authError}
                  </div>
                )}

                {/* Content */}
                <div className="space-y-4">
                  {mode === 'login' && (
                    <>
                      <LoginForm onSuccess={handleSocialLoginSuccess} />
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-neutral-300 dark:border-neutral-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white dark:bg-neutral-800 text-neutral-500">
                            Or
                          </span>
                        </div>
                      </div>

                      <SocialLoginButtons onSuccess={handleSocialLoginSuccess} />

                      <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                        Don&apos;t have an account?{' '}
                        <button
                          type="button"
                          onClick={() => handleModeSwitch('register')}
                          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                        >
                          Sign up now
                        </button>
                      </div>
                    </>
                  )}

                  {mode === 'register' && (
                    <>
                      <StepwiseRegisterForm onSuccess={handleSocialLoginSuccess} />
                      
                      <div className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-4">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => handleModeSwitch('login')}
                          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                        >
                          Sign in now
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 text-xs text-center text-neutral-500 dark:text-neutral-400">
                  By continuing, you agree to our{' '}
                  <a href="/terms" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </a>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
