import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
  placeholder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  currentImage,
  placeholder = "Upload an image"
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(currentImage || '');
  const { toast } = useToast();

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ZOOJAPP');
    formData.append('cloud_name', 'dtivjmfgj');

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dtivjmfgj/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const imageUrl = await uploadToCloudinary(file);
      setPreviewImage(imageUrl);
      onImageUpload(imageUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage('');
    onImageUpload('');
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-lg p-6">
        {previewImage ? (
          <div className="relative">
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Image className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">{placeholder}</p>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
              id="image-upload"
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById('image-upload')?.click()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Choose Image'}
            </Button>
          </div>
        )}
      </div>
      {previewImage && (
        <div className="text-sm text-muted-foreground">
          <p>✓ Image uploaded successfully</p>
        </div>
      )}
    </div>
  );
};