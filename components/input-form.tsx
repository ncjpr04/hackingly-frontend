'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Camera, Link, User, Upload, Loader2, AlertCircle } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';
import { UploadHandler } from './upload-handler';

interface InputFormProps {
  onComplete: (result: AnalysisResult) => void;
  onAnalysisStart?: () => void;
}

export function InputForm({ onComplete, onAnalysisStart }: InputFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handlePdfUpload = async (file: File) => {
    setError(null);
    setIsLoading(true);
    onAnalysisStart?.();
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'PDF analysis failed';
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (jsonError) {
          console.warn('Could not parse error response as JSON:', jsonError);
        }
        throw new Error(errorMessage);
      }
      
      const result: AnalysisResult = await response.json();
      onComplete(result);
    } catch (error) {
      console.error('PDF upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while analyzing the PDF';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    setError(null);
    setIsLoading(true);
    onAnalysisStart?.();
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      // Use the new direct image analysis endpoint
      const response = await fetch('/api/analyze-images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Image analysis failed';
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (jsonError) {
          console.warn('Could not parse error response as JSON:', jsonError);
        }
        throw new Error(errorMessage);
      }
      
      const result: AnalysisResult = await response.json();
      onComplete(result);
    } catch (error) {
      console.error('Image upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while processing the images';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!linkedinUrl.trim()) return;
    
    setError(null);
    setIsLoading(true);
    onAnalysisStart?.();
    try {
      const response = await fetch('/api/parse/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkedinUrl }),
      });

      if (!response.ok) {
        let errorMessage = 'URL scraping failed';
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (jsonError) {
          console.warn('Could not parse error response as JSON:', jsonError);
        }
        throw new Error(errorMessage);
      }
      
      const profileData = await response.json();
      
      // Now analyze the scraped data
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      
      if (!analysisResponse.ok) {
        throw new Error('Analysis failed after URL scraping');
      }
      
      const result: AnalysisResult = await analysisResponse.json();
      onComplete(result);
    } catch (error) {
      console.error('URL scraping error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while scraping the URL';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameSubmit = async () => {
    if (!username.trim()) return;
    
    setError(null);
    setIsLoading(true);
    onAnalysisStart?.();
    try {
      const response = await fetch('/api/analyze-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!response.ok) {
        let errorMessage = 'LinkedIn profile analysis failed';
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (jsonError) {
          console.warn('Could not parse error response as JSON:', jsonError);
        }
        throw new Error(errorMessage);
      }
      
      const result: AnalysisResult = await response.json();
      onComplete(result);
    } catch (error) {
      console.error('Username analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while analyzing the LinkedIn profile';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Analyze Your LinkedIn Profile
        </h1>
        <p className="text-lg text-gray-600">
          Choose your preferred method to get started with the analysis
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Select Input Method</CardTitle>
          <CardDescription className="text-center">
            We support multiple ways to analyze your LinkedIn profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pdf" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100">
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                PDF Upload
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Screenshots
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Profile URL
              </TabsTrigger>
              <TabsTrigger value="username" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Username
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pdf" className="mt-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Upload LinkedIn PDF</h3>
                <p className="text-gray-600 mb-8">
                  Export your LinkedIn profile as PDF and upload it here for instant AI analysis
                </p>
                
                <UploadHandler
                  accept=".pdf"
                  onUpload={(files) => handlePdfUpload(Array.isArray(files) ? files[0] : files)}
                  isLoading={isLoading}
                  multiple={false}
                />
              </div>
            </TabsContent>

            <TabsContent value="images" className="mt-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Camera className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Upload Screenshots</h3>
                <p className="text-gray-600 mb-8">
                  Take screenshots of your LinkedIn profile sections and get instant AI analysis with detailed insights
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-semibold text-blue-900 mb-2">📸 Pro Tips for Best Results:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Capture your full profile header (name, headline, photo)</li>
                    <li>• Include complete About/Summary section</li>
                    <li>• Screenshot all experience entries with descriptions</li>
                    <li>• Capture skills section and endorsements</li>
                    <li>• Include education and certifications</li>
                    <li>• Ensure text is clear and readable</li>
                  </ul>
                </div>
                
                <UploadHandler
                  accept="image/*"
                  onUpload={(files) => handleImageUpload(Array.isArray(files) ? files : [files])}
                  isLoading={isLoading}
                  multiple={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="url" className="mt-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Link className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">LinkedIn Profile URL</h3>
                <p className="text-gray-600 mb-8">
                  Provide your LinkedIn profile URL and we'll scrape the public information
                </p>
                
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
                    <Input
                      id="linkedin-url"
                      type="url"
                      placeholder="https://www.linkedin.com/in/your-profile"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  
                  <Button
                    onClick={handleUrlSubmit}
                    disabled={isLoading || !linkedinUrl.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Profile...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Analyze Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="username" className="mt-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">LinkedIn Username</h3>
                <p className="text-gray-600 mb-8">
                  Enter your LinkedIn username and we'll fetch your profile data for instant AI analysis
                </p>
                
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="linkedin-username">LinkedIn Username</Label>
                    <Input
                      id="linkedin-username"
                      type="text"
                      placeholder="your-linkedin-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Just the username part from your LinkedIn URL (e.g., "john-doe" from linkedin.com/in/john-doe)
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleUsernameSubmit}
                    disabled={isLoading || !username.trim()}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Profile...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Analyze Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}