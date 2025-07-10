import React from 'react';

export default function Footer() {
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
            <li><a href="#" className="hover:underline">Upload Projects</a></li>
            <li><a href="#" className="hover:underline">Dashboard</a></li>
            <li><a href="#" className="hover:underline">Resources</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">For Investors</h3>
          <ul className="text-sm space-y-1">
            <li><a href="#" className="hover:underline">Browse Projects</a></li>
            <li><a href="#" className="hover:underline">Connect</a></li>
            <li><a href="#" className="hover:underline">Success Stories</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Support</h3>
          <ul className="text-sm space-y-1">
            <li><a href="#" className="hover:underline">Help Center</a></li>
            <li><a href="#" className="hover:underline">Contact Us</a></li>
            <li><a href="#" className="hover:underline">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="text-center text-sm text-white mt-10 px-4">
        © 2024 ALU Graduates Empowerment Platform. All rights reserved.
      </div>
    </footer>
  );
}
