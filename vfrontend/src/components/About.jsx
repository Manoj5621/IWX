// About.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './About.css';

const About = () => {
  const [activeTab, setActiveTab] = useState('story');

  const teamMembers = [
    {
      name: "Elena Rodriguez",
      role: "Creative Director",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      bio: "With over 15 years in fashion design, Elena brings visionary creativity to the IWX brand."
    },
    {
      name: "Marcus Chen",
      role: "Head of Innovation",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      bio: "Marcus leads our sustainable materials research and technological integration."
    },
    {
      name: "Sophie Williams",
      role: "Production Director",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      bio: "Sophie ensures our ethical production standards are met across all facilities."
    },
    {
      name: "David Kim",
      role: "Retail Experience Director",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
      bio: "David creates seamless customer experiences across our physical and digital stores."
    }
  ];

  const values = [
    {
      title: "Sustainability",
      description: "We're committed to reducing our environmental impact through ethical sourcing and production methods.",
      icon: "🌱"
    },
    {
      title: "Innovation",
      description: "Pushing boundaries in design and technology to create the future of fashion.",
      icon: "💡"
    },
    {
      title: "Quality",
      description: "Every piece is crafted with precision and attention to detail that stands the test of time.",
      icon: "✳️"
    },
    {
      title: "Inclusivity",
      description: "Designing for all bodies, identities, and expressions without compromise.",
      icon: "🌍"
    }
  ];

  const milestones = [
    { year: "2005", event: "Founded as a small boutique design studio" },
    { year: "2010", event: "Launched first international collection" },
    { year: "2015", event: "Opened flagship stores in Paris and Tokyo" },
    { year: "2018", event: "Introduced sustainable materials across all lines" },
    { year: "2020", event: "Launched e-commerce platform serving 30+ countries" },
    { year: "2023", event: "Achieved carbon neutral certification" },
    { year: "2025", event: "Opened innovative design hub in Copenhagen" }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Our Story
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Designing Tomorrow, Today – Since 2005
          </motion.p>
        </div>
      </section>

      {/* Brand Intro */}
      <section className="brand-intro">
        <div className="container">
          <div className="brand-intro-content">
            <motion.div 
              className="brand-text"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2>InfiniteWaveX</h2>
              <h3>Shaping Dreams with Timeless Waves</h3>
              <p>
                Founded in 2005, IWX emerged from a simple vision: to create clothing that transcends 
                trends and becomes part of your life's story. Our designs blend innovative techniques 
                with timeless aesthetics, creating pieces that feel both contemporary and eternal.
              </p>
              <p>
                Today, we're a global community of designers, artisans, and visionaries committed to 
                redefining fashion through sustainable practices, inclusive design, and technological 
                innovation.
              </p>
            </motion.div>
            <motion.div 
              className="brand-image"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" alt="IWX Studio" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="about-tabs">
        <div className="container">
          <div className="tabs-header">
            <button 
              className={activeTab === 'story' ? 'tab-active' : ''}
              onClick={() => setActiveTab('story')}
            >
              Our Story
            </button>
            <button 
              className={activeTab === 'values' ? 'tab-active' : ''}
              onClick={() => setActiveTab('values')}
            >
              Our Values
            </button>
            <button 
              className={activeTab === 'team' ? 'tab-active' : ''}
              onClick={() => setActiveTab('team')}
            >
              Our Team
            </button>
            <button 
              className={activeTab === 'journey' ? 'tab-active' : ''}
              onClick={() => setActiveTab('journey')}
            >
              Our Journey
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'story' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="tab-panel"
              >
                <h3>Crafting the Future of Fashion</h3>
                <p>
                  IWX began as a small atelier in Milan with just three designers and a shared vision. 
                  Today, we've grown into an international fashion house without losing our commitment 
                  to artistry, innovation, and personal connection.
                </p>
                <p>
                  Our design philosophy centers on "timeless waves" – the idea that great design 
                  moves through time like waves, with each collection building on the last while 
                  introducing new innovations in form, function, and sustainability.
                </p>
                <div className="story-stats">
                  <div className="stat">
                    <h4>20</h4>
                    <p>Years of Excellence</p>
                  </div>
                  <div className="stat">
                    <h4>50+</h4>
                    <p>Countries Served</p>
                  </div>
                  <div className="stat">
                    <h4>200+</h4>
                    <p>Team Members</p>
                  </div>
                  <div className="stat">
                    <h4>100%</h4>
                    <p>Carbon Neutral</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'values' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="tab-panel"
              >
                <h3>Our Guiding Principles</h3>
                <div className="values-grid">
                  {values.map((value, index) => (
                    <motion.div 
                      key={index}
                      className="value-card"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="value-icon">{value.icon}</div>
                      <h4>{value.title}</h4>
                      <p>{value.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'team' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="tab-panel"
              >
                <h3>Meet Our Leadership</h3>
                <div className="team-grid">
                  {teamMembers.map((member, index) => (
                    <motion.div 
                      key={index}
                      className="team-card"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="team-image">
                        <img src={member.image} alt={member.name} />
                        <div className="team-overlay">
                          <p>{member.bio}</p>
                        </div>
                      </div>
                      <div className="team-info">
                        <h4>{member.name}</h4>
                        <p>{member.role}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'journey' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="tab-panel"
              >
                <h3>Our Journey Through Time</h3>
                <div className="timeline">
                  {milestones.map((milestone, index) => (
                    <motion.div 
                      key={index}
                      className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="timeline-content">
                        <h4>{milestone.year}</h4>
                        <p>{milestone.event}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="sustainability">
        <div className="container">
          <motion.div 
            className="sustainability-content"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2>Sustainability at Our Core</h2>
            <p>
              We believe fashion should respect both people and planet. That's why we've implemented 
              comprehensive sustainability initiatives across our entire supply chain.
            </p>
            <div className="sustainability-stats">
              <div className="sust-stat">
                <h4>85%</h4>
                <p>of materials from sustainable sources</p>
              </div>
              <div className="sust-stat">
                <h4>100%</h4>
                <p>carbon neutral operations</p>
              </div>
              <div className="sust-stat">
                <h4>0</h4>
                <p>waste to landfill from our facilities</p>
              </div>
              <div className="sust-stat">
                <h4>2025</h4>
                <p>target for 100% circular production</p>
              </div>
            </div>
            <button className="cta-button">Learn About Our Initiatives</button>
          </motion.div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="global-presence">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Global Presence, Local Impact
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            With flagship stores in fashion capitals worldwide and online shipping to over 50 countries
          </motion.p>
          
          <div className="stores-grid">
            {[
              { city: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" },
              { city: "Paris", image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" },
              { city: "Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1794&q=80" },
              { city: "Milan", image: "https://images.unsplash.com/photo-1552832230-c019704d62d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" },
              { city: "London", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" },
              { city: "Seoul", image: "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" }
            ].map((store, index) => (
              <motion.div 
                key={index}
                className="store-card"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <img src={store.image} alt={store.city} />
                <div className="store-overlay">
                  <h4>{store.city}</h4>
                  <button>Visit Store</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <motion.div 
          className="cta-content"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2>Join Our Journey</h2>
          <p>Be part of our story as we continue to shape the future of fashion</p>
          <div className="cta-buttons">
            <button className="cta-primary">Explore Careers</button>
            <button className="cta-secondary">View Collections</button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default About;