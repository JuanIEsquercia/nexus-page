import { BsSun, BsMoon } from 'react-icons/bs';
import { useThemeContext } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
    >
      {theme === 'light' ? <BsMoon size={24} /> : <BsSun size={24} />}
    </button>
  );
};

export default ThemeToggle; 