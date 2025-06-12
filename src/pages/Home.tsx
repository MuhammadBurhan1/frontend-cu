import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Users, BarChart as ChartBar, Github, Linkedin, Mail, User, Heart, Building2, Shield, Clock, MapPin, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Reducing Food Waste, One Byte at a Time
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Byte2Bite is a revolutionary platform that bridges the gap between food donors and NGOs, 
          creating a sustainable ecosystem to combat food waste while feeding those in need.
        </p>
        <Link to="/auth">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="bg-emerald-600 text-white px-8 py-3 rounded-full text-lg font-semibold flex items-center mx-auto hover:bg-emerald-700 transition-colors"
          >
            Get Started <ArrowRight className="ml-2" />
          </motion.button>
        </Link>
      </motion.div>

      {/* About Byte2Bite Platform */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">About Byte2Bite Platform</h2>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto">
            Our innovative platform leverages technology to create meaningful connections between food donors 
            and charitable organizations, ensuring surplus food reaches those who need it most while reducing environmental impact.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 shadow-md"
          >
            <div className="flex items-center mb-4">
              <Clock className="h-8 w-8 text-emerald-600 mr-3" />
              <h3 className="text-xl font-semibold">Real-Time Matching</h3>
            </div>
            <p className="text-gray-600">
              Instantly connect food donors with nearby NGOs through our intelligent matching system, 
              ensuring quick pickup and distribution before food expires.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg p-6 shadow-md"
          >
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-emerald-600 mr-3" />
              <h3 className="text-xl font-semibold">Verified Network</h3>
            </div>
            <p className="text-gray-600">
              All donors and NGOs undergo thorough verification processes, ensuring food safety standards 
              and legitimate charitable operations for maximum trust and impact.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg p-6 shadow-md"
          >
            <div className="flex items-center mb-4">
              <TrendingUp className="h-8 w-8 text-emerald-600 mr-3" />
              <h3 className="text-xl font-semibold">Impact Tracking</h3>
            </div>
            <p className="text-gray-600">
              Monitor your contribution with detailed analytics showing meals provided, waste reduced, 
              and environmental impact, making every donation count.
            </p>
          </motion.div>
        </div>
      </div>

      {/* How We're Contributing */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How Byte2Bite is Making a Difference</h2>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto">
            Our platform addresses critical global challenges through innovative technology solutions, 
            creating positive impact across multiple dimensions of society and environment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="flex items-center mb-6">
              <Leaf className="h-10 w-10 text-emerald-600 mr-4" />
              <h3 className="text-2xl font-bold text-gray-900">Environmental Impact</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Reducing Greenhouse Gases:</strong> Every kilogram of food waste prevented saves approximately 2.5kg of CO₂ emissions</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Conserving Resources:</strong> Preventing food waste saves water, energy, and land resources used in food production</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Landfill Reduction:</strong> Diverting organic waste from landfills reduces methane emissions and soil contamination</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="flex items-center mb-6">
              <Users className="h-10 w-10 text-emerald-600 mr-4" />
              <h3 className="text-2xl font-bold text-gray-900">Social Impact</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Fighting Hunger:</strong> Connecting surplus food with food-insecure communities and vulnerable populations</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Empowering NGOs:</strong> Providing reliable food sources to enhance charitable organizations' capacity to serve</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span><strong>Building Community:</strong> Fostering collaboration between businesses and charitable organizations</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="bg-emerald-600 text-white rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">The Global Food Waste Challenge</h3>
            <p className="text-emerald-100 text-lg max-w-3xl mx-auto">
              Byte2Bite addresses one of the world's most pressing issues: approximately 1.3 billion tons of food 
              is wasted globally each year, while 828 million people suffer from hunger.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">1/3</div>
              <div className="text-emerald-100">of all food produced globally is wasted</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">8-10%</div>
              <div className="text-emerald-100">of global greenhouse gas emissions from food waste</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">$1T</div>
              <div className="text-emerald-100">economic losses from food waste annually</div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {[
          {
            icon: <Heart className="h-12 w-12 text-emerald-600" />,
            title: "For Food Donors",
            description: "Restaurants, cafes, and food businesses can easily donate surplus food, track their environmental impact, and contribute to their community while reducing waste disposal costs.",
            features: ["Quick donation posting", "Impact tracking", "Tax benefit documentation", "Pickup coordination"]
          },
          {
            icon: <Building2 className="h-12 w-12 text-emerald-600" />,
            title: "For NGOs & Charities",
            description: "Non-profit organizations can access verified food donations, manage distribution efficiently, and expand their capacity to serve vulnerable communities.",
            features: ["Real-time notifications", "Donation management", "Distribution tracking", "Impact reporting"]
          },
          {
            icon: <ChartBar className="h-12 w-12 text-emerald-600" />,
            title: "Impact Analytics",
            description: "Comprehensive tracking and reporting system that measures environmental and social impact, providing transparency and motivation for continued participation.",
            features: ["CO₂ reduction metrics", "Meals provided tracking", "Waste prevention data", "Community impact reports"]
          }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="mb-6">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
            <p className="text-gray-600 mb-6">{feature.description}</p>
            <ul className="space-y-2">
              {feature.features.map((item, idx) => (
                <li key={idx} className="flex items-center text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3"></span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Our Impact Statistics */}
      <div className="bg-emerald-50 rounded-xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Our Growing Impact</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { number: "10,000+", label: "Meals Donated", sublabel: "Feeding communities daily" },
            { number: "500+", label: "Active NGOs", sublabel: "Verified charitable partners" },
            { number: "1,000+", label: "Regular Donors", sublabel: "Committed food businesses" },
            { number: "25,000kg", label: "CO₂ Saved", sublabel: "Environmental impact reduction" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-emerald-600 mb-2">{stat.number}</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-600">{stat.sublabel}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl p-8 text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
        <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
          Whether you're a food business looking to reduce waste or an NGO seeking reliable food sources, 
          Byte2Bite provides the platform to make a meaningful difference.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-white text-emerald-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Donating Food
            </motion.button>
          </Link>
          <Link to="/auth">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="border-2 border-white text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors"
            >
              Register as NGO
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Developer Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Meet Our Developers</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Muhammad Burhan Hussain */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-300"
          >
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center mb-4 border-4 border-emerald-500">
                <User className="w-16 h-16 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Muhammad Burhan Hussain</h3>
              <p className="text-emerald-600 font-semibold mb-2">Frontend Developer</p>
              <p className="text-gray-600 mb-4">21-CS-50</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  <Github className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  <Mail className="h-6 w-6" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Muhammad Shehroz Sarmad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-300"
          >
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center mb-4 border-4 border-emerald-500">
                <User className="w-16 h-16 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Muhammad Shehroz Sarmad</h3>
              <p className="text-emerald-600 font-semibold mb-2">Backend Developer</p>
              <p className="text-gray-600 mb-4">21-CS-59</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  <Github className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  <Mail className="h-6 w-6" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;