import NexusLogo from './NexusLogo';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-theme">
      <div className="container">
        <a className="navbar-brand" href="#">
          <NexusLogo height="40" />
        </a>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="#inicio">Inicio</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#quienes-somos">¿Quiénes Somos?</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#servicios">Servicios</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#expendedoras">Tipo de Expendedoras</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#modalidades">Modalidades</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#contacto">Contacto</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 