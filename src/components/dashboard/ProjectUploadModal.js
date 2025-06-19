import React, { useState } from "react";
import { X } from "lucide-react";

const ProjectUploadModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    impactArea: "",
    images: [],
    video: null,
    documents: [],
  });

  const categories = [
    "Agriculture",
    "FinTech",
    "HealthTech",
    "EdTech",
    "CleanTech",
    "Other",
  ];
  const impactAreas = [
    "Environment",
    "Healthcare",
    "Education",
    "Financial Inclusion",
    "Social Impact",
    "Technology",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle project upload
    console.log("Uploading project:", formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Upload New Project
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impact Area
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.impactArea}
                  onChange={(e) =>
                    setFormData({ ...formData, impactArea: e.target.value })
                  }
                >
                  <option value="">Select Impact Area</option>
                  {impactAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    images: Array.from(e.target.files),
                  })
                }
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload multiple images to showcase your project
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Video (Optional)
              </label>
              <input
                type="file"
                accept="video/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) =>
                  setFormData({ ...formData, video: e.target.files[0] })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documents (Optional)
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    documents: Array.from(e.target.files),
                  })
                }
              />
              <p className="text-sm text-gray-500 mt-1">
                Business plans, presentations, etc.
              </p>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Upload Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectUploadModal;
