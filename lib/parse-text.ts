import { ProfileData } from './types';

export function parseText(text: string): ProfileData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const profileData: ProfileData = {
    name: '',
    headline: '',
    about: '',
    experience: [],
    skills: [],
    education: [],
    certifications: []
  };

  let currentSection = '';
  let currentContent: string[] = [];
  let isProcessingExperience = false;
  let isProcessingEducation = false;
  let experienceBuffer: string[] = [];
  let educationBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Skip common LinkedIn UI elements and noise
    if (isNoiseText(line)) {
      continue;
    }

    // Detect name (usually the first meaningful line or a line with proper nouns)
    if (!profileData.name && isLikelyName(line)) {
      profileData.name = line;
      continue;
    }

    // Detect headline (usually after name, contains role-related keywords)
    if (!profileData.headline && profileData.name && isLikelyHeadline(line)) {
      profileData.headline = line;
      continue;
    }

    // Skip contact information
    if (isContactInfo(line)) {
      continue;
    }

    // Detect section headers
    if (isSectionHeader(lowerLine, 'about')) {
      finalizePreviousSection(profileData, currentSection, currentContent, experienceBuffer, educationBuffer);
      currentSection = 'about';
      currentContent = [];
      isProcessingExperience = false;
      isProcessingEducation = false;
      continue;
    } else if (isSectionHeader(lowerLine, 'experience')) {
      finalizePreviousSection(profileData, currentSection, currentContent, experienceBuffer, educationBuffer);
      currentSection = 'experience';
      currentContent = [];
      experienceBuffer = [];
      isProcessingExperience = true;
      isProcessingEducation = false;
      continue;
    } else if (isSectionHeader(lowerLine, 'skills')) {
      finalizePreviousSection(profileData, currentSection, currentContent, experienceBuffer, educationBuffer);
      currentSection = 'skills';
      currentContent = [];
      isProcessingExperience = false;
      isProcessingEducation = false;
      continue;
    } else if (isSectionHeader(lowerLine, 'education')) {
      finalizePreviousSection(profileData, currentSection, currentContent, experienceBuffer, educationBuffer);
      currentSection = 'education';
      currentContent = [];
      educationBuffer = [];
      isProcessingExperience = false;
      isProcessingEducation = true;
      continue;
    } else if (isSectionHeader(lowerLine, 'certifications')) {
      finalizePreviousSection(profileData, currentSection, currentContent, experienceBuffer, educationBuffer);
      currentSection = 'certifications';
      currentContent = [];
      isProcessingExperience = false;
      isProcessingEducation = false;
      continue;
    }

    // Special handling for experience entries
    if (isProcessingExperience) {
      if (isJobEntry(line)) {
        // This might be a new job entry
        if (experienceBuffer.length > 0) {
          // Process previous job entry
          const jobEntry = experienceBuffer.join('\n').trim();
          if (jobEntry.length > 5) {
            profileData.experience.push(jobEntry);
          }
          experienceBuffer = [];
        }
      }
      experienceBuffer.push(line);
      continue;
    }

    // Special handling for education entries
    if (isProcessingEducation) {
      if (isEducationEntry(line)) {
        // This might be a new education entry
        if (educationBuffer.length > 0) {
          // Process previous education entry
          const eduEntry = educationBuffer.join('\n').trim();
          if (eduEntry.length > 3) {
            profileData.education.push(eduEntry);
          }
          educationBuffer = [];
        }
      }
      educationBuffer.push(line);
      continue;
    }

    // Add content to current section
    if (currentSection && line.length > 0) {
      currentContent.push(line);
    } else if (!currentSection && line.length > 0) {
      // If no section detected yet, might be about content
      if (!profileData.about && line.length > 15 && !isLikelyHeadline(line) && !isLikelyName(line)) {
        profileData.about = line;
      }
    }
  }

  // Process final section content
  finalizePreviousSection(profileData, currentSection, currentContent, experienceBuffer, educationBuffer);

  // Clean up and validate data
  return cleanProfileData(profileData);
}

function finalizePreviousSection(
  profileData: ProfileData, 
  section: string, 
  content: string[], 
  experienceBuffer: string[], 
  educationBuffer: string[]
) {
  if (section === 'experience' && experienceBuffer.length > 0) {
    const jobEntry = experienceBuffer.join('\n').trim();
    if (jobEntry.length > 5) {
      profileData.experience.push(jobEntry);
    }
  } else if (section === 'education' && educationBuffer.length > 0) {
    const eduEntry = educationBuffer.join('\n').trim();
    if (eduEntry.length > 3) {
      profileData.education.push(eduEntry);
    }
  } else if (content.length > 0) {
    processSectionContent(profileData, section, content);
  }
}

