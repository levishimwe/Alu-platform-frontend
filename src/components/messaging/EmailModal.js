import React, { useState, useEffect } from 'react';
import { X, Mail, AlertCircle, CheckCircle } from 'lucide-react';

const EmailModal = ({ isOpen, onClose, recipient, onEmailSent }) => {
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [authUrl, setAuthUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      checkGmailStatus();
    }
  }, [isOpen]);

  const checkGmailStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/email/gmail/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGmailConnected(data.isConnected);
        
        if (!data.isConnected) {
          // Get auth URL
          const authResponse = await fetch('http://localhost:5000/api/email/auth/gmail', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (authResponse.ok) {
            const authData = await authResponse.json();
            setAuthUrl(authData.authUrl);
          }
        }
      }
    } catch (error) {
      console.error('Gmail status check error:', error);
    }
  };

  const connectGmail = () => {
    window.open(authUrl, 'gmail-auth', 'width=600,height=600');
    
    // Listen for auth completion
    const checkAuth = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/email/gmail/status', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.isConnected) {
            setGmailConnected(true);
            clearInterval(checkAuth);
          }
        }
      } catch (error) {
        // Continue checking
      }
    }, 2000);
    
    // Stop checking after 5 minutes
    setTimeout(() => clearInterval(checkAuth), 300000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gmailConnected) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: recipient.email,
          subject: formData.subject,
          message: formData.message,
          recipientName: `${recipient.firstName} ${recipient.lastName}`
        })
      });

      if (response.ok) {
        setFormData({ subject: '', message: '' });
        onEmailSent();
        alert('Email sent successfully!');
      } else {
        const error = await response.json();
        alert('Failed to send email: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Send email error:', error);
      alert('Failed to send email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Send Email</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {!gmailConnected ? (
          <div className="text-center py-6">
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="text-blue-600 mr-2" size={20} />
                <span className="font-medium text-blue-800">Gmail Connection Required</span>
              </div>
              <p className="text-blue-700 text-sm">
                To send emails, please connect your Gmail account first.
              </p>
            </div>
            
            <button
              onClick={connectGmail}
              className="flex items-center justify-center w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              <Mail className="mr-2" size={16} />
              Connect Gmail Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="text-green-600 mr-2" size={16} />
                <span className="text-green-800 text-sm">Gmail Connected</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To: {recipient.firstName} {recipient.lastName}
              </label>
              <input
                type="email"
                value={recipient.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmailModal;