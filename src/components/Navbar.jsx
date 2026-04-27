import { useState, useEffect } from 'react';
import NexusLogo from './NexusLogo';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`navbar navbar-expand-lg fixed-top transition-all ${
        isScrolled ? 'navbar-theme py-2' : 'bg-transparent py-4'
      }`}
      style={{ transition: 'all 0.3s ease-in-out' }}
    >
      <div className="container">
        <a className="navbar-brand" href="#">
          <NexusLogo height="40" />
        </a>
        <button 
          className="navbar-toggler bg-theme-secondary border-0 opacity-75" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center bg-theme-primary bg-lg-transparent p-3 p-lg-0 rounded-3 mt-3 mt-lg-0 border border-theme border-lg-0">
            <li className="nav-item">
              <a className="nav-link fw-semibold px-3" href="#inicio">Inicio</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-semibold px-3" href="#quienes-somos">¿Quiénes Somos?</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-semibold px-3" href="#servicios">Servicios</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-semibold px-3" href="#expendedoras">Máquinas</a>
            </li>
            <li className="nav-item">
              <button 
                className="btn btn-theme-primary rounded-pill ms-lg-3 mt-2 mt-lg-0 px-4 fw-bold shadow-sm"
                onClick={() => {
                  const contactSection = document.getElementById('contacto');
                  if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Pedir Presupuesto
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 