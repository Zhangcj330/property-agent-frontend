'use client';

// Authentication button component - displays different buttons based on user status

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';

interface AuthButtonProps {
  className?: string;
}

export default function AuthButton({ className = '' }: AuthButtonProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const router = useRouter();

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleRegisterClick = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleModalClose = () => {
    setShowAuthModal(false);
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  const handleSavedPropertiesClick = () => {
    router.push('/saved-properties');
  };

  const handleSearchHistoryClick = () => {
    router.push('/search-history');
  };

  const handleSecurityClick = () => {
    router.push('/settings/security');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse bg-neutral-200 dark:bg-neutral-700 h-8 w-20 rounded"></div>
      </div>
    );
  }

  // Authenticated user - show user menu
  if (isAuthenticated && user) {
    return (
      <>
        <UserMenu
          user={user}
          onProfileClick={handleProfileClick}
          onSettingsClick={handleSettingsClick}
          onSavedPropertiesClick={handleSavedPropertiesClick}
          onSearchHistoryClick={handleSearchHistoryClick}
          onSecurityClick={handleSecurityClick}
        />
      </>
    );
  }

  // Unauthenticated user - show login/register buttons
  return (
    <>
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={handleLoginClick}
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 px-3 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Sign In
        </button>
        <button
          onClick={handleRegisterClick}
          className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Sign Up
        </button>
      </div>

      {/* Authentication modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleModalClose}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
