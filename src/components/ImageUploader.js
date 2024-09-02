import { useState, useCallback } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Loader2, X } from 'lucide-react';

const ImageUploader = ({ onImagesUploaded }) => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("You can only upload up to 5 images.");
      return;
    }

    setIsLoading(true);
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }));

    const loadImages = newImages.map(image => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(image);
        img.src = image.preview;
      });
    });

    Promise.all(loadImages).then((loadedImages) => {
      setImages(prevImages => [...prevImages, ...loadedImages]);
      onImagesUploaded(prevImages => [...prevImages, ...loadedImages]);
      setIsLoading(false);
    });
  }, [onImagesUploaded]);

  const handleClear = useCallback(() => {
    setImages([]);
    onImagesUploaded([]);
  }, [onImagesUploaded]);

  const handleDelete = useCallback((id) => {
    setImages(prevImages => prevImages.filter(image => image.id !== id));
    onImagesUploaded(prevImages => prevImages.filter(image => image.id !== id));
  }, [onImagesUploaded]);

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          disabled={isLoading}
        />
        <Button onClick={handleClear} variant="outline" disabled={isLoading}>Clear</Button>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading images...</span>
        </div>
      )}
      <div className="grid grid-cols-5 gap-4">
        {images.map((image, index) => (
          <Card key={image.id} className="p-2 relative">
            <img src={image.preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={() => handleDelete(image.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;