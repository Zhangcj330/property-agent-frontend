'use client';

// User menu dropdown component

import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  HeartIcon, 
  ClockIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/types/auth';

interface UserMenuProps {
  user: UserProfile;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onSavedPropertiesClick?: () => void;
  onSearchHistoryClick?: () => void;
  onSecurityClick?: () => void;
}

export default function UserMenu({ 
  user,
  onProfileClick,
  onSettingsClick,
  onSavedPropertiesClick,
  onSearchHistoryClick,
  onSecurityClick
}: UserMenuProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'premium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            Premium Member
          </span>
        );
      case 'registered':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Registered User
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
          {/* User avatar */}
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
            {user.avatar ? (
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={user.avatar}
                alt={user.name}
              />
            ) : (
              getInitials(user.name)
            )}
          </div>
          
          {/* Username and dropdown arrow */}
          <div className="hidden md:flex items-center space-x-1">
            <span className="text-neutral-700 dark:text-neutral-300 font-medium">
              {user.name}
            </span>
            <ChevronDownIcon className="h-4 w-4 text-neutral-400" />
          </div>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Panel className="absolute right-0 mt-2 w-80 origin-top-right divide-y divide-neutral-100 dark:divide-neutral-700 rounded-md bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          {/* User info header */}
          <div className="px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {user.avatar ? (
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={user.avatar}
                    alt={user.name}
                  />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {user.name}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                  {user.email}
                </p>
                <div className="mt-1">
                  {getTierBadge(user.tier)}
                </div>
              </div>
            </div>
            
            {/* Email verification status */}
            {!user.emailVerified && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  Please verify your email address to get full functionality
                </p>
              </div>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onProfileClick}
                  className={`${
                    active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                  } group flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300`}
                >
                  <UserIcon className="mr-3 h-5 w-5 text-neutral-400 group-hover:text-neutral-500" />
                  Profile
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onSavedPropertiesClick}
                  className={`${
                    active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                  } group flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300`}
                >
                  <HeartIcon className="mr-3 h-5 w-5 text-neutral-400 group-hover:text-neutral-500" />
                  Saved Properties
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onSearchHistoryClick}
                  className={`${
                    active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                  } group flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300`}
                >
                  <ClockIcon className="mr-3 h-5 w-5 text-neutral-400 group-hover:text-neutral-500" />
                  Search History
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onSettingsClick}
                  className={`${
                    active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                  } group flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300`}
                >
                  <Cog6ToothIcon className="mr-3 h-5 w-5 text-neutral-400 group-hover:text-neutral-500" />
                  Preferences
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onSecurityClick}
                  className={`${
                    active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                  } group flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300`}
                >
                  <ShieldCheckIcon className="mr-3 h-5 w-5 text-neutral-400 group-hover:text-neutral-500" />
                  Account Security
                </button>
              )}
            </Menu.Item>
          </div>

          {/* Logout */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`${
                    active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                  } group flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300`}
                >
                  <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-neutral-400 group-hover:text-neutral-500" />
                  Sign Out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Panel>
      </Transition>
    </Menu>
  );
}
