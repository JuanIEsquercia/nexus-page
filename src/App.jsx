import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './components/ThemeToggle'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import ServicesSection from './components/ServicesSection'
import VendingTypesSection from './components/VendingTypesSection'
import ServiceModesSection from './components/ServiceModesSection'
import FAQSection from './components/FAQSection'
import ImageCarousel from './components/ImageCarousel'
import ContactSection from './components/ContactSection'
function App() {
  return (
    <ThemeProvider>
      <div className="min-vh-100">
        <ThemeToggle />
        <Navbar />
        <HeroSection />
        <AboutSection />
        <ImageCarousel />
        <ServicesSection />
        <VendingTypesSection />
        <ServiceModesSection />
        <FAQSection />
        <ContactSection />
      </div>
    </ThemeProvider>
  );
}

export default App
