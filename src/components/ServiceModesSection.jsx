import { BsCoin, BsBuilding, BsPeople } from "react-icons/bs";

const ServiceModesSection = () => {
  const modes = [
    {
      icon: <BsBuilding className="text-primary" size={32} />,
      title: "Servicio Corporativo Local",
      description: "Servicio gratuito para colaboradores. La empresa abona los consumos cumplimentando una cantidad mensual mínima requerida.",
      bgColor: "bg-primary",
    },
    {
      icon: <BsPeople className="text-success" size={32} />,
      title: "Servicio a Distancia",
      description: "Instalación remota con provisión mensual de insumos. Incluye capacitación detallada de manipulación y carga.",
      bgColor: "bg-success",
    }
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
            <div key={index} className="col-lg-6">
              <div className="card card-glass h-100 shadow-theme">
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
                          Implementación
                        </th>
                        <th className="text-theme-primary border-theme px-4 py-3">
                          Control de Consumos
                        </th>
                        <th className="text-theme-primary border-theme px-4 py-3">
                          Requisitos
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-theme">
                        <td className="text-theme-primary px-4 py-3 fw-bold">
                          Servicio Corporativo Local
                        </td>
                        <td className="text-theme-secondary px-4 py-3">
                          Técnicos presenciales en tu empresa
                        </td>
                        <td className="text-theme-secondary px-4 py-3">
                          Gestión exclusiva por sistema de usuarios
                        </td>
                        <td className="text-theme-secondary px-4 py-3">
                          Cumplimentar cantidad de consumo mínimo mensual
                        </td>
                      </tr>
                      <tr className="border-theme">
                        <td className="text-theme-primary px-4 py-3 fw-bold">
                          Servicio a Distancia
                        </td>
                        <td className="text-theme-secondary px-4 py-3">
                          Envío de máquina e insumos mensuales, con capacitación
                        </td>
                        <td className="text-theme-secondary px-4 py-3">
                          Gestión exclusiva por sistema de usuarios
                        </td>
                        <td className="text-theme-secondary px-4 py-3">
                          Cumplimentar cantidad de consumo mínimo mensual
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
