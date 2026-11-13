import React from "react";

export default function FaqPage({ faqsList = [], openFaq, toggleFaq }) {
  return (
    <section className="faqs-section" id="faqs">
      <div className="faqs-inner">
        <div className="services-header">
          <h2>Got Questions? <span className="gradient-text">We Have Answers.</span></h2>
        </div>

        <div className="faq-accordion">
          {faqsList.map((faq, index) => (
            <div
              className={`faq-item ${openFaq === index ? "faq-open" : ""}`}
              key={faq.q}
              onClick={() => toggleFaq(index)}
            >
              <div className="faq-question">
                <h3>{faq.q}</h3>
                <span className="faq-toggle">{openFaq === index ? "−" : "+"}</span>
              </div>
              {openFaq === index && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