function isNoiseText(line: string): boolean {
  // Be less aggressive with noise filtering
  const noisePatterns = [
    /^\d+\s*(connection|follower|view|like)s?\s*$/i,
    /^(linkedin|view profile|connect|message|edit profile)$/i,
    /^(home|posts|activity|recommendations)$/i,
    /^\s*[•\-·]\s*$/,
    /^[^\w\s]*$/,
    /^\d{1,2}:\d{2}\s*(am|pm)$/i
  ];

  // Only filter very short lines or pure symbols
  return noisePatterns.some(pattern => pattern.test(line)) || 
         line.length < 1 ||
         /^[\s\-•·]+$/.test(line);
}

function isContactInfo(line: string): boolean {
  return (line.includes('@') && line.includes('.')) ||
         line.includes('linkedin.com') ||
         line.includes('http') ||
         /^[\+]?[\d\s\-\(\)]{10,}$/.test(line) ||
         /^\d{3}-\d{3}-\d{4}$/.test(line);
}

function isSectionHeader(lowerLine: string, sectionType: string): boolean {
  const sectionPatterns = {
    about: ['about', 'summary', 'profile summary', 'professional summary', 'overview'],
    experience: ['experience', 'work experience', 'professional experience', 'work history', 'employment', 'career history'],
    skills: ['skills', 'technical skills', 'core competencies', 'expertise', 'proficiencies', 'technologies'],
    education: ['education', 'academic background', 'academic', 'university', 'college', 'school'],
    certifications: ['certification', 'certifications', 'certificate', 'certificates', 'license', 'licenses', 'credentials']
  };

  const patterns = sectionPatterns[sectionType as keyof typeof sectionPatterns] || [];
  return patterns.some(pattern => 
    lowerLine === pattern || 
    lowerLine === pattern + ':' ||
    lowerLine.startsWith(pattern + ' ') ||
    (lowerLine.includes(pattern) && lowerLine.length < pattern.length + 15)
  );
}

