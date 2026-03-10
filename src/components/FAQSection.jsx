import { faqs } from '../data/contentData';

const FAQSection = () => {
  return (
    <section id="faq" className="py-5 bg-theme-primary">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-gradient mb-3">Preguntas Frecuentes</h2>
          <p className="lead text-theme-secondary">
            Todo lo que necesitás saber sobre nuestro servicio corporativo
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="accordion glass-panel rounded-4 overflow-hidden animate-fade-in-up" id="faqAccordion">
              {faqs.map((faq, index) => (
                <div className="accordion-item bg-transparent border-0 border-bottom border-theme" key={faq.id}>
                  <h2 className="accordion-header" id={`heading${faq.id}`}>
                    <button 
                      className={`accordion-button ${index !== 0 ? 'collapsed' : ''} bg-transparent text-theme-primary fw-bold px-4 py-4 shadow-none`}
                      type="button" 
                      data-bs-toggle="collapse" 
                      data-bs-target={`#collapse${faq.id}`}
                      aria-expanded={index === 0 ? "true" : "false"} 
                      aria-controls={`collapse${faq.id}`}
                    >
                      {faq.question}
                    </button>
                  </h2>
                  <div 
                    id={`collapse${faq.id}`} 
                    className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} 
                    aria-labelledby={`heading${faq.id}`} 
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body text-theme-secondary px-4 pb-4 pt-0">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
