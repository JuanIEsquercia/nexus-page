// Usamos import.meta.glob de Vite para importar de forma dinámica cualquier imagen (jpg, jpeg, png, webp) 
// que esté en la carpeta src/assets/carousel. Esto evita la necesidad de configurar formatos manualmente.
const imagesContext = import.meta.glob('../assets/carousel/*.{png,jpg,jpeg,webp,gif}', { eager: true });
const dynamicImages = Object.values(imagesContext).map((module, index) => ({
  id: index + 1,
  url: module.default || module,
}));

// Si aún no hay imágenes cargadas en src/assets/carousel, mostramos un placeholder por defecto
const imagesToRender = dynamicImages.length > 0 ? dynamicImages : [
  { id: 1, url: 'https://placehold.co/1200x500/0f172a/0ea5e9?text=Cargar+imágenes+en+src/assets/carousel' }
];

const ImageCarousel = () => {
  return (
    <section className="py-5 bg-theme-secondary">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-gradient mb-3">Nuestras Soluciones en Acción</h2>
          <p className="lead text-theme-secondary">
            Equipos de última generación instalados en corporaciones y grandes superficies
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="glass-panel rounded-4 overflow-hidden shadow-theme-lg animate-fade-in-up">
              <div id="nexusCarousel" className="carousel slide carousel-fade" data-bs-ride="carousel">
                <div className="carousel-inner">
                  {imagesToRender.map((image, index) => (
                    <div 
                      key={image.id} 
                      className={`carousel-item ${index === 0 ? 'active' : ''}`}
                      style={{ height: '500px' }}
                    >
                      <div 
                        className="carousel-item-background" 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundImage: `url(${image.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: 'blur(20px) brightness(0.6)',
                          transform: 'scale(1.1)',
                          zIndex: 0
                        }}
                      />
                      <img 
                        src={image.url} 
                        className="d-block w-100 h-100" 
                        alt="Imagen de Vending Nexus"
                        style={{
                          objectFit: 'contain',
                          position: 'relative',
                          zIndex: 1,
                          padding: '1rem' // Espacio de respiro
                        }}
                      />
                    </div>
                  ))}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#nexusCarousel" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#nexusCarousel" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            </div>
            
            <div className="text-center mt-4">
               <small className="text-theme-secondary">
                  <em>* Las imágenes mostradas incluyen tanto nuestras máquinas automáticas de café como las expendedoras de acompañamiento.</em>
               </small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageCarousel;
