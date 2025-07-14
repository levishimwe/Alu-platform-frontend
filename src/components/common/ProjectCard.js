import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useInvestorPortal } from '../../hooks/useSimpleAPI'; // Change this import

const ProjectCard = ({ project, onViewDetails }) => {
  const { user } = useAuth();
  const { bookmarkProject } = useInvestorPortal();

  const handleBookmark = async (e) => {
    e.stopPropagation();
    try {
      await bookmarkProject(project.id);
      // Show success message
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Project image */}
      <div className="h-48 bg-gray-200 overflow-hidden">
        {project.images && project.images.length > 0 ? (
          <img 
            src={project.images[0]} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Image
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
