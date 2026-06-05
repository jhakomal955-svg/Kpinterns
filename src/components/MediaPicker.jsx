"use client";

import { useState, useRef } from "react";

export default function MediaPicker({
  onFileSelect,
  acceptedFormats = ["image/*", "video/*", "application/pdf"],
  maxSize = 100, // MB
  multiple = false,
  isUploading = false,
  uploadedItems = [],
  onRemoveItem = null,
}) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadErrors, setUploadErrors] = useState([]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes, k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("video")) return "🎬";
    if (fileType.includes("pdf")) return "📄";
    return "📎";
  };

  const getFileCategory = (fileType) => {
    if (fileType.includes("image")) return "Image";
    if (fileType.includes("video")) return "Video";
    if (fileType.includes("pdf")) return "Document";
    return "File";
  };

  const validateFile = (file) => {
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSize}MB limit`;
    }
    return null;
  };

  const handleFiles = (files) => {
    const newErrors = [];
    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push({ name: file.name, error });
      } else {
        onFileSelect(file);
      }
    });
    if (newErrors.length > 0) {
      setUploadErrors(newErrors);
      setTimeout(() => setUploadErrors([]), 5000);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        className={`relative w-full border-3 border-dashed rounded-2xl p-8 transition-all duration-300 ${
          dragActive
            ? "border-brand-primary bg-brand-primary/5 scale-[1.02]"
            : "border-border-main bg-bg-main hover:border-brand-primary hover:bg-brand-primary/2"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          onChange={handleChange}
          accept={acceptedFormats.join(",")}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 text-5xl animate-bounce">
            {dragActive ? "📥" : "📤"}
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">
            {dragActive
              ? "Drop your files here"
              : "Drag & drop media files here"}
          </h3>
          <p className="text-sm text-text-muted mb-4">
            or click the button below to select files
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-6 rounded-xl shadow transition duration-200 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            {isUploading ? "Uploading..." : "Choose Files"}
          </button>
          <p className="text-xs text-text-muted mt-4">
            Supported: Images, Videos, PDFs (Max {maxSize}MB per file)
          </p>
        </div>
      </div>

      {/* Error Messages */}
      {uploadErrors.length > 0 && (
        <div className="space-y-2">
          {uploadErrors.map((err, idx) => (
            <div
              key={idx}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm flex items-start gap-2"
            >
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-semibold">{err.name}</p>
                <p className="text-xs">{err.error}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Items Display */}
      {uploadedItems && uploadedItems.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-text-main text-sm uppercase tracking-wide">
            Uploaded Media ({uploadedItems.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedItems.map((item, idx) => {
              // Handle both string URLs and object formats
              const itemUrl = typeof item === "string" ? item : item.url;
              const itemName =
                typeof item === "string"
                  ? itemUrl.split("/").pop().split("?")[0]
                  : item.name || itemUrl.split("/").pop().split("?")[0];
              const fileType =
                typeof item === "string" ? "image" : item.type || "image";

              return (
                <div
                  key={idx}
                  className="relative group bg-bg-card border-2 border-border-main rounded-xl overflow-hidden hover:border-brand-primary transition-all"
                >
                  {/* Preview */}
                  <div className="aspect-video bg-bg-main flex items-center justify-center overflow-hidden relative">
                    {fileType.includes("image") && (
                      <img
                        src={itemUrl}
                        alt={itemName}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {fileType.includes("video") && (
                      <video
                        src={itemUrl}
                        className="w-full h-full object-cover"
                        onMouseEnter={(e) => e.target.play()}
                        onMouseLeave={(e) => e.target.pause()}
                      />
                    )}
                    {fileType.includes("pdf") && (
                      <div className="flex flex-col items-center justify-center text-4xl">
                        <span>📄</span>
                        <span className="text-xs text-text-muted mt-2">
                          PDF
                        </span>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
                      {onRemoveItem && (
                        <button
                          type="button"
                          onClick={() => onRemoveItem(idx)}
                          className="opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-200 p-3 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg"
                          title="Remove this file"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-1">
                    <p className="text-xs font-semibold text-text-main truncate">
                      {itemName}
                    </p>
                    <p className="text-xs text-text-muted">
                      {getFileCategory(fileType)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
