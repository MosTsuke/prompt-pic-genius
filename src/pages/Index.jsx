import React, { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateDescriptionAndKeywords } from '@/lib/openai';

const Index = () => {
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState([]);

  const handleImagesUploaded = (newImages) => {
    setImages(newImages);
  };

  const handleGenerateContent = async () => {
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    try {
      const result = await generateDescriptionAndKeywords(images);
      setDescription(result.description);
      setKeywords(result.keywords);
    } catch (error) {
      console.error("Error generating content:", error);
      alert("An error occurred while generating content. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center">Image Description and Keyword Generator</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Images (Max 5)</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader onImagesUploaded={handleImagesUploaded} />
        </CardContent>
      </Card>

      <Button onClick={handleGenerateContent} className="w-full">
        Generate Description and Keywords
      </Button>

      {description && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{description}</p>
          </CardContent>
        </Card>
      )}

      {keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;
