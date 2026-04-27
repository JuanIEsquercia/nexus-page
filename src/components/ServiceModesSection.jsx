import { BsBuilding, BsPeople, BsCreditCard, BsBox } from "react-icons/bs";

const ServiceModesSection = () => {
  return (
    <section id="modalidades" className="py-5 bg-theme-primary position-relative">
      <div className="container py-5">
        <div className="text-center mb-5 animate-blur-reveal">
          <span className="badge bg-theme-accent text-primary mb-2 px-3 py-2 border border-theme rounded-pill">¿Cómo operamos?</span>
          <h2 className="display-4 fw-bold text-theme-primary mb-3">
            Modalidades de Servicio
          </h2>
          <p className="lead text-theme-secondary mx-auto" style={{ maxWidth: '650px' }}>
            Flexibilidad total para adaptarse a las necesidades de tu empresa, estés donde estés.
          </p>
        </div>

        <div className="bento-grid animate-blur-reveal" style={{ animationDelay: '0.1s' }}>
          
          {/* Modalidad 1: Local */}
          <div className="bento-item bento-col-6 card-glass p-5 border-primary border-opacity-25 position-relative overflow-hidden">
            <div className="position-absolute top-0 end-0 p-4 opacity-10">
               <BsBuilding size={120} className="text-primary" />
            </div>
            <div className="position-relative z-1">
               <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-4">
                 <BsBuilding className="text-primary" size={32} />
               </div>
               <h3 className="text-theme-primary fw-bold mb-3">Servicio Corporativo Local</h3>
               <p className="text-theme-secondary mb-4">
                 Técnicos presenciales en tu empresa. Servicio gratuito para colaboradores donde la empresa abona los consumos.
               </p>
               <ul className="list-unstyled mb-0">
                 <li className="d-flex align-items-center mb-3">
                   <span className="bg-theme-accent rounded-circle p-2 me-3 d-flex"><BsCreditCard className="text-primary" size={16} /></span>
                   <span className="text-theme-secondary fw-semibold">Gestión por sistema de usuarios</span>
                 </li>
                 <li className="d-flex align-items-center">
                   <span className="bg-theme-accent rounded-circle p-2 me-3 d-flex"><BsBox className="text-primary" size={16} /></span>
                   <span className="text-theme-secondary fw-semibold">Requiere consumo mínimo mensual</span>
                 </li>
               </ul>
            </div>
          </div>

          {/* Modalidad 2: A Distancia */}
          <div className="bento-item bento-col-6 card-glass p-5 border-success border-opacity-25 position-relative overflow-hidden">
            <div className="position-absolute top-0 end-0 p-4 opacity-10">
               <BsPeople size={120} className="text-success" />
            </div>
            <div className="position-relative z-1">
               <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-flex mb-4">
                 <BsPeople className="text-success" size={32} />
               </div>
               <h3 className="text-theme-primary fw-bold mb-3">Servicio a Distancia</h3>
               <p className="text-theme-secondary mb-4">
                 Instalación remota con provisión mensual de insumos. Incluye capacitación detallada de manipulación y carga.
               </p>
               
               <div className="bg-theme-accent p-4 rounded-4 border border-theme">
                  <h6 className="text-theme-primary fw-bold mb-3">Opciones de Contratación:</h6>
                  <ul className="list-unstyled mb-0">
                    <li className="d-flex align-items-start mb-3">
                      <span className="text-success me-2 mt-1">✓</span>
                      <div>
                        <strong className="text-theme-primary d-block">Gestión de Usuarios</strong>
                        <small className="text-theme-secondary">Administración remota del consumo de tus colaboradores.</small>
                      </div>
                    </li>
                    <li className="d-flex align-items-start">
                      <span className="text-success me-2 mt-1">✓</span>
                      <div>
                        <strong className="text-theme-primary d-block">Compra de Kit Starter</strong>
                        <small className="text-theme-secondary">Paquete mínimo mensual con todo lo necesario para operar.</small>
                      </div>
                    </li>
                  </ul>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ServiceModesSection;
