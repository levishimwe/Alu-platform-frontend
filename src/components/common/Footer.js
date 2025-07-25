import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Footer({ setCurrentPage, setAuthModal }) {
  const { user } = useAuth();

  const handleAuthRequiredNavigation = (targetPage) => {
    if (!user) {
      // If not logged in, show auth modal
      if (setAuthModal) {
        setAuthModal({ isOpen: true, mode: 'login' });
      } else {
        alert('Please log in to access this feature.');
      }
    } else {
      // If logged in, navigate to the target page
      if (setCurrentPage) {
        setCurrentPage(targetPage);
      }
    }
  };

  const handleContactUs = () => {
    if (setCurrentPage) {
      setCurrentPage('contact');
    } else {
      alert(`Contact Information:\n\nName: Levis Ishimwe\nPhone: +250 784 106 595\nEmail: i.levis@alustudent.com`);
    }
  };

  return (
    <footer className="bg-[#011e41] text-white pt-16 pb-12 -mt-4">
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h2 className="text-2xl font-bold mb-4">ALU Platform</h2>
          <p className="text-sm">
            Empowering ALU graduates to showcase their innovative projects and connect with investors.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">For Graduates</h3>
          <ul className="text-sm space-y-1">
            <li>
              <button 
                className="hover:underline text-left"
                onClick={() => {
                  if (!user) {
                    handleAuthRequiredNavigation('graduate-dashboard');
                  } else if (user.userType === 'graduate') {
                    handleAuthRequiredNavigation('create-project');
                  } else {
                    alert('This feature is only available for graduates.');
                  }
                }}
              >
                Upload Projects
              </button>
            </li>
            <li>
              <button 
                className="hover:underline text-left"
                onClick={() => {
                  if (!user) {
                    handleAuthRequiredNavigation('graduate-dashboard');
                  } else if (user.userType === 'graduate') {
                    handleAuthRequiredNavigation('graduate-dashboard');
                  } else if (user.userType === 'investor') {
                    handleAuthRequiredNavigation('investor-portal');
                  } else if (user.userType === 'admin') {
                    handleAuthRequiredNavigation('admin-dashboard');
                  }
                }}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button 
                className="hover:underline text-left"
                onClick={() => {
                  if (!user) {
                    handleAuthRequiredNavigation('home');
                  } else {
                    alert('Resources page coming soon!');
                  }
                }}
              >
                Resources
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">For Investors</h3>
          <ul className="text-sm space-y-1">
            <li>
              <button 
                className="hover:underline text-left"
                onClick={() => handleAuthRequiredNavigation('investor-portal')}
              >
                Browse Projects
              </button>
            </li>
            <li>
              <a 
                href="https://www.linkedin.com/school/alueducation/posts/?feedView=all" 
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Connect
              </a>
            </li>
            <li>
              <button 
                className="hover:underline text-left"
                onClick={() => {
                  if (!user) {
                    handleAuthRequiredNavigation('investor-portal');
                  } else {
                    alert('Success Stories page coming soon!');
                  }
                }}
              >
                Success Stories
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Support</h3>
          <ul className="text-sm space-y-1">
            <li>
              <a 
                href="https://www.alueducation.com/" 
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Help Center
              </a>
            </li>
            <li>
              <button 
                className="hover:underline text-left"
                onClick={handleContactUs}
              >
                Contact Us
              </button>
            </li>
            <li>
              <button 
                className="hover:underline text-left"
                onClick={() => {
                  alert('Privacy Policy page coming soon!');
                }}
              >
                Privacy Policy
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-sm text-white mt-10 px-4">
        © 2024 ALU Graduates Empowerment Platform. All rights reserved.
      </div>
    </footer>
  );
}
