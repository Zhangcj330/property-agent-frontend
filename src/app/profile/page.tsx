'use client';

import { Suspense } from 'react';
import ProfileForm from './ProfileForm';

// Create a loading component
const Loading = () => (
  <div className="container mx-auto max-w-3xl px-4 py-8">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">My Profile</h1>
    </div>
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    </div>
  </div>
);

export default function ProfilePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfileForm />
    </Suspense>
  );
} 