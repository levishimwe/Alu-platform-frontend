import React, { useState } from 'react';
import { Eye, MessageCircle, Heart, MapPin } from 'lucide-react';

const ProjectCard = ({ project, showActions = false }) => {
  const [isBookmarked, setIsBookmarked] = useState(project.bookmarked);

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: API call to update bookmark status
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={project.images[0]} 
        alt={project.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{project.title}</h3>
          {showActions && (
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-full ${isBookmarked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            >
              <Heart size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{project.category}</span>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">{project.impactArea}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <MapPin size={14} />
            <span>{project.location}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye size={14} />
              <span>{project.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle size={14} />
              <span>{project.messages}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            By <span className="font-medium">{project.graduate}</span>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
