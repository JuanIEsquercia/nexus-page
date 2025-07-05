import { BsCheck2Circle, BsStars } from 'react-icons/bs';
import { openWhatsApp } from '../utils/contactUtils';

const WhyChooseUsSection = () => {
  const benefits = [
    "Instalación sin costo",
    "Mantenimiento y reposición incluidos",
    "Sistema de usuarios para control por colaborador",
    "Servicio flexible según tus necesidades"
  ];

  return (
    <section className="py-5 bg-theme-primary">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h2 className="display-6 fw-bold text-theme-primary mb-4">
              ¿Por qué elegirnos?
            </h2>
            <div className="d-flex flex-column gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="d-flex align-items-center">
                  <BsCheck2Circle className="text-success me-3" size={24} />
                  <span className="text-theme-primary fs-5">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 mb-4">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => openWhatsApp('Hola! Me interesa solicitar una propuesta para mi empresa.')}
              >
                Solicitar Propuesta
              </button>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="text-center">
              <div className="bg-theme-accent rounded p-4 shadow-theme">
                <div className="d-flex justify-content-center mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <BsStars key={star} className="text-warning" size={24} />
                  ))}
                </div>
                <h4 className="text-theme-primary">Servicio Garantizado</h4>
                <p className="text-theme-secondary mb-3">
                  "Excelente servicio, instalación rápida y productos siempre frescos. 
                  Nuestros empleados están muy contentos."
                </p>
                <small className="text-theme-secondary">- Empresa Cliente</small>
                
                <div className="row mt-4 text-center">
                  <div className="col-4">
                    <h5 className="text-primary mb-0">100+</h5>
                    <small className="text-theme-secondary">Empresas</small>
                  </div>
                  <div className="col-4">
                    <h5 className="text-success mb-0">24/7</h5>
                    <small className="text-theme-secondary">Soporte</small>
                  </div>
                  <div className="col-4">
                    <h5 className="text-warning mb-0">0€</h5>
                    <small className="text-theme-secondary">Inversión</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection; 