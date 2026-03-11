// Usamos import.meta.glob de Vite para importar de forma dinámica cualquier imagen o video 
// que esté en la carpeta src/assets/carousel.
const mediaContext = import.meta.glob('../assets/carousel/*.{png,jpg,jpeg,webp,gif,mp4,webm}', { eager: true });
const dynamicMedia = Object.values(mediaContext).map((module, index) => {
  const url = module.default || module;
  const isVideo = url.match(/\.(mp4|webm)$/i);
  return {
    id: index + 1,
    url: url,
    isVideo: isVideo,
  };
});

// Si aún no hay medios cargados en src/assets/carousel, mostramos un placeholder por defecto
const mediaToRender = dynamicMedia.length > 0 ? dynamicMedia : [
  { id: 1, url: 'https://placehold.co/1200x500/0f172a/0ea5e9?text=Cargar+imágenes+o+videos+en+src/assets/carousel', isVideo: false }
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
                  {mediaToRender.map((media, index) => (
                    <div 
                      key={media.id} 
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
                          backgroundImage: media.isVideo ? 'none' : `url(${media.url})`,
                          backgroundColor: media.isVideo ? '#000' : 'transparent', // Fondo negro puro para video si no cubre todo
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: media.isVideo ? 'none' : 'blur(20px) brightness(0.6)',
                          transform: media.isVideo ? 'none' : 'scale(1.1)',
                          zIndex: 0
                        }}
                      />
                      {media.isVideo ? (
                        <video 
                          src={media.url}
                          className="d-block w-100 h-100"
                          autoPlay 
                          loop 
                          muted 
                          playsInline
                          style={{
                            objectFit: 'contain',
                            position: 'relative',
                            zIndex: 1,
                            padding: '1rem' // Espacio de respiro
                          }}
                        />
                      ) : (
                        <img 
                          src={media.url} 
                          className="d-block w-100 h-100" 
                          alt="Solución Vending Nexus"
                          style={{
                            objectFit: 'contain',
                            position: 'relative',
                            zIndex: 1,
                            padding: '1rem' // Espacio de respiro
                          }}
                        />
                      )}
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
