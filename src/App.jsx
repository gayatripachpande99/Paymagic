import "./App.css";

function App() {
  return (
    <div className="website">


      {/* Hero Section */}
      <section className="hero" id="home"></section>


      {/* About Section */}
      <section className="section" id="about">

        <div className="section-content">

          <p className="section-label">
            ABOUT PAYMAGIC
          </p>

          <h2>
            Engineering the
            <span> Future of Finance.</span>
          </h2>

          <p>
            PayMagic PVT LTD is focused on delivering reliable,
            transparent and technology-driven financial solutions.
            Our goal is to make financial services simpler,
            smarter and more accessible.
          </p>

        </div>

      </section>


      {/* Services */}
      <section className="services" id="services">

        <p className="section-label">
          OUR SERVICES
        </p>

        <h2>
          Financial Solutions
        </h2>

        <div className="service-grid">

          <div className="service-card">
            <div className="service-icon">₹</div>
            <h3>Financial Solutions</h3>
            <p>
              Simple and reliable solutions designed around
              your financial needs.
            </p>
          </div>


          <div className="service-card">
            <div className="service-icon">↗</div>
            <h3>Growth</h3>
            <p>
              Helping customers and businesses move towards
              sustainable financial growth.
            </p>
          </div>


          <div className="service-card">
            <div className="service-icon">✓</div>
            <h3>Trusted Service</h3>
            <p>
              Transparent processes with a strong focus on
              customer trust and reliability.
            </p>
          </div>

        </div>

      </section>


      {/* CTA */}
      <section className="cta">

        <h2>
          Ready to move forward?
        </h2>

        <p>
          Discover smarter financial possibilities with PayMagic.
        </p>

        <button className="primary-btn">
          Contact Us
        </button>

      </section>


      {/* Footer */}
      <footer>

        <div>
          <strong>PayMagic PVT LTD</strong>
          <p>Finance Made Simple</p>
        </div>

        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>

        <p className="copyright">
          © 2026 PayMagic PVT LTD. All rights reserved by OIT_Stack.
        </p>

      </footer>

    </div>
  );
}

export default App;