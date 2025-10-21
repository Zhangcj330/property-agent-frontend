'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, HomeIcon, ChatBubbleLeftRightIcon, HeartIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import AuthButton from '@/components/auth/AuthButton';

const navItems = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Saved Properties', href: '/saved-properties', icon: HeartIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon, requireAuth: true },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // 过滤导航项目 - 根据认证状态显示
  const filteredNavItems = navItems.filter(item => {
    if (item.requireAuth && !isAuthenticated) {
      return false;
    }
    return true;
  });

  return (
    <nav className="bg-white/90 dark:bg-black/90 border-b border-neutral-100 dark:border-neutral-800 shadow-sm backdrop-blur-xl backdrop-saturate-150 sticky top-0 z-20">
      <div className="absolute inset-0 z-0 texture-overlay opacity-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-black dark:text-white font-bold text-xl flex items-center gap-2">
                <Image
                  src="/property agent logo.png"
                  alt="Dataly Logo"
                  width={128}
                  height={128}
                  className="w-24 h-24 object-contain pt-1"
                />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-black to-neutral-700 dark:from-white dark:to-neutral-400"></span>
              </Link>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'border-black text-black dark:border-white dark:text-white'
                      : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-1.5 transition-transform group-hover:scale-110 ${isActive ? 'text-black dark:text-white' : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'}`} />
                  {item.name}
                </Link>
              );
            })}
            
            {/* 认证按钮 */}
            <AuthButton />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden relative z-10`}>
        <div className="pt-2 pb-3 space-y-1 bg-white/95 dark:bg-black/95 backdrop-blur-xl">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-3 text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-neutral-50 dark:bg-neutral-800/80 text-black dark:text-white border-l-4 border-black dark:border-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 hover:border-l-4 hover:border-neutral-300'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-black dark:text-white' : 'text-neutral-400'}`} />
                {item.name}
              </Link>
            );
          })}
          
          {/* 移动端认证按钮 */}
          <div className="px-3 py-3 border-t border-neutral-200 dark:border-neutral-700">
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}