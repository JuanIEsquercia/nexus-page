import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './components/ThemeToggle'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import ServicesSection from './components/ServicesSection'
import VendingTypesSection from './components/VendingTypesSection'
import ServiceModesSection from './components/ServiceModesSection'
import WhyChooseUsSection from './components/WhyChooseUsSection'
import ContactSection from './components/ContactSection'

function App() {
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
        <WhyChooseUsSection />
        <ContactSection />
      </div>
    </ThemeProvider>
  )
}

export default App
