import { NextRequest, NextResponse } from 'next/server';
import { ProfileData } from '@/lib/types';
import { parseText } from '@/lib/parse-text';
import Tesseract from 'tesseract.js';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files: File[] = [];
    
    // Extract all uploaded files
    for (const [key, value] of Array.from(formData.entries())) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No image files provided' },
        { status: 400 }
      );
    }

    let combinedText = '';

    // Process each image file with OCR
    for (const file of files) {
      try {
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Perform OCR on the image
        const { data: { text } } = await Tesseract.recognize(buffer, 'eng', {
          logger: m => console.log(m) // Optional: log OCR progress
        });

        if (text && text.trim().length > 0) {
          combinedText += text + '\n\n';
        }
      } catch (ocrError) {
        console.error(`OCR error for file ${file.name}:`, ocrError);
        // Continue processing other files even if one fails
      }
    }

    if (!combinedText || combinedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text content could be extracted from the images' },
        { status: 400 }
      );
    }

    // Parse the combined OCR text into structured profile data
    const profileData = parseText(combinedText);

    // Validate that we got meaningful data
    if (!profileData.name && !profileData.headline && !profileData.about) {
      return NextResponse.json(
        { error: 'Could not extract meaningful profile data from images' },
        { status: 400 }
      );
    }

    return NextResponse.json(profileData);

  } catch (error) {
    console.error('OCR processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process images' },
      { status: 500 }
    );
  }
}