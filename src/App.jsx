import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './components/ThemeToggle'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import ServicesSection from './components/ServicesSection'
import VendingTypesSection from './components/VendingTypesSection'
import ServiceModesSection from './components/ServiceModesSection'
import ContactSection from './components/ContactSection'
import CountrySelector from './components/CountrySelector'
import MiamiPage from './pages/MiamiPage'

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    // Verificar si ya hay una selección guardada
    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry) {
      setSelectedCountry(savedCountry);
    }
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
  };

  // Si no hay país seleccionado, mostrar el selector
  if (!selectedCountry) {
    return (
      <ThemeProvider>
        <CountrySelector onCountrySelect={handleCountrySelect} />
      </ThemeProvider>
    );
  }

  // Si el país seleccionado es Argentina, mostrar la página actual
  if (selectedCountry === 'argentina') {
    return (
      <ThemeProvider>
        <div className="min-vh-100">
          <ThemeToggle />
          <Navbar />
          <HeroSection />
          <AboutSection />
          <ServicesSection />
          <VendingTypesSection />
          <ServiceModesSection />
          <ContactSection />
        </div>
      </ThemeProvider>
    );
  }

  // Si el país seleccionado es Miami, mostrar página en inglés
  if (selectedCountry === 'miami') {
    return <MiamiPage />;
  }

  return null;
}

export default App
