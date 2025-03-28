'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Encode the search query for URL
    const encodedQuery = encodeURIComponent(searchQuery);
    router.push(`/chat?initial_message=${encodedQuery}`);
  };

  console.log('Rendering with state:', { searchQuery });

  return (
    <div>
      {/* Hero Section - Enhanced with premium gradients and textures */}
      <section className="relative overflow-hidden bg-premium-slate text-white">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 z-0 texture-overlay opacity-30"></div>
        
        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#32363F] rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-60 -left-20 w-72 h-72 bg-[#3E4250] rounded-full blur-3xl opacity-20"></div>
        
        {/* Background image with positioning to hide watermark */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/backgrounds/background-blue.png"
            alt="Modern background"
            fill
            priority
            style={{ 
              objectFit: 'cover',
              objectPosition: 'center top',
              transform: 'scale(1.05)',
              mixBlendMode: 'soft-light'
            }}
            className="opacity-30"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl glass-card p-8 md:p-10">
            <div className="mb-6 inline-block text-gradient-light font-medium tracking-wide">
              INTELLIGENT PROPERTY SEARCH
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient-light">
              Find Your Dream Home with AI Assistance
            </h1>
            <p className="text-xl mb-10 text-neutral-200 leading-relaxed">
              Our intelligent property agent helps you discover the perfect property match through personalized conversations.
            </p>

            {/* Chat Input Section */}
            <form onSubmit={handleSearch} className="relative">
              <div className="relative flex items-center group">
                {/* Enhanced input container with premium glass effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.12] to-white/[0.08] rounded-2xl" style={{ zIndex: 1 }}></div>
                <div className="absolute inset-0 backdrop-blur-md rounded-2xl border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.2)]" style={{ zIndex: 2 }}></div>
                
                {/* AI Icon with enhanced styling */}
                <div className="absolute left-5 top-1/2 -translate-y-1/2" style={{ zIndex: 3 }}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#32363F] to-[#1A1C22] flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                    </svg>
                  </div>
                </div>

                {/* Enhanced input field */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    console.log('Input changed:', { value });
                    setSearchQuery(value);
                  }}
                  placeholder="Tell me about your dream home..."
                  className="w-full pl-20 pr-36 py-6 bg-transparent text-white placeholder-white/50 text-lg focus:outline-none relative z-10 [-webkit-font-smoothing:antialiased]"
                  style={{ zIndex: 3 }}
                  aria-label="Property search input"
                  role="textbox"
                  aria-haspopup="dialog"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSearch(e);
                    }
                  }}
                />

                {/* Send button with premium design */}
                <div 
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2"
                  style={{ zIndex: 10 }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      console.log('Button clicked:', { searchQuery });
                      e.preventDefault();
                      e.stopPropagation();
                      handleSearch(e);
                    }}
                    className={`
                      px-6 py-3 
                      bg-gradient-to-b from-[#ffffff] to-[#f5f5f5] 
                      text-[#1a1c20] text-base font-medium 
                      rounded-xl flex items-center gap-2 
                      transition-all duration-200
                      relative
                      ${searchQuery 
                        ? 'hover:from-[#f8f8f8] hover:to-[#efefef] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:translate-y-[-2px] shadow-[0_0_20px_rgba(255,255,255,0.12)] cursor-pointer'
                        : 'opacity-50'
                      }
                    `}
                    style={{ 
                      zIndex: 20,
                      pointerEvents: 'auto'
                    }}
                  >
                    <span className={`transition-transform duration-200 ${searchQuery ? 'group-hover:scale-105' : ''}`}>
                      Send
                    </span>
                    <PaperAirplaneIcon className={`w-4 h-4 transform rotate-90 transition-transform duration-200 ${searchQuery ? 'group-hover:scale-105' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl"></div>
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl"></div>
            </form>
          </div>
        </div>
        
        {/* Bottom fade effect - softer gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#f8f9fc]/40 dark:from-[#21242c]/40 to-transparent"></div>
      </section>

      {/* Features Section - Enhanced with subtle gradients */}
      <section className="py-20 bg-premium-light dark:bg-premium-slate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="inline-block mb-2 text-sm font-medium text-neutral-500 tracking-wide">HOW IT WORKS</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-dark dark:text-gradient-light">Effortless Property Discovery</h2>
            <div className="mt-4 w-32 h-1 mx-auto bg-gradient-to-r from-black to-neutral-400 dark:from-white dark:to-neutral-600"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-white dark:bg-gradient-to-br dark:from-[#2a2d35] dark:to-[#1A1C22] rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px]">
              <div className="w-16 h-16 mb-6 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-[#32363F] dark:to-[#272A32] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-black dark:text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gradient-dark dark:text-gradient-light">Chat with Our AI</h3>
              <p className="text-neutral-600 dark:text-neutral-300">Tell us your preferences and requirements through a natural conversation with our intelligent assistant.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="group p-8 bg-white dark:bg-gradient-to-br dark:from-[#2a2d35] dark:to-[#1A1C22] rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px]">
              <div className="w-16 h-16 mb-6 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-[#32363F] dark:to-[#272A32] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-black dark:text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gradient-dark dark:text-gradient-light">Get Recommendations</h3>
              <p className="text-neutral-600 dark:text-neutral-300">Receive personalized property recommendations based on your specific needs and preferences.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="group p-8 bg-white dark:bg-gradient-to-br dark:from-[#2a2d35] dark:to-[#1A1C22] rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px]">
              <div className="w-16 h-16 mb-6 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-[#32363F] dark:to-[#272A32] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-black dark:text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gradient-dark dark:text-gradient-light">Save & Refine</h3>
              <p className="text-neutral-600 dark:text-neutral-300">Like properties to save them, and provide feedback to continuously improve your recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced with luxury space black gradients */}
      <section className="py-24 relative overflow-hidden">
        {/* Premium space black background with metallic texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1c20] via-[#1c1e22] to-[#1e2024] texture-overlay opacity-95"></div>
        
        {/* Subtle metallic light effects */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#2a2d31]/20 to-[#2d3035]/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#32353a]/15 to-[#2d3035]/15 rounded-full blur-3xl"></div>
        
        {/* Additional metallic sheen */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#2a2d31]/5 to-transparent"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 glass-card backdrop-blur-md bg-[#20232680]/5 border-[#ffffff0d]">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#ffffff] via-[#ffffffeb] to-[#989898] [-webkit-font-smoothing:antialiased]">Ready to Find Your Perfect Home?</h2>
            <p className="text-xl mb-10 max-w-3xl mx-auto leading-relaxed bg-clip-text text-transparent bg-gradient-to-r from-[#ffffffcc] via-[#ffffff99] to-[#ffffff80] [-webkit-font-smoothing:antialiased]">Our AI-powered chat assistant is ready to help you discover properties that match your exact needs and preferences.</p>
            <Link 
              href="/chat" 
              className="inline-block px-8 py-4 bg-gradient-to-b from-[#ffffff] to-[#f5f5f5] text-[#1a1c20] text-lg font-medium rounded-full hover:from-[#f8f8f8] hover:to-[#efefef] transition-all shadow-[0_0_20px_rgba(255,255,255,0.12)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:translate-y-[-2px] [-webkit-font-smoothing:antialiased]"
            >
              Start Your Property Search
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
