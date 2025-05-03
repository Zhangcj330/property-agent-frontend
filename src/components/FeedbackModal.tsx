import React, { useState, useRef, useMemo, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhotoIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { ChangeEvent, FormEvent } from 'react';
import { uniqueId } from 'lodash';

export default function FeedbackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const titleId = useMemo(() => uniqueId('feedback-modal-title-'), []);
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Filter to only allow images
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    
    setFiles(prevFiles => [...prevFiles, ...imageFiles]);
    
    // Create URL previews for the images
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
  };
  
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    
    // Also remove the preview and revoke the object URL to avoid memory leaks
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
      setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!text.trim() && files.length === 0) {
      return;
    }
    
    setIsSubmitting(true);
    setFeedbackStatus('idle');
    
    try {
      // Upload images to S3 if there are any
      let uploadedImageUrls: string[] = [];
      
      if (files.length > 0) {
        const imageUploadPromises = files.map(async (file) => {
          try {
            const fileName = `feedback/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            
            // Get the S3 presigned URL
            const s3PresignResponse = await fetch('/api/v1/feedback/get-upload-url', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fileName,
                fileType: file.type,
              }),
            });
            
            if (!s3PresignResponse.ok) {
              throw new Error('Failed to get upload URL');
            }
            
            const { uploadUrl, fileUrl } = await s3PresignResponse.json();
            
            // Upload directly to S3
            const uploadResponse = await fetch(uploadUrl, {
              method: 'PUT',
              body: file,
              headers: {
                'Content-Type': file.type,
              },
            });
            
            if (!uploadResponse.ok) {
              throw new Error('Failed to upload file to S3');
            }
            
            return fileUrl;
          } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
          }
        });
        
        uploadedImageUrls = await Promise.all(imageUploadPromises);
      }
      
      // Submit the feedback with image URLs
      const feedbackResponse = await fetch('/api/v1/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          images: uploadedImageUrls,
        }),
      });
      
      if (!feedbackResponse.ok) {
        throw new Error('Failed to submit feedback');
      }
      
      // Reset form and show success state
      setText('');
      setFiles([]);
      setImagePreviews([]);
      setFeedbackStatus('success');
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        setFeedbackStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFeedbackStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    // Clean up any object URLs to avoid memory leaks
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    setImagePreviews([]);
    setFiles([]);
    setText('');
    setFeedbackStatus('idle');
    onClose();
  };
  
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Focus the textarea when modal opens
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
    
    return () => {
      // Clean up any object URLs when component unmounts
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [isOpen, imagePreviews]);

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
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white p-4 sm:p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <Dialog.Title
                    id={titleId}
                    as="h3"
                    className="text-base sm:text-lg font-semibold leading-6 text-gray-900"
                  >
                    Send Feedback
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-full p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3 sm:mb-4">
                    <label htmlFor="feedback-text" className="block text-sm font-medium text-gray-700 mb-1">
                      Your feedback
                    </label>
                    <textarea
                      id="feedback-text"
                      ref={textareaRef}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Tell us what you think or report an issue..."
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 text-sm sm:text-base"
                      rows={4}
                    />
                  </div>
                  
                  {imagePreviews.length > 0 && (
                    <div className="mb-3 sm:mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attached screenshots
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative rounded-md overflow-hidden h-[80px] sm:h-[100px] border border-gray-200 group">
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute top-0.5 right-0.5 bg-white/90 rounded-full p-0.5 text-gray-500 hover:text-gray-700 transition-opacity group-hover:opacity-100 opacity-60"
                            >
                              <XMarkIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4 sm:mb-5">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleUploadClick}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <PhotoIcon className="h-4 w-4 mr-1.5" />
                        Add screenshot
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        multiple
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || (!text.trim() && files.length === 0)}
                      className={`inline-flex justify-center rounded-full px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 ${
                        isSubmitting || (!text.trim() && files.length === 0)
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        'Send feedback'
                      )}
                    </button>
                  </div>
                </form>
                
                {/* Success/Error notification */}
                <Transition
                  show={feedbackStatus !== 'idle'}
                  enter="transition-opacity duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition-opacity duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className={`mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg text-sm ${
                    feedbackStatus === 'success' 
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {feedbackStatus === 'success' ? (
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                        <span>Feedback submitted successfully!</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1.5" />
                        <span>Failed to submit feedback. Please try again.</span>
                      </div>
                    )}
                  </div>
                </Transition>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 