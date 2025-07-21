import React, { useState } from 'react';
import { Upload, X, Plus, FileText, Video, Camera } from 'lucide-react';

const ProjectForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Technology',
    stage: initialData?.stage || 'Idea',
    fundingNeeded: initialData?.fundingNeeded || '',
    currency: initialData?.currency || 'USD',
    images: initialData?.images || [],
    documents: initialData?.documents || [],
    videos: initialData?.videos || [],
    tags: initialData?.tags || [],
    isPublic: initialData?.isPublic !== undefined ? initialData.isPublic : true,
  });

  const [newImage, setNewImage] = useState('');
  const [newDocument, setNewDocument] = useState({ name: '', url: '' });
  const [newVideo, setNewVideo] = useState({ name: '', url: '' });
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});

  const categories = [
    'Technology', 'Healthcare', 'Education', 'Agriculture', 
    'Finance', 'Environment', 'Social Impact', 'Other'
  ];

  const stages = [
    'Idea', 'Prototype', 'Development', 'Testing', 'Launch', 'Growth'
  ];

  const currencies = [
    'USD', 'EUR', 'GBP', 'RWF', 'KES', 'UGX', 'TZS', 'NGN', 'GHS', 'ZAR'
  ];

  const validateGoogleDriveLink = (url) => {
    return url.includes('drive.google.com');
  };

  const validateVideoLink = (url) => {
    return url.includes('drive.google.com') || 
           url.includes('youtube.com') || 
           url.includes('youtu.be');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addImage = () => {
    if (!newImage.trim()) return;
    
    if (!validateGoogleDriveLink(newImage)) {
      setErrors(prev => ({ ...prev, newImage: 'Image must be a Google Drive link' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImage.trim()]
    }));
    setNewImage('');
    setErrors(prev => ({ ...prev, newImage: '' }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addDocument = () => {
    if (!newDocument.name.trim() || !newDocument.url.trim()) return;
    
    if (!validateGoogleDriveLink(newDocument.url)) {
      setErrors(prev => ({ ...prev, newDocument: 'Document must be a Google Drive link' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, { ...newDocument }]
    }));
    setNewDocument({ name: '', url: '' });
    setErrors(prev => ({ ...prev, newDocument: '' }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const addVideo = () => {
    if (!newVideo.name.trim() || !newVideo.url.trim()) return;
    
    if (!validateVideoLink(newVideo.url)) {
      setErrors(prev => ({ ...prev, newVideo: 'Video must be from Google Drive or YouTube' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, { ...newVideo }]
    }));
    setNewVideo({ name: '', url: '' });
    setErrors(prev => ({ ...prev, newVideo: '' }));
  };

  const removeVideo = (index) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (!newTag.trim() || formData.tags.includes(newTag.trim())) return;
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    setNewTag('');
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {initialData ? 'Edit Project' : 'Create New Project'}
      </h2>

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
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter project title"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Stage
            </label>
            <select
              name="stage"
              value={formData.stage}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Funding Needed (Optional)
            </label>
            <div className="flex">
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-24 px-2 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
              <input
                type="number"
                name="fundingNeeded"
                value={formData.fundingNeeded}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 border border-l-0 border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={6}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe your project in detail..."
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        {/* Images Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Images (Google Drive Links)
          </label>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://drive.google.com/file/d/your-image-id/view"
                />
              </div>
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            {errors.newImage && <p className="text-red-500 text-xs">{errors.newImage}</p>}
            
            {formData.images.length > 0 && (
              <div className="space-y-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-600 truncate flex-1">{image}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Documents Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Documents (Google Drive Links)
          </label>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                value={newDocument.name}
                onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Document name"
              />
              <input
                type="url"
                value={newDocument.url}
                onChange={(e) => setNewDocument(prev => ({ ...prev, url: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Google Drive link"
              />
              <button
                type="button"
                onClick={addDocument}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FileText size={16} className="mr-1" />
                Add
              </button>
            </div>
            {errors.newDocument && <p className="text-red-500 text-xs">{errors.newDocument}</p>}
            
            {formData.documents.length > 0 && (
              <div className="space-y-2">
                {formData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800">{doc.name}</span>
                      <br />
                      <span className="text-xs text-gray-500 truncate">{doc.url}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Videos Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Videos (Google Drive or YouTube Links)
          </label>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                value={newVideo.name}
                onChange={(e) => setNewVideo(prev => ({ ...prev, name: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Video name"
              />
              <input
                type="url"
                value={newVideo.url}
                onChange={(e) => setNewVideo(prev => ({ ...prev, url: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Google Drive or YouTube link"
              />
              <button
                type="button"
                onClick={addVideo}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <Video size={16} className="mr-1" />
                Add
              </button>
            </div>
            {errors.newVideo && <p className="text-red-500 text-xs">{errors.newVideo}</p>}
            
            {formData.videos.length > 0 && (
              <div className="space-y-2">
                {formData.videos.map((video, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800">{video.name}</span>
                      <br />
                      <span className="text-xs text-gray-500 truncate">{video.url}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visibility */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isPublic"
            id="isPublic"
            checked={formData.isPublic}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
            Make this project publicly visible
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {initialData ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Google Drive Instructions:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Upload your files to Google Drive</li>
          <li>• Right-click the file and select "Get link"</li>
          <li>• Set permission to "Anyone with the link can view"</li>
          <li>• Copy and paste the sharing link above</li>
          <li>• For videos, you can also use YouTube links</li>
        </ul>
      </div>
    </div>
  );
};

export default ProjectForm;