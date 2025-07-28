import { 
  BsCupHot, 
  BsPersonCheck, 
  BsShieldCheck, 
  BsGearWideConnected,
  BsFileText,
  BsDroplet
} from 'react-icons/bs';
import { openWhatsApp } from '../../utils/contactUtils';

const MiamiCoffeeSection = () => {
  // Coffee beverages
  const beverages = [
    { name: "Americano", icon: "☕" },
    { name: "Espresso", icon: "☕" },
    { name: "Cappuccino", icon: "🥛" },
    { name: "Latte", icon: "🥛" },
    { name: "Hot Chocolate", icon: "🍫" },
    { name: "Cortado", icon: "☕" },
    { name: "Milk", icon: "🥛" },
    { name: "Custom Drinks", icon: "🌟" }
  ];

  const coffeeServices = [
    {
      icon: <BsGearWideConnected className="text-primary" size={32} />,
      title: "Full Service Management",
      description: "We handle restocking, maintenance, and machine monitoring"
    },
    {
      icon: <BsShieldCheck className="text-success" size={32} />,
      title: "Revenue Sharing",
      description: "Earn passive income from every coffee sold"
    },
    {
      icon: <BsPersonCheck className="text-info" size={32} />,
      title: "Multiple Payment Options",
      description: "Cash, credit cards, and mobile payments accepted"
    }
  ];

  const cardStyle = {
    minHeight: '500px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  };

  const cardBodyStyle = {
    display: 'flex',
    flexDirection: 'column',
    flex: '1'
  };

  return (
    <section id="coffee" className="py-5 bg-theme-primary">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-theme-primary">Two Business Models</h2>
          <p className="lead text-theme-secondary">
            Choose the perfect coffee solution for your needs: employee benefits or revenue generation.
          </p>
        </div>

        {/* Business Models */}
        <div className="row g-4">
          {/* Model 1: Corporate Employee Benefits */}
          <div className="col-lg-6">
            <div className="card card-theme shadow-theme" style={cardStyle}>
              <div className="card-body p-4" style={cardBodyStyle}>
                <div className="text-center mb-4">
                  <h3 className="text-theme-primary mb-3">🏢 Corporate Employee Benefits</h3>
                  <p className="text-theme-secondary">
                    <strong>Employee coffee program</strong> - Companies provide coffee benefits to their workforce
                  </p>
                </div>
                
                <div className="d-flex flex-column gap-3" style={{ flex: '1' }}>
                  <div className="d-flex align-items-start">
                    <div className="me-3 mt-1 flex-shrink-0">
                      <BsPersonCheck className="text-primary" size={24} />
                    </div>
                    <div>
                      <h6 className="text-theme-primary mb-1">User System with PINs</h6>
                      <p className="text-theme-secondary mb-0 small">Each employee gets personal access with company credit</p>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-start">
                    <div className="me-3 mt-1 flex-shrink-0">
                      <BsShieldCheck className="text-success" size={24} />
                    </div>
                    <div>
                      <h6 className="text-theme-primary mb-1">Company Pays</h6>
                      <p className="text-theme-secondary mb-0 small">Business covers the cost and provides the benefit</p>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-start">
                    <div className="me-3 mt-1 flex-shrink-0">
                      <BsGearWideConnected className="text-info" size={24} />
                    </div>
                    <div>
                      <h6 className="text-theme-primary mb-1">Full Service Included</h6>
                      <p className="text-theme-secondary mb-0 small">Restocking, maintenance, and user management</p>
                    </div>
                  </div>
                </div>
                
                <hr className="border-theme my-4" />
                <div className="bg-theme-accent rounded p-3">
                  <h6 className="text-theme-primary mb-2">
                    <BsFileText className="me-2" />
                    Perfect For
                  </h6>
                  <div className="row text-center">
                    <div className="col-6">
                      <h5 className="text-primary mb-1">🏢</h5>
                      <small className="text-theme-secondary">Offices</small>
                    </div>
                    <div className="col-6">
                      <h5 className="text-success mb-1">🏭</h5>
                      <small className="text-theme-secondary">Factories</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Model 2: Commercial Vending */}
          <div className="col-lg-6">
            <div className="card card-theme shadow-theme" style={cardStyle}>
              <div className="card-body p-4" style={cardBodyStyle}>
                <div className="text-center mb-4">
                  <h3 className="text-theme-primary mb-3">🏪 Commercial Vending</h3>
                  <p className="text-theme-secondary">
                    <strong>Revenue generation</strong> - Turn your space into a coffee profit center
                  </p>
                </div>
                
                <div className="d-flex flex-column gap-3" style={{ flex: '1' }}>
                  <div className="d-flex align-items-start">
                    <div className="me-3 mt-1 flex-shrink-0">
                      <BsGearWideConnected className="text-primary" size={24} />
                    </div>
                    <div>
                      <h6 className="text-theme-primary mb-1">Direct Sales to Public</h6>
                      <p className="text-theme-secondary mb-0 small">Customers pay directly for coffee and beverages</p>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-start">
                    <div className="me-3 mt-1 flex-shrink-0">
                      <BsShieldCheck className="text-success" size={24} />
                    </div>
                    <div>
                      <h6 className="text-theme-primary mb-1">Revenue Sharing</h6>
                      <p className="text-theme-secondary mb-0 small">Earn passive income from every sale</p>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-start">
                    <div className="me-3 mt-1 flex-shrink-0">
                      <BsPersonCheck className="text-info" size={24} />
                    </div>
                    <div>
                      <h6 className="text-theme-primary mb-1">Multiple Payment Options</h6>
                      <p className="text-theme-secondary mb-0 small">Cash, credit cards, and mobile payments</p>
                    </div>
                  </div>
                </div>
                
                <hr className="border-theme my-4" />
                <div className="bg-theme-accent rounded p-3">
                  <h6 className="text-theme-primary mb-2">
                    <BsFileText className="me-2" />
                    Perfect For
                  </h6>
                  <div className="row text-center">
                    <div className="col-6">
                      <h5 className="text-primary mb-1">🛍️</h5>
                      <small className="text-theme-secondary">Malls</small>
                    </div>
                    <div className="col-6">
                      <h5 className="text-success mb-1">✈️</h5>
                      <small className="text-theme-secondary">Airports</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-5">
          <div className="card card-theme shadow-theme-lg">
            <div className="card-body p-5">
              <h3 className="text-theme-primary mb-4">
                Ready to implement your coffee solution?
              </h3>
              <p className="text-theme-secondary mb-4">
                Get a free consultation for employee benefits or revenue generation. No commitment required.
              </p>
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => openWhatsApp('Hello! I am interested in coffee vending services for my company in Miami.')}
              >
                <BsDroplet className="me-2" />
                Request Free Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiamiCoffeeSection; 