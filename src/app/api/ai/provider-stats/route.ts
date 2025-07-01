import { NextResponse } from 'next/server';

// Types
type ProviderStatus = 'available' | 'limited' | 'exhausted' | 'error';

type ProviderStats = {
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

// Mock data store - in production this would be a database
let providerStats: ProviderStats[] = [
  { 
    provider: 'groq', 
    status: 'available', 
    dailyRequests: 1245, 
    dailyLimit: 30000,
    latency: 320, 
    successRate: 99.1,
    tokens: 42500,
    lastUsed: new Date().toISOString()
  },
  { 
    provider: 'together', 
    status: 'available', 
    dailyRequests: 534, 
    dailyLimit: null,
    latency: 580, 
    successRate: 98.4,
    tokens: 15200,
    lastUsed: new Date().toISOString()
  },
  { 
    provider: 'huggingface', 
    status: 'available', 
    dailyRequests: 198, 
    dailyLimit: 100000,
    latency: 1250, 
    successRate: 96.5,
    tokens: 7800,
    lastUsed: new Date().toISOString()
  },
  { 
    provider: 'google', 
    status: 'limited', 
    dailyRequests: 1490, 
    dailyLimit: 1500,
    latency: 410, 
    successRate: 99.3,
    tokens: 38200,
    lastUsed: new Date().toISOString()
  },
  { 
    provider: 'cohere', 
    status: 'available', 
    dailyRequests: 120, 
    dailyLimit: 1000,
    latency: 620, 
    successRate: 97.8,
    tokens: 4350,
    lastUsed: new Date().toISOString()
  },
  { 
    provider: 'ollama', 
    status: 'available', 
    dailyRequests: 75, 
    dailyLimit: null,
    latency: 850, 
    successRate: 96.2,
    tokens: 2800,
    lastUsed: new Date().toISOString()
  }
];

let switchEvents: SwitchEvent[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    fromProvider: null,
    toProvider: 'groq',
    reason: 'Initial selection',
    latency: 15,
    prompt: 'Generate a math problem'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 90000).toISOString(),
    fromProvider: 'google',
    toProvider: 'groq',
    reason: 'Rate limit exceeded',
    latency: 68,
    prompt: 'Create a short story'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    fromProvider: 'groq',
    toProvider: 'together',
    reason: 'Task type optimization',
    latency: 42,
    prompt: 'Generate creative content'
  }
];

// Update mock data to simulate changes
function updateMockData() {
  providerStats = providerStats.map(provider => ({
    ...provider,
    dailyRequests: provider.dailyRequests + Math.floor(Math.random() * 5),
    latency: provider.latency + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 10),
    tokens: provider.tokens + Math.floor(Math.random() * 100),
    lastUsed: Math.random() > 0.7 ? new Date().toISOString() : provider.lastUsed,
    // Update status based on limit proximity
    status: provider.dailyLimit && provider.dailyRequests > provider.dailyLimit * 0.9 
      ? 'limited' 
      : provider.dailyLimit && provider.dailyRequests >= provider.dailyLimit 
        ? 'exhausted' 
        : 'available'
  }));
}

// GET handler for provider statistics
export async function GET(request: Request) {
  // Parse the URL to get query parameters
  const { searchParams } = new URL(request.url);
  const dataType = searchParams.get('dataType') || 'all';
  
  // Simulate database/API updates by modifying our mock data
  updateMockData();
  
  // Determine what data to return based on the dataType parameter
  switch (dataType) {
    case 'providers':
      return NextResponse.json({ providers: providerStats });
    
    case 'events':
      return NextResponse.json({ events: switchEvents });
    
    case 'all':
    default:
      return NextResponse.json({ 
        providers: providerStats, 
        events: switchEvents,
        totalRequests: providerStats.reduce((sum, p) => sum + p.dailyRequests, 0),
        totalTokens: providerStats.reduce((sum, p) => sum + p.tokens, 0),
        lastUpdated: new Date().toISOString()
      });
  }
}

// POST handler to record a new provider switch event
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.toProvider || !data.prompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create a new event
    const newEvent: SwitchEvent = {
      id: (switchEvents.length + 1).toString(),
      timestamp: new Date().toISOString(),
      fromProvider: data.fromProvider || null,
      toProvider: data.toProvider,
      reason: data.reason || 'Manual selection',
      latency: data.latency || 0,
      prompt: data.prompt
    };
    
    // Add to events list
    switchEvents = [newEvent, ...switchEvents].slice(0, 100); // Keep only 100 most recent
    
    // Update provider stats
    const providerIndex = providerStats.findIndex(p => p.provider === data.toProvider);
    if (providerIndex >= 0) {
      providerStats[providerIndex] = {
        ...providerStats[providerIndex],
        dailyRequests: providerStats[providerIndex].dailyRequests + 1,
        tokens: providerStats[providerIndex].tokens + (data.tokens || 0),
        lastUsed: new Date().toISOString()
      };
    }
    
    return NextResponse.json({ success: true, event: newEvent });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 