import React, { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateDescriptionAndKeywords } from '@/lib/openai';
import { CopyIcon, CheckIcon } from 'lucide-react';

const Index = () => {
  const [images, setImages] = useState([]);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImagesUploaded = (newImages) => {
    setImages(newImages);
    setGeneratedContent([]);
  };

  const handleGenerateContent = async () => {
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setIsGenerating(true);
    try {
      const newContent = await Promise.all(images.map(async (image) => {
        const result = await generateDescriptionAndKeywords(image);
        const description = result.description.slice(0, 200); // Limit to 200 characters
        const wordCount = description.trim().split(/\s+/).length;
        return { 
          ...result, 
          id: image.id,
          description,
          descriptionStats: {
            characters: description.length,
            words: wordCount
          },
          keywords: result.keywords.slice(0, Math.max(40, result.keywords.length))
        };
      }));
      setGeneratedContent(newContent);
    } catch (error) {
      console.error("Error generating content:", error);
      alert("An error occurred while generating content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text, id, type) => {
    try {
      await navigator.clipboard.writeText(text);
      const updatedContent = generatedContent.map(content => {
        if (content.id === id) {
          return { ...content, [`${type}Copied`]: true };
        }
        return content;
      });
      setGeneratedContent(updatedContent);
      setTimeout(() => {
        const resetContent = generatedContent.map(content => {
          if (content.id === id) {
            return { ...content, [`${type}Copied`]: false };
        }
          return content;
        });
        setGeneratedContent(resetContent);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
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

      <Button onClick={handleGenerateContent} className="w-full" disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Description and Keywords'}
      </Button>

      {generatedContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex overflow-x-auto space-x-4">
              {generatedContent.map((content, index) => (
                <div key={content.id} className="flex-none w-96">
                  <img 
                    src={images.find(img => img.id === content.id).preview} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-64 object-cover rounded mb-4"
                  />
                  <ScrollArea className="h-96 w-full rounded-md border p-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">Description</h3>
                        <p>{content.description}</p>
                        <p className="text-xs text-gray-500">
                          Characters: {content.descriptionStats.characters}, Words: {content.descriptionStats.words}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(content.description, content.id, 'description')}
                        >
                          {content.descriptionCopied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div>
                        <h3 className="font-semibold">Keywords</h3>
                        <div className="flex flex-wrap gap-1">
                          {content.keywords.map((keyword, keywordIndex) => (
                            <span key={keywordIndex} className="bg-gray-200 rounded-full px-2 py-1 text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Keywords: {content.keywords.length}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(content.keywords.join(', '), content.id, 'keywords')}
                        >
                          {content.keywordsCopied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div>
                        <h3 className="font-semibold">Token Usage</h3>
                        <p>Tokens used: {content.tokenUsage}</p>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;
