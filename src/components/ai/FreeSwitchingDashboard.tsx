'use client';

import { useState, useEffect } from 'react';

// Types for dashboard
type ProviderStatus = 'available' | 'limited' | 'exhausted' | 'error';

type ProviderMetrics = {
  provider: string;
  status: ProviderStatus;
  dailyRequests: number;
  dailyLimit: number | null;
  latency: number;
  successRate: number;
  tokens: number;
  lastUsed: string;
};

type SwitchEvent = {
  id: string;
  timestamp: string;
  fromProvider: string | null;
  toProvider: string;
  reason: string;
  latency: number;
  prompt: string;
};

type TestResult = {
  text?: string;
  provider?: string;
  model?: string;
  latency?: number;
  estimatedTokens?: number;
  error?: string;
};

export default function FreeSwitchingDashboard() {
  const [providers, setProviders] = useState<ProviderMetrics[]>([]);
  const [switchEvents, setSwitchEvents] = useState<SwitchEvent[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testPrompt, setTestPrompt] = useState('');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    // Fetch initial data
    fetchData();
    
    // Refresh data periodically
    const interval = setInterval(() => {
      fetchData(false); // Silent refresh
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchData = async (showLoading = true) => {
    if (showLoading) setIsRefreshing(true);
    
    try {
      const response = await fetch('/api/ai/provider-stats');
      const data = await response.json();
      
      setProviders(data.providers || []);
      setSwitchEvents(data.events || []);
      setTotalRequests(data.totalRequests || 0);
      setTotalTokens(data.totalTokens || 0);
      setLastUpdated(data.lastUpdated || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  };
  
  const refreshData = () => {
    fetchData(true);
  };
  
  const runTestGeneration = async () => {
    if (!testPrompt) return;
    
    setTestLoading(true);
    setTestResult(null);
    
    try {
      // In a real implementation, this would call the actual AI endpoint
      // For now, we'll simulate with our stats API
      const mockProvider = providers[Math.floor(Math.random() * providers.length)].provider;
      const estimatedTokens = Math.floor(testPrompt.length / 4) + Math.floor(Math.random() * 100);
      const latency = Math.floor(Math.random() * 500) + 300;
      
      // Record the event via API
      await fetch('/api/ai/provider-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromProvider: null,
          toProvider: mockProvider,
          reason: 'Test generation',
          latency,
          prompt: testPrompt,
          tokens: estimatedTokens
        }),
      });
      
      // Simulate result
      const result = {
        text: `This is a simulated response to: "${testPrompt}"`,
        provider: mockProvider,
        model: `${mockProvider}-model`,
        latency,
        estimatedTokens
      };
      
      setTestResult(result);
      
      // Refresh data to see the new event
      fetchData(false);
      
    } catch (error) {
      console.error('Error running test:', error);
      setTestResult({ error: "Generation failed" });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Free AI Provider Dashboard</h1>
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Total Requests Today: {totalRequests.toLocaleString()} | 
            Total Tokens: {totalTokens.toLocaleString()} | 
            Last Updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}
          </p>
          <button 
            onClick={refreshData}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>
      
      {/* Provider Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {providers.map(provider => (
          <div key={provider.provider} className="border rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{provider.provider}</h3>
              <ProviderStatusBadge status={provider.status} />
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-500">Daily Requests</div>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ 
                        width: provider.dailyLimit 
                          ? `${Math.min(100, (provider.dailyRequests / provider.dailyLimit) * 100)}%` 
                          : '10%' 
                      }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm">
                    {provider.dailyRequests.toLocaleString()}{provider.dailyLimit ? `/${provider.dailyLimit.toLocaleString()}` : ''}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm text-gray-500">Latency</div>
                  <div>{provider.latency} ms</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                  <div>{provider.successRate}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Tokens</div>
                  <div>{provider.tokens.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Last Used</div>
                  <div title={provider.lastUsed}>
                    {new Date(provider.lastUsed).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Test Generation */}
      <div className="mb-8 border rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Test Generation</h2>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            placeholder="Enter a prompt to test smart switching"
            className="flex-1 border rounded px-3 py-2"
          />
          <button
            onClick={runTestGeneration}
            disabled={testLoading || !testPrompt}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
          >
            {testLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        
        {testResult && (
          <div className="border rounded p-4 bg-gray-50">
            {testResult.error ? (
              <div className="text-red-500">{testResult.error}</div>
            ) : (
              <>
                <div className="mb-2">
                  <span className="font-semibold">Provider:</span> {testResult.provider} ({testResult.model})
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Latency:</span> {testResult.latency}ms | 
                  <span className="font-semibold ml-2">Tokens:</span> {testResult.estimatedTokens}
                </div>
                <div>
                  <span className="font-semibold">Response:</span>
                  <div className="mt-1 p-2 bg-white border rounded">{testResult.text}</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Switching Events */}
      <div className="border rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Recent Switching Events</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From → To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {switchEvents.length > 0 ? (
                switchEvents.map(event => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {event.fromProvider ? (
                        <span>
                          {event.fromProvider} → <span className="font-medium text-green-600">{event.toProvider}</span>
                        </span>
                      ) : (
                        <span className="font-medium text-green-600">{event.toProvider}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.latency}ms
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                      {event.prompt}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No switching events recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Provider status badge component
function ProviderStatusBadge({ status }: { status: ProviderStatus }) {
  const getStatusInfo = () => {
    switch (status) {
      case 'available':
        return { color: 'bg-green-100 text-green-800', text: 'Available' };
      case 'limited':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Limited' };
      case 'exhausted':
        return { color: 'bg-red-100 text-red-800', text: 'Exhausted' };
      case 'error':
        return { color: 'bg-gray-100 text-gray-800', text: 'Error' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'Unknown' };
    }
  };
  
  const { color, text } = getStatusInfo();
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {text}
    </span>
  );
} 