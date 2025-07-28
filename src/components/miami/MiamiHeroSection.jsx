import { BsArrowDown, BsCupHot } from 'react-icons/bs';
import { openWhatsApp } from '../../utils/contactUtils';
import aboutUsImage from '../../assets/aboutUs.jpeg';

const MiamiHeroSection = () => {
  const handleContactClick = () => {
    openWhatsApp('Hello! I am interested in coffee vending services for my company in Miami.');
  };

  return (
    <section id="home" className="hero-section bg-theme-primary">
      <div className="container">
        <div className="row align-items-center min-vh-100">
          <div className="col-lg-6">
            <div className="hero-content">
              <h1 className="display-4 fw-bold text-theme-primary mb-4">
                Premium Coffee On-The-Go
              </h1>
              <p className="lead text-theme-secondary mb-4">
                High-traffic coffee vending solutions in Miami. Perfect for malls, airports, 
                hospitals, universities, and busy commercial areas.
              </p>
                              <div className="hero-features mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <BsCupHot className="text-primary me-3" size={24} />
                    <span className="text-theme-primary">Quick Service Coffee & Espresso</span>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <BsCupHot className="text-primary me-3" size={24} />
                    <span className="text-theme-primary">High-Traffic Locations</span>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <BsCupHot className="text-primary me-3" size={24} />
                    <span className="text-theme-primary">Cash & Card Payment Options</span>
                  </div>
                </div>
              <div className="hero-buttons">
                <button 
                  className="btn btn-primary btn-lg me-3 mb-3"
                  onClick={handleContactClick}
                >
                  Get Free Quote
                </button>
                <a href="#coffee" className="btn btn-outline-primary btn-lg mb-3">
                  Learn More
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="hero-image text-center">
              <img 
                src={aboutUsImage}
                alt="Coffee Vending Machine" 
                className="img-fluid rounded shadow-theme-lg"
                style={{ maxHeight: '500px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
        <div className="text-center mt-4">
          <a href="#about" className="scroll-down">
            <BsArrowDown className="text-theme-secondary" size={32} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default MiamiHeroSection; 