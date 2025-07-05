import { 
  BsDroplet, 
  BsCupStraw, 
  BsBox, 
  BsArrowRepeat,
  BsPeople,
  BsCoin,
  BsBuilding
} from 'react-icons/bs';
import { openWhatsApp } from '../utils/contactUtils';

const SnacksVendingSection = () => {
  const products = [
    { name: "Bebidas Frías", icon: "🥤", items: ["Gaseosas", "Jugos", "Agua", "Energizantes"] },
    { name: "Snacks", icon: "🍫", items: ["Chocolates", "Galletas", "Papas", "Frutos secos"] },
    { name: "Golosinas", icon: "🍬", items: ["Caramelos", "Chicles", "Chupetines", "Turrones"] },
    { name: "Otros", icon: "🍪", items: ["Cereales", "Barras", "Yogures", "Helados"] }
  ];

  const features = [
    {
      icon: <BsArrowRepeat className="text-success" size={32} />,
      title: "Alta Rotación",
      description: "Ideal para oficinas con alto flujo de personas"
    },
    {
      icon: <BsCoin className="text-warning" size={32} />,
      title: "Modalidad Flexible",
      description: "Colaborador paga o empresa financia"
    },
    {
      icon: <BsPeople className="text-info" size={32} />,
      title: "Variedad Completa",
      description: "Amplia gama de productos para todos los gustos"
    }
  ];

  const benefits = [
    "Sin inversión inicial",
    "Reposición automática",
    "Mantenimiento incluido",
    "Productos siempre frescos"
  ];

  return (
    <section id="snacks-bebidas" className="py-5 bg-theme-primary">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="mb-4">
            <BsDroplet className="text-info" size={64} />
          </div>
          <h2 className="display-5 fw-bold text-theme-primary">
            Máquinas de Snacks y Bebidas Frías
          </h2>
          <p className="lead text-theme-secondary">
            Solución completa para satisfacer todas las necesidades de tu equipo
          </p>
        </div>

        <div className="row g-5">
          {/* Productos disponibles */}
          <div className="col-lg-6">
            <div className="card card-theme shadow-theme h-100">
              <div className="card-body p-4">
                <h3 className="text-theme-primary mb-4">Productos Disponibles</h3>
                <div className="row g-3">
                  {products.map((category, index) => (
                    <div key={index} className="col-md-6">
                      <div className="bg-theme-accent rounded p-3">
                        <div className="text-center mb-2">
                          <span style={{ fontSize: '2rem' }}>{category.icon}</span>
                        </div>
                        <h6 className="text-theme-primary text-center mb-2">{category.name}</h6>
                        <ul className="list-unstyled small text-theme-secondary mb-0">
                          {category.items.map((item, itemIndex) => (
                            <li key={itemIndex}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Características principales */}
          <div className="col-lg-6">
            <div className="card card-theme shadow-theme h-100">
              <div className="card-body p-4">
                <h3 className="text-theme-primary mb-4">Características Principales</h3>
                <div className="d-flex flex-column gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="d-flex align-items-start">
                      <div className="me-3 mt-1">{feature.icon}</div>
                      <div>
                        <h6 className="text-theme-primary mb-1">{feature.title}</h6>
                        <p className="text-theme-secondary mb-0 small">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <hr className="border-theme my-4" />
                <div className="bg-theme-accent rounded p-3">
                  <h6 className="text-theme-primary mb-3">
                    <BsBuilding className="me-2" />
                    Modalidades de Pago
                  </h6>
                  <div className="row text-center">
                    <div className="col-6">
                      <div className="border-end border-theme">
                        <h6 className="text-primary mb-1">Modalidad Libre</h6>
                        <small className="text-theme-secondary">Colaborador paga</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <h6 className="text-success mb-1">Empresa Financia</h6>
                      <small className="text-theme-secondary">Beneficio corporativo</small>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <button 
                    className="btn btn-info btn-lg"
                    onClick={() => openWhatsApp('Hola! Me interesa la propuesta de máquinas de snacks y bebidas para mi empresa.')}
                  >
                    <BsDroplet className="me-2" />
                    Solicitar Propuesta de Snacks
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

export default SnacksVendingSection; 