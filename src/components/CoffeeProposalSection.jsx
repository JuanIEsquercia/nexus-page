import { 
  BsCupHot, 
  BsPersonCheck, 
  BsShieldCheck, 
  BsGearWideConnected,
  BsFileText
} from 'react-icons/bs';
import { openWhatsApp } from '../utils/contactUtils';

const CoffeeProposalSection = () => {
  const beverages = [
    { name: "Café Americano", icon: "☕" },
    { name: "Espresso", icon: "☕" },
    { name: "Cappuccino", icon: "🥛" },
    { name: "Café con Leche", icon: "🥛" },
    { name: "Chocolate", icon: "🍫" },
    { name: "Café Cortado", icon: "☕" },
    { name: "Leche", icon: "🥛" },
    { name: "Combinaciones", icon: "🌟" }
  ];

  const services = [
    {
      icon: <BsGearWideConnected className="text-primary" size={32} />,
      title: "Reposición Completa",
      description: "Café, leche, chocolate, azúcar, vasos y mezcladores"
    },
    {
      icon: <BsShieldCheck className="text-success" size={32} />,
      title: "Mantenimiento Total",
      description: "Preventivo y correctivo incluido"
    },
    {
      icon: <BsPersonCheck className="text-info" size={32} />,
      title: "Sistema de Usuarios",
      description: "PIN personal con crédito asignado por empresa"
    }
  ];

  return (
    <section id="propuesta-cafeteras" className="py-5 bg-theme-secondary">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="mb-4">
            <BsCupHot className="text-warning" size={64} />
          </div>
          <h2 className="display-5 fw-bold text-theme-primary">
            Propuesta de Cafeteras Automáticas
          </h2>
          <p className="lead text-theme-secondary">
            Solución integral sin inversión inicial para tu empresa
          </p>
        </div>

        <div className="row g-5">
          {/* ¿Qué ofrecemos? */}
          <div className="col-lg-6">
            <div className="card card-theme shadow-theme h-100">
              <div className="card-body p-4">
                <h3 className="text-theme-primary mb-4">¿Qué Ofrecemos?</h3>
                <p className="text-theme-secondary mb-4">
                  <strong>Instalación bajo modalidad de comodato</strong> - Sin costos de adquisición ni inversión inicial
                </p>
                <div className="row g-2">
                  {beverages.map((beverage, index) => (
                    <div key={index} className="col-6">
                      <div className="bg-theme-accent rounded p-2 text-center">
                        <div className="mb-1" style={{ fontSize: '1.5rem' }}>
                          {beverage.icon}
                        </div>
                        <small className="text-theme-primary fw-bold">
                          {beverage.name}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cómo funciona */}
          <div className="col-lg-6">
            <div className="card card-theme shadow-theme h-100">
              <div className="card-body p-4">
                <h3 className="text-theme-primary mb-4">¿Cómo Funciona?</h3>
                <div className="d-flex flex-column gap-3">
                  {services.map((service, index) => (
                    <div key={index} className="d-flex align-items-start">
                      <div className="me-3 mt-1">{service.icon}</div>
                      <div>
                        <h6 className="text-theme-primary mb-1">{service.title}</h6>
                        <p className="text-theme-secondary mb-0 small">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <hr className="border-theme my-4" />
                <div className="bg-theme-accent rounded p-3">
                  <h6 className="text-theme-primary mb-2">
                    <BsFileText className="me-2" />
                    Condiciones del Contrato
                  </h6>
                  <div className="row text-center">
                    <div className="col-6">
                      <h5 className="text-primary mb-1">6</h5>
                      <small className="text-theme-secondary">meses mínimo</small>
                    </div>
                    <div className="col-6">
                      <h5 className="text-success mb-1">📋</h5>
                      <small className="text-theme-secondary">Consumo acordado</small>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={() => openWhatsApp('Hola! Me interesa la propuesta de cafeteras automáticas para mi empresa.')}
                  >
                    <BsCupHot className="me-2" />
                    Solicitar Propuesta de Cafeteras
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoffeeProposalSection; 