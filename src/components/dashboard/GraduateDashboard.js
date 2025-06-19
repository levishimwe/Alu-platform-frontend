import React from 'react';
const GraduateDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState(mockProjects);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'projects', label: 'My Projects', icon: Plus },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Graduate Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your projects and connect with investors</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Plus className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">Total Projects</p>
                        <p className="text-2xl font-semibold text-gray-900">{projects.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Eye className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">Total Views</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {projects.reduce((sum, p) => sum + p.views, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <MessageCircle className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-yellow-600">Messages</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {projects.reduce((sum, p) => sum + p.messages, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600">Your recent project activities will appear here.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">My Projects</h3>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
                  >
                    <Plus size={18} />
                    <span>Upload Project</span>
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-gray-50 rounded-lg p-4">
                      <ProjectCard project={project} />
                      <div className="mt-4 flex space-x-2">
                        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm">
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                        <button className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm">
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Messages</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">Your messages with investors will appear here.</p>
                </div>
              </div>

            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">Account settings and profile management options will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Project Modal */}
        <ProjectUploadModal 
          isOpen={showUploadModal} 
          onClose={() => setShowUploadModal(false)} 
        />
      </div>
    </div>
  );
};

export default GraduateDashboard;

