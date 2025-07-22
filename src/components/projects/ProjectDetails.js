import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Eye, Heart } from 'lucide-react';

// Helper function to convert Google Drive sharing link to direct image URL
const convertGoogleDriveImageUrl = (shareUrl) => {
  if (!shareUrl || !shareUrl.includes('drive.google.com')) {
    return shareUrl;
  }

  // Extract file ID from various Google Drive URL formats
  const fileIdRegex = /\/file\/d\/([a-zA-Z0-9-_]+)/;
  const match = shareUrl.match(fileIdRegex);
  
  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?id=${fileId}&export=view`;
  }
  
  return shareUrl;
};

// Helper function to convert YouTube URL to embed URL
const convertYouTubeToEmbed = (youtubeUrl) => {
  if (!youtubeUrl || !youtubeUrl.includes('youtube')) {
    return youtubeUrl;
  }

  // Extract video ID from various YouTube URL formats
  const videoIdRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9-_]+)/;
  const match = youtubeUrl.match(videoIdRegex);
  
  if (match && match[1]) {
    const videoId = match[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  return youtubeUrl;
};

const ProjectDetails = ({ project, onClose }) => {
  const [loading, setLoading] = useState(false);

  // Debug: Log the project data
  useEffect(() => {
    if (project) {
      console.log('📊 Project details data:', project);
      console.log('🖼️ Images:', project.images);
      console.log('🎥 Videos:', project.videos);
      console.log('📄 Documents:', project.documents);
    }
  }, [project]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Info */}
          <div>
            <p className="text-gray-600 mb-4 whitespace-pre-wrap">{project.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.category && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {project.category}
                </span>
              )}
              {project.impactArea && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {project.impactArea}
                </span>
              )}
            </div>
          </div>

          {/* Images Section */}
          {project.images && project.images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                🖼️ Project Images ({project.images.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.images.map((imageUrl, index) => {
                  const directUrl = convertGoogleDriveImageUrl(imageUrl);
                  return (
                    <div key={index} className="relative group">
                      <div className="aspect-w-16 aspect-h-12 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={directUrl}
                          alt={`Project image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg transition-transform group-hover:scale-105"
                          onError={(e) => {
                            console.error('Image failed to load:', directUrl);
                            e.target.parentElement.innerHTML = `
                              <div class="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                                <div class="text-center text-gray-500">
                                  <p class="text-sm">Image not available</p>
                                  <a href="${imageUrl}" target="_blank" class="text-blue-500 text-xs hover:underline">
                                    View in Google Drive
                                  </a>
                                </div>
                              </div>
                            `;
                          }}
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <a 
                          href={imageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-sm flex items-center justify-center gap-1"
                        >
                          <ExternalLink size={14} />
                          Open in Google Drive
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Videos Section */}
          {project.videos && project.videos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                🎥 Project Videos ({project.videos.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.videos.map((videoUrl, index) => {
                  const embedUrl = convertYouTubeToEmbed(videoUrl);
                  return (
                    <div key={index} className="relative">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                          src={embedUrl}
                          title={`Project video ${index + 1}`}
                          className="w-full h-64 rounded-lg"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          onError={(e) => {
                            console.error('Video failed to load:', embedUrl);
                          }}
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <a 
                          href={videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-red-600 hover:underline text-sm flex items-center justify-center gap-1"
                        >
                          <ExternalLink size={14} />
                          Watch on YouTube
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Documents Section */}
          {project.documents && project.documents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                📄 Project Documents ({project.documents.length})
              </h3>
              <div className="space-y-3">
                {project.documents.map((docUrl, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="text-blue-500 text-2xl">📄</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Document {index + 1}</p>
                      <p className="text-sm text-gray-500">Google Drive Document</p>
                    </div>
                    <a 
                      href={docUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <ExternalLink size={16} />
                      Open
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state if no media */}
          {(!project.images || project.images.length === 0) && 
           (!project.videos || project.videos.length === 0) && 
           (!project.documents || project.documents.length === 0) && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No images, videos, or documents available for this project.</p>
            </div>
          )}

          {/* Project Stats */}
          <div className="border-t pt-6 flex justify-between items-center">
            <div className="flex space-x-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Eye size={16} />
                {project.views || 0} views
              </span>
              <span className="flex items-center gap-1">
                <Heart size={16} />
                {project.likes || 0} likes
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Created: {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;