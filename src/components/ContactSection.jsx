import { BsWhatsapp, BsGeoAlt, BsInstagram, BsEnvelope, BsPhone } from 'react-icons/bs';

const ContactSection = () => {
  return (
    <>
      {/* Sección de contacto */}
      <section id="contacto" className="py-5 bg-theme-secondary">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-theme-primary">¡Hablemos!</h2>
            <p className="lead text-theme-secondary">
              Contáctanos para recibir una propuesta personalizada sin compromiso
            </p>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-8 mx-auto">
              <div className="row g-4">
                {/* Información de contacto */}
                <div className="col-md-6">
                  <div className="card card-theme h-100 shadow-theme">
                    <div className="card-body text-center p-4">
                      <BsGeoAlt className="text-primary mb-3" size={48} />
                      <h5 className="text-theme-primary">Ubicación</h5>
                      <p className="text-theme-secondary">
                        [Tu dirección o ciudad]<br />
                        Servicio en toda la región
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="card card-theme h-100 shadow-theme">
                    <div className="card-body text-center p-4">
                      <BsPhone className="text-success mb-3" size={48} />
                      <h5 className="text-theme-primary">Contacto Directo</h5>
                      <p className="text-theme-secondary">
                        WhatsApp: [Tu número]<br />
                        Email: [Tu email]
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Call to Action principal */}
              <div className="text-center mt-5">
                <div className="card card-theme shadow-theme-lg">
                  <div className="card-body p-5">
                    <h3 className="text-theme-primary mb-4">
                      ¿Quieres una propuesta personalizada?
                    </h3>
                    <p className="text-theme-secondary mb-4">
                      Sin compromiso, sin costos ocultos. Te visitamos y evaluamos las mejores opciones para tu empresa.
                    </p>
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                      <button className="btn btn-success btn-lg">
                        <BsWhatsapp className="me-2" /> Consultar por WhatsApp
                      </button>
                      <button className="btn btn-theme-secondary btn-lg">
                        <BsEnvelope className="me-2" /> Enviar Email
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
                <h5 className="text-theme-primary mb-2">Nexus Vending</h5>
                <p className="mb-1 text-theme-secondary">
                  Soluciones en máquinas expendedoras para empresas
                </p>
                <p className="mb-0 text-theme-secondary small">
                  © 2024 Nexus Vending. Todos los derechos reservados.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-md-end align-items-center gap-4">
                <span className="text-theme-secondary small">Síguenos:</span>
                <div className="d-flex gap-3">
                  <a href="#" className="text-theme-secondary" title="WhatsApp">
                    <BsWhatsapp size={24} />
                  </a>
                  <a href="#" className="text-theme-secondary" title="Instagram">
                    <BsInstagram size={24} />
                  </a>
                  <a href="#" className="text-theme-secondary" title="Email">
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

export default ContactSection; 