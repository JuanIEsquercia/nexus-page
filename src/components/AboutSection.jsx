import { BsBuilding, BsPeople, BsGear } from 'react-icons/bs';

const AboutSection = () => {
  return (
    <section id="quienes-somos" className="py-5 bg-theme-secondary">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h2 className="display-6 fw-bold text-theme-primary mb-4">
              ¿Quiénes Somos?
            </h2>
            <p className="text-theme-secondary mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>
              Somos una empresa que instala y gestiona máquinas expendedoras en empresas, 
              oficinas y espacios comerciales, buscando mejorar el entorno laboral y 
              simplificar la gestión interna.
            </p>
            <div className="d-flex flex-column gap-3">
              {[
                { icon: BsBuilding, text: "Presencia en empresas y oficinas" },
                { icon: BsPeople, text: "Enfoque en bienestar laboral" },
                { icon: BsGear, text: "Gestión integral y simplificada" }
              ].map((item, index) => (
                <div key={index} className="d-flex align-items-center">
                  <item.icon className="text-primary me-3" size={24} />
                  <span className="text-theme-primary">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="text-center">
              <div className="bg-theme-accent rounded p-4 shadow-theme">
                <div className="mb-3" style={{ fontSize: '4rem' }}>
                  🏢
                </div>
                <h4 className="text-theme-primary">Nuestra Misión</h4>
                <p className="text-theme-secondary mb-0">
                  Mejorar la experiencia laboral de equipos y empresas con soluciones 
                  prácticas que no requieren inversión inicial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection; 