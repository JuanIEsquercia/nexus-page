import { useState, useRef } from 'react';
import { BsWhatsapp, BsGeoAlt, BsInstagram, BsEnvelope, BsPhone, BsSendCheck, BsExclamationTriangle } from 'react-icons/bs';
import { openWhatsApp } from '../utils/contactUtils';
import emailjs from '@emailjs/browser';

const ContactSection = () => {
  const form = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const handleEmailClick = () => {
    window.location.href = 'mailto:nexuscorrientes@gmail.com?subject=Consulta sobre servicios de vending';
  };

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/nexusok_/', '_blank');
  };

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // TODO: Reemplazar estas keys con las reales de tu cuenta de EmailJS
    emailjs.sendForm('service_9rtwy0u', 'template_80muv82', form.current, 'd69F6v3b_neMWozO6')
      .then((result) => {
          setIsSubmitting(false);
          setSubmitStatus('success');
          e.target.reset();
      }, (error) => {
          setIsSubmitting(false);
          setSubmitStatus('error');
      });
  };

  return (
    <>
      {/* Sección de contacto */}
      <section id="contacto" className="py-5 bg-theme-secondary">
        <div className="container">
          <div className="row g-5 align-items-center">
            
            {/* Columna Izquierda: Información de Contacto */}
            <div className="col-lg-5 animate-fade-in-up">
              <h2 className="display-5 fw-bold text-gradient mb-3">¡Hablemos de tu Empresa!</h2>
              <p className="lead text-theme-secondary mb-5">
                Evaluamos el consumo exacto de tu oficina y te brindamos la opción más rentable. Dejanos tus datos o contactanos directo.
              </p>
              
              <div className="d-flex flex-column gap-4 mb-5">
                <div className="card card-glass">
                  <div className="card-body d-flex align-items-center p-4">
                    <div className="me-4 text-primary">
                      <BsGeoAlt size={32} />
                    </div>
                    <div>
                      <h5 className="text-theme-primary mb-1">Central Operativa</h5>
                      <p className="text-theme-secondary mb-0">José Ramón Vidal 1768, Corrientes</p>
                    </div>
                  </div>
                </div>

                <div className="card card-glass">
                  <div className="card-body d-flex align-items-center p-4">
                    <div className="me-4 text-success">
                      <BsPhone size={32} />
                    </div>
                    <div>
                      <h5 className="text-theme-primary mb-1">Contacto Rápido</h5>
                      <p className="text-theme-secondary mb-0">+54 9 379 426-7780 <br/>nexuscorrientes@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-3 flex-wrap">
                <button 
                  className="btn btn-success btn-lg flex-grow-1"
                  onClick={() => openWhatsApp('Hola! Me interesa conversar sobre el servicio corporativo de café.')}
                >
                  <BsWhatsapp className="me-2" /> WhatsApp Directo
                </button>
              </div>
            </div>

            {/* Columna Derecha: Formulario EmailJS */}
            <div className="col-lg-7 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="glass-panel p-5 rounded-4 shadow-theme-lg">
                <h4 className="text-theme-primary mb-4">Solicitar Cotización Formal</h4>
                
                {submitStatus === 'success' && (
                  <div className="alert alert-success d-flex align-items-center" role="alert">
                    <BsSendCheck className="me-2" size={24} />
                    <div>
                      ¡Gracias! Hemos recibido tu solicitud. Nos contactaremos a la brevedad.
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <BsExclamationTriangle className="me-2" size={24} />
                    <div>
                      Hubo un error al enviar el mensaje. Por favor, intentá por WhatsApp.
                    </div>
                  </div>
                )}

                <form ref={form} onSubmit={sendEmail}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-theme-secondary">Nombre Completo *</label>
                      <input type="text" name="user_name" className="form-control bg-transparent border-theme text-theme-primary" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-theme-secondary">Empresa *</label>
                      <input type="text" name="company_name" className="form-control bg-transparent border-theme text-theme-primary" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-theme-secondary">Email Corporativo *</label>
                      <input type="email" name="user_email" className="form-control bg-transparent border-theme text-theme-primary" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-theme-secondary">Cant. de Colaboradores *</label>
                      <select name="employee_count" className="form-select bg-transparent border-theme text-theme-primary" required>
                        <option value="" className="text-dark">Seleccionar...</option>
                        <option value="1-15" className="text-dark">1 a 15</option>
                        <option value="16-50" className="text-dark">16 a 50</option>
                        <option value="51-200" className="text-dark">51 a 200</option>
                        <option value="+200" className="text-dark">Más de 200</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-theme-secondary">Mensaje Adicional</label>
                      <textarea name="message" className="form-control bg-transparent border-theme text-theme-primary" rows="4" placeholder="Contanos brevemente qué buscan implementar..." required></textarea>
                    </div>
                    <div className="col-12 mt-4">
                      <button type="submit" className="btn btn-theme-primary btn-lg w-100" disabled={isSubmitting}>
                        {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-theme-secondary py-4 border-top border-theme">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="mb-3 mb-md-0">
                <h5 className="text-theme-primary mb-2">Nexus Vending</h5>
                <p className="mb-1 text-theme-secondary">
                  Soluciones en máquinas expendedoras para empresas
                </p>
                <p className="mb-0 text-theme-secondary small">
                  © 2024 Nexus Vending. Todos los derechos reservados.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-md-end align-items-center gap-4">
                <span className="text-theme-secondary small">Síguenos:</span>
                <div className="d-flex gap-3">
                  <a href="#" className="text-theme-secondary" title="WhatsApp" onClick={() => openWhatsApp('Hola!')}>
                    <BsWhatsapp size={24} />
                  </a>
                  <a href="#" className="text-theme-secondary" title="Instagram" onClick={handleInstagramClick}>
                    <BsInstagram size={24} />
                  </a>
                  <a href="#" className="text-theme-secondary" title="Email" onClick={handleEmailClick}>
                    <BsEnvelope size={24} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default ContactSection; 