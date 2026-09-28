'use client';

import { useState } from 'react';
import { buildFaqData } from './faq.data';
import './faq.css';

export default function FaqRoom() {
  const faqs = buildFaqData();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="faq-root">
      <h3 className="faq-head">
        Frequently Asked Questions
      </h3>

      <div className="faq-list">
        {faqs.map((f, i) => (
          <div
            key={i}
            className={`faq-item ${open === i ? 'open' : ''}`}
          >
            <button
              type="button"
              className="faq-q"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="faq-q-text">{f.q}</span>

              <span className="faq-icon" aria-hidden="true">
                {open === i ? '×' : '+'}
              </span>
            </button>

            <div className="faq-a-wrap">
              <div className="faq-a">
                {f.a}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
