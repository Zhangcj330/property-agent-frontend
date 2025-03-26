'use client';

import { usePathname } from "next/navigation";

export default function ClientFooter() {
  const pathname = usePathname();
  
  // Hide footer on chat page
  if (pathname === '/chat') {
    return null;
  }
  
  return (
    <footer className="bg-neutral-800 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center">© {new Date().getFullYear()} Property Agent. All rights reserved.</p>
      </div>
    </footer>
  );
} 