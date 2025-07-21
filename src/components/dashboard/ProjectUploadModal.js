import React, { useState } from 'react';
import { X, Link, Plus, Trash2, AlertCircle } from 'lucide-react';
import { projectAPI } from '../../services/api';

const ProjectUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    impactArea: ''
  });

  // Only URL states (no file states)
  const [imageUrls, setImageUrls] = useState(['']);

  const [videoUrls, setVideoUrls] = useState(['']);

  const [documentUrls, setDocumentUrls] = useState(['']);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

  };

  // URL handling functions
  const handleUrlChange = (index, value, type) => {
    if (type === 'images') {
      const newUrls = [...imageUrls];
      newUrls[index] = value;
      setImageUrls(newUrls);
    } else if (type === 'videos') {
      const newUrls = [...videoUrls];
      newUrls[index] = value;
      setVideoUrls(newUrls);
    } else if (type === 'documents') {
      const newUrls = [...documentUrls];
      newUrls[index] = value;
      setDocumentUrls(newUrls);
    }
  };

  const addUrlField = (type) => {
    if (type === 'images') {
      setImageUrls(prev => [...prev, '']);
    } else if (type === 'videos') {
      setVideoUrls(prev => [...prev, '']);
    } else if (type === 'documents') {
      setDocumentUrls(prev => [...prev, '']);
    }
  };

  const removeUrlField = (index, type) => {
    if (type === 'images') {
      setImageUrls(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'videos') {
      setVideoUrls(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'documents') {
      setDocumentUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Validation functions
  const validateGoogleDriveUrl = (url) => {
    return url.includes('drive.google.com');
  };

  const validateYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Basic validation
    if (!formData.title || !formData.description) {
      setErrors({ general: 'Title and description are required' });
      setLoading(false);
      return;
    }

    // URL validation
    const validationErrors = {};

    // Validate image URLs (Google Drive only)
    const validImageUrls = imageUrls.filter(url => url.trim());
    for (const url of validImageUrls) {
      if (!validateGoogleDriveUrl(url)) {
        validationErrors.images = 'All image URLs must be Google Drive links';
        break;
      }
    }

    // Validate video URLs (YouTube only)
    const validVideoUrls = videoUrls.filter(url => url.trim());
    for (const url of validVideoUrls) {
      if (!validateYouTubeUrl(url)) {
        validationErrors.videos = 'All video URLs must be YouTube links';
        break;
      }
    }

    // Validate document URLs (Google Drive only)
    const validDocumentUrls = documentUrls.filter(url => url.trim());
    for (const url of validDocumentUrls) {
      if (!validateGoogleDriveUrl(url)) {
        validationErrors.documents = 'All document URLs must be Google Drive links';
        break;
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      // Prepare project data
      const projectData = {
        ...formData,
        imageUrls: validImageUrls,
        videoUrls: validVideoUrls,
        documentUrls: validDocumentUrls
      };

      console.log('🚀 Submitting project data:', projectData);

      // Use the API service
      const response = await projectAPI.createProject(projectData);

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        impactArea: ''
      });
      setImageUrls(['']);
      setVideoUrls(['']);
      setDocumentUrls(['']);

      // Call success callback
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(response.data.project);
      }

      onClose();

    } catch (error) {
      console.error('❌ Project creation error:', error);
      setErrors({ general: error.message || 'Failed to create project' });
    } finally {
      setLoading(false);
    }
  };

  const UrlSection = ({ title, type, urls, placeholder, validation, icon }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {title}
      </label>
      
      {/* Validation info */}
      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start space-x-2">
          <AlertCircle size={16} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">{validation.title}</p>
            <p className="text-blue-600">{validation.description}</p>
            <p className="text-xs mt-1 text-blue-500">Example: {validation.example}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {urls.map((url, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(index, e.target.value, type)}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[type] ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {icon && (
                <div className="absolute right-3 top-2.5 text-gray-400">
                  {icon}
                </div>
              )}
            </div>
            {urls.length > 1 && (
              <button
                type="button"
                onClick={() => removeUrlField(index, type)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
        
        {errors[type] && (
          <p className="text-sm text-red-600">{errors[type]}</p>
        )}
        
        <button
          type="button"
          onClick={() => addUrlField(type)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
        >
          <Plus size={16} />
          <span>Add Another {title.slice(0, -1)} URL</span>
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upload New Project</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Technology">Technology</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Environment">Environment</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Finance">Finance</option>
                <option value="Social Impact">Social Impact</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Impact Area
            </label>
            <input
              type="text"
              name="impactArea"
              value={formData.impactArea}
              onChange={handleInputChange}
              placeholder="e.g., Rural Development, Youth Empowerment"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* URL Sections */}
          <UrlSection
            title="Images"
            type="images"
            urls={imageUrls}
            placeholder="https://drive.google.com/file/d/your-file-id/view"
            validation={{
              title: "Google Drive Images Required",
              description: "Upload your images to Google Drive and share the link here.",
              example: "https://drive.google.com/file/d/1ABC123.../view"
            }}
            icon={<Link size={16} />}
          />

          <UrlSection
            title="Videos"
            type="videos"
            urls={videoUrls}
            placeholder="https://www.youtube.com/watch?v=your-video-id"
            validation={{
              title: "YouTube Videos Required",
              description: "Upload your videos to YouTube and share the link here.",
              example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            }}
            icon={<Link size={16} />}
          />

          <UrlSection
            title="Documents"
            type="documents"
            urls={documentUrls}
            placeholder="https://drive.google.com/file/d/your-document-id/view"
            validation={{
              title: "Google Drive Documents Required",
              description: "Upload your documents to Google Drive and share the link here.",
              example: "https://drive.google.com/file/d/1XYZ789.../view"
            }}
            icon={<Link size={16} />}
          />

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating Project...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectUploadModal;
