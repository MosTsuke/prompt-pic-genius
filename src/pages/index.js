import { useState } from 'react';
import Head from 'next/head';
import ImageUploader from '../components/ImageUploader';
import ResultsTable from '../components/ResultsTable';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { generateDescriptionAndKeywords } from '../lib/openai';

export default function Home() {
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
        const result = await generateDescriptionAndKeywords(image.file);
        return { 
          ...result, 
          id: image.id,
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

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Head>
        <title>Image Description and Keyword Generator</title>
        <meta name="description" content="Generate descriptions and keywords for images using AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
        <ResultsTable generatedContent={generatedContent} images={images} />
      )}
    </div>
  );
}