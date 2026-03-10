import { BsBuilding, BsPeople, BsGear } from 'react-icons/bs';

const AboutSection = () => {
  return (
    <section id="quienes-somos" className="py-5 bg-theme-secondary">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 animate-fade-in-up">
            <h2 className="display-6 fw-bold text-gradient mb-4">
              ¿Quiénes Somos?
            </h2>
            <p className="text-theme-secondary mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>
              Somos una empresa que instala y gestiona máquinas expendedoras en empresas, 
              oficinas y espacios comerciales, buscando mejorar el entorno laboral y 
              simplificar la gestión interna.
            </p>
            <div className="d-flex flex-column gap-3">
              {[
                { icon: BsBuilding, text: "Soluciones para empresas y oficinas" },
                { icon: BsPeople, text: "Enfoque en el bienestar de tu equipo" },
                { icon: BsGear, text: "Mantenimiento y gestión 100% incluidos" }
              ].map((item, index) => (
                <div key={index} className="d-flex align-items-center">
                  <item.icon className="text-primary me-3" size={24} />
                  <span className="text-theme-primary">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-center">
              <div className="glass-panel rounded-4 p-5">
                <div className="mb-3" style={{ fontSize: '4rem' }}>
                  🏢
                </div>
                <h4 className="text-theme-primary">Nuestra Misión</h4>
                <p className="text-theme-secondary mb-0">
                  Mejorar la experiencia laboral de equipos y empresas ofreciendo el mejor servicio de café corporativo, sin complicaciones ni inversión inicial.
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