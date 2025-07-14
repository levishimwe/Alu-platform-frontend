import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const { login } = useAuth();
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Graduate registration form state
  const [graduateData, setGraduateData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: '',
    city: '',
    userType: 'graduate'
  });

  // Investor registration form state
  const [investorData, setInvestorData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: '',
    city: '',
    companyName: '',
    companyWebsite: '',
    userType: 'investor'
  });

  const [userType, setUserType] = useState('graduate');
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [degreeFile, setDegreeFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleGraduateChange = (e) => {
    const { name, value } = e.target;
    setGraduateData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleInvestorChange = (e) => {
    const { name, value } = e.target;
    setInvestorData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (fileType === 'profileImage') {
      setProfileImage(file);
    } else if (fileType === 'degree') {
      setDegreeFile(file);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    
    if (!loginData.email || !loginData.password) {
      setErrors({ general: 'Please fill in all fields' });
      setLoading(false);
      return;
    }

    try {
      await login(loginData);
      onClose();
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Custom register function that handles file uploads
  const registerWithFiles = async (formData) => {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return { success: true, ...data };
    } catch (err) {
      throw err;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    
    const textData = userType === 'graduate' ? graduateData : investorData;
    
    // Validation
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'country', 'city'];
    if (userType === 'investor') {
      requiredFields.push('companyName');
    }
    
    for (let field of requiredFields) {
      if (!textData[field] || textData[field].trim() === '') {
        setErrors({ [field]: `${field} is required` });
        setLoading(false);
        return;
      }
    }

    if (textData.password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add text fields
      Object.keys(textData).forEach(key => {
        if (textData[key] !== null && textData[key] !== undefined && textData[key] !== '') {
          formData.append(key, textData[key]);
        }
      });

      // Add files if they exist
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      if (degreeFile && userType === 'graduate') {
        formData.append('degree', degreeFile);
      }

      const response = await registerWithFiles(formData);
      if (response.success) {
        alert('Registration successful! Please login with your credentials.');
        onSwitchMode('login');
        // Reset forms
        setGraduateData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          country: '',
          city: '',
          userType: 'graduate'
        });
        setInvestorData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          country: '',
          city: '',
          companyName: '',
          companyWebsite: '',
          userType: 'investor'
        });
        setProfileImage(null);
        setDegreeFile(null);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {mode === 'login' ? 'Login' : 'Register'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <div>
            {/* User Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Register as:
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="graduate"
                    checked={userType === 'graduate'}
                    onChange={(e) => setUserType(e.target.value)}
                    className="mr-2"
                  />
                  Graduate
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="investor"
                    checked={userType === 'investor'}
                    onChange={(e) => setUserType(e.target.value)}
                    className="mr-2"
                  />
                  Investor
                </label>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profileImage')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 5MB</p>
                {profileImage && (
                  <p className="text-xs text-green-600 mt-1">Selected: {profileImage.name}</p>
                )}
              </div>

              {/* Common fields for both graduate and investor */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={userType === 'graduate' ? graduateData.firstName : investorData.firstName}
                    onChange={userType === 'graduate' ? handleGraduateChange : handleInvestorChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={userType === 'graduate' ? graduateData.lastName : investorData.lastName}
                    onChange={userType === 'graduate' ? handleGraduateChange : handleInvestorChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={userType === 'graduate' ? graduateData.email : investorData.email}
                  onChange={userType === 'graduate' ? handleGraduateChange : handleInvestorChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={userType === 'graduate' ? graduateData.password : investorData.password}
                  onChange={userType === 'graduate' ? handleGraduateChange : handleInvestorChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength="6"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={userType === 'graduate' ? graduateData.country : investorData.country}
                    onChange={userType === 'graduate' ? handleGraduateChange : handleInvestorChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={userType === 'graduate' ? graduateData.city : investorData.city}
                    onChange={userType === 'graduate' ? handleGraduateChange : handleInvestorChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
              </div>

              {/* Investor-specific fields */}
              {userType === 'investor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={investorData.companyName}
                      onChange={handleInvestorChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Website
                    </label>
                    <input
                      type="url"
                      name="companyWebsite"
                      value={investorData.companyWebsite}
                      onChange={handleInvestorChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </>
              )}

              {/* Graduate-specific fields */}
              {userType === 'graduate' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Degree Certificate
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'degree')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX up to 5MB</p>
                  {degreeFile && (
                    <p className="text-xs text-green-600 mt-1">Selected: {degreeFile.name}</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')}
            className="text-blue-600 hover:text-blue-800"
          >
            {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
