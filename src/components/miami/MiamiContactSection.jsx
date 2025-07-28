import { BsWhatsapp, BsGeoAlt, BsInstagram, BsEnvelope, BsPhone } from 'react-icons/bs';
import { openWhatsApp } from '../../utils/contactUtils';

const MiamiContactSection = () => {
  const handleEmailClick = () => {
    window.location.href = 'mailto:info@nexusvendingmiami.com?subject=Inquiry about coffee vending services';
  };

  const handleInstagramClick = () => {
    window.open('https://instagram.com/nexusvendingmiami', '_blank');
  };

  return (
    <>
      {/* Contact Section */}
      <section id="contact" className="py-5 bg-theme-secondary">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-theme-primary">Let's Partner!</h2>
            <p className="lead text-theme-secondary">
              Contact us to discuss revenue opportunities for your high-traffic location
            </p>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-8 mx-auto">
              <div className="row g-4">
                {/* Contact Information */}
                <div className="col-md-6">
                  <div className="card card-theme h-100 shadow-theme">
                    <div className="card-body text-center p-4">
                      <BsGeoAlt className="text-primary mb-3" size={48} />
                      <h5 className="text-theme-primary">Service Areas</h5>
                      <p className="text-theme-secondary">
                        Miami, Fort Lauderdale<br />
                        Broward & Dade Counties
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card card-theme h-100 shadow-theme">
                    <div className="card-body text-center p-4">
                      <BsPhone className="text-success mb-3" size={48} />
                      <h5 className="text-theme-primary">Direct Contact</h5>
                      <p className="text-theme-secondary">
                        WhatsApp: +1 (305) 123-4567<br />
                        Email: info@nexusvendingmiami.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main Call to Action */}
              <div className="text-center mt-5">
                <div className="card card-theme shadow-theme-lg">
                  <div className="card-body p-5">
                    <h3 className="text-theme-primary mb-4">
                      Want to explore revenue opportunities?
                    </h3>
                    <p className="text-theme-secondary mb-4">
                      No commitment, no hidden costs. We analyze your location and provide revenue projections.
                    </p>
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                      <button 
                        className="btn btn-success btn-lg"
                        onClick={() => openWhatsApp('Hello! I am interested in coffee vending services for my company in Miami.')}
                      >
                        <BsWhatsapp className="me-2" /> Contact via WhatsApp
                      </button>
                      <button 
                        className="btn btn-theme-secondary btn-lg"
                        onClick={handleEmailClick}
                      >
                        <BsEnvelope className="me-2" /> Send Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-theme-secondary py-4 border-top border-theme">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="mb-3 mb-md-0">
                <h5 className="text-theme-primary mb-2">Nexus Vending Miami</h5>
                <p className="mb-1 text-theme-secondary">
                  Professional coffee vending solutions for businesses
                </p>
                <p className="mb-0 text-theme-secondary small">
                  © 2024 Nexus Vending Miami. All rights reserved.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-md-end align-items-center gap-4">
                <span className="text-theme-secondary small">Follow us:</span>
                <div className="d-flex gap-3">
                  <a 
                    href="#" 
                    className="text-theme-secondary" 
                    title="WhatsApp"
                    onClick={() => openWhatsApp('Hello!')}
                  >
                    <BsWhatsapp size={24} />
                  </a>
                  <a 
                    href="#" 
                    className="text-theme-secondary" 
                    title="Instagram"
                    onClick={handleInstagramClick}
                  >
                    <BsInstagram size={24} />
                  </a>
                  <a 
                    href="#" 
                    className="text-theme-secondary" 
                    title="Email"
                    onClick={handleEmailClick}
                  >
                    <BsEnvelope size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default MiamiContactSection; 