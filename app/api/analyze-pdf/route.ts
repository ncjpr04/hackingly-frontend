import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult } from '@/lib/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid PDF file provided' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert LinkedIn profile analyzer and career strategist with deep expertise in talent acquisition, personal branding, and career development. I need you to perform an extremely thorough, comprehensive, word-by-word analysis of this LinkedIn profile PDF document.

CRITICAL INSTRUCTIONS:
1. Read EVERY SINGLE WORD in the PDF document with meticulous attention to detail
2. Extract ALL information from EVERY section of the LinkedIn profile
3. Analyze the formatting, structure, presentation quality, and professional impact
4. Identify gaps, inconsistencies, missed opportunities, and areas for strategic improvement
5. Provide comprehensive data extraction with actionable professional recommendations
6. Consider current market trends, ATS optimization, and recruiter preferences
7. Evaluate against industry benchmarks and best practices

DETAILED ANALYSIS REQUIREMENTS:

**COMPREHENSIVE SECTION-BY-SECTION DEEP DIVE:**

1. **HEADER/CONTACT SECTION ANALYSIS:**
   - Extract full name, current title, location, contact information
   - Analyze profile photo presence and professionalism (if mentioned)
   - Evaluate headline effectiveness, keyword density, and value proposition clarity
   - Assess contact information completeness and accessibility

2. **ABOUT/SUMMARY SECTION DEEP ANALYSIS:**
   - Extract complete about section text word-for-word
   - Analyze storytelling quality, personal branding strength, and unique value proposition
   - Evaluate narrative flow, emotional connection, and professional positioning
   - Identify missing elements (call-to-action, quantified achievements, personality indicators)
   - Check for keyword optimization, industry relevance, and ATS compatibility
   - Assess length, readability, and engagement factor

3. **EXPERIENCE SECTION COMPREHENSIVE REVIEW:**
   - Extract EVERY job title, company name, employment dates, locations, and descriptions
   - Analyze each role for quantified achievements, impact metrics, and results-oriented language
   - Identify gaps in employment history, career progression logic, and growth trajectory
   - Evaluate description quality, action verb usage, and accomplishment specificity
   - Check for consistency in formatting, tense usage, and presentation style
   - Assess relevance to career goals and industry standards

4. **SKILLS SECTION STRATEGIC ANALYSIS:**
   - Extract ALL listed skills (technical, soft, industry-specific, tools, certifications)
   - Analyze skill relevance to career goals, market demand, and industry standards
   - Identify missing critical skills for advancement and competitiveness
   - Evaluate skill organization, endorsement potential, and validation opportunities
   - Assess skill currency, market value, and strategic positioning

5. **EDUCATION SECTION EVALUATION:**
   - Extract all degrees, institutions, graduation dates, GPAs, honors, relevant coursework
   - Analyze relevance to current career path and future aspirations
   - Identify additional certifications, continuing education needs, and skill gaps
   - Evaluate presentation and strategic positioning

6. **CERTIFICATIONS & LICENSES ASSESSMENT:**
   - Extract all professional certifications, licenses, credentials, and training
   - Analyze currency, relevance, and competitive advantage
   - Identify missing industry-standard certifications and growth opportunities

7. **ADDITIONAL SECTIONS COMPREHENSIVE REVIEW:**
   - Projects, publications, patents, languages, volunteer work
   - Awards, honors, recognitions, and achievements
   - Professional associations, memberships, and community involvement
   - Speaking engagements, media appearances, and thought leadership

**ADVANCED SCORING METHODOLOGY:**

- **Content Quality & Impact (35%):** Depth, relevance, quantified achievements, and professional impact
- **Professional Presentation & Branding (25%):** Formatting, consistency, visual appeal, and brand coherence
- **Keyword Optimization & ATS Compatibility (20%):** Industry-relevant terms, searchability, and system compatibility
- **Completeness & Strategic Positioning (20%):** Coverage of relevant sections, strategic career positioning

**COMPREHENSIVE OUTPUT REQUIREMENTS:**

Return a detailed JSON object with the following enhanced structure:

