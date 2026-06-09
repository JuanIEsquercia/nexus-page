const products = [
  { name: 'Nescafé Tradición', image: '/images/brands/nescafe.png' },
  { name: 'Nestlé Cacao con Leche', image: '/images/brands/nestle.png' },
  // Agregá más productos: { name: 'Nombre', image: '/images/brands/archivo.png' }
];

const BrandsSection = () => {
  return (
    <section className="py-5 bg-theme-secondary">
      <div className="container">
        <div className="text-center mb-5">
          <span
            className="badge bg-theme-accent text-primary mb-3 px-3 py-2 border border-theme rounded-pill"
            style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}
          >
            Calidad garantizada
          </span>
          <h2 className="fw-bold text-theme-primary mb-2" style={{ fontSize: '1.75rem' }}>
            Trabajamos con productos de primera calidad
          </h2>
          <p className="text-theme-secondary mb-0" style={{ maxWidth: '520px', margin: '0 auto' }}>
            Seleccionamos insumos de marcas líderes para que cada bebida sea una experiencia.
          </p>
        </div>

        <div className="d-flex flex-wrap justify-content-center gap-4">
          {products.map((product) => (
            <div
              key={product.name}
              className="card-glass rounded-4 overflow-hidden"
              style={{
                width: '220px',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.18)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div
                style={{
                  height: '220px',
                  overflow: 'hidden',
                  background: 'rgba(0,0,0,0.04)',
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    display: 'block',
                  }}
                />
              </div>
              <div className="px-3 py-3 text-center">
                <span className="fw-semibold text-theme-primary" style={{ fontSize: '0.9rem' }}>
                  {product.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
