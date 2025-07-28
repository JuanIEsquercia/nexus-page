import { ThemeProvider } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import MiamiNavbar from '../components/miami/MiamiNavbar';
import MiamiHeroSection from '../components/miami/MiamiHeroSection';
import MiamiAboutSection from '../components/miami/MiamiAboutSection';
import MiamiCoffeeSection from '../components/miami/MiamiCoffeeSection';
import MiamiContactSection from '../components/miami/MiamiContactSection';

const MiamiPage = () => {
  return (
    <ThemeProvider>
      <div className="min-vh-100">
        <ThemeToggle />
        <MiamiNavbar />
        <MiamiHeroSection />
        <MiamiAboutSection />
        <MiamiCoffeeSection />
        <MiamiContactSection />
      </div>
    </ThemeProvider>
  );
};

export default MiamiPage; 