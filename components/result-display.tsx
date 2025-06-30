'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Copy, 
  RotateCcw, 
  TrendingUp, 
  Award, 
  Lightbulb, 
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  PieChart,
  Users,
  Briefcase,
  GraduationCap,
  Star,
  Zap,
  Brain,
  Rocket,
  Shield,
  Globe
} from 'lucide-react';
import { AnalysisResult } from '@/lib/types';
import { generatePDF } from '@/lib/pdf-generator';
import { 
  RadialBarChart, 
  RadialBar, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

interface ResultDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  onStartOver: () => void;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

export function ResultDisplay({ result, isLoading, onStartOver }: ResultDisplayProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const downloadReport = async () => {
    if (!result) return;
    
    try {
      await generatePDF(result);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  const renderRewriteSection = (section: string, content: any) => {
    if (section === 'experienceImprovements' && Array.isArray(content)) {
      return (
        <div className="space-y-4">
          {content.map((item, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 bg-blue-50/30 p-4 rounded-r-lg">
              <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {item.originalRole}
              </h5>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {item.improvedDescription}
              </p>
            </div>
          ))}
        </div>
      );
    }
    
    if (typeof content === 'string') {
      return (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 p-4 rounded-lg border-l-4 border-indigo-500">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
        </div>
      );
    }
    
    return (
      <p className="text-gray-500 italic">
        No content available for this section.
      </p>
    );
  };

  const getRewriteText = (section: string, content: any): string => {
    if (section === 'experienceImprovements' && Array.isArray(content)) {
      return content.map(item => `${item.originalRole}:\n${item.improvedDescription}`).join('\n\n');
    }
    return typeof content === 'string' ? content : '';
  };

  // Prepare chart data
  const sectionScoreData = result ? Object.entries(result.sectionScores).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    score: value,
    fill: COLORS[Object.keys(result.sectionScores).indexOf(key) % COLORS.length]
  })) : [];

  const radialData = result ? [{
    name: 'Overall Score',
    score: result.overallScore,
    fill: result.overallScore >= 80 ? '#10B981' : result.overallScore >= 60 ? '#F59E0B' : '#EF4444'
  }] : [];

  const skillsComparisonData = result ? [
    { name: 'Strong Skills', count: result.strongSkills.length, fill: '#10B981' },
    { name: 'Missing Skills', count: result.missingSkills.length, fill: '#EF4444' },
  ] : [];

  const careerMatchData = result ? result.careerMatches.map((career, index) => ({
    name: career.role.length > 20 ? career.role.substring(0, 20) + '...' : career.role,
    match: career.matchPercentage,
    fill: COLORS[index % COLORS.length]
  })) : [];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center animate-pulse">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analyzing Your Profile...
              </h3>
              <p className="text-gray-600">
                Our AI is performing deep analysis of your LinkedIn profile
              </p>
            </div>
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analysis Failed
              </h3>
              <p className="text-gray-600 mb-6">
                We encountered an error while analyzing your profile. Please try again.
              </p>
              <Button onClick={onStartOver} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header with Overall Score and Key Metrics */}
      <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-0 shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Award className="h-8 w-8" />
            </div>
            <CardTitle className="text-4xl font-bold">Profile Analysis Complete</CardTitle>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            {/* Overall Score Radial Chart */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData}>
                    <RadialBar dataKey="score" cornerRadius={10} fill={radialData[0]?.fill} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{result.overallScore}/100</div>
                <p className="text-blue-100">Overall Score</p>
              </div>
            </div>

            {/* Key Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  <span>Strong Skills</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {result.strongSkills.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <span>Career Matches</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {result.careerMatches.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  <span>Insights</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {result.insights.length}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <Button
                onClick={downloadReport}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
              <Button
                onClick={onStartOver}
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Analyze Another Profile
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Detailed Analysis Dashboard */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Section Scores Chart */}
        <Card className="lg:col-span-2 bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Section Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionScoreData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Skills Overview */}
        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              Skills Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={skillsComparisonData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="count"
                  >
                    {skillsComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {skillsComparisonData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Career Matches Visualization */}
      {result.careerMatches.length > 0 && (
        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-green-600" />
              Career Path Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={careerMatchData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="match" 
                    stroke="#10B981" 
                    fill="url(#colorMatch)" 
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorMatch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis Tabs */}
      <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
        <CardContent className="p-8">
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-gray-100/80 backdrop-blur-sm">
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="rewrites" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Rewrites
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Skills Gap
              </TabsTrigger>
              <TabsTrigger value="careers" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Career Fit
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Deep Analysis
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Action Plan
              </TabsTrigger>
            </TabsList>

            {/* Insights Tab */}
            <TabsContent value="insights" className="mt-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  AI-Powered Insights
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {result.insights.map((insight, index) => (
                    <Card key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          </div>
                          <p className="text-gray-700 leading-relaxed">{insight}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {result.detailedAnalysis && (
                <>
                  <Separator />
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Key Strengths
                      </h4>
                      <div className="space-y-3">
                        {result.detailedAnalysis.strengths.map((strength, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                            <Star className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <p className="text-gray-700 text-sm">{strength}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Areas for Improvement
                      </h4>
                      <div className="space-y-3">
                        {result.detailedAnalysis.weaknesses.map((weakness, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                            <Target className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                            <p className="text-gray-700 text-sm">{weakness}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Rewrites Tab */}
            <TabsContent value="rewrites" className="mt-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-yellow-600" />
                AI-Generated Professional Rewrites
              </h3>
              
              {Object.entries(result.rewrites).map(([section, rewrite]) => {
                if (!rewrite) return null;
                
                const displayName = section === 'experienceImprovements' ? 'Experience Improvements' :
                                  section === 'skillsPresentation' ? 'Skills Presentation' :
                                  section.charAt(0).toUpperCase() + section.slice(1);
                
                return (
                  <Card key={section} className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-indigo-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          {section === 'headline' && <Users className="h-4 w-4 text-indigo-600" />}
                          {section === 'about' && <Globe className="h-4 w-4 text-indigo-600" />}
                          {section === 'experienceImprovements' && <Briefcase className="h-4 w-4 text-indigo-600" />}
                          {section === 'skillsPresentation' && <Star className="h-4 w-4 text-indigo-600" />}
                        </div>
                        {displayName}
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(getRewriteText(section, rewrite), section)}
                        className="flex items-center gap-2 hover:bg-indigo-50"
                      >
                        {copiedSection === section ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {renderRewriteSection(section, rewrite)}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/* Skills Gap Tab */}
            <TabsContent value="skills" className="mt-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="h-6 w-6 text-purple-600" />
                Skills Gap Analysis
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Strong Skills ({result.strongSkills.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.strongSkills.map((skill, index) => (
                        <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Skills to Develop ({result.missingSkills.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50 transition-colors">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Skill Development Roadmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.skillRecommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-white/60 rounded-lg border border-blue-200">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Career Fit Tab */}
            <TabsContent value="careers" className="mt-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                Career Path Analysis
              </h3>
              
              <div className="grid gap-6">
                {result.careerMatches.map((career, index) => (
                  <Card key={index} className="bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 border-purple-200 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Briefcase className="h-5 w-5 text-purple-600" />
                          </div>
                          {career.role}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-800 text-lg px-3 py-1">
                            {career.matchPercentage}% Match
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700 leading-relaxed">{career.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Key Requirements:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {career.requirements.map((req, reqIndex) => (
                              <Badge key={reqIndex} variant="outline" className="text-sm">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {career.skillGaps && career.skillGaps.length > 0 && (
                          <div>
                            <p className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                              <Target className="h-4 w-4 text-orange-600" />
                              Skill Gaps:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {career.skillGaps.map((gap, gapIndex) => (
                                <Badge key={gapIndex} variant="outline" className="text-sm border-orange-300 text-orange-700">
                                  {gap}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {(career.salaryRange || career.growthPotential) && (
                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-purple-200">
                          {career.salaryRange && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">Salary Range:</span>
                              <Badge variant="secondary">{career.salaryRange}</Badge>
                            </div>
                          )}
                          {career.growthPotential && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">Growth:</span>
                              <Badge variant="secondary">{career.growthPotential}</Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Deep Analysis Tab */}
            <TabsContent value="analysis" className="mt-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="h-6 w-6 text-indigo-600" />
                Deep Profile Analysis
              </h3>

              {result.detailedAnalysis && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-red-50/50 border-red-200">
                    <CardHeader>
                      <CardTitle className="text-red-800 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Missing Elements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.detailedAnalysis.missingElements.map((element, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{element}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-50/50 border-yellow-200">
                    <CardHeader>
                      <CardTitle className="text-yellow-800 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Inconsistencies Found
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.detailedAnalysis.inconsistencies.map((inconsistency, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{inconsistency}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}

              {result.industryBenchmarking && (
                <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                  <CardHeader>
                    <CardTitle className="text-indigo-800 flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Industry Benchmarking
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Profile Completeness</h5>
                        <p className="text-gray-700 text-sm">{result.industryBenchmarking.profileCompleteness}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Market Value</h5>
                        <p className="text-gray-700 text-sm">{result.industryBenchmarking.marketValue}</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Competitive Positioning</h5>
                      <p className="text-gray-700 text-sm">{result.industryBenchmarking.competitivePositioning}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Key Differentiators</h5>
                      <div className="flex flex-wrap gap-2">
                        {result.industryBenchmarking.differentiators.map((diff, index) => (
                          <Badge key={index} className="bg-indigo-100 text-indigo-800">
                            {diff}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Action Plan Tab */}
            <TabsContent value="actions" className="mt-8 space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-600" />
                Actionable Improvement Plan
              </h3>

              {result.actionableRecommendations && result.actionableRecommendations.length > 0 && (
                <div className="space-y-4">
                  {result.actionableRecommendations.map((action, index) => {
                    const priority = index < 2 ? 'high' : index < 4 ? 'medium' : 'low';
                    const priorityColors = {
                      high: 'bg-red-50 border-red-200 text-red-800',
                      medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                      low: 'bg-green-50 border-green-200 text-green-800'
                    };
                    
                    return (
                      <Card key={index} className={`${priorityColors[priority]} border-l-4`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-white/60 rounded-lg flex-shrink-0">
                              <span className="font-semibold text-sm">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-700 leading-relaxed">{action}</p>
                              <div className="mt-2">
                                <Badge variant="outline" className={`text-xs ${
                                  priority === 'high' ? 'border-red-300 text-red-700' :
                                  priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                                  'border-green-300 text-green-700'
                                }`}>
                                  {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}