export default function Loading() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f8f8f8] overflow-hidden">
      {/* Chat Header */}
      <header className="bg-white/70 backdrop-blur-xl py-4 px-4 sm:py-5 sm:px-5 sticky top-0 z-10 border-b border-gray-100/50 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
            </div>
            <div>
              <h1 className="font-medium text-base sm:text-lg text-gray-900">Property Assistant</h1>
              <p className="text-xs text-gray-500 font-medium">Online • Replies instantly</p>
            </div>
          </div>
          {/* Add New Chat Button and Feedback Button */}
          <div className="flex space-x-2 sm:space-x-3 mt-3 sm:mt-0">
            <div className="flex-1 sm:flex-auto h-9 sm:h-10 bg-gray-100 rounded-full animate-pulse"></div>
            <div className="flex-1 sm:flex-auto h-9 sm:h-10 bg-gray-100 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 sm:px-8 overflow-hidden">
        <div className="overflow-y-auto flex-1 scroll-smooth px-1 sm:px-3 pt-4 sm:pt-6 pb-2">
          {/* Loading placeholders for messages */}
          <div className="space-y-4 sm:space-y-7">
            {/* User message placeholder */}
            <div className="flex justify-end mb-4 sm:mb-7">
              <div className="flex items-start max-w-[85%] sm:max-w-[75%] space-x-2 sm:space-x-3">
                <div className="chat-bubble rounded-[16px] sm:rounded-[18px] py-7 sm:py-10 px-3.5 sm:px-4 w-[180px] sm:w-[250px] bg-gradient-to-br from-gray-800 to-black shadow-[0_2px_15px_rgba(0,0,0,0.2)] animate-pulse"></div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex-shrink-0 bg-gray-200 animate-pulse"></div>
              </div>
            </div>

            {/* Assistant message placeholder */}
            <div className="flex justify-start mb-4 sm:mb-7">
              <div className="flex items-start max-w-[85%] sm:max-w-[75%] space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-200 flex-shrink-0 animate-pulse"></div>
                <div className="chat-bubble rounded-[16px] sm:rounded-[18px] py-7 sm:py-10 px-3.5 sm:px-4 w-[220px] sm:w-[300px] bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)] animate-pulse"></div>
              </div>
            </div>
            
            {/* Assistant message loading indicator */}
            <div className="flex justify-start">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-gray-800 to-black flex-shrink-0 flex items-center justify-center text-white mr-2 sm:mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
              </div>
              <div className="bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)] rounded-[16px] sm:rounded-[18px] py-3 sm:py-3.5 px-4 sm:px-5 min-w-[60px] sm:min-w-[70px] flex items-center justify-center">
                <div className="flex space-x-1.5 sm:space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Input Bar */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-xl py-3 sm:py-5 px-4 sm:px-8 border-t border-gray-100/40 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end rounded-[16px] sm:rounded-[18px] bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="flex-1 py-3 sm:py-3.5 px-3.5 sm:px-4 h-10 sm:h-11 bg-white"></div>
            <div className="p-3 sm:p-3.5 mr-1 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 