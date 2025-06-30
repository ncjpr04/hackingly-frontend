import { ProfileData } from './types';

export function buildPrompt(profileData: ProfileData): string {
  return `
Analyze the following LinkedIn profile and provide a comprehensive assessment in JSON format.

Profile Data:
- Name: ${profileData.name}
- Headline: ${profileData.headline}
- About: ${profileData.about}
- Experience: ${profileData.experience.join('\n\n')}
- Skills: ${profileData.skills.join(', ')}
- Education: ${profileData.education.join('\n')}

Please analyze this profile and return a JSON object with the following structure:

{
  "overallScore": number (0-100),
  "sectionScores": {
    "headline": number (0-100),
    "about": number (0-100),
    "experience": number (0-100),
    "skills": number (0-100),
    "education": number (0-100)
  },
  "rewrites": {
    "headline": "Professional rewrite of the headline",
    "about": "Professional rewrite of the about section",
    "experience": "Professional rewrite suggestions for experience section",
    "skills": "Professional rewrite for skills presentation"
  },
  "insights": [
    "Key insight 1 about the profile",
    "Key insight 2 about the profile",
    "Key insight 3 about the profile"
  ],
  "strongSkills": [
    "List of 5-7 strongest skills identified"
  ],
  "missingSkills": [
    "List of 5-7 skills missing for career advancement"
  ],
  "skillRecommendations": [
    "Specific recommendation 1 for skill development",
    "Specific recommendation 2 for skill development",
    "Specific recommendation 3 for skill development"
  ],
  "careerMatches": [
    {
      "role": "Job title that matches the profile",
      "matchPercentage": number (0-100),
      "description": "Description of why this role is a good fit",
      "requirements": ["Key requirement 1", "Key requirement 2", "Key requirement 3"]
    }
  ]
}

Analysis Guidelines:
1. Be objective and constructive in your assessment
2. Focus on professional growth opportunities
3. Provide specific, actionable recommendations
4. Consider industry standards and best practices
5. Identify both strengths and areas for improvement
6. Suggest 2-3 career matches that align with the profile
7. Ensure all scores are realistic and well-reasoned
8. Make rewrites professional, engaging, and ATS-friendly

Return only the JSON object, no additional text or formatting.
`;
}