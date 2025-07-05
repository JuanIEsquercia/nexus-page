import { BsCupHot, BsDroplet, BsShop } from 'react-icons/bs';
import { openWhatsApp } from '../utils/contactUtils';

const ServicesSection = () => {
  const services = [
    {
      title: "Cafeteras automáticas",
      icon: <BsCupHot size={48} className="text-warning" />,
      features: [
        "Instalación en oficinas o puntos de venta",
        "Variedad de cafés, capuccino, leche y chocolate",
        "Modalidad: consumo directo o abono por colaborador",
        "Gestión y reposición 100% a cargo nuestro"
      ],
      message: "Hola! Me interesa más información sobre las cafeteras automáticas."
    },
    {
      title: "Máquinas de snacks y bebidas frías",
      icon: <BsDroplet size={48} className="text-info" />,
      features: [
        "Amplia variedad de productos",
        "Modalidad libre (colaborador paga) o empresa-financia",
        "Alta rotación, ideal para oficinas",
        "Entornos con alto flujo de personas"
      ],
      message: "Hola! Me interesa más información sobre las máquinas de snacks y bebidas frías."
    },
    {
      title: "Cafeteras para locales comerciales",
      icon: <BsShop size={48} className="text-success" />,
      features: [
        "Solución simple y profesional para vender café al paso",
        "Ingreso extra y fidelización de clientes",
        "Mínima gestión, máxima eficiencia",
        "Ideal para comercios y locales"
      ],
      message: "Hola! Me interesa más información sobre las cafeteras para locales comerciales."
    }
  ];

  return (
    <section id="servicios" className="py-5 bg-theme-primary">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-theme-primary">Nuestros Servicios</h2>
          <p className="lead text-theme-secondary">
            Soluciones completas para mejorar el bienestar en tu empresa
          </p>
        </div>
        
        <div className="row g-4">
          {services.map((service, index) => (
            <div key={index} className="col-lg-4">
              <div className="card card-theme h-100 shadow-theme">
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