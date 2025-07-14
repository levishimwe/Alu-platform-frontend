import React, { useState } from 'react';
import { X, Upload, Link, Plus, Trash2 } from 'lucide-react';

const ProjectUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    impactArea: ''
  });

  // File and URL states
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState(['']);
  const [videos, setVideos] = useState([]);
  const [videoUrls, setVideoUrls] = useState(['']);
  const [documents, setDocuments] = useState([]);
  const [documentUrls, setDocumentUrls] = useState(['']);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState({
    images: 'upload', // 'upload' or 'url'
    videos: 'upload',
    documents: 'upload'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // File handling functions
  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    
    if (type === 'images') {
      setImages(prev => [...prev, ...files]);
    } else if (type === 'videos') {
      setVideos(prev => [...prev, ...files]);
    } else if (type === 'documents') {
      setDocuments(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index, type) => {
    if (type === 'images') {
      setImages(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'videos') {
      setVideos(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'documents') {
      setDocuments(prev => prev.filter((_, i) => i !== index));
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

 // In your handleSubmit function, replace the alert with proper onSuccess call:

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrors({});

  // Validation
  if (!formData.title || !formData.description) {
    setErrors({ general: 'Title and description are required' });
    setLoading(false);
    return;
  }

  try {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('token');

    // Create FormData for file upload
    const submitData = new FormData();
    
    // Add text fields
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });

    // Add files
    images.forEach((file, index) => {
      submitData.append('images', file);
    });
    videos.forEach((file, index) => {
      submitData.append('videos', file);
    });
    documents.forEach((file, index) => {
      submitData.append('documents', file);
    });

    // Add URLs (filter out empty ones)
    const validImageUrls = imageUrls.filter(url => url.trim());
    const validVideoUrls = videoUrls.filter(url => url.trim());
    const validDocumentUrls = documentUrls.filter(url => url.trim());

    if (validImageUrls.length > 0) {
      submitData.append('imageUrls', JSON.stringify(validImageUrls));
    }
    if (validVideoUrls.length > 0) {
      submitData.append('videoUrls', JSON.stringify(validVideoUrls));
    }
    if (validDocumentUrls.length > 0) {
      submitData.append('documentUrls', JSON.stringify(validDocumentUrls));
    }

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: submitData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create project');
    }

    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      impactArea: ''
    });
    setImages([]);
    setVideos([]);
    setDocuments([]);
    setImageUrls(['']);
    setVideoUrls(['']);
    setDocumentUrls(['']);

    // Call onSuccess callback if it exists
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess(data.project);
    } else {
      // Fallback alert if onSuccess is not provided
      alert('Project uploaded successfully!');
      onClose();
    }
  } catch (error) {
    setErrors({ general: error.message });
  } finally {
    setLoading(false);
  }
};

  const TabButton = ({ type, mode, label, icon }) => (
    <button
      type="button"
      onClick={() => setActiveTab(prev => ({ ...prev, [type]: mode }))}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium ${
        activeTab[type] === mode
          ? 'bg-blue-100 text-blue-700'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
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

          {/* Images Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Images
            </label>
            <div className="flex space-x-2 mb-3">
              <TabButton
                type="images"
                mode="upload"
                label="Upload Files"
                icon={<Upload size={16} />}
              />
              <TabButton
                type="images"
                mode="url"
                label="Add URLs"
                icon={<Link size={16} />}
              />
            </div>

            {activeTab.images === 'upload' ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'images')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB each</p>
                
                {/* Display selected files */}
                {images.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {images.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index, 'images')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value, 'images')}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUrlField(index, 'images')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addUrlField('images')}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  <Plus size={16} />
                  <span>Add Another URL</span>
                </button>
              </div>
            )}
          </div>

          {/* Videos Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Videos
            </label>
            <div className="flex space-x-2 mb-3">
              <TabButton
                type="videos"
                mode="upload"
                label="Upload Files"
                icon={<Upload size={16} />}
              />
              <TabButton
                type="videos"
                mode="url"
                label="Add URLs"
                icon={<Link size={16} />}
              />
            </div>

            {activeTab.videos === 'upload' ? (
              <div>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleFileChange(e, 'videos')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">MP4, AVI, MOV up to 50MB each</p>
                
                {videos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {videos.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index, 'videos')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {videoUrls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value, 'videos')}
                      placeholder="https://youtube.com/watch?v=... or upload MP4"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {videoUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUrlField(index, 'videos')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addUrlField('videos')}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  <Plus size={16} />
                  <span>Add Another URL</span>
                </button>
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Documents
            </label>
            <div className="flex space-x-2 mb-3">
              <TabButton
                type="documents"
                mode="upload"
                label="Upload Files"
                icon={<Upload size={16} />}
              />
              <TabButton
                type="documents"
                mode="url"
                label="Add URLs"
                icon={<Link size={16} />}
              />
            </div>

            {activeTab.documents === 'upload' ? (
              <div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                  multiple
                  onChange={(e) => handleFileChange(e, 'documents')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, TXT, PPT up to 10MB each</p>
                
                {documents.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {documents.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index, 'documents')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {documentUrls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value, 'documents')}
                      placeholder="https://drive.google.com/... or upload PDF"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {documentUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUrlField(index, 'documents')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addUrlField('documents')}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  <Plus size={16} />
                  <span>Add Another URL</span>
                </button>
              </div>
            )}
          </div>

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
              {loading ? 'Uploading...' : 'Upload Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectUploadModal;
