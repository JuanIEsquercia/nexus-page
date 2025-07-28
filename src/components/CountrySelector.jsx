import { useState, useEffect } from 'react';
import NexusLogo from './NexusLogo';
import '../styles/CountrySelector.css';

const CountrySelector = ({ onCountrySelect }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animación de entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleCountrySelect = (country) => {
    // Guardar selección en localStorage
    localStorage.setItem('selectedCountry', country);
    onCountrySelect(country);
  };

  return (
    <div className="country-selector">
      <div className={`selector-container ${isVisible ? 'visible' : ''}`}>
        <div className="logo-section text-center mb-4">
          <div className="logo-container">
            <NexusLogo height="80" className="d-none d-md-block" />
            <NexusLogo height="60" className="d-block d-md-none" />
          </div>
          <h1 className="display-5 display-md-4 fw-bold text-white mt-3 mb-2">
            Bienvenido a Nexus Vending
          </h1>
          <p className="lead text-white-50 mb-1">
            Selecciona tu ubicación para continuar
          </p>
          <p className="text-white-50 small">
            Select your location to continue
          </p>
        </div>

        <div className="countries-grid">
          <div 
            className="country-card argentina"
            onClick={() => handleCountrySelect('argentina')}
          >
            <div className="flag-container">
              <img 
                src="https://flagcdn.com/w320/ar.png" 
                alt="Argentina Flag" 
                className="flag-image"
              />
            </div>
            <div className="country-info">
              <h3 className="country-name">Argentina</h3>
              <p className="country-description">Servicios en español</p>
              <p className="country-description-en">Services in Spanish</p>
              <div className="country-details">
                <span className="location">📍 Corrientes</span>
                <span className="language">🇪🇸 Español</span>
              </div>
            </div>
          </div>

          <div 
            className="country-card miami"
            onClick={() => handleCountrySelect('miami')}
          >
            <div className="flag-container">
              <img 
                src="https://flagcdn.com/w320/us.png" 
                alt="USA Flag" 
                className="flag-image"
              />
            </div>
            <div className="country-info">
              <h3 className="country-name">Miami, USA</h3>
              <p className="country-description">Servicios en inglés</p>
              <p className="country-description-en">Services in English</p>
              <div className="country-details">
                <span className="location">📍 Miami, Florida</span>
                <span className="language">🇺🇸 English</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <p className="text-white-50 small mb-1">
            Selecciona tu ubicación para acceder a servicios personalizados
          </p>
          <p className="text-white-50 small">
            Select your location to access personalized services
          </p>
        </div>
      </div>
    </div>
  );
};

export default CountrySelector; 