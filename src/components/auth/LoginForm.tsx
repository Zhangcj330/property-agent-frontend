'use client';

// Login form component

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials } from '@/types/auth';

interface LoginFormProps {
  onSuccess?: () => void;
}

interface LoginFormData extends LoginCredentials {
  rememberMe: boolean;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });
      onSuccess?.();
    } catch (error: any) {
      // 根据错误类型设置具体的字段错误
      if (error.message.includes('email')) {
        setError('email', { message: error.message });
      } else if (error.message.includes('password')) {
        setError('password', { message: error.message });
      } else {
        setError('root', { message: error.message });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 邮箱输入 */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email', {
            required: 'Please enter email address',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Please enter a valid email address',
            },
          })}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm placeholder-neutral-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100
            ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-neutral-300'}
          `}
          placeholder="Enter your email address"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* 密码输入 */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            {...register('password', {
              required: 'Please enter password',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
            className={`
              w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-neutral-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100
              ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-neutral-300'}
            `}
            placeholder="Enter your password"
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-neutral-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-neutral-400" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* 记住我 & 忘记密码 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            {...register('rememberMe')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
            disabled={isLoading}
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300">
            Remember me
          </label>
        </div>
        <div className="text-sm">
          <a
            href="/forgot-password"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Forgot password?
          </a>
        </div>
      </div>

      {/* 表单错误 */}
      {errors.root && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
          {errors.root.message}
        </div>
      )}

      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${isLoading 
            ? 'bg-neutral-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
          }
        `}
      >
        {isLoading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </div>
        ) : (
          'Sign In'
        )}
      </button>

      {/* Magic Link 选项 */}
      <div className="text-center">
        <button
          type="button"
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          disabled={isLoading}
          onClick={() => {
            // TODO: 实现 Magic Link 登录
            console.log('Magic Link login not implemented yet');
          }}
        >
          Sign in with email link (no password required)
        </button>
      </div>
    </form>
  );
}
