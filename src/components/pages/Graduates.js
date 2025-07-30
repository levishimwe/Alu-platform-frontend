import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Calendar, Mail, ExternalLink, Users, GraduationCap } from 'lucide-react';
import { graduatesAPI } from '../../services/api';

const Graduates = () => {
  const [graduates, setGraduates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch graduates from your backend
  const fetchGraduates = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await graduatesAPI.getAllGraduates();
      console.log('Graduates response:', response.data);
      
      setGraduates(response.data || []);
    } catch (error) {
      console.error('Error fetching graduates:', error);
      setError('Failed to fetch graduates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraduates();
  }, []);

  // Filter graduates based on search and graduation year
  const filteredGraduates = graduates.filter(graduate => {
    const matchesSearch = 
      graduate.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      graduate.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      graduate.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      graduate.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      graduate.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      graduate.country?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    return matchesSearch && graduate.graduationYear?.toString() === filterBy;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <GraduationCap className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ALU Graduates</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Connect with talented African Leadership University graduates making impact across Africa and beyond
          </p>
          <div className="mt-6 flex justify-center items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{graduates.length} Graduates</span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search graduates by name, university, location, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Graduation Years</option>
              <option value="2024">Class of 2024</option>
              <option value="2023">Class of 2023</option>
              <option value="2022">Class of 2022</option>
              <option value="2021">Class of 2021</option>
              <option value="2020">Class of 2020</option>
              <option value="2019">Class of 2019</option>
              <option value="2018">Class of 2018</option>
            </select>
          </div>
          
          {/* Search Results Count */}
          {searchTerm && (
            <div className="mt-4 text-sm text-gray-600">
              Found {filteredGraduates.length} graduate{filteredGraduates.length !== 1 ? 's' : ''} 
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading graduates...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchGraduates}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Graduates Grid */}
        {!loading && !error && (
          <>
            {filteredGraduates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGraduates.map((graduate) => (
                  <div key={graduate.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="p-6">
                      {/* Profile Header */}
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0">
                          {graduate.firstName?.[0] || 'A'}{graduate.lastName?.[0] || 'L'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {graduate.firstName} {graduate.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {graduate.graduationYear ? `Class of ${graduate.graduationYear}` : 'ALU Graduate'}
                          </p>
                        </div>
                      </div>

                      {/* Graduate Info */}
                      <div className="space-y-2 mb-4">
                        {graduate.university && (
                          <div className="flex items-center text-sm text-gray-600">
                            <GraduationCap className="mr-2 flex-shrink-0" size={16} />
                            <span className="truncate">{graduate.university}</span>
                          </div>
                        )}
                        
                        {(graduate.city || graduate.country) && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="mr-2 flex-shrink-0" size={16} />
                            <span className="truncate">
                              {graduate.city && graduate.country 
                                ? `${graduate.city}, ${graduate.country}`
                                : graduate.city || graduate.country
                              }
                            </span>
                          </div>
                        )}
                        
                        {graduate.bio && (
                          <div className="flex items-start text-sm text-gray-600">
                            <Briefcase className="mr-2 mt-0.5 flex-shrink-0" size={16} />
                            <span className="line-clamp-2 text-xs leading-relaxed">
                              {graduate.bio.length > 100 
                                ? `${graduate.bio.substring(0, 100)}...` 
                                : graduate.bio
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 mt-4">
                        <a
                          href={`mailto:${graduate.email}`}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded-lg text-sm transition-colors duration-300 flex items-center justify-center"
                        >
                          <Mail className="mr-1" size={14} />
                          <span>Contact</span>
                        </a>
                        
                        {graduate.profileImage && (
                          <a
                            href={graduate.profileImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-center py-2 px-3 rounded-lg text-sm transition-colors duration-300 flex items-center justify-center"
                          >
                            <ExternalLink className="mr-1" size={14} />
                            <span>View</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* No Results */
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No graduates found</h3>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? `No graduates match your search "${searchTerm}"`
                      : "No graduates found matching your criteria"
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Statistics Footer */}
        {!loading && !error && graduates.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{graduates.length}</div>
                <div className="text-sm text-gray-600">Total Graduates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {new Set(graduates.map(g => g.country).filter(Boolean)).size}
                </div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(graduates.map(g => g.graduationYear).filter(Boolean)).size}
                </div>
                <div className="text-sm text-gray-600">Graduation Years</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Graduates;