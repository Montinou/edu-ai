import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/lib/services/supabaseStorageService';

export async function GET(_request: NextRequest) {
  try {
    console.log('Testing Supabase Storage connection...');
    
    // Test storage connection
    const isConnected = await storageService.testConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Storage connection failed',
        buckets: []
      }, { status: 500 });
    }

    // Get storage stats
    const stats = await storageService.getStorageStats();
    
    // List images in the cards bucket
    const cardImages = await storageService.listImages('cards.images');
    
    return NextResponse.json({
      success: true,
      connection: 'OK',
      stats,
      cardImages: cardImages.length,
      buckets: {
        'cards.images': 'exists',
        'generated-images': 'checking...'
      }
    });

  } catch (error) {
    console.error('Storage test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(_request: NextRequest) {
  try {
    // Test image upload
    const testImageBuffer = Buffer.from('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/AB//2Q==', 'base64');
    
    const result = await storageService.uploadCardImage(
      testImageBuffer,
      `test-${Date.now()}.jpg`,
      {
        cardId: 'test-card',
        provider: 'test',
        type: 'test'
      }
    );

    return NextResponse.json({
      success: true,
      uploadResult: result
    });

  } catch (error) {
    console.error('Upload test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 