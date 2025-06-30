import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult } from '@/lib/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username || !username.trim()) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    console.log(`Fetching LinkedIn profile for username: ${username}`);

    // Call the backend API to get LinkedIn profile data
    const backendResponse = await fetch(`https://hackingly-backend-8tk6.onrender.com/api/profile/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      console.error(`Backend API error: ${backendResponse.status} ${backendResponse.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch LinkedIn profile data' },
        { status: backendResponse.status }
      );
    }

    const profileData = await backendResponse.json();
    console.log('Backend profile data received:', {
      fullName: profileData.full_name,
      hasSummary: !!profileData.summary,
      hasExperience: !!profileData.experience,
      hasSkills: !!profileData.skills,
      hasEducation: !!profileData.education
    });

    // Build prompt for LinkedIn profile analysis
    const prompt = buildLinkedInPrompt(profileData);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log('Sending request to Gemini API...');
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

    console.log('Gemini API response received, length:', responseText.length);

    // Parse the JSON response
    let analysisResult: AnalysisResult;
    try {
      // Clean the response text to extract JSON
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanedResponse);
      console.log('Successfully parsed Gemini response:', {
        overallScore: analysisResult.overallScore,
        hasDetailedAnalysis: !!analysisResult.detailedAnalysis,
        insightsCount: analysisResult.insights?.length,
        careerMatchesCount: analysisResult.careerMatches?.length
      });
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      console.error('Parse error:', parseError);
      // Fallback response if JSON parsing fails
      analysisResult = createFallbackResponse(profileData);
      console.log('Using fallback response');
    }

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('LinkedIn analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze LinkedIn profile' },
      { status: 500 }
    );
  }
}