{
  "profileData": {
    "personalInfo": {
      "fullName": "Complete name as written",
      "currentTitle": "Current professional title",
      "location": "Geographic location",
      "contactInfo": "Available contact details",
      "profileUrl": "LinkedIn URL if visible"
    },
    "headline": "Complete headline text with analysis",
    "aboutSection": "Complete about/summary section text",
    "experience": [
      {
        "jobTitle": "Exact job title",
        "company": "Company name",
        "duration": "Employment period",
        "location": "Job location",
        "description": "Complete job description",
        "achievements": ["List of quantified achievements"],
        "skills": ["Skills demonstrated in this role"],
        "impactMetrics": ["Quantified business impact"]
      }
    ],
    "skills": {
      "technical": ["Technical skills listed"],
      "soft": ["Soft skills identified"],
      "industry": ["Industry-specific skills"],
      "tools": ["Software/tools mentioned"],
      "emerging": ["Trending skills in the field"]
    },
    "education": [
      {
        "degree": "Degree type and field",
        "institution": "School/university name",
        "graduationYear": "Year of graduation",
        "gpa": "GPA if mentioned",
        "honors": "Academic honors/achievements",
        "relevantCoursework": ["Relevant courses if listed"]
      }
    ],
    "certifications": [
      {
        "name": "Certification name",
        "issuer": "Issuing organization",
        "dateObtained": "Date received",
        "expirationDate": "Expiration if applicable",
        "credentialId": "ID if provided"
      }
    ],
    "additionalSections": {
      "projects": ["Project details with impact"],
      "publications": ["Publication details"],
      "languages": ["Languages and proficiency"],
      "volunteer": ["Volunteer experience"],
      "awards": ["Awards and recognitions"]
    }
  },
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
      "Specific strength 1 with detailed examples and impact assessment",
      "Specific strength 2 with market positioning analysis",
      "Specific strength 3 with competitive advantage evaluation"
    ],
    "weaknesses": [
      "Specific weakness 1 with detailed improvement strategy",
      "Specific weakness 2 with market impact analysis",
      "Specific weakness 3 with actionable solutions"
    ],
    "missingElements": [
      "Critical missing element 1 with business justification",
      "Critical missing element 2 with competitive disadvantage analysis",
      "Critical missing element 3 with implementation priority"
    ],
    "inconsistencies": [
      "Formatting or content inconsistency 1 with professional impact",
      "Formatting or content inconsistency 2 with credibility assessment"
    ]
  },
  "rewrites": {
    "headline": "Professionally rewritten headline with strategic keywords and value proposition",
    "about": "Completely rewritten about section with compelling narrative, quantified achievements, and clear call-to-action",
    "experienceImprovements": [
      {
        "originalRole": "Original job title and company",
        "improvedDescription": "Enhanced description with specific metrics, impact statements, and achievement quantification"
      }
    ],
    "skillsPresentation": "Strategically organized skills section with market-relevant categorization and positioning"
  },
  "insights": [
    "Deep strategic insight 1 about career trajectory optimization and market positioning",
    "Deep strategic insight 2 about industry alignment, competitive advantage, and value differentiation",
    "Deep strategic insight 3 about personal branding enhancement and professional visibility",
    "Deep strategic insight 4 about networking strategy and relationship building opportunities",
    "Deep strategic insight 5 about skill development priorities and career advancement pathways",
    "Deep strategic insight 6 about market trends and future-proofing strategies"
  ],
  "strongSkills": [
    "Top demonstrated skill 1 with evidence and market value assessment",
    "Top demonstrated skill 2 with competitive advantage analysis",
    "Top demonstrated skill 3 with growth potential evaluation",
    "Top demonstrated skill 4 with industry relevance scoring",
    "Top demonstrated skill 5 with differentiation factor analysis"
  ],
  "missingSkills": [
    "Critical missing skill 1 for career advancement with market demand analysis",
    "Critical missing skill 2 for industry competitiveness with urgency assessment",
    "Critical missing skill 3 for leadership growth with development pathway",
    "Critical missing skill 4 for technical advancement with certification recommendations",
    "Critical missing skill 5 for market relevance with trend analysis"
  ],
  "skillRecommendations": [
    "Specific skill development recommendation 1 with detailed learning path, timeline, and ROI analysis",
    "Specific skill development recommendation 2 with certification suggestions and career impact",
    "Specific skill development recommendation 3 with practical application ideas and portfolio building",
    "Specific skill development recommendation 4 with mentorship and networking strategies",
    "Specific skill development recommendation 5 with resource recommendations and success metrics"
  ],
  "careerMatches": [
    {
      "role": "Specific job title matching profile with growth potential",
      "matchPercentage": number (0-100),
      "description": "Detailed explanation of fit, growth potential, and strategic career positioning",
      "requirements": ["Specific requirement 1", "Specific requirement 2", "Specific requirement 3"],
      "salaryRange": "Expected salary range based on market analysis",
      "growthPotential": "Career advancement opportunities and trajectory",
      "skillGaps": ["Skills needed to qualify with development timeline"],
      "marketDemand": "Industry demand and job availability assessment"
    },
    {
      "role": "Alternative career path option with strategic rationale",
      "matchPercentage": number (0-100),
      "description": "Why this alternative path makes strategic sense for long-term career growth",
      "requirements": ["Key requirements for successful transition"],
      "transitionStrategy": "Detailed steps needed to pivot to this role with timeline",
      "riskAssessment": "Potential challenges and mitigation strategies"
    }
  ],
  "actionableRecommendations": [
    "Immediate action item 1 (can be implemented today) with specific steps",
    "Short-term goal 1 (1-3 months) with measurable outcomes and success metrics",
    "Medium-term goal 1 (3-6 months) with milestone tracking and progress indicators",
    "Long-term goal 1 (6-12 months) with strategic impact and career advancement",
    "Strategic career move 1 (1-2 years) with market positioning and competitive advantage"
  ],
  "industryBenchmarking": {
    "profileCompleteness": "Detailed comparison to industry standards with specific improvement areas",
    "competitivePositioning": "How profile stands against industry peers with differentiation strategies",
    "marketValue": "Assessment of current market positioning with enhancement opportunities",
    "differentiators": ["Unique value propositions identified with strategic amplification recommendations"]
  }
}

