import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const ImageUploader = ({ onImagesUploaded }) => {
  const [images, setImages] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("You can only upload up to 5 images.");
      return;
    }

    const newImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(newImages);
    onImagesUploaded(newImages);
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
      />
      <div className="grid grid-cols-5 gap-4">
        {images.map((image, index) => (
          <Card key={index} className="p-2">
            <img src={image.preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded" />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
