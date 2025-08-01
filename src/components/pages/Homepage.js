import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Star, Users, TrendingUp, Award, ArrowRight, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Homepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const { user } = useAuth();
  const autoplayIntervalRef = useRef(null);
  
  const slides = [
    {
      type: 'hero',
      content: {
        title: 'ALU Graduates Platform',
        subtitle: 'Showcase Innovation',
        description: 'For years, the African Leadership University (ALU) has been shaping the future - empowering bold, ethical, and entrepreneurial leaders transforming Africa and the world through innovative projects.',
        buttonText: 'EXPLORE PROJECTS',
        buttonAction: () => {
          if (!user) {
            document.querySelector('[data-auth-trigger]')?.click();
          }
        }
      }
    },
    {
      type: 'video',
      content: {
        title: 'Experience ALU',
        subtitle: 'A One of A Kind University',
        youtubeId: '8rkzLjpRFOU', // Fixed: Removed timestamp from ID
        description: 'Discover how ALU graduates are making impact across Africa and beyond through innovative projects and entrepreneurial solutions.'
      }
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Reset and restart the autoplay interval when slide changes
  useEffect(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
    }
    
    autoplayIntervalRef.current = setInterval(() => {
      nextSlide();
    }, 10000);
    
    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, [currentSlide]);

  return (
    <div className="relative">
      {/* Hero Slider */}
      <div className="relative h-screen overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {slide.type === 'hero' && (
              <div className="relative h-full bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600">
                {/* Animated flowing background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-purple-700/80 to-pink-600/90">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-800/30 to-pink-500/30 animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-bounce"></div>
                    <div className="absolute top-32 right-20 w-24 h-24 bg-pink-300/20 rounded-full blur-lg animate-pulse delay-1000"></div>
                    <div className="absolute bottom-20 left-32 w-40 h-40 bg-purple-300/15 rounded-full blur-2xl animate-bounce delay-500"></div>
                    <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-blue-300/10 rounded-full blur-lg animate-pulse delay-2000"></div>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
                  <div className="text-center text-white max-w-4xl mx-auto">
                    {/* Large Number */}
                    <div className="flex items-center justify-center mb-8">
                      <div className="text-8xl md:text-9xl font-bold opacity-20 mr-4">10</div>
                      <div className="text-center">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-full flex items-center justify-center mb-2 animate-spin-slow">
                          <span className="text-white font-bold text-xs">CELEBRATING</span>
                        </div>
                        <div className="text-xs md:text-sm font-semibold">
                          Years of Innovation<br />
                          Future of Opportunities
                        </div>
                      </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-up">
                      {slide.content.title}
                    </h1>
                    <h2 className="text-2xl md:text-4xl font-light mb-6 text-blue-100 animate-fade-in-up delay-200">
                      {slide.content.subtitle}
                    </h2>
                    <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-400">
                      {slide.content.description}
                    </p>
                    <button
                      onClick={slide.content.buttonAction}
                      data-auth-trigger
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg animate-fade-in-up delay-600"
                    >
                      {slide.content.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {slide.type === 'video' && (
              <div className="relative h-full bg-black">
                {/* FIXED: YouTube Video Embed */}
                <div className="relative h-full w-full overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-0 pb-[56.25%]">
                      <iframe
                        src={`https://www.youtube.com/embed/${slide.content.youtubeId}?start=276&autoplay=0&mute=1&loop=1&playlist=${slide.content.youtubeId}&controls=1&rel=0&modestbranding=1`}
                        title="ALU University Video"
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
                
                {/* Video Overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <div className="text-center text-white max-w-4xl mx-auto px-4">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-up">
                      {slide.content.title}
                    </h1>
                    <h2 className="text-2xl md:text-4xl font-light mb-6 text-blue-100 animate-fade-in-up delay-200">
                      {slide.content.subtitle}
                    </h2>
                    <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-400">
                      {slide.content.description}
                    </p>
                    
                    {/* Play button instead of mute toggle */}
                    <button
                      onClick={() => {
                        window.open(`https://www.youtube.com/watch?v=${slide.content.youtubeId}&t=276s`, '_blank');
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full text-sm transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center mx-auto animate-fade-in-up delay-600"
                    >
                      <Play className="mr-2" size={20} />
                      WATCH ON YOUTUBE
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 z-20 backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 z-20 backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white scale-110' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar for Auto-advance */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10 z-20">
          <div 
            className="h-full bg-white animate-progress-bar"
            style={{
              width: '100%',
              animationDuration: '10s',
              animationPlayState: 'running',
              animationIterationCount: 1,
              animationName: 'progress',
              animationTimingFunction: 'linear',
              transform: `scaleX(${currentSlide === 0 ? 0 : 1})`,
              transformOrigin: 'left',
              transition: 'transform 10s linear'
            }}
          ></div>
        </div>
      </div>

      {/* Rest of your component remains unchanged */}
      {/* Empowering ALU Graduates Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Your existing content */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Empowering ALU Graduates
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform connects innovative ALU graduates with investors and showcases 
              groundbreaking projects that are transforming Africa and the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation Hub</h3>
              <p className="text-gray-600">
                Discover cutting-edge projects from ALU graduates across various industries and sectors.
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect & Invest</h3>
              <p className="text-gray-600">
                Bridge the gap between innovative graduates and potential investors and partners.
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-orange-50 rounded-lg transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Impact</h3>
              <p className="text-gray-600">
                Supporting projects that create meaningful change across Africa and beyond.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-[#011e41] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Your existing content */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Platform Impact
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Connecting innovation with opportunity across Africa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto mb-4">
                <Users className="text-white" size={32} />
              </div>
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-300">Active Graduates</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto mb-4">
                <TrendingUp className="text-white" size={32} />
              </div>
              <div className="text-3xl font-bold text-white mb-2">200+</div>
              <div className="text-gray-300">Projects Showcased</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto mb-4">
                <Award className="text-white" size={32} />
              </div>
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-gray-300">Successful Connections</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto mb-4">
                <Star className="text-white" size={32} />
              </div>
              <div className="text-3xl font-bold text-white mb-2">98%</div>
              <div className="text-gray-300">Success Rate</div>
            </div>
          </div>
        </div>
      </div>


     {/* Featured Projects Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Projects
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover innovative solutions created by talented ALU graduates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="h-48 bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-6xl">🌱</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AgriTech Solutions</h3>
                <p className="text-gray-600 mb-4">
                  Smart farming platform connecting farmers with modern agricultural techniques.
                </p>
                <a 
                  href="https://www.minagri.gov.rw/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors duration-300"
                >
                  Learn More <ArrowRight size={16} className="ml-1" />
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                <span className="text-6xl">💊</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">HealthTech Innovation</h3>
                <p className="text-gray-600 mb-4">
                  Digital health platform improving healthcare access in rural communities.
                </p>
                <a 
                  href="https://www.mwckigali.com/themes/healthtech" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors duration-300"
                >
                  Learn More <ArrowRight size={16} className="ml-1" />
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-all duration-300">
              <div className="h-48 bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center">
                <span className="text-6xl">🎓</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">EduTech Platform</h3>
                <p className="text-gray-600 mb-4">
                  Online learning platform making quality education accessible to all.
                </p>
                <a 
                  href="https://edtechhub.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors duration-300"
                >
                  Learn More <ArrowRight size={16} className="ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Community Says
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Hear from graduates and investors who are part of our growing ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={16} />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "This platform helped me connect with the right investors for my fintech startup. The process was seamless and professional."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  A
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Amara Okafor</div>
                  <div className="text-sm text-gray-600">ALU Graduate '22</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={16} />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "As an investor, I've found incredible opportunities through this platform. The quality of projects is outstanding."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  K
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Kwame Asante</div>
                  <div className="text-sm text-gray-600">Impact Investor</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-orange-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={16} />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "The platform showcased my project beautifully and helped me gain visibility in the tech ecosystem."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  Z
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Zuri Mwangi</div>
                  <div className="text-sm text-gray-600">ALU Graduate '23</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-[#011e41] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8">
            Whether you're a graduate looking to showcase your project or an investor seeking the next big opportunity, we're here to connect you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                if (!user) {
                  document.querySelector('[data-auth-trigger]')?.click();
                }
              }}
              className="bg-white text-[#011e41] hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Started Today
            </button>
            <a
              href="https://www.youtube.com/watch?v=8rkzLjpRFOU&t=284s"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#011e41] font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <Play className="mr-2" size={20} />
              Watch Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
