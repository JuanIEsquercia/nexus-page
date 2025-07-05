import { BsCoin, BsBuilding, BsPeople, BsCheck2Circle } from "react-icons/bs";
import { openWhatsApp } from '../utils/contactUtils';

const ServiceModesSection = () => {
  const modes = [
    {
      icon: <BsCoin className="text-warning" size={32} />,
      title: "Consumo directo",
      description: "Cada colaborador paga su consumo en la máquina",
      bgColor: "bg-warning",
    },
    {
      icon: <BsBuilding className="text-primary" size={32} />,
      title: "Abono mensual por empresa",
      description:
        "La empresa asigna un monto a cada colaborador (PIN personalizado)",
      bgColor: "bg-primary",
    },
    {
      icon: <BsPeople className="text-success" size={32} />,
      title: "Venta al público",
      description:
        "Se instala en locales comerciales para venta directa a clientes externos",
      bgColor: "bg-success",
    },
  ];

  const benefits = [
    "Instalación sin costo",
    "Mantenimiento y reposición incluidos",
    "Sistema de usuarios para control por colaborador",
    "Servicio flexible según tus necesidades"
  ];

  return (
    <section id="modalidades" className="py-5 bg-theme-secondary">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-theme-primary">
            Modalidades de Servicio
          </h2>
          <p className="lead text-theme-secondary">
            Flexibilidad total para adaptarse a las necesidades de tu empresa
          </p>
        </div>

        <div className="row g-4">
          {modes.map((mode, index) => (
            <div key={index} className="col-lg-4">
              <div className="card card-theme h-100 shadow-theme">
                <div className="card-header card-theme text-center py-4">
                  <div className="mb-3">{mode.icon}</div>
                  <h5 className="text-theme-primary mb-0">{mode.title}</h5>
                </div>
                <div className="card-body text-center p-4">
                  <p className="text-theme-secondary mb-4">
                    {mode.description}
                  </p>
                  <div
                    className={`badge ${mode.bgColor} bg-opacity-10 text-${
                      mode.bgColor.split("-")[1]
                    } px-3 py-2`}
                  >
                    Modalidad {index + 1}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Beneficios destacados */}
        <div className="row mt-5">
          <div className="col-lg-8 mx-auto">
            <div className="card card-theme shadow-theme mb-5">
              <div className="card-body p-4">
                <h4 className="text-center text-theme-primary mb-4">
                  Beneficios para tu empresa
                </h4>
                <div className="row g-3 mb-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="col-md-6">
                      <div className="d-flex align-items-center">
                        <BsCheck2Circle className="text-success me-3" size={20} />
                        <span className="text-theme-primary">{benefit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={() => openWhatsApp('Hola! Me interesa solicitar una propuesta para mi empresa.')}
                  >
                    Solicitar Propuesta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla adicional para detalles */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="card card-theme shadow-theme">
              <div className="card-header">
                <h4 className="text-theme-primary mb-0">
                  Comparativa de Modalidades
                </h4>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-theme-secondary">
                      <tr>
                        <th className="text-theme-primary border-theme px-4 py-3">
                          Modalidad
                        </th>
                        <th className="text-theme-primary border-theme px-4 py-3">
                          ¿Quién paga?
                        </th>
                        <th className="text-theme-primary border-theme px-4 py-3">
                          Control
                        </th>
                        <th className="text-theme-primary border-theme px-4 py-3">
                          Ideal para
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-theme">
                        <td className="text-theme-primary px-4 py-3 fw-bold">
                          Consumo directo
                        </td>
                        <td className="text-theme-secondary px-4 py-3">
                          Colaborador
                        </td>
                        <td className="text-theme-secondary px-4 py-3">
                          Individual
                        </td>
                        <td className="text-theme-secondary px-4 py-3">
                          Oficinas pequeñas
                        </td>
                      </tr>
                      <tr className="border-theme">
                        <td className="text-theme-primary px-4 py-3 fw-bold">
                          Abono mensual
                        </td>
                        <td className="text-theme-secondary px-4 py-3">
                          Empresa
                        </td>
                        <td className="text-theme-secondary px-4 py-3">
                          PIN personalizado
                        </td>
                        <td className="text-theme-secondary px-4 py-3">
                          Empresas medianas/grandes
                        </td>
                      </tr>
                      <tr className="border-theme">
                        <td className="text-theme-primary px-4 py-3 fw-bold">
                          Venta al público
                        </td>
                        <td className="text-theme-secondary px-4 py-3">
                          Cliente final
                        </td>
                        <td className="text-theme-secondary px-4 py-3">
                          Libre acceso
                        </td>
                        <td className="text-theme-secondary px-4 py-3">
                          Locales comerciales
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceModesSection;
