'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  preferredLocation: string;
  budget: string;
  propertyType: string;
  minBedrooms: string;
  notifications: boolean;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Default values for the form
  const defaultValues: ProfileFormData = {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '(555) 123-4567',
    preferredLocation: 'Downtown',
    budget: '$2,000 - $3,500',
    propertyType: 'Apartment',
    minBedrooms: '2',
    notifications: true,
  };
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues,
  });
  
  const onSubmit: SubmitHandler<ProfileFormData> = (data) => {
    // In a real app, this would save to a backend
    console.log('Saving profile data:', data);
    
    // Show success message briefly
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    
    // Exit edit mode
    setIsEditing(false);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    reset(defaultValues);
    setIsEditing(false);
  };
  
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {!isEditing && (
          <button onClick={handleEdit} className="btn btn-primary">
            Edit Profile
          </button>
        )}
      </div>
      
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            Profile updated successfully!
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-3">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required' })}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md"
                    />
                  ) : (
                    <p className="py-2">{defaultValues.name}</p>
                  )}
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md"
                    />
                  ) : (
                    <p className="py-2">{defaultValues.email}</p>
                  )}
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md"
                    />
                  ) : (
                    <p className="py-2">{defaultValues.phone}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Property Preferences */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-3 mt-4">Property Preferences</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Preferred Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      {...register('preferredLocation')}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md"
                    />
                  ) : (
                    <p className="py-2">{defaultValues.preferredLocation}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Budget Range
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      {...register('budget')}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md"
                    />
                  ) : (
                    <p className="py-2">{defaultValues.budget}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Property Type
                  </label>
                  {isEditing ? (
                    <select
                      {...register('propertyType')}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md"
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Condo">Condo</option>
                      <option value="Townhouse">Townhouse</option>
                    </select>
                  ) : (
                    <p className="py-2">{defaultValues.propertyType}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Minimum Bedrooms
                  </label>
                  {isEditing ? (
                    <select
                      {...register('minBedrooms')}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4+</option>
                    </select>
                  ) : (
                    <p className="py-2">{defaultValues.minBedrooms}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Notification Preferences */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-3 mt-4">Notification Preferences</h2>
              <div className="flex items-center">
                {isEditing ? (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('notifications')}
                      className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    />
                    <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                      Receive notifications for new property recommendations
                    </span>
                  </label>
                ) : (
                  <p className="py-2">
                    {defaultValues.notifications ? 'Enabled' : 'Disabled'}: Notifications for new property recommendations
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          {isEditing && (
            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="btn bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 