import { BsWhatsapp, BsCupHot, BsShieldCheck, BsLightningCharge } from 'react-icons/bs';
import { openWhatsApp } from '../utils/contactUtils';

const HeroSection = () => {
  return (
    <section id="inicio" className="py-5 position-relative overflow-hidden bg-theme-primary">
      {/* Background Fluid Gradient / Orbs */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100 bg-fluid-animate"
        style={{
          background: 'radial-gradient(circle at 15% 50%, var(--primary-color) 0%, transparent 40%), radial-gradient(circle at 85% 30%, var(--info-color) 0%, transparent 40%)',
          opacity: 0.15,
          zIndex: 0
        }}
      ></div>

      <div className="container position-relative" style={{ zIndex: 1 }}>
        <div className="row align-items-center min-vh-75 py-5 mt-4">
          <div className="col-lg-6 animate-blur-reveal">
            <div className="mb-3 d-inline-flex align-items-center px-3 py-1 rounded-pill bg-theme-accent border border-theme">
              <span className="text-warning me-2">✨</span>
              <span className="small fw-semibold text-theme-primary">Servicio Premium 2026</span>
            </div>
            <h1 className="display-3 fw-bold text-theme-primary mb-4" style={{ lineHeight: '1.1' }}>
              El <span className="text-gradient">Mejor Café</span> <br />
              para tu equipo
            </h1>
            <p className="lead text-theme-secondary mb-5" style={{ fontSize: '1.25rem', maxWidth: '90%' }}>
              Revolucionamos el ambiente laboral con máquinas de café de última generación. Instalación, mantenimiento y gestión <strong className="text-theme-primary">100% a nuestro cargo</strong>.
            </p>
            <div className="d-flex gap-3 flex-wrap mb-4">
              <button 
                className="btn btn-theme-primary btn-lg mb-2 fw-bold rounded-pill px-4 py-3 btn-glow d-flex align-items-center"
                onClick={() => openWhatsApp('Hola! Me interesa pedir un presupuesto del servicio de máquinas de café para mi empresa.')}
              >
                <BsWhatsapp className="me-2 fs-5" /> Pedir Presupuesto
              </button>
            </div>
            
            <div className="d-flex gap-4 mt-5 d-none d-md-flex opacity-75">
              <div className="d-flex align-items-center">
                <BsShieldCheck className="text-success me-2 fs-4" />
                <span className="small text-theme-secondary">Sin Inversión</span>
              </div>
              <div className="d-flex align-items-center">
                <BsLightningCharge className="text-warning me-2 fs-4" />
                <span className="small text-theme-secondary">Instalación Rápida</span>
              </div>
            </div>
          </div>
          
          <div className="col-lg-6 mt-5 mt-lg-0">
            <div className="text-center position-relative h-100 d-flex justify-content-center align-items-center">
              
              {/* Contenedor Flotante Principal */}
              <div className="card-glass rounded-4 p-5 animate-float w-100" style={{ maxWidth: '480px', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                <div className="mb-4 bg-theme-accent rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: '80px', height: '80px', boxShadow: '0 0 30px rgba(14, 165, 233, 0.2)' }}>
                  <BsCupHot size={40} className="text-primary" />
                </div>
                <h3 className="text-theme-primary mb-3 fw-bold">Soluciones Integrales</h3>
                <p className="text-theme-secondary mb-4">
                  Experiencia de cafetería corporativa completamente autogestionada.
                </p>
                
                <div className="d-flex flex-column gap-3 text-start mt-4">
                  <div className="d-flex align-items-center p-3 rounded-3 bg-theme-accent border border-theme">
                    <div className="bg-success rounded-circle p-2 me-3 d-flex align-items-center justify-content-center">
                      <BsShieldCheck className="text-white" size={16} />
                    </div>
                    <div>
                      <h6 className="mb-0 text-theme-primary fw-bold">Mantenimiento Incluido</h6>
                      <small className="text-theme-secondary">Soporte técnico preventivo</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center p-3 rounded-3 bg-theme-accent border border-theme">
                    <div className="bg-primary rounded-circle p-2 me-3 d-flex align-items-center justify-content-center">
                      <BsCupHot className="text-white" size={16} />
                    </div>
                    <div>
                      <h6 className="mb-0 text-theme-primary fw-bold">Insumos Garantizados</h6>
                      <small className="text-theme-secondary">Reposición periódica</small>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 