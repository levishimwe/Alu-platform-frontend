import React, { useState } from "react";
import { Search } from "lucide-react";
import { mockProjects } from "../../data/mockData";
import ProjectCard from "../common/ProjectCard";

const InvestorPortal = () => {
  const [projects] = useState(mockProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedImpactArea, setSelectedImpactArea] = useState("");

  const categories = [
    "All",
    "Agriculture",
    "FinTech",
    "HealthTech",
    "EdTech",
    "CleanTech",
  ];
  const impactAreas = [
    "All",
    "Environment",
    "Healthcare",
    "Education",
    "Financial Inclusion",
    "Social Impact",
  ];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      selectedCategory === "All" ||
      project.category === selectedCategory;
    const matchesImpact =
      !selectedImpactArea ||
      selectedImpactArea === "All" ||
      project.impactArea === selectedImpactArea;

    return matchesSearch && matchesCategory && matchesImpact;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Investor Portal</h1>
          <p className="text-gray-600 mt-2">
            Discover and connect with innovative ALU graduate projects
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat === "All" ? "" : cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={selectedImpactArea}
                onChange={(e) => setSelectedImpactArea(e.target.value)}
              >
                {impactAreas.map((area) => (
                  <option key={area} value={area === "All" ? "" : area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              showActions={true}
            />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No projects found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorPortal;
