import { BsCupHot, BsBoxSeam, BsWrench } from 'react-icons/bs';
import { openWhatsApp } from '../utils/contactUtils';

const ServicesSection = () => {
  const services = [
    {
      title: "Máquinas en Comodato",
      icon: <BsCupHot size={48} className="text-warning" />,
      features: [
        "Instalación sin inversión inicial",
        "Equipos de última generación",
        "Variedad de cafés y bebidas calientes",
        "Gestión 100% a nuestro cargo"
      ],
      message: "Hola! Me interesa pedir un presupuesto por las máquinas de café en comodato."
    },
    {
      title: "Provisión de Insumos",
      icon: <BsBoxSeam size={48} className="text-info" />,
      features: [
        "Café",
        "Vasos, revolvedores y azúcar",
        "Reposición periódica garantizada",
        "Stock constante en tu oficina"
      ],
      message: "Hola! Me interesa conocer sobre la provisión de insumos de café."
    },
    {
      title: "Soporte Técnico Especializado",
      icon: <BsWrench size={48} className="text-success" />,
      features: [
        "Mantenimiento preventivo regular",
        "Resolución rápida de incidencias",
        "Limpieza y sanitización de equipos",
        "Equipos de reemplazo si es necesario"
      ],
      message: "Hola! Me interesa saber más sobre el mantenimiento y soporte técnico."
    }
  ];

  return (
    <section id="servicios" className="py-5 bg-theme-primary">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-theme-primary">Nuestros Servicios</h2>
          <p className="lead text-theme-secondary">
            Soluciones completas de café para potenciar a tu equipo
          </p>
        </div>
        
        <div className="row g-4">
          {services.map((service, index) => (
            <div key={index} className="col-lg-4">
              <div className="card card-glass h-100">
                <div className="card-body text-center p-4">
                  <div className="mb-4">
                    {service.icon}
                  </div>
                  <h5 className="card-title text-theme-primary mb-4">{service.title}</h5>
                  <ul className="list-unstyled text-start">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="mb-2">
                        <span className="text-success me-2">✓</span>
                        <span className="text-theme-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    className="btn btn-theme-primary mt-3"
                    onClick={() => openWhatsApp(service.message)}
                  >
                    Más Información
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection; 