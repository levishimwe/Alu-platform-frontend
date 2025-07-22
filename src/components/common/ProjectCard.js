import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInvestorPortal } from '../../hooks/useSimpleAPI';

// Helper function to convert Google Drive sharing link to direct image URL
const convertGoogleDriveImageUrl = (shareUrl) => {
  if (!shareUrl || !shareUrl.includes('drive.google.com')) {
    return shareUrl;
  }

  const fileIdRegex = /\/file\/d\/([a-zA-Z0-9-_]+)/;
  const match = shareUrl.match(fileIdRegex);
  
  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?id=${fileId}&export=view`;
  }
  
  return shareUrl;
};

const ProjectCard = ({ project, onViewDetails }) => {
  const { user } = useAuth();
  const { bookmarkProject } = useInvestorPortal();

  const handleBookmark = async (e) => {
    e.stopPropagation();
    try {
      await bookmarkProject(project.id);
      
      alert('Project bookmarked successfully!');
    } catch (error) {
      console.error('Bookmark failed:', error);
      alert('Failed to bookmark project');
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(project);
    }
  };

  // Get the first image URL and convert it for display
  const getFirstImageUrl = () => {
    if (project.images && project.images.length > 0) {
      return convertGoogleDriveImageUrl(project.images[0]);
    }
    return null;
  };

  const firstImageUrl = getFirstImageUrl();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Project image */}
      <div className="h-48 bg-gray-200 overflow-hidden">
        {firstImageUrl ? (
          <img 
            src={firstImageUrl}
            alt={project.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div class="w-full h-full flex items-center justify-center text-gray-500">
                  <div class="text-center">
                    <p class="text-sm">Image not available</p>
                    <p class="text-xs text-gray-400">Click "View Details" to see media</p>
                  </div>
                </div>
              `;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-sm">No Image</p>
              <p className="text-xs text-gray-400">Click "View Details" for project media</p>
            </div>
          </div>
        )}
      </div>

      {/* Project content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {project.title}
          </h3>
          {user?.userType === 'investor' && (
            <button
              onClick={handleBookmark}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Bookmark project"
            >
              ♡
            </button>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {project.category && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {project.category}
            </span>
          )}
          {project.impactArea && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {project.impactArea}
            </span>
          )}
        </div>

        {/* Media indicators */}
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
          {project.images && project.images.length > 0 && (
            <span className="flex items-center gap-1">
              🖼️ {project.images.length} image{project.images.length > 1 ? 's' : ''}
            </span>
          )}
          {project.videos && project.videos.length > 0 && (
            <span className="flex items-center gap-1">
              🎥 {project.videos.length} video{project.videos.length > 1 ? 's' : ''}
            </span>
          )}
          {project.documents && project.documents.length > 0 && (
            <span className="flex items-center gap-1">
              📄 {project.documents.length} doc{project.documents.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>👁 {project.views || 0}</span>
            <span>❤ {project.likes || 0}</span>
          </div>
          
          <button
            onClick={handleViewDetails}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
