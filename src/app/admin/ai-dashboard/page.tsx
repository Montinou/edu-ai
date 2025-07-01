import FreeSwitchingDashboard from '@/components/ai/FreeSwitchingDashboard';

export default function AIDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Provider Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor free AI provider usage, performance metrics, and switching events
          </p>
        </div>
      </header>
      
      <main className="py-6">
        <FreeSwitchingDashboard />
      </main>
      
      <footer className="bg-white border-t mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            Free AI Provider Smart Switching System Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
} 