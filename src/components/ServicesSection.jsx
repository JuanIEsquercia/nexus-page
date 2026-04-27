import { BsCupHot, BsBoxSeam, BsWrench, BsArrowRightShort, BsStarFill } from 'react-icons/bs';
import { openWhatsApp } from '../utils/contactUtils';

const ServicesSection = () => {
  return (
    <section id="servicios" className="py-5 bg-theme-primary position-relative">
      <div className="container py-5">
        <div className="text-center mb-5 animate-blur-reveal">
          <span className="badge bg-theme-accent text-primary mb-2 px-3 py-2 border border-theme rounded-pill">¿Qué ofrecemos?</span>
          <h2 className="display-4 fw-bold text-theme-primary mb-3">Nuestros Servicios</h2>
          <p className="lead text-theme-secondary mx-auto" style={{ maxWidth: '600px' }}>
            Ecosistema completo para garantizar que nunca falte un buen café en tu espacio de trabajo.
          </p>
        </div>
        
        <div className="bento-grid animate-blur-reveal" style={{ animationDelay: '0.2s' }}>
          
          {/* Main Feature - Comodato */}
          <div className="bento-item bento-col-8 card-glass p-0">
            <div className="row g-0 h-100">
              <div className="col-md-7 p-5 d-flex flex-column justify-content-center">
                <div className="mb-4 d-inline-block">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3 d-inline-flex">
                    <BsCupHot size={32} className="text-warning" />
                  </div>
                </div>
                <h3 className="text-theme-primary fw-bold mb-3">Máquinas en Comodato</h3>
                <p className="text-theme-secondary mb-4">
                  Instalación de equipos de última generación sin inversión inicial. Nos hacemos cargo de todo para que disfrutes del mejor café.
                </p>
                <ul className="list-unstyled mb-4">
                  <li className="d-flex align-items-center mb-2">
                    <BsStarFill className="text-warning me-2" size={12} />
                    <span className="text-theme-secondary">Sin costo de adquisición</span>
                  </li>
                  <li className="d-flex align-items-center mb-2">
                    <BsStarFill className="text-warning me-2" size={12} />
                    <span className="text-theme-secondary">Variedad de bebidas calientes</span>
                  </li>
                  <li className="d-flex align-items-center">
                    <BsStarFill className="text-warning me-2" size={12} />
                    <span className="text-theme-secondary">Gestión 100% a nuestro cargo</span>
                  </li>
                </ul>
                <button 
                  className="btn btn-theme-secondary rounded-pill align-self-start px-4"
                  onClick={() => openWhatsApp('Hola! Me interesa pedir un presupuesto por las máquinas de café en comodato.')}
                >
                  Saber más <BsArrowRightShort size={20} className="ms-1" />
                </button>
              </div>
              <div className="col-md-5 bg-theme-accent border-start border-theme position-relative overflow-hidden min-h-100" style={{ minHeight: '300px' }}>
                <div className="position-absolute top-50 start-50 translate-middle w-100 h-100 bg-fluid-animate opacity-50" style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)' }}></div>
                {/* Decoración visual para representar el comodato */}
                <div className="position-absolute bottom-0 end-0 p-4 w-100 text-end">
                   <h1 className="display-1 fw-bold text-theme-primary opacity-25 m-0">0$</h1>
                   <p className="text-theme-secondary opacity-75 m-0 fw-bold">Inversión Inicial</p>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Feature 1 - Insumos */}
          <div className="bento-item bento-col-4 card-glass p-4 d-flex flex-column">
            <div className="mb-auto">
              <div className="bg-info bg-opacity-10 rounded-circle p-3 d-inline-flex mb-4">
                <BsBoxSeam size={28} className="text-info" />
              </div>
              <h4 className="text-theme-primary fw-bold mb-3">Provisión de Insumos</h4>
              <p className="text-theme-secondary small">
                Café, vasos, revolvedores y azúcar. Todo lo necesario con reposición periódica garantizada.
              </p>
            </div>
            <button 
              className="btn btn-sm btn-outline-info rounded-pill w-100 mt-4"
              onClick={() => openWhatsApp('Hola! Me interesa conocer sobre la provisión de insumos de café.')}
            >
              Consultar Insumos
            </button>
          </div>

          {/* Secondary Feature 2 - Soporte Técnico */}
          <div className="bento-item bento-col-12 card-glass p-5">
            <div className="row align-items-center h-100">
              <div className="col-md-4 text-center text-md-start mb-4 mb-md-0">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                  <BsWrench size={32} className="text-success" />
                </div>
                <h4 className="text-theme-primary fw-bold mb-2">Soporte Técnico Especializado</h4>
                <p className="text-theme-secondary small mb-0">Atención técnica rápida y eficiente para que tus máquinas siempre funcionen a la perfección.</p>
              </div>
              <div className="col-md-8">
                <div className="row g-4 ps-md-4 border-start-md border-theme">
                  <div className="col-sm-6">
                    <div className="d-flex align-items-start">
                      <div className="text-success me-3 mt-1 fs-5">✓</div>
                      <div>
                        <h6 className="mb-1 text-theme-primary fw-bold">Mantenimiento Preventivo</h6>
                        <p className="small text-theme-secondary mb-0">Visitas regulares de control</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-start">
                      <div className="text-success me-3 mt-1 fs-5">✓</div>
                      <div>
                        <h6 className="mb-1 text-theme-primary fw-bold">Resolución Rápida</h6>
                        <p className="small text-theme-secondary mb-0">Atención ágil ante incidencias</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-start">
                      <div className="text-success me-3 mt-1 fs-5">✓</div>
                      <div>
                        <h6 className="mb-1 text-theme-primary fw-bold">Sanitización</h6>
                        <p className="small text-theme-secondary mb-0">Limpieza profunda de equipos</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-start">
                      <div className="text-success me-3 mt-1 fs-5">✓</div>
                      <div>
                        <h6 className="mb-1 text-theme-primary fw-bold">Equipos de Reemplazo</h6>
                        <p className="small text-theme-secondary mb-0">Para que nunca falte el servicio</p>
                      </div>
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

export default ServicesSection; 