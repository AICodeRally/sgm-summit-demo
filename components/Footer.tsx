'use client';

export function Footer() {
  return (
    <footer className="bg-white shadow-sm border-t-4 border-transparent fixed bottom-0 left-0 right-0 z-40" style={{
      borderImage: 'linear-gradient(to right, rgb(37, 99, 235), rgb(147, 51, 234)) 1'
    }}>
      <div className="w-full px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Left side - OpsChief Label - positioned near the orb */}
          <div className="text-xs text-gray-600" style={{ marginLeft: '4.5rem' }}>
            <p className="font-semibold">OpsChief</p>
            <p>System Health</p>
          </div>

          {/* Center - Footer Info */}
          <div className="text-center flex-1 mx-8">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
                <span>© 2026 BHG Consulting</span>
                <span>•</span>
                <a href="#" className="hover:text-purple-600 transition-colors">Privacy</a>
                <span>•</span>
                <a href="#" className="hover:text-purple-600 transition-colors">Terms</a>
                <span>•</span>
                <a href="#" className="hover:text-purple-600 transition-colors">Support</a>
              </div>
              <div className="text-xs">
                <span className="text-gray-500">Powered by </span>
                <span className="font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                  AICR
                </span>
                <span className="text-gray-400 ml-1">• SPARCC</span>
              </div>
            </div>
          </div>

          {/* Right side - AskSGM Label - positioned near the orb */}
          <div className="text-xs text-gray-600 text-right" style={{ marginRight: '4.5rem' }}>
            <p className="font-semibold">AskSGM</p>
            <p>AI Assistant</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