function isLikelyName(line: string): boolean {
  const words = line.split(' ').filter(word => word.length > 0);
  
  // Check if it looks like a name (2-4 words, each starting with capital)
  if (words.length < 2 || words.length > 4) return false;
  
  // All words should start with capital letter and contain mostly letters
  // Enhanced regex to handle hyphens, apostrophes, and multiple capitals
  return words.every(word => /^[A-Z][a-zA-Z\-'\.]*$/.test(word)) &&
         words.every(word => word.length > 1) &&
         !words.some(word => /^(the|and|or|of|in|at|to|for|with|by|inc|llc|corp|ltd)$/i.test(word));
}

function isLikelyHeadline(line: string): boolean {
  const headlineKeywords = [
    'manager', 'developer', 'engineer', 'director', 'specialist', 'analyst',
    'consultant', 'coordinator', 'supervisor', 'lead', 'senior', 'junior',
    'marketing', 'sales', 'product', 'software', 'data', 'business',
    'executive', 'officer', 'administrator', 'designer', 'architect',
    'strategist', 'expert', 'professional', 'associate', 'assistant',
    'student', 'intern', 'freelancer', 'entrepreneur', 'founder', 'ceo',
    'cto', 'cfo', 'vp', 'vice president', 'head of', 'chief', 'principal',
    'scientist', 'researcher', 'technician', 'representative', 'agent',
    'owner', 'partner', 'president', 'team lead', 'project manager'
  ];
  
  const lowerLine = line.toLowerCase();
  
  // Check for job title keywords
  const hasKeywords = headlineKeywords.some(keyword => lowerLine.includes(keyword));
  
  // Check for common headline separators
  const hasSeparators = line.includes('|') || line.includes('•') || line.includes('-') || 
                       line.includes(' at ') || line.includes(' @ ');
  
  // Check length (headlines are usually 10-150 characters)
  const goodLength = line.length >= 8 && line.length <= 150;
  
  // Check if it contains "seeking" or similar job-seeking terms
  const isJobSeeking = lowerLine.includes('seeking') || lowerLine.includes('looking for') || 
                      lowerLine.includes('open to') || lowerLine.includes('available for');
  
  // Check if it has typical headline structure
  const hasHeadlineStructure = /^[A-Z]/.test(line) && 
                              (line.includes(' ') || line.length > 10) &&
                              !line.endsWith('.');
  
  return (hasKeywords || hasSeparators || isJobSeeking) && goodLength && hasHeadlineStructure;
}

function isJobEntry(line: string): boolean {
  const jobTitlePatterns = [
    /^(senior|junior|lead|principal|chief|head of|vp|vice president|director|manager|engineer|developer|analyst|specialist|consultant|coordinator|assistant|associate|intern)/i,
    /\b(manager|engineer|developer|analyst|specialist|consultant|director|coordinator|assistant|associate|lead|senior|junior|intern|owner|partner|president)\b/i
  ];
  
  const companyPatterns = [
    /(inc\.|llc|corp\.|company|ltd\.|organization|university|college|institute|group|solutions|systems|technologies|services|consulting|agency|firm)/i
  ];
  
  const datePatterns = [
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}/i,
    /\d{4}\s*[-–]\s*(\d{4}|present|current)/i,
    /\d{1,2}\/\d{4}/i,
    /\b\d{4}\b/
  ];
  
  // Require combination of indicators for better accuracy
  const hasJobTitle = jobTitlePatterns.some(pattern => pattern.test(line));
  const hasCompany = companyPatterns.some(pattern => pattern.test(line));
  const hasDate = datePatterns.some(pattern => pattern.test(line));
  
  // More permissive - require at least one strong indicator
  return (hasJobTitle || hasCompany || hasDate) && line.length > 3 && line.length < 300;
}

function isEducationEntry(line: string): boolean {
  const degreePatterns = [
    /(bachelor|master|phd|doctorate|associate|certificate|diploma|degree|b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?a\.?|m\.?b\.?a\.?|ph\.?d\.?|high school|hs)/i
  ];
  
  const institutionPatterns = [
    /(university|college|institute|school|academy|tech|polytechnic)/i
  ];
  
  const datePatterns = [
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}/i,
    /\d{4}\s*[-–]\s*\d{4}/i,
    /class of \d{4}/i,
    /\b\d{4}\b/
  ];
  
  const academicPatterns = [
    /(major|minor|gpa|honors|magna cum laude|summa cum laude|dean's list|graduated|graduation)/i
  ];
  
  // More permissive - require at least one indicator
  const hasDegree = degreePatterns.some(pattern => pattern.test(line));
  const hasInstitution = institutionPatterns.some(pattern => pattern.test(line));
  const hasDate = datePatterns.some(pattern => pattern.test(line));
  const hasAcademic = academicPatterns.some(pattern => pattern.test(line));
  
  return (hasDegree || hasInstitution || hasAcademic || hasDate) && line.length > 3 && line.length < 300;
}

function processSectionContent(profileData: ProfileData, section: string, content: string[]) {
  const text = content.join(' ').trim();
  
  switch (section) {
    case 'about':
      if (!profileData.about && text.length > 0) {
        profileData.about = text;
      }
      break;
    case 'skills':
      const skills = parseSkills(text);
      profileData.skills.push(...skills);
      break;
    case 'certifications':
      const certificationEntries = content.filter(line => line.trim().length > 0);
      profileData.certifications?.push(...certificationEntries);
      break;
  }
}

function parseSkills(text: string): string[] {
  // Expanded list of delimiters for better skill splitting
  const delimiters = [',', '•', '|', ';', '\n', '·', '/', '&', '\\', '+', ':', '–', '-', '(', ')', '[', ']', '{', '}'];
  let skills = [text];
  
  for (const delimiter of delimiters) {
    skills = skills.flatMap(skill => skill.split(delimiter));
  }
  
  return skills
    .map(skill => skill.trim())
    .filter(skill => skill.length > 1 && skill.length < 100)
    .filter(skill => !isNoiseText(skill))
    .filter(skill => !/^\d+$/.test(skill)) // Remove pure numbers
    .filter(skill => !/^(and|or|the|of|in|at|to|for|with|by|a|an)$/i.test(skill)) // Remove common words
    .filter(skill => skill.length > 1) // Remove very short entries
    .filter(skill => /[a-zA-Z]/.test(skill)) // Must contain at least one letter
    .slice(0, 100); // Increased limit for skills
}

function cleanProfileData(profileData: ProfileData): ProfileData {
  return {
    name: profileData.name?.trim() || '',
    headline: profileData.headline?.trim() || '',
    about: profileData.about?.trim() || '',
    experience: Array.from(new Set(profileData.experience))
      .filter(exp => exp?.trim().length > 3)
      .slice(0, 30), // Increased limit for experience entries
    skills: Array.from(new Set(profileData.skills))
      .filter(skill => skill?.trim().length > 1)
      .slice(0, 100), // Increased limit for skills
    education: Array.from(new Set(profileData.education))
      .filter(edu => edu?.trim().length > 3)
      .slice(0, 15), // Increased limit for education entries
    certifications: Array.from(new Set(profileData.certifications || []))
      .filter(cert => cert?.trim().length > 0)
      .slice(0, 30) // Increased limit for certifications
  };
}