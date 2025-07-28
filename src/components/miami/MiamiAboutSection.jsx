import { BsShieldCheck, BsGearWideConnected, BsAward } from 'react-icons/bs';
import aboutUsImage from '../../assets/aboutUs.jpeg';

const MiamiAboutSection = () => {
  const features = [
    {
      icon: <BsShieldCheck className="text-success" size={48} />,
      title: "High-Traffic Ready",
      description: "Designed for busy locations with fast service and reliable operation."
    },
    {
      icon: <BsGearWideConnected className="text-primary" size={48} />,
      title: "Smart Payment",
      description: "Accept cash, cards, and mobile payments for maximum convenience."
    },
    {
      icon: <BsAward className="text-warning" size={48} />,
      title: "Revenue Generator",
      description: "Turn your space into a profit center with our coffee vending solutions."
    }
  ];

  return (
    <section id="about" className="py-5 bg-theme-secondary">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="about-content">
              <h2 className="display-5 fw-bold text-theme-primary mb-4">
                About Nexus Vending Miami
              </h2>
              <p className="lead text-theme-secondary mb-4">
                We are a leading provider of high-traffic coffee vending solutions in the Miami area. 
                Our mission is to provide quick, quality coffee access in busy locations where people need it most.
              </p>
              <p className="text-theme-secondary mb-4">
                With years of experience in the vending industry, we understand the unique needs of 
                high-traffic locations. We offer reliable, fast-service coffee solutions that generate 
                revenue while providing convenience to your visitors and customers.
              </p>
              <div className="row g-4 mt-4">
                {features.map((feature, index) => (
                  <div key={index} className="col-md-6">
                    <div className="text-center">
                      <div className="mb-3">{feature.icon}</div>
                      <h5 className="text-theme-primary mb-2">{feature.title}</h5>
                      <p className="text-theme-secondary small">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="about-image text-center">
              <img 
                src={aboutUsImage}
                alt="Coffee Vending Machine in Context" 
                className="img-fluid rounded shadow-theme-lg"
                style={{ maxHeight: '500px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiamiAboutSection; 