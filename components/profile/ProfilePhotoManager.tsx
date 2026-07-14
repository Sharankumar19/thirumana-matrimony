"use client";
// components/profile/ProfilePhotoManager.tsx
import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, CheckCircle, Loader } from "lucide-react";
import toast from "react-hot-toast";

interface ProfileImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

export default function ProfilePhotoManager() {
  const [images, setImages] = useState<ProfileImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/profile/upload", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        setImages(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load photos");
    } finally {
      setLoading(false);
    }
  }

  async function uploadFile(file: File): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append("profile_image", file);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found. Please login again.");
        return false;
      }

      const res = await fetch("/api/profile/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      console.log(`Upload response for ${file.name}:`, {
        status: res.status,
        data,
      });

      if (!res.ok) {
        const errorMsg =
          data.error || `Upload failed with status ${res.status}`;
        console.error(`Upload error: ${errorMsg}`);
        toast.error(errorMsg);
        return false;
      }

      if (data.success) {
        setImages((prev) => [...prev, data.data]);
        return true;
      } else {
        toast.error(data.error || `Failed to upload ${file.name}`);
        return false;
      }
    } catch (err) {
      console.error("Upload exception:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload photo";
      toast.error(errorMessage);
      return false;
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      let successCount = 0;
      const totalFiles = files.length;

      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        const success = await uploadFile(files[i]);
        if (success) {
          successCount++;
        }
      }

      if (successCount > 0) {
        toast.success(
          successCount === totalFiles
            ? `All ${totalFiles} photo(s) uploaded successfully!`
            : `${successCount} of ${totalFiles} photo(s) uploaded`,
        );
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(imageId: number) {
    if (!confirm("Are you sure you want to delete this photo?")) {
      toast.success("Photo deletion cancelled");
      return;
    }

    try {
      setDeleting(imageId);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/profile/images/${imageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setImages(images.filter((img) => img.id !== imageId));
        toast.success("Photo deleted successfully");
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete photo");
    } finally {
      setDeleting(null);
    }
  }

  async function handleSetPrimary(imageId: number) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/profile/images/${imageId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        // Update images locally
        setImages(
          images.map((img) => ({
            ...img,
            is_primary: img.id === imageId,
          })),
        );
        toast.success("Photo set as primary");
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update photo");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="w-5 h-5 text-rose-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Upload Button */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={uploading}
          multiple
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full bg-rose-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-rose-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2 p-2"
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading..." : "Add Photos (Multiple)"}
        </button>
      </div>

      {/* Photos Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Photos
        </h3>

        {images.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-500">
              No photos yet. Upload your first photo!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                {/* Image */}
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={image.image_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Primary Badge */}
                {image.is_primary && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Primary
                  </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  {!image.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(image.id)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      title="Set as primary"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(image.id)}
                    disabled={deleting === image.id}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-500 transition-colors"
                    title="Delete photo"
                  >
                    {deleting === image.id ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> Upload multiple photos to increase your
          visibility. The first photo will be used as your primary profile
          picture. You can select multiple files at once!
        </p>
      </div>
    </div>
  );
}
