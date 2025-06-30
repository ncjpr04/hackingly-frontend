'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight, Edit3, Eye } from 'lucide-react';
import { ProfileData } from '@/lib/types';

interface PreviewCardProps {
  data: ProfileData;
  onComplete: (editedData: ProfileData) => void;
  onBack: () => void;
}

export function PreviewCard({ data, onComplete, onBack }: PreviewCardProps) {
  const [editedData, setEditedData] = useState<ProfileData>(data);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof ProfileData, index: number, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: keyof ProfileData) => {
    setEditedData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const removeArrayItem = (field: keyof ProfileData, index: number) => {
    setEditedData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Review Your Profile
        </h1>
        <p className="text-lg text-gray-600">
          Check the extracted information and make any necessary edits before analysis
        </p>
      </div>

      <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Profile Preview</CardTitle>
            <CardDescription>
              Review and edit your profile information before AI analysis
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            {isEditing ? <Eye className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            {isEditing ? 'Preview' : 'Edit'}
          </Button>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editedData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 p-3 bg-gray-50 rounded-md">{editedData.name || 'Not provided'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="headline">Professional Headline</Label>
                {isEditing ? (
                  <Input
                    id="headline"
                    value={editedData.headline}
                    onChange={(e) => handleInputChange('headline', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 p-3 bg-gray-50 rounded-md">{editedData.headline || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* About Section */}
          <div>
            <Label htmlFor="about">About Section</Label>
            {isEditing ? (
              <Textarea
                id="about"
                value={editedData.about}
                onChange={(e) => handleInputChange('about', e.target.value)}
                className="mt-1 min-h-32"
                placeholder="Your professional summary..."
              />
            ) : (
              <p className="mt-1 p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                {editedData.about || 'Not provided'}
              </p>
            )}
          </div>

          <Separator />

          {/* Experience Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Experience</Label>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('experience')}
                >
                  Add Experience
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {editedData.experience.map((exp, index) => (
                <div key={index} className="relative">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Textarea
                        value={exp}
                        onChange={(e) => handleArrayChange('experience', index, e.target.value)}
                        className="flex-1"
                        placeholder="Job title, company, duration, and description..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('experience', index)}
                        className="self-start"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <p className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                      {exp || 'Not provided'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Skills Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Skills</Label>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('skills')}
                >
                  Add Skill
                </Button>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-2">
              {editedData.skills.map((skill, index) => (
                <div key={index} className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Input
                        value={skill}
                        onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                        className="flex-1"
                        placeholder="Skill name..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('skills', index)}
                      >
                        Remove
                      </Button>
                    </>
                  ) : (
                    <p className="p-2 bg-gray-50 rounded-md flex-1">
                      {skill || 'Not provided'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Education Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Education</Label>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('education')}
                >
                  Add Education
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {editedData.education.map((edu, index) => (
                <div key={index}>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Textarea
                        value={edu}
                        onChange={(e) => handleArrayChange('education', index, e.target.value)}
                        className="flex-1"
                        placeholder="Degree, institution, year..."
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('education', index)}
                        className="self-start"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <p className="p-4 bg-gray-50 rounded-md">
                      {edu || 'Not provided'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <div className="p-6 bg-gray-50/50 flex justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Input
          </Button>
          
          <Button 
            onClick={() => onComplete(editedData)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center gap-2"
          >
            Continue to Analysis
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}