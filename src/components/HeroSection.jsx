import { BsWhatsapp, BsGeoAlt } from 'react-icons/bs';
import { openWhatsApp, openLocation } from '../utils/contactUtils';

const HeroSection = () => {
  return (
    <section id="inicio" className="py-5 bg-theme-primary">
      <div className="container">
        <div className="row align-items-center min-vh-75">
          <div className="col-lg-6">
            <h1 className="display-4 fw-bold text-theme-primary mb-4">
              <span className="text-primary">El Mejor Café</span> para tu equipo
            </h1>
            <p className="lead text-theme-secondary mb-4">
              Mejoramos el ambiente laboral con máquinas de café. Instalación y mantenimiento 100% a nuestro cargo.
            </p>
            <div className="d-flex gap-3 flex-wrap mb-4">
              <button 
                className="btn btn-primary btn-lg mb-2 fw-bold"
                onClick={() => openWhatsApp('Hola! Me interesa pedir un presupuesto del servicio de máquinas de café para mi empresa.')}
              >
                <BsWhatsapp className="me-2" /> Pedir Presupuesto
              </button>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="text-center">
              <div className="glass-panel rounded-4 p-5">
                <h3 className="text-theme-primary mb-3">☕ Soluciones Integrales</h3>
                <p className="text-theme-secondary">
                  Instalación, mantenimiento y gestión 100% a nuestro cargo
                </p>
                <div className="mt-4">
                  <span className="badge bg-success me-2">Sin inversión inicial</span>
                  <span className="badge bg-info">Servicio completo</span>
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