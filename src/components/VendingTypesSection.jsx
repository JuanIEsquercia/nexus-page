import { 
  BsCupHot, 
  BsPersonCheck, 
  BsShieldCheck, 
  BsGearWideConnected,
  BsFileText,
  BsDroplet, 
  BsCoin
} from 'react-icons/bs';
import { openWhatsApp } from '../utils/contactUtils';

const VendingTypesSection = () => {
  // Cafeteras
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
  const coffeeServices = [
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

  // Snacks solo abono mensual
  const snacks = [
    { name: "Bebidas Frías", icon: "🥤", items: ["Gaseosas", "Jugos", "Agua", "Energizantes"] },
    { name: "Snacks", icon: "🍫", items: ["Chocolates", "Galletas", "Papas", "Frutos secos"] },
    { name: "Golosinas", icon: "🍬", items: ["Caramelos", "Chicles", "Chupetines", "Turrones"] },
    { name: "Otros", icon: "🍪", items: ["Cereales", "Barras", "Yogures", "Helados"] }
  ];

  const cardStyle = {
    minHeight: '500px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  };

  const cardBodyStyle = {
    display: 'flex',
    flexDirection: 'column',
    flex: '1'
  };

  return (
    <section id="expendedoras" className="py-5 bg-theme-primary">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-theme-primary">Tipo de Expendedoras</h2>
          <p className="lead text-theme-secondary">
            Soluciones para el bienestar de tu equipo: cafeteras automáticas y snacks/bebidas con abono mensual.
          </p>
        </div>

        {/* Todas las cards en un solo contenedor */}
        <div className="row g-4">
          {/* Card 1: Cafeteras Automáticas */}
          <div className="col-lg-6">
            <div className="card card-theme shadow-theme" style={cardStyle}>
              <div className="card-body p-4" style={cardBodyStyle}>
                <h3 className="text-theme-primary mb-4">Cafeteras Automáticas</h3>
                <p className="text-theme-secondary mb-4">
                  <strong>Instalación bajo modalidad de comodato</strong> - Sin costos de adquisición ni inversión inicial
                </p>
                <div className="row g-2" style={{ flex: '1' }}>
                  {beverages.map((beverage, index) => (
                    <div key={index} className="col-6">
                      <div className="bg-theme-accent rounded p-2 text-center h-100 d-flex flex-column justify-content-center">
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

          {/* Card 2: ¿Cómo Funciona? */}
          <div className="col-lg-6">
            <div className="card card-theme shadow-theme" style={cardStyle}>
              <div className="card-body p-4" style={cardBodyStyle}>
                <h4 className="text-theme-primary mb-4">¿Cómo Funciona?</h4>
                <div className="d-flex flex-column gap-3" style={{ flex: '1' }}>
                  {coffeeServices.map((service, index) => (
                    <div key={index} className="d-flex align-items-start">
                      <div className="me-3 mt-1 flex-shrink-0">{service.icon}</div>
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
              </div>
            </div>
          </div>

          {/* Card 3: Snacks y Bebidas Frías */}
          <div className="col-lg-6">
            <div className="card card-theme shadow-theme" style={cardStyle}>
              <div className="card-body p-4" style={cardBodyStyle}>
                <h3 className="text-theme-primary mb-4">Snacks y Bebidas Frías</h3>
                <p className="text-theme-secondary mb-4">
                  Servicio exclusivo por abono mensual para colaboradores. Amplia variedad de productos, reposición y mantenimiento incluidos.
                </p>
                <div className="row g-2" style={{ flex: '1' }}>
                  {snacks.map((category, index) => (
                    <div key={index} className="col-6">
                      <div className="bg-theme-accent rounded p-2 text-center h-100 d-flex flex-column justify-content-center">
                        <div className="mb-1" style={{ fontSize: '1.5rem' }}>
                          {category.icon}
                        </div>
                        <small className="text-theme-primary fw-bold">
                          {category.name}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Modalidad de Servicio */}
          <div className="col-lg-6">
            <div className="card card-theme shadow-theme" style={cardStyle}>
              <div className="card-body p-4" style={{ ...cardBodyStyle, textAlign: 'center' }}>
                <h4 className="text-theme-primary mb-4">Modalidad de Servicio</h4>
                <div className="mb-4" style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <BsCoin className="text-warning mb-3 mx-auto" size={48} />
                  <h6 className="text-theme-primary mb-2">Abono mensual por colaborador</h6>
                  <p className="text-theme-secondary small">
                    La empresa asigna un monto mensual en pesos argentinos a cada colaborador para consumo en la máquina.
                  </p>
                </div>
                <button 
                  className="btn btn-primary btn-lg w-100"
                  onClick={() => openWhatsApp('Hola! Me interesa la propuesta de snacks y bebidas para colaboradores en mi empresa.')}
                >
                  <BsDroplet className="me-2" />
                  Solicitar Propuesta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VendingTypesSection; 