function buildLinkedInPrompt(profileData: any): string {
  // Extract key information from the rich profile data
  const fullName = profileData.full_name || 'N/A';
  const summary = profileData.summary || 'N/A';
  const experience = profileData.experience || 'N/A';
  const education = profileData.education || 'N/A';
  const skills = profileData.skills || 'N/A';
  const certifications = profileData.certifications || 'N/A';
  const projects = profileData.projects || 'N/A';
  const honors = profileData.honors || 'N/A';
  const posts = profileData.posts || 'N/A';

  // Extract headline from summary if available
  const headlineMatch = summary.match(/HEADLINE:\s*(.+?)(?:\n|$)/);
  const headline = headlineMatch ? headlineMatch[1] : 'N/A';

  // Extract about section from summary
  const aboutMatch = summary.match(/# ABOUT\n"""(.*?)"""/s);
  const about = aboutMatch ? aboutMatch[1].trim() : summary;

  return `
Analyze the following comprehensive LinkedIn profile data and provide a detailed assessment in JSON format.

PROFILE INFORMATION:
- Full Name: ${fullName}
- Headline: ${headline}
- About/Summary: ${about}
- Experience: ${experience}
- Education: ${education}
- Skills: ${skills}
- Certifications: ${certifications}
- Projects: ${projects}
- Honors & Awards: ${honors}
- Posts & Content: ${posts}

Please provide a comprehensive analysis and return a JSON object with the following structure:

{
  "overallScore": number (0-100),
  "sectionScores": {
    "headline": number (0-100),
    "about": number (0-100),
    "experience": number (0-100),
    "skills": number (0-100),
    "education": number (0-100),
    "completeness": number (0-100),
    "presentation": number (0-100),
    "keywordOptimization": number (0-100)
  },
  "detailedAnalysis": {
    "strengths": [
      "List 5-7 key strengths based on experience, skills, and achievements"
    ],
    "weaknesses": [
      "List 3-5 areas that need improvement"
    ],
    "missingElements": [
      "List 3-5 missing elements that would enhance the profile"
    ],
    "inconsistencies": [
      "List any inconsistencies found in the profile"
    ]
  },
  "rewrites": {
    "headline": "Professional, compelling headline rewrite",
    "about": "Comprehensive about section rewrite highlighting key achievements",
    "experienceImprovements": [
      {
        "originalRole": "Job title from experience",
        "improvedDescription": "Enhanced description with quantified achievements and impact"
      }
    ],
    "skillsPresentation": "Professional skills presentation and organization"
  },
  "insights": [
    "Provide 5-7 actionable insights about the profile",
    "Focus on professional growth opportunities",
    "Include industry-specific observations"
  ],
  "strongSkills": [
    "List 5-7 strongest skills identified from the profile"
  ],
  "missingSkills": [
    "List 5-7 skills that would enhance career prospects"
  ],
  "skillRecommendations": [
    "Provide 3-5 specific recommendations for skill development"
  ],
  "careerMatches": [
    {
      "role": "Specific job title that matches the profile",
      "matchPercentage": number (0-100),
      "description": "Detailed explanation of why this role is a good fit",
      "requirements": ["Key requirement 1", "Key requirement 2", "Key requirement 3"],
      "salaryRange": "Estimated salary range for this role",
      "growthPotential": "Growth potential description",
      "skillGaps": ["Skill gap 1", "Skill gap 2"],
      "transitionStrategy": "Strategy to transition to this role"
    }
  ],
  "actionableRecommendations": [
    "List 5-7 specific, actionable steps to improve the profile"
  ],
  "industryBenchmarking": {
    "profileCompleteness": "Assessment of profile completeness compared to industry standards",
    "competitivePositioning": "Analysis of competitive positioning in the market",
    "marketValue": "Assessment of current market value",
    "differentiators": ["Key differentiator 1", "Key differentiator 2", "Key differentiator 3"]
  }
}

ANALYSIS GUIDELINES:
1. Be objective and constructive in your assessment
2. Focus on professional growth opportunities
3. Provide specific, actionable recommendations
4. Consider industry standards and best practices
5. Identify both strengths and areas for improvement
6. Suggest 2-3 career matches that align with the profile
7. Ensure all scores are realistic and well-reasoned
8. Make rewrites professional, engaging, and ATS-friendly
9. Consider the person's experience, education, skills, and achievements
10. Analyze their online presence and engagement through posts
11. Evaluate profile completeness and presentation
12. Assess keyword optimization for recruiters and ATS systems
13. Consider industry trends and market demands
14. Provide specific salary and growth insights where possible

Return only the JSON object, no additional text or formatting.
`;
}

function createFallbackResponse(profileData: any): AnalysisResult {
  const name = profileData.full_name || 'Professional';
  const skills = profileData.skills ? profileData.skills.split(',').map((s: string) => s.trim()) : [];
  const headlineMatch = profileData.summary?.match(/HEADLINE:\s*(.+?)(?:\n|$)/);
  const headline = headlineMatch ? headlineMatch[1] : 'Professional in your field';
  
  return {
    overallScore: 75,
    sectionScores: {
      headline: 80,
      about: 70,
      experience: 75,
      skills: 70,
      education: 80,
      completeness: 75,
      presentation: 70,
      keywordOptimization: 65,
    },
    detailedAnalysis: {
      strengths: [
        'Strong technical background and experience',
        'Good educational foundation',
        'Demonstrated project work and achievements'
      ],
      weaknesses: [
        'Profile could benefit from more quantified achievements',
        'Skills section could be more comprehensive',
        'About section needs more compelling content'
      ],
      missingElements: [
        'Quantified achievements in experience descriptions',
        'Industry-specific keywords for ATS optimization',
        'Professional certifications and training'
      ],
      inconsistencies: [
        'Some experience descriptions lack specific metrics'
      ]
    },
    rewrites: {
      headline: `Experienced professional in ${headline} with expertise in delivering results`,
      about: `Professional summary highlighting your key achievements and expertise in ${skills.slice(0, 3).join(', ')}.`,
      experienceImprovements: [
        {
          originalRole: 'Current Role',
          improvedDescription: 'Enhanced experience descriptions with quantified achievements and impact metrics.'
        }
      ],
      skillsPresentation: `Comprehensive skill set including ${skills.join(', ')} with proven application in professional settings.`,
    },
    insights: [
      'Your profile shows strong technical expertise',
      'Consider adding more quantified achievements',
      'Professional summary could be more compelling',
      'Skills section demonstrates good breadth of knowledge',
      'Education background provides solid foundation'
    ],
    strongSkills: skills.slice(0, 5),
    missingSkills: ['Leadership', 'Project Management', 'Data Analysis', 'Strategic Planning', 'Team Management'],
    skillRecommendations: [
      'Consider obtaining certifications in your core competencies',
      'Develop leadership and management skills',
      'Stay current with industry trends and technologies',
      'Focus on building soft skills alongside technical expertise'
    ],
    careerMatches: [
      {
        role: 'Senior Professional',
        matchPercentage: 85,
        description: 'Advanced role matching your current skill set and experience level.',
        requirements: ['Experience', 'Technical Skills', 'Leadership'],
        salaryRange: '$80,000 - $120,000',
        growthPotential: 'High potential for advancement to management roles',
        skillGaps: ['Advanced Leadership', 'Strategic Planning'],
        transitionStrategy: 'Focus on developing leadership skills and taking on more responsibility'
      },
    ],
    actionableRecommendations: [
      'Add quantified achievements to all experience descriptions',
      'Enhance the about section with compelling professional story',
      'Optimize skills section with industry-specific keywords',
      'Consider adding professional certifications',
      'Improve profile completeness by filling all sections'
    ],
    industryBenchmarking: {
      profileCompleteness: 'Profile is 75% complete compared to industry standards',
      competitivePositioning: 'Competitive positioning is strong in technical areas',
      marketValue: 'Current market value aligns with experience level',
      differentiators: ['Technical Expertise', 'Project Experience', 'Educational Background']
    }
  };
} 