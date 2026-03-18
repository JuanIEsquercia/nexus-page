import { useThemeContext } from '../context/ThemeContext';
import logoLight from '../assets/nexus-logo-light.png';
import logoDark from '../assets/nexus-logo.png';

const NexusLogo = ({ height = "40", className = "", style = {} }) => {
  const { theme } = useThemeContext();
  const logoSrc = theme === 'light' ? logoLight : logoDark;

  return (
    <img
      src={logoSrc}
      alt="Nexus Vending"
      height={height}
      className={`d-inline-block align-top ${className}`}
      style={{ transition: 'opacity 0.3s ease', maxWidth: '100%', width: 'auto', ...style }}
    />
  );
};

export default NexusLogo; 