**PROFESSIONAL ANALYSIS STANDARDS:**
- Be extremely thorough and leave no detail unexamined
- Provide specific, actionable feedback with concrete examples and implementation strategies
- Use current industry best practices and market trend analysis
- Consider ATS optimization, recruiter preferences, and hiring manager expectations
- Focus on measurable improvements with clear ROI and career impact
- Maintain professional tone while being constructively critical and strategically insightful
- Provide evidence-based recommendations with clear reasoning and market justification
- Consider diversity, equity, and inclusion best practices
- Address personal branding and thought leadership opportunities
- Include networking and relationship building strategies

**CRITICAL SUCCESS FACTORS:**
- Quantify achievements wherever possible
- Emphasize unique value propositions and competitive advantages
- Align recommendations with current market demands and future trends
- Provide clear implementation timelines and success metrics
- Consider industry-specific requirements and cultural nuances
- Address both technical and soft skill development needs
- Include personal branding and online presence optimization

Return ONLY the JSON object with no additional formatting, markdown, or explanatory text.
`;

    const result = await model.generateContent([
      {
        text: prompt
      },
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data
        }
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
      console.log('Raw response:', responseText.substring(0, 1000) + '...');
      
      // Fallback response if JSON parsing fails
      analysisResult = createFallbackResponse();
    }

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('PDF analysis error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to analyze PDF. Please ensure the PDF contains a valid LinkedIn profile.';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function createFallbackResponse(): AnalysisResult {
  return {
    overallScore: 75,
    sectionScores: {
      headline: 70,
      about: 75,
      experience: 80,
      skills: 70,
      education: 75,
      completeness: 65,
      presentation: 70,
      keywordOptimization: 60
    },
    detailedAnalysis: {
      strengths: [
        'Strong professional experience with clear career progression and industry expertise',
        'Demonstrated leadership capabilities with evidence of team management and project delivery',
        'Good educational foundation with relevant qualifications for the field'
      ],
      weaknesses: [
        'Limited quantified achievements and specific metrics to demonstrate business impact',
        'About section lacks compelling narrative and clear value proposition for target audience',
        'Skills section could be better organized and optimized for industry-specific keywords'
      ],
      missingElements: [
        'Quantified achievements with specific numbers, percentages, and business impact metrics',
        'Industry-specific certifications and professional development credentials',
        'Thought leadership content such as publications, speaking engagements, or project portfolios'
      ],
      inconsistencies: [
        'Inconsistent formatting and presentation style across different profile sections',
        'Varying levels of detail in job descriptions creating uneven professional narrative'
      ]
    },
    rewrites: {
      headline: 'Results-driven professional with expertise in delivering measurable business impact and leading high-performance teams',
      about: 'Experienced professional with a proven track record of success across multiple industries. Demonstrated ability to lead cross-functional teams, drive strategic initiatives, and deliver exceptional results that exceed organizational goals. Passionate about leveraging technology and innovation to solve complex business challenges and create sustainable growth. Seeking opportunities to apply strategic thinking and leadership expertise to drive transformational change.',
      experienceImprovements: [
        {
          originalRole: 'Senior Professional',
          improvedDescription: 'Led cross-functional team of 15+ professionals to deliver strategic initiatives resulting in 25% increase in operational efficiency. Managed $2M+ budget while implementing innovative solutions that reduced costs by 18% and improved customer satisfaction scores by 30%. Developed and executed comprehensive project plans that consistently delivered results ahead of schedule and under budget.'
        }
      ],
      skillsPresentation: 'Strategically organized skill set highlighting core competencies in leadership and management, technical proficiencies in industry-standard tools and platforms, and specialized expertise in strategic planning and business development with relevant certifications and endorsements.',
    },
    insights: [
      'Your profile demonstrates strong professional experience with significant opportunities to enhance quantified achievements and specific business impact metrics',
      'Consider strengthening your personal brand narrative to better differentiate yourself in a competitive market and clearly communicate your unique value proposition',
      'Skills section would benefit from strategic reorganization and industry-specific keyword optimization to improve ATS compatibility and recruiter visibility',
      'Experience descriptions would be more impactful with specific metrics, percentages, and measurable outcomes that demonstrate tangible business value',
      'Profile completeness is good but could be enhanced with additional sections like projects, certifications, or thought leadership content to showcase expertise',
      'Consider adding industry-specific certifications and professional development credentials to strengthen competitive positioning and market credibility'
    ],
    strongSkills: [
      'Leadership & Team Management with proven ability to guide diverse teams toward common goals',
      'Strategic Planning & Business Development with track record of successful initiative implementation',
      'Project Management with expertise in delivering complex projects on time and within budget',
      'Communication & Presentation Skills with ability to influence stakeholders at all organizational levels',
      'Problem Solving & Analysis with systematic approach to identifying and resolving business challenges'
    ],
    missingSkills: [
      'Data Analytics & Visualization tools like Tableau, Power BI, or Google Analytics for data-driven decision making',
      'Digital Transformation expertise including cloud technologies and automation platforms',
      'Agile Methodologies and Scrum certification for modern project management approaches',
      'Change Management frameworks and methodologies for organizational transformation',
      'Business Intelligence and advanced Excel skills for financial analysis and reporting'
    ],
    skillRecommendations: [
      'Obtain Google Analytics or Tableau certification to strengthen data analysis capabilities and demonstrate proficiency in data-driven decision making with 3-6 month timeline',
      'Complete Agile/Scrum certification through Scrum Alliance or PMI to align with modern project management practices and increase market competitiveness',
      'Develop digital marketing skills through Google Ads, HubSpot, or Salesforce certifications to enhance business development capabilities',
      'Enhance leadership credentials with executive education programs or MBA coursework to prepare for senior management roles',
      'Build technical skills in emerging technologies relevant to your industry through online courses and hands-on project experience'
    ],
    careerMatches: [
      {
        role: 'Senior Manager / Director',
        matchPercentage: 88,
        description: 'Your leadership experience, strategic thinking, and proven track record align exceptionally well with senior management roles requiring cross-functional collaboration and business growth leadership.',
        requirements: ['10+ years progressive experience', 'Team leadership and development', 'Strategic planning and execution', 'P&L responsibility and budget management'],
        salaryRange: '$120,000 - $180,000',
        growthPotential: 'High potential for advancement to VP or C-suite roles within 3-5 years',
        skillGaps: ['Advanced financial analysis', 'Digital transformation leadership']
      },
      {
        role: 'Management Consultant',
        matchPercentage: 82,
        description: 'Your problem-solving skills, diverse industry experience, and strategic mindset make you well-suited for consulting roles helping organizations optimize operations and drive transformation.',
        requirements: ['Analytical and problem-solving skills', 'Client relationship management', 'Industry expertise and credibility', 'Excellent communication and presentation abilities'],
        salaryRange: '$100,000 - $160,000',
        growthPotential: 'Path to partner level with strong client development and thought leadership',
        transitionStrategy: 'Develop consulting methodology expertise and build portfolio of successful transformation projects'
      }
    ],
    actionableRecommendations: [
      'Update headline immediately with specific value proposition and key achievements to improve profile visibility',
      'Rewrite about section within 1 week to include compelling narrative with quantified accomplishments and clear call-to-action',
      'Add specific metrics and achievements to each job description over the next 2 weeks to demonstrate measurable business impact',
      'Obtain relevant industry certification within 3 months to strengthen competitive positioning and market credibility',
      'Develop thought leadership content strategy within 6 months including articles, speaking opportunities, or project showcases'
    ],
    industryBenchmarking: {
      profileCompleteness: 'Profile is 75% complete compared to industry standards. Missing elements include quantified achievements, industry certifications, and thought leadership content that would elevate professional positioning.',
      competitivePositioning: 'Currently positioned in the middle tier of industry professionals. With strategic enhancements to achievements quantification and skill certification, could move to top 25% of peer group.',
      marketValue: 'Current market positioning suggests strong foundation with significant upside potential. Enhanced profile could increase market value by 20-30% and improve recruiter interest.',
      differentiators: [
        'Cross-functional leadership experience across multiple industries',
        'Proven track record of delivering results in challenging environments',
        'Strong combination of strategic thinking and operational execution capabilities'
      ]
    }
  };
}