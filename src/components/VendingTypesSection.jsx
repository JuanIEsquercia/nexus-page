import { 
  BsShieldCheck, 
  BsGearWideConnected,
  BsFileText,
  BsFillLightningFill
} from 'react-icons/bs';

const VendingTypesSection = () => {
  const beverages = [
    { name: "Americano", icon: "☕" },
    { name: "Espresso", icon: "☕" },
    { name: "Cappuccino", icon: "🥛" },
    { name: "Café c/ Leche", icon: "🥛" },
    { name: "Chocolate", icon: "🍫" },
    { name: "Cortado", icon: "☕" },
    { name: "Leche", icon: "🥛" },
    { name: "Especiales", icon: "🌟" }
  ];

  return (
    <section id="expendedoras" className="py-5 bg-theme-secondary position-relative">
      <div className="container py-5">
        <div className="text-center mb-5 animate-blur-reveal">
          <span className="badge bg-theme-accent text-primary mb-2 px-3 py-2 border border-theme rounded-pill">Tecnología & Sabor</span>
          <h2 className="display-4 fw-bold text-theme-primary mb-3">Máquinas de Última Generación</h2>
          <p className="lead text-theme-secondary mx-auto" style={{ maxWidth: '650px' }}>
            Elevamos la experiencia del café corporativo con equipos automáticos que combinan diseño premium y rendimiento ininterrumpido.
          </p>
        </div>

        <div className="bento-grid animate-blur-reveal" style={{ animationDelay: '0.1s' }}>
          
          {/* Main Visual Card */}
          <div className="bento-item bento-col-12 card-glass p-0 border-primary border-opacity-25 overflow-hidden">
             <div className="row g-0 h-100 position-relative">
                <div className="col-lg-6 p-5 d-flex flex-column justify-content-center z-1">
                   <h3 className="display-6 fw-bold text-theme-primary mb-3">Cafeteras Automáticas</h3>
                   <p className="text-theme-secondary mb-4 fs-5">
                     <strong>Instalación 100% en comodato.</strong> Disfruta de la mejor calidad sin costos de adquisición ni sorpresas.
                   </p>
                   
                   <div className="d-flex flex-wrap gap-3 mb-4">
                     <div className="bg-theme-accent px-4 py-3 rounded-4 border border-theme d-flex flex-column w-100" style={{ maxWidth: '280px' }}>
                       <div className="d-flex align-items-center mb-2">
                          <BsFillLightningFill className="text-warning me-2 fs-4" />
                          <h6 className="m-0 fw-bold text-theme-primary">Rendimiento</h6>
                       </div>
                       <small className="text-theme-secondary">Listas para alto volumen de consumo diario sin perder calidad.</small>
                     </div>
                   </div>
                </div>
                
                <div className="col-lg-6 bg-theme-accent border-start border-theme position-relative p-5 d-flex flex-column justify-content-center">
                  <h5 className="text-theme-primary mb-4 fw-bold text-center">Menú de Bebidas Disponibles</h5>
                  <div className="row g-3">
                    {beverages.map((beverage, index) => (
                      <div key={index} className="col-6 col-sm-3 col-lg-3">
                        <div className="bg-theme-secondary rounded-4 p-3 text-center h-100 d-flex flex-column justify-content-center border border-theme hover-lift transition-all cursor-pointer" style={{ transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                          <div className="mb-2" style={{ fontSize: '2rem' }}>
                            {beverage.icon}
                          </div>
                          <small className="text-theme-primary fw-bold text-truncate w-100 d-block" style={{ fontSize: '0.8rem' }}>
                            {beverage.name}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>

          {/* How it works 1 */}
          <div className="bento-item bento-col-4 card-glass p-4 d-flex flex-column justify-content-center">
             <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3 align-self-start">
               <BsGearWideConnected size={24} className="text-primary" />
             </div>
             <h5 className="text-theme-primary fw-bold mb-2">Reposición Completa</h5>
             <p className="text-theme-secondary small mb-0">
               Nos encargamos del café, leche, chocolate, azúcar, vasos y mezcladores. Nunca te faltará nada.
             </p>
          </div>

          {/* How it works 2 */}
          <div className="bento-item bento-col-4 card-glass p-4 d-flex flex-column justify-content-center">
             <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3 align-self-start">
               <BsShieldCheck size={24} className="text-success" />
             </div>
             <h5 className="text-theme-primary fw-bold mb-2">Mantenimiento Total</h5>
             <p className="text-theme-secondary small mb-0">
               Mantenimiento preventivo programado y correctivo inmediato ante cualquier incidencia.
             </p>
          </div>

          {/* Contract Terms */}
          <div className="bento-item bento-col-4 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-4 p-4 d-flex flex-column justify-content-center position-relative overflow-hidden">
             <div className="position-absolute top-0 end-0 opacity-10 p-3">
               <BsFileText size={100} />
             </div>
             <h5 className="text-primary fw-bold mb-3 z-1">Condiciones del Servicio</h5>
             <div className="d-flex align-items-center gap-3 z-1 mb-2">
               <div className="bg-white text-primary rounded px-3 py-2 fw-bold text-center">
                 <span className="fs-4 d-block">6</span>
                 <span className="small">Meses</span>
               </div>
               <p className="text-theme-primary small mb-0 fw-semibold">Contrato mínimo inicial</p>
             </div>
             <div className="d-flex align-items-center gap-3 z-1">
               <div className="bg-white text-success rounded px-3 py-2 fw-bold text-center">
                 <span className="fs-4 d-block">✓</span>
                 <span className="small">Consumo</span>
               </div>
               <p className="text-theme-primary small mb-0 fw-semibold">Acuerdo de consumo mínimo</p>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default VendingTypesSection; 