import React, { useState, useCallback } from 'react';
import ImageUploader from '@/components/ImageUploader';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generateDescriptionAndKeywords } from '@/lib/openai';
import { CopyIcon, CheckIcon } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

const Index = () => {
  const [images, setImages] = useState([]);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImagesUploaded = useCallback((newImages) => {
    setImages(newImages);
    setGeneratedContent([]);
  }, []);

  const handleGenerateContent = async () => {
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setIsGenerating(true);
    try {
      const newContent = await Promise.all(images.map(async (image) => {
        const result = await generateDescriptionAndKeywords(image);
        const description = result.description;
        const wordCount = description.trim().split(/\s+/).length;
        return { 
          ...result, 
          id: image.id,
          description,
          descriptionStats: {
            characters: description.length,
            words: wordCount
          },
          keywords: result.keywords
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

      <Button onClick={handleGenerateContent} className="w-full" disabled={isGenerating || images.length === 0}>
        {isGenerating ? 'Generating...' : 'Generate Description and Keywords'}
      </Button>

      {generatedContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Keywords</TableHead>
                    <TableHead className="w-[100px]">Token Usage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedContent.map((content, index) => (
                    <TableRow key={content.id}>
                      <TableCell className="p-2">
                        <img 
                          src={images.find(img => img.id === content.id)?.preview} 
                          alt={`Preview ${index + 1}`} 
                          className="w-24 h-24 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="mb-2 max-h-48 overflow-y-auto">{content.description}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          Characters: {content.descriptionStats.characters}, Words: {content.descriptionStats.words}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(content.description, content.id, 'description')}
                          className="mt-2"
                        >
                          {content.descriptionCopied ? <CheckIcon className="h-4 w-4 mr-2" /> : <CopyIcon className="h-4 w-4 mr-2" />}
                          Copy
                        </Button>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {content.keywords.map((keyword, keywordIndex) => (
                            <span key={keywordIndex} className="bg-gray-100 text-gray-800 rounded-full px-2 py-1 text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          Keywords: {content.keywords.length}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(content.keywords.join(', '), content.id, 'keywords')}
                        >
                          {content.keywordsCopied ? <CheckIcon className="h-4 w-4 mr-2" /> : <CopyIcon className="h-4 w-4 mr-2" />}
                          Copy
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        {content.tokenUsage}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;
