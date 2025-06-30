import { NextRequest, NextResponse } from 'next/server';
import { ProfileData } from '@/lib/types';
import { parseText } from '@/lib/parse-text';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Dynamically import pdf-parse only when needed
    const pdf = (await import('pdf-parse')).default;
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid PDF file' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Extract text from PDF
    let extractedText = '';
    try {
      const pdfData = await pdf(buffer, {
        // Options to improve text extraction
        normalizeWhitespace: false,
        disableCombineTextItems: false
      });
      extractedText = pdfData.text;
      
      console.log('Extracted PDF text length:', extractedText.length);
      console.log('First 500 characters:', extractedText.substring(0, 500));
      
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return NextResponse.json(
        { error: 'Failed to extract text from PDF. The PDF might be corrupted or password-protected.' },
        { status: 500 }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text content found in PDF. The PDF might be image-based or corrupted.' },
        { status: 400 }
      );
    }

    // Clean up the extracted text for better parsing
    const cleanedText = cleanExtractedText(extractedText);
    console.log('Cleaned text length:', cleanedText.length);
    console.log('First 500 characters of cleaned text:', cleanedText.substring(0, 500));

    // Parse the extracted text into structured profile data
    const profileData = parseText(cleanedText);

    console.log('Parsed profile data:', {
      name: profileData.name,
      headline: profileData.headline,
      aboutLength: profileData.about.length,
      experienceCount: profileData.experience.length,
      skillsCount: profileData.skills.length,
      educationCount: profileData.education.length
    });

    // Validate that we got meaningful data
    if (!profileData.name && !profileData.headline && !profileData.about && profileData.experience.length === 0) {
      return NextResponse.json(
        { error: 'Could not extract meaningful profile data from PDF. Please ensure the PDF contains readable text content.' },
        { status: 400 }
      );
    }

    return NextResponse.json(profileData);

  } catch (error) {
    console.error('PDF processing error:', error);
    
    // Ensure we always return a valid JSON response with a serializable error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
        ? error 
        : 'Failed to process PDF file. Please try again or use a different file format.';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function cleanExtractedText(text: string): string {
  // Remove excessive whitespace and normalize line breaks
  let cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  // Remove common PDF artifacts
  cleaned = cleaned
    .replace(/Page \d+ of \d+/gi, '')
    .replace(/Generated on .*/gi, '')
    .replace(/Resume/gi, '')
    .replace(/LinkedIn/gi, '')
    .replace(/\f/g, '\n') // Form feed characters
    .replace(/\u0000/g, '') // Null characters
    .replace(/\u00A0/g, ' '); // Non-breaking spaces

  // Split into lines and filter out very short or meaningless lines
  const lines = cleaned.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .filter(line => !/^[\s\-_=]+$/.test(line)) // Remove lines with only whitespace/dashes
    .filter(line => !/^\d+$/.test(line)) // Remove lines with only numbers
    .filter(line => line.length > 1 || /[a-zA-Z]/.test(line)); // Keep only lines with letters or longer than 1 char

  return lines.join('\n');
}