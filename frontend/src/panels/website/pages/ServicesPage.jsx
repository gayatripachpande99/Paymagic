import React from "react";

export default function ServicesPage({ servicesList = [] }) {
  return (
    <section className="services" id="services">
      <div className="services-inner">
        <div className="services-header">
          <h2>Everything You Need to <span className="gradient-text">Manage Money</span></h2>
        </div>
        <div className="service-grid">
          {servicesList.map((s) => (
            <div className="service-card" key={s.title}>
              <div className="service-tag">{s.tag}</div>
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <div className="card-learn">Explore &rarr;</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
