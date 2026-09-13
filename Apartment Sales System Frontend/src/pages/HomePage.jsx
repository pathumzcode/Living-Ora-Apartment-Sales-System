import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Heart, MapPin, Search, Star
} from 'lucide-react';

export const HomePage = ({ setActivePage, setSelectedApartment }) => {
  const { apartments, promotions } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [listingMode, setListingMode] = useState('Buy');
  const [openFaq, setOpenFaq] = useState(0);
  const [favorites, setFavorites] = useState([]);

  const featuredApartments = useMemo(() => (apartments || []).filter((apt) => {
    const search = searchQuery.toLowerCase();
    return `${apt?.name || ''} ${apt?.location || ''}`.toLowerCase().includes(search);
  }), [apartments, searchQuery]);

  const handleSelectApartment = (apt) => {
    setSelectedApartment(apt);
    setActivePage('apartment-detail');
  };

  const toggleFavorite = (id) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const propertyCards = featuredApartments.slice(0, 3);
  const heroImage = propertyCards[0]?.images || '/images/luxury-villa-hero.jpg';
  const interiorImage = propertyCards[1]?.images || '/images/luxury-interior-lounge.jpg';
  const footerImage = propertyCards[2]?.images || '/images/luxury-waterfront-residence.jpg';

  const formatLocation = (location = '') => location.split(',').slice(-2).join(',').trim();

  const faqs = [
    ['How does our platform work?', 'Our platform connects buyers with verified Living-Ora apartment developments through transparent listings, unit details, and secure reservation workflows.'],
    ['Is it free to use your platform?', 'Browsing developments and comparing available units is completely free. Any booking fees are shown clearly before you confirm.'],
    ['How can I find a property to buy or sell?', 'Search by location or development above, then open any listing to view available units, pricing, amenities, and the next step to reserve.'],
    ['What information is included in property listings?', 'Each listing includes location, images, development details, facilities, availability, price range, and a link to explore individual units.'],
    ['How can I find a rental property?', 'Switch the search mode to Rent and contact our team through your preferred development to discuss current rental availability.'],
  ];

  return (
    <div className="home-modern animate-fade-in">

      {/* ── Trust Bar ─────────────────────────────────────────── */}
      <div className="home-trust-bar">
        <div className="home-container">
          <span>Living-Ora residences</span>
          <span>Verified availability</span>
          <span>Flexible reservation support</span>
          <button onClick={() => setActivePage('units')}>Browse live units <ArrowRight size={13} /></button>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="home-hero">
        <div className="home-container">
          <div className="home-kicker"><span /> Buy Property</div>
          <h1>We Bring <em>New Experience</em><br />of Your <u>Dream</u> Property</h1>
          <p className="home-lede">Helping you find your dream home, one property at a time. Your satisfaction is our priority.</p>

          <div className="home-hero-image">
            <img src={heroImage} alt={propertyCards[0]?.name || 'Living-Ora residence'} />
            <div className="home-image-shade" />
            <span className="image-tag tag-one"><i /> Balcony 2nd Floor</span>
            <span className="image-tag tag-two"><i /> Sunset view</span>
            <span className="image-tag tag-three"><i /> Swimming pool</span>
            <div className="hero-actions">
              <button onClick={() => setActivePage('apartments')}>Sell Property</button>
              <button onClick={() => setListingMode('Rent')}>Rent Property</button>
            </div>
          </div>

          {/* Search Panel */}
          <div className="home-search-panel">
            <div className="search-panel-top">
              <div className="mode-toggle">
                {['Rent', 'Buy'].map((mode) => (
                  <button key={mode} className={listingMode === mode ? 'active' : ''} onClick={() => setListingMode(mode)}>{mode}</button>
                ))}
              </div>
              <div className="review-score">
                <span className="review-avatars"><b>LO</b><b>RA</b><b>+</b></span>
                <span><strong><Star size={12} fill="currentColor" /> 4.9</strong> (10k+ Reviews)</span>
              </div>
            </div>
            <div className="search-fields">
              <label>
                <small>Location</small>
                <select>
                  <option>Sri Lanka, Colombo</option>
                  <option>Colombo 03</option>
                  <option>Colombo 07</option>
                  <option>Mount Lavinia</option>
                </select>
              </label>
              <label>
                <small>Type</small>
                <select>
                  <option>Apartment</option>
                  <option>Penthouse Suite</option>
                  <option>Family Residence</option>
                  <option>Waterfront Villa</option>
                </select>
              </label>
              <label>
                <small>Style</small>
                <select>
                  <option>Industrial Luxury</option>
                  <option>Modern Minimalist</option>
                  <option>Coastal Living</option>
                </select>
              </label>
              <label className="price-field">
                <small>Search property</small>
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Name or location" />
              </label>
              <button className="search-button" onClick={() => setActivePage('apartments')} aria-label="Search properties">
                <Search size={16} /> Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────── */}
      <section className="home-container home-about">
        <span className="eyebrow">About</span>
        <p>
          We're your trusted partner in real estate. With <b>10 years of experience</b> in Sri Lanka, our <b>team of experts</b> is dedicated to providing personalized service and achieving the best possible results. From finding your dream home to selling your property at the right price, we're here to guide you every step of the way.
        </p>
      </section>

      {/* ── Interior Showcase ─────────────────────────────────── */}
      <section className="home-container interior-showcase">
        <div className="interior-image">
          <img src={interiorImage} alt={propertyCards[1]?.name || 'Living-Ora interior'} />
          <span className="image-tag interior-tag"><i /> Ocean-facing lounge</span>
          <div className="featured-card">
            <strong>{propertyCards[0]?.name || 'Living-Ora Heights'}</strong>
            <span><MapPin size={13} /> {formatLocation(propertyCards[0]?.location || 'Colombo 03')}</span>
            <p>{propertyCards[0]?.about || 'A considered home for modern coastal living.'}</p>
            <div>
              <span className="carousel-dots"><b /><i /><i /></span>
              <b>{propertyCards[0]?.priceRange || '$220,000 – $850,000'}</b>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow ──────────────────────────────────────────── */}
      <section className="home-container workflow">
        <div className="workflow-copy">
          <span className="eyebrow">How It Works</span>
          <h2>How It works?</h2>
          {[
            ['01', 'Verify', 'Provide necessary documentation to verify your identity and ensure a secure transaction.'],
            ['02', 'Search property', 'Use our search tools to filter properties based on location, price, size, and other criteria.'],
            ['03', 'Get The Deals', 'Once you have found your ideal home, submit an offer through our platform.'],
          ].map(([number, title, body], index) => (
            <div className={`step${index === 0 ? ' current' : ''}`} key={number}>
              <small>{number}</small>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>

        <div className="mini-search">
          <div className="mini-top">
            <b>Listings Search</b>
            <span>Living-Ora Client <b>●</b></span>
          </div>
          <div className="mini-filters">
            <span>Style<br /><b>All residences</b></span>
            <span>Price<br /><b>Price range</b></span>
            <button onClick={() => setActivePage('apartments')}>Search <ArrowRight size={12} /></button>
          </div>
          <div className="mini-listings">
            {propertyCards.slice(0, 2).map((apt) => (
              <button key={apt.apartmentId} onClick={() => handleSelectApartment(apt)}>
                <img src={apt.images} alt={apt.name} />
                <b>{apt.name}</b>
                <small>{formatLocation(apt.location)}</small>
                <strong>{apt.priceRange}</strong>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Explore Latest ────────────────────────────────────── */}
      <section className="home-container property-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Explore</span>
            <h2>Explore our latest property</h2>
          </div>
          <button onClick={() => setActivePage('apartments')}>View all <ArrowRight size={15} /></button>
        </div>

        <div className="property-grid">
          <div className="opportunity-card">
            <h3>Fresh Opportunities</h3>
            <p>Stay ahead of the curve with our latest property listings. Explore our newest additions and find your perfect match.</p>
            <button onClick={() => setActivePage('apartments')}>Search more <ArrowRight size={14} /></button>
          </div>
          {propertyCards.map((apt) => (
            <article className="property-card" key={apt.apartmentId} onClick={() => handleSelectApartment(apt)}>
              <div className="property-photo">
                <img src={apt.images} alt={apt.name} />
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(apt.apartmentId); }}
                  aria-label={`Save ${apt.name}`}
                >
                  <Heart size={15} fill={favorites.includes(apt.apartmentId) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <h3>{apt.name}</h3>
              <p>{formatLocation(apt.location)}</p>
              <strong>{apt.priceRange}</strong>
            </article>
          ))}
        </div>
      </section>

      {/* ── Top Picks Rent ────────────────────────────────────── */}
      <section className="home-container property-section popular-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Popular</span>
            <h2>Top Picks Rent Property</h2>
          </div>
          <div className="circle-arrows">
            <button className="btn-circle" aria-label="Previous"><ArrowLeft size={15} /></button>
            <button className="btn-circle" aria-label="Next"><ArrowRight size={15} /></button>
          </div>
        </div>
        <div className="rental-grid">
          {propertyCards.map((apt, index) => (
            <article className="rental-card" key={apt.apartmentId}>
              <img src={apt.images} alt={apt.name} />
              <div>
                <h3>{apt.name}</h3>
                <p>{formatLocation(apt.location)}</p>
                <strong>{index === 0 ? '$40,000 / yr' : apt.priceRange}</strong>
              </div>
            </article>
          ))}
          <div className="rental-note">
            <b>Happy Lagoon Farm</b>
            <p>Discover a tranquil oasis nestled amidst lush greenery. A charming retreat for those seeking peace and tranquility.</p>
            <strong>$37,500.00</strong>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="home-container faq-section">
        <div className="center-heading">
          <span className="eyebrow">FAQ</span>
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => (
            <div className={`faq-item${openFaq === index ? ' open' : ''}`} key={question}>
              <button onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                <span><small>0{index + 1}</small>{question}</span>
                {openFaq === index ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {openFaq === index && <p>{answer}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────── */}
      <section className="home-container contact-section">
        <div className="contact-copy">
          <span className="eyebrow">Contact</span>
          <h2>Still not sure where to start? Contact us and fill out the form.</h2>
          <p>Tell us what you need and our property team will help you find the right place.</p>
          <div className="contact-rating">
            <span>LO</span>
            <span>RA</span>
            <b><Star size={12} fill="currentColor" /> 4.9 <small>(10k Reviews)</small></b>
          </div>
        </div>
        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
          <label>Full Name<input placeholder="Full name here..." required /></label>
          <label>Email<input type="email" placeholder="Your email here..." required /></label>
          <label>Message<textarea placeholder="How we can help you?" rows="4" /></label>
          <button type="submit">Send <ArrowRight size={14} /></button>
        </form>
      </section>

      {/* ── Footer Visual ─────────────────────────────────────── */}
      <div className="home-container" style={{ paddingBottom: '3rem' }}>
        <div className="footer-visual">
          <img src={footerImage} alt="Living-Ora architecture" />
          <div className="footer-watermark">Living Ora</div>
          <span className="image-tag footer-tag-one"><i /> Contact Us</span>
          <span className="image-tag footer-tag-two"><i /> Rent Property</span>
        </div>
      </div>

    </div>
  );
};
