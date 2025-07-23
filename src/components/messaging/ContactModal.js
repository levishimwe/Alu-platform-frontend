import React, { useState, useEffect } from 'react';
import { X, Search, Mail, Linkedin, Github, ExternalLink } from 'lucide-react';

const ContactModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    if (searchQuery.length >= 1) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users);
      } else {
        console.error('Failed to fetch users:', response.status);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case 'graduate': return 'Graduate';
      case 'investor': return 'Investor';
      case 'admin': return 'Admin';
      default: return userType;
    }
  };

  const openEmailClient = (email) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const openLink = (url) => {
    if (url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Find & Connect</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-4">
          {searchResults.map((user) => (
            <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center ${user.profileImage ? 'hidden' : ''}`}>
                    <span className="text-gray-600 font-medium">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-grow">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {getUserTypeLabel(user.userType)}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-2">{user.email}</p>

                  {/* Additional Info Based on User Type */}
                  {user.userType === 'graduate' && (
                    <div className="text-sm text-gray-500 mb-3">
                      {user.major && <p>Major: {user.major}</p>}
                      {user.university && <p>University: {user.university}</p>}
                      {user.graduationYear && <p>Graduation: {user.graduationYear}</p>}
                    </div>
                  )}

                  {user.userType === 'investor' && (
                    <div className="text-sm text-gray-500 mb-3">
                      {user.company && <p>Company: {user.company}</p>}
                      {user.position && <p>Position: {user.position}</p>}
                    </div>
                  )}

                  {/* Contact Actions */}
                  <div className="flex flex-wrap gap-2">
                    {/* Email */}
                    <button
                      onClick={() => openEmailClient(user.email)}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      <Mail size={14} />
                      <span>Email</span>
                    </button>

                    {/* LinkedIn */}
                    {user.linkedinUrl && (
                      <button
                        onClick={() => openLink(user.linkedinUrl)}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                      >
                        <Linkedin size={14} />
                        <span>LinkedIn</span>
                      </button>
                    )}

                    {/* GitHub (for graduates) */}
                    {user.userType === 'graduate' && user.githubUrl && (
                      <button
                        onClick={() => openLink(user.githubUrl)}
                        className="flex items-center space-x-1 px-3 py-1 bg-gray-800 text-white text-sm rounded hover:bg-gray-900 transition-colors"
                      >
                        <Github size={14} />
                        <span>GitHub</span>
                      </button>
                    )}

                    {/* Company Website (for investors) */}
                    {user.userType === 'investor' && user.companyWebsite && (
                      <button
                        onClick={() => openLink(user.companyWebsite)}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        <ExternalLink size={14} />
                        <span>Website</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {searchQuery && !loading && searchResults.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No users found matching "{searchQuery}"</p>
            <p className="text-sm">Try searching by first name, last name, or email</p>
          </div>
        )}

        {/* Search Instructions */}
        {!searchQuery && (
          <div className="text-center py-8 text-gray-500">
            <Search size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Start typing to search for users</p>
            <p className="text-sm">Search by name or email to find and connect with other users</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
