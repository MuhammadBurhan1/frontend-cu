import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Byte2Bite</h3>
            <p className="text-gray-400">
              Reducing food waste through technology and community action.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
              <li><a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Byte2Bite. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;