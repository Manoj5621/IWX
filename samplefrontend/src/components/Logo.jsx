import React, { useEffect, useState } from 'react';
// import './Logo.css'; // We'll include the CSS directly in the component

const AnimatedLogo = () => {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Set animation complete after 10 seconds
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  // Inline CSS for the component
  const styles = `
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: transparent;
      overflow: hidden;
    }
    
    .logo-wrapper {
      position: relative;
      width: 300px;
      height: 300px;
      transform-origin: center;
    }
    
    .logo-element {
      opacity: 0;
    }
    
    .top-arch {
      position: absolute;
      top: 0;
      width: 100%;
      text-align: center;
    }
    
    .top-arch-svg {
      width: 100%;
    }
    
    .top-arch-text {
      font-family: 'Times New Roman', serif;
      font-weight: 900;
      font-size: 6px;
      fill: #000000;
      letter-spacing: 0.5px;
    }
    
    .center-elements {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .diamond {
      font-family: serif;
      font-weight: 900;
    }
    
    .letter-i {
      font-family: 'Times New Roman', serif;
      font-weight: 900;
      font-size: 60px;
      margin: 0 15px;
    }
    
    .iwx-section {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, 40px);
      text-align: center;
    }
    
    .horizontal-line {
      width: 120px;
      height: 1px;
      background-color: #000000;
      margin: 8px auto;
    }
    
    .iwx-text {
      font-family: 'Times New Roman', serif;
      font-weight: 900;
      font-size: 20px;
      letter-spacing: 1px;
    }
    
    .bottom-arch {
      position: absolute;
      bottom: 0;
      width: 100%;
      text-align: center;
    }
    
    .bottom-arch-svg {
      width: 100%;
    }
    
    .bottom-arch-text {
      font-family: 'Times New Roman', serif;
      font-weight: 900;
      font-size: 4px;
      fill: #000000;
      letter-spacing: 0.3px;
    }
    
    .bottom-stars {
      position: absolute;
      bottom: -30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .bottom-star {
      font-family: serif;
      font-weight: 900;
    }
    
    /* Animation keyframes */
    @keyframes scaleIn {
      from {
        transform: scale(1.5);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    /* Animation classes */
    .logo-wrapper.animate {
      animation: scaleIn 8s ease-in-out forwards;
    }
    
    .top-arch.animate {
      animation: fadeIn 1s ease-out 0.5s forwards;
    }
    
    .center-elements.animate {
      animation: fadeIn 1s ease-out 2.5s forwards;
    }
    
    .iwx-section.animate {
      animation: fadeIn 1s ease-out 4.5s forwards;
    }
    
    .bottom-arch.animate {
      animation: fadeIn 1s ease-out 6.5s forwards;
    }
    
    .bottom-stars.animate {
      animation: fadeIn 1s ease-out 8.5s forwards;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="logo-container">
        <div className={`logo-wrapper ${animationComplete ? '' : 'animate'}`}>
          {/* Top arch text: SINCE 2025 */}
          <div className={`logo-element top-arch ${animationComplete ? '' : 'animate'}`}>
            <svg viewBox="0 0 100 20" className="top-arch-svg">
              <path id="topArc" d="M 10,18 A 40,40 0 0 1 90,18" fill="transparent" />
              <text className="top-arch-text">
                <textPath href="#topArc" startOffset="50%" textAnchor="middle">
                  SINCE 2025
                </textPath>
              </text>
            </svg>
          </div>

          {/* Center I with diamond stars */}
          <div className={`logo-element center-elements ${animationComplete ? '' : 'animate'}`}>
            <span className="diamond" style={{ fontSize: '40px' }}>◆</span>
            <span className="letter-i">I</span>
            <span className="diamond" style={{ fontSize: '40px' }}>◆</span>
          </div>

          {/* IWX text with horizontal lines */}
          <div className={`logo-element iwx-section ${animationComplete ? '' : 'animate'}`}>
            <div className="horizontal-line"></div>
            <div className="iwx-text">IWX</div>
            <div className="horizontal-line"></div>
          </div>

          {/* Bottom arch text: SHAPING DREAMS WITH TIMELESS WAVES */}
          <div className={`logo-element bottom-arch ${animationComplete ? '' : 'animate'}`}>
            <svg viewBox="0 0 100 20" className="bottom-arch-svg">
              <path id="bottomArc" d="M 10,2 A 40,40 0 0 0 90,2" fill="transparent" />
              <text className="bottom-arch-text">
                <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
                  SHAPING DREAMS WITH TIMELESS WAVES
                </textPath>
              </text>
            </svg>
          </div>

          {/* Three stars at the bottom */}
          <div className={`logo-element bottom-stars ${animationComplete ? '' : 'animate'}`}>
            <span className="bottom-star" style={{ fontSize: '24px' }}>◆</span>
            <span className="bottom-star" style={{ fontSize: '30px', margin: '0 10px' }}>◆</span>
            <span className="bottom-star" style={{ fontSize: '24px' }}>◆</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnimatedLogo;