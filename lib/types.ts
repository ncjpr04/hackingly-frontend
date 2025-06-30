export interface ProfileData {
  name: string;
  headline: string;
  about: string;
  experience: string[];
  skills: string[];
  education: string[];
  certifications?: string[];
}

export interface PersonalInfo {
  fullName: string;
  currentTitle: string;
  location: string;
  contactInfo: string;
  profileUrl?: string;
}

export interface ExperienceItem {
  jobTitle: string;
  company: string;
  duration: string;
  location: string;
  description: string;
  achievements: string[];
  skills: string[];
}

export interface SkillsData {
  technical: string[];
  soft: string[];
  industry: string[];
  tools: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  graduationYear: string;
  gpa?: string;
  honors?: string;
  relevantCoursework: string[];
}

export interface CertificationItem {
  name: string;
  issuer: string;
  dateObtained: string;
  expirationDate?: string;
  credentialId?: string;
}

export interface AdditionalSections {
  projects: string[];
  publications: string[];
  languages: string[];
  volunteer: string[];
  awards: string[];
}

export interface DetailedAnalysis {
  strengths: string[];
  weaknesses: string[];
  missingElements: string[];
  inconsistencies: string[];
}

export interface IndustryBenchmarking {
  profileCompleteness: string;
  competitivePositioning: string;
  marketValue: string;
  differentiators: string[];
}

export interface ExtendedProfileData {
  personalInfo: PersonalInfo;
  headline: string;
  aboutSection: string;
  experience: ExperienceItem[];
  skills: SkillsData;
  education: EducationItem[];
  certifications: CertificationItem[];
  additionalSections: AdditionalSections;
}

export interface AnalysisResult {
  profileData?: ExtendedProfileData;
  overallScore: number;
  sectionScores: {
    headline: number;
    about: number;
    experience: number;
    skills: number;
    education: number;
    completeness?: number;
    presentation?: number;
    keywordOptimization?: number;
  };
  detailedAnalysis?: DetailedAnalysis;
  rewrites: {
    headline: string;
    about: string;
    experienceImprovements?: { originalRole: string; improvedDescription: string; }[];
    skillsPresentation?: string;
    // Keep backward compatibility
    experience?: string;
    skills?: string;
  };
  insights: string[];
  strongSkills: string[];
  missingSkills: string[];
  skillRecommendations: string[];
  careerMatches: CareerMatch[];
  actionableRecommendations?: string[];
  industryBenchmarking?: IndustryBenchmarking;
}

export interface CareerMatch {
  role: string;
  matchPercentage: number;
  description: string;
  requirements: string[];
  salaryRange?: string;
  growthPotential?: string;
  skillGaps?: string[];
  transitionStrategy?: string;
}