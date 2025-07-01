'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, ImageIcon, UploadIcon, TestTube2Icon, PlayIcon } from 'lucide-react';

interface StorageTestResult {
  success: boolean;
  connection?: string;
  stats?: {
    generatedImages?: number;
    [key: string]: unknown;
  };
  cardImages?: number;
  buckets?: Record<string, unknown>;
  error?: string;
}

interface GenerationResult {
  cardId: string;
  cardName: string;
  success: boolean;
  imageUrl?: string;
  provider?: string;
  cached?: boolean;
  cost?: number;
  error?: string;
}

export default function StorageAdminPage() {
  const [storageStatus, setStorageStatus] = useState<StorageTestResult | null>(null);
  const [isTestingStorage, setIsTestingStorage] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [generationResults, setGenerationResults] = useState<GenerationResult[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Test storage connection on load
  useEffect(() => {
    testStorageConnection();
  }, []);

  const testStorageConnection = async () => {
    setIsTestingStorage(true);
    try {
      const response = await fetch('/api/test-storage');
      const result = await response.json();
      setStorageStatus(result);
    } catch (error) {
      setStorageStatus({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTestingStorage(false);
    }
  };

  const generateAllImages = async () => {
    setIsGeneratingImages(true);
    setGenerationResults([]);
    setGenerationProgress(0);

    try {
      const response = await fetch('/api/generate-card-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ generateAll: true })
      });

      const result = await response.json();
      
      if (result.success) {
        setGenerationResults(result.results || []);
        setGenerationProgress(100);
      } else {
        console.error('Generation failed:', result.error);
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const testImageUpload = async () => {
    try {
      const response = await fetch('/api/test-storage', {
        method: 'POST'
      });
      const result = await response.json();
      console.log('Upload test result:', result);
      
      // Refresh storage status after upload test
      await testStorageConnection();
    } catch (error) {
      console.error('Upload test error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/test-cards" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Volver a Test Cards</span>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🗄️ Storage & Image Generation Admin
            </h1>
            <div className="w-32" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Storage Status Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TestTube2Icon className="w-6 h-6" />
                Storage Connection Status
              </h2>
              <button
                onClick={testStorageConnection}
                disabled={isTestingStorage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {isTestingStorage ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {storageStatus && (
              <div className={`p-4 rounded-lg ${storageStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {storageStatus.success ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-green-600 text-xl">✅</span>
                      <span className="font-semibold text-green-800">Storage Connected Successfully</span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-700 mb-2">Bucket Status:</div>
                        <div className="space-y-1">
                          <div>📁 cards.images: <span className="text-green-600 font-medium">Available</span></div>
                          <div>📁 generated-images: <span className="text-gray-500">Checking...</span></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-700 mb-2">Statistics:</div>
                        <div className="space-y-1">
                          <div>Card Images: {storageStatus.cardImages || 0}</div>
                          <div>Generated Images: {storageStatus.stats?.generatedImages || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 text-xl">❌</span>
                    <span className="font-semibold text-red-800">Connection Failed: {storageStatus.error}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PlayIcon className="w-6 h-6" />
              Actions
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={testImageUpload}
                className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
              >
                <UploadIcon className="w-8 h-8 text-green-600 mb-2" />
                <div className="font-medium text-green-800">Test Upload</div>
                <div className="text-sm text-green-600">Test image upload functionality</div>
              </button>

              <button
                onClick={generateAllImages}
                disabled={isGeneratingImages || !storageStatus?.success}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors text-left"
              >
                <ImageIcon className="w-8 h-8 text-blue-600 mb-2" />
                <div className="font-medium text-blue-800">Generate All Images</div>
                <div className="text-sm text-blue-600">
                  {isGeneratingImages ? 'Generating...' : 'Generate images for all cards'}
                </div>
              </button>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 bg-gray-400 rounded mb-2 flex items-center justify-center">
                  <span className="text-white font-bold">?</span>
                </div>
                <div className="font-medium text-gray-800">More Actions</div>
                <div className="text-sm text-gray-600">Coming soon...</div>
              </div>
            </div>
          </div>
        </div>

        {/* Generation Results */}
        {(isGeneratingImages || generationResults.length > 0) && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-6 h-6" />
                Image Generation Results
              </h2>

              {isGeneratingImages && (
                <div className="mb-4">
                  <div className="flex items-center gap-3">
                    <div className="loading-spinner w-6 h-6"></div>
                    <span>Generating images... This may take several minutes.</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {generationResults.length > 0 && (
                <div className="space-y-3">
                  {generationResults.map((result, _index) => (
                    <div 
                      key={result.cardId}
                      className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{result.cardName}</div>
                          <div className="text-sm text-gray-600">
                            {result.success ? (
                              <>
                                ✅ Generated with {result.provider} 
                                {result.cached && ' (cached)'}
                                {result.cost && ` - $${result.cost}`}
                              </>
                            ) : (
                              <>❌ Failed: {result.error}</>
                            )}
                          </div>
                        </div>
                        {result.imageUrl && (
                          <div className="relative w-16 h-16">
                            <Image 
                              src={result.imageUrl} 
                              alt={result.cardName}
                              fill
                              className="object-cover rounded-lg"
                              sizes="64px"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-3">📋 Setup Instructions</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <div>1. ✅ <strong>Storage bucket created:</strong> cards.images bucket exists</div>
            <div>2. 🔄 <strong>Run SQL setup:</strong> Execute scripts/setup-supabase-storage.sql in Supabase SQL Editor</div>
            <div>3. 🔑 <strong>API Keys:</strong> Ensure HUGGINGFACE_API_KEY is configured in environment</div>
            <div>4. 🚀 <strong>Generate images:</strong> Click &quot;Generate All Images&quot; to create images for all cards</div>
          </div>
        </div>
      </main>
    </div>
  );
} 