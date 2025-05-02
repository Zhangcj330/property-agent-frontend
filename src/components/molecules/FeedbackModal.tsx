'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';

// API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// 支持的图片类型
const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "JPEG",
  "image/jpg": "JPEG", 
  "image/png": "PNG",
  "image/gif": "GIF",
  "image/webp": "WebP"
};

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
}

// S3预签名URL响应接口
interface PresignedUrlResponse {
  url: string;           // S3上传端点URL
  fields: Record<string, string>; // 上传表单需要的字段
  image_key: string;     // 图片在S3的路径键值
}

export default function FeedbackModal({ isOpen, onClose, sessionId }: FeedbackModalProps) {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type - 检查是否为支持的图片类型
      if (!Object.keys(ALLOWED_IMAGE_TYPES).includes(file.type)) {
        setError('Please upload a supported image format (JPEG, PNG, GIF, WebP)');
        return;
      }
      
      // Validate file size (10MB max) - 与后端限制保持一致
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }
      
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const clearScreenshot = () => {
    setScreenshotPreview(null);
    setScreenshotFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 获取S3预签名上传URL
  const getPresignedUrl = async (): Promise<PresignedUrlResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/feedback/upload-url`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }
    
    return await response.json();
  };
  
  // 上传图片到S3
  const uploadToS3 = async (presignedData: PresignedUrlResponse, file: File): Promise<string> => {
    // 创建FormData对象用于上传
    const formData = new FormData();
    
    // 添加S3需要的所有字段
    Object.entries(presignedData.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // 添加文件作为最后一个字段
    formData.append('file', file);
    
    // 直接上传到S3
    console.log('Uploading to S3...');
    console.log('Upload URL:', presignedData.url);
    console.log('Form data fields:', presignedData.fields);
    
    const response = await fetch(presignedData.url, {
      method: 'POST',
      body: formData,
      mode: 'cors', // 明确指定cors模式
      // 不要设置Content-Type，让浏览器自动设置multipart/form-data及其boundary
    });
    
    if (!response.ok) {
      // 如果状态码不是2xx，记录详细错误
      console.error('S3 upload failed with status:', response.status);
      const responseText = await response.text();
      console.error('S3 error response:', responseText);
      throw new Error(`Failed to upload screenshot: ${response.status}`);
    }
    
    // 返回image_key
    return presignedData.image_key;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackText.trim()) {
      setError('Please enter your feedback');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      let imageKey = null;
      
      // 如果有截图，先上传
      if (screenshotFile) {
        try {
          // 1. 获取S3预签名上传URL
          const presignedData = await getPresignedUrl();
          
          // 2. 上传图片到S3
          imageKey = await uploadToS3(presignedData, screenshotFile);
          
        } catch (err) {
          console.error('Error uploading screenshot:', err);
          // 如果图片上传失败，我们仍然继续提交反馈，但不包括图片
        }
      }
      
      // 3. 提交反馈信息
      const feedbackData = {
        feedback_text: feedbackText,
        feedback_type: feedbackType,
        session_id: sessionId,
        image_key: imageKey, // 直接传递image_key而不是完整URL
      };
      
      const response = await fetch(`${API_BASE_URL}/api/v1/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit feedback: ${response.statusText}`);
      }
      
      setSuccess(true);
      setFeedbackText('');
      setFeedbackType('general');
      clearScreenshot();
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Share Your Feedback</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {success ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600">Your feedback has been submitted successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Type</label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="usability">Usability Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Please share your thoughts, experiences, or issues..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
              />
            </div>
            
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Screenshot (Optional)</label>
              
              {screenshotPreview ? (
                <div className="relative mb-3 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="relative w-full h-48">
                    <Image 
                      src={screenshotPreview} 
                      alt="Screenshot preview" 
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={clearScreenshot}
                    className="absolute top-2 right-2 p-1 bg-gray-800/70 rounded-full text-white hover:bg-gray-800 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto mb-2 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="text-sm text-gray-500">Click to upload a screenshot</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WebP up to 10MB</p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleScreenshotChange}
                className="hidden"
              />
            </div>
            
            {error && (
              <div className="mb-5 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 