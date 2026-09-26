import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Check, Cpu, HeartHandshake, ShieldCheck, Wrench } from 'lucide-react';

const VALUES = [
  {
    icon: <HeartHandshake size={21} />,
    title: 'Built around your needs',
    description: 'Whether this is your first build or your next upgrade, find components for the way you use your PC.',
  },
  {
    icon: <ShieldCheck size={21} />,
    title: 'Compatibility matters',
    description: 'The PC Builder helps you check the fit between key components before you settle on a build.',
  },
  {
    icon: <Bot size={21} />,
    title: 'Help when you need it',
    description: 'Use the AI assistant to explore hardware questions and make more informed choices.',
  },
];

export default function AboutUs() {
  return (
    <div className="about-page">
      <section className="about-intro" aria-labelledby="about-title">
        <div className="about-intro-copy">
          <p className="about-eyebrow"><Cpu size={16} /> COMPUTER HARDWARE, MADE CLEARER</p>
          <h1 id="about-title">A better way to build your next PC.</h1>
          <p className="about-lead">
            Choosing parts should feel exciting, not overwhelming. We bring hardware discovery,
            build planning, and practical guidance together in one place.
          </p>
          <Link to="/products" className="btn-primary about-shop-link">
            Explore components <ArrowRight size={18} />
          </Link>
        </div>
        <figure className="about-intro-image">
          <img
            src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=85"
            alt="PC components arranged for a custom computer build"
          />
          <figcaption><span /> Thoughtful choices. Confident builds.</figcaption>
        </figure>
      </section>

      <section className="about-story" aria-labelledby="about-story-title">
        <div className="about-section-label"><span>01</span> OUR APPROACH</div>
        <div className="about-story-copy">
          <h2 id="about-story-title">Hardware shopping should work for people, not just specs.</h2>
          <p>
            Computer Hardware is an e-commerce project built for people who want to choose PC
            components with more confidence. Instead of leaving you to piece everything together
            across separate tools, the experience brings product browsing and build planning into
            one straightforward place.
          </p>
          <p>
            Compare the parts that matter, check a build as it comes together, and get a little
            guidance along the way. You stay in control of every choice; the tools are here to make
            those choices easier to understand.
          </p>
        </div>
      </section>

      <section className="about-values" aria-labelledby="about-values-title">
        <div className="about-values-heading">
          <div className="about-section-label"><span>02</span> WHAT GUIDES US</div>
          <h2 id="about-values-title">Useful tools. Clear choices.</h2>
        </div>
        <div className="about-values-list">
          {VALUES.map((value, index) => (
            <article className="about-value" key={value.title}>
              <div className="about-value-number">0{index + 1}</div>
              <div className="about-value-icon">{value.icon}</div>
              <div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
              <Check className="about-value-check" size={18} aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="about-builder" aria-labelledby="about-builder-title">
        <div className="about-builder-icon"><Wrench size={23} /></div>
        <div>
          <p className="about-eyebrow">READY WHEN YOU ARE</p>
          <h2 id="about-builder-title">Start with the build you have in mind.</h2>
          <p>Browse components or open the PC Builder to start planning your setup.</p>
        </div>
        <div className="about-builder-actions">
          <Link to="/builder" className="btn-primary">Open PC Builder <ArrowRight size={18} /></Link>
          <Link to="/products" className="about-text-link">Browse products</Link>
        </div>
      </section>
    </div>
  );
}
