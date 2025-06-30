import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProfileData, AnalysisResult } from '@/lib/types';
import { buildPrompt } from '@/lib/build-prompt';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const profileData: ProfileData = await request.json();

    if (!profileData || !profileData.name) {
      return NextResponse.json(
        { error: 'Invalid profile data provided' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = buildPrompt(profileData);

    const result = await model.generateContent([
      {
        text: `You are a professional LinkedIn profile analyzer and career coach. Provide detailed, actionable feedback in the exact JSON format requested. ${prompt}`
      }
    ]);

    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error('No response from Gemini API');
    }

    // Parse the JSON response
    let analysisResult: AnalysisResult;
    try {
      // Clean the response text to extract JSON
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      // Fallback response if JSON parsing fails
      analysisResult = createFallbackResponse(profileData);
    }

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze profile' },
      { status: 500 }
    );
  }
}

function createFallbackResponse(profileData: ProfileData): AnalysisResult {
  return {
    overallScore: 75,
    sectionScores: {
      headline: 80,
      about: 70,
      experience: 75,
      skills: 70,
      education: 80,
    },
    rewrites: {
      headline: `Experienced professional in ${profileData.headline || 'your field'} with expertise in delivering results`,
      about: `Professional summary highlighting your key achievements and expertise in ${profileData.skills.slice(0, 3).join(', ')}.`,
      experienceImprovements: [
        {
          originalRole: 'Current Role',
          improvedDescription: 'Enhanced experience descriptions with quantified achievements and impact metrics.'
        }
      ],
      skillsPresentation: `Comprehensive skill set including ${profileData.skills.join(', ')} with proven application in professional settings.`,
    },
    insights: [
      'Your profile shows strong technical expertise',
      'Consider adding more quantified achievements',
      'Professional summary could be more compelling',
    ],
    strongSkills: profileData.skills.slice(0, 5),
    missingSkills: ['Leadership', 'Project Management', 'Data Analysis'],
    skillRecommendations: [
      'Consider obtaining certifications in your core competencies',
      'Develop leadership and management skills',
      'Stay current with industry trends and technologies',
    ],
    careerMatches: [
      {
        role: 'Senior Professional',
        matchPercentage: 85,
        description: 'Advanced role matching your current skill set and experience level.',
        requirements: ['Experience', 'Technical Skills', 'Leadership'],
      },
    ],
  };
}