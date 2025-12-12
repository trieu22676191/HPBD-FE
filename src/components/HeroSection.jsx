import React from "react";
import "../styles/HeroSection.css";

function HeroSection() {
  return (
    <section className="hero-section" id="home">
      <div className="hero-background">
        <div className="stars"></div>
        <div className="stars"></div>
        <div className="stars"></div>
      </div>

      <div className="hero-content">
        <div className="hero-text-container">
          <h1 className="hero-title">
            <span className="title-line">Chúc Mừng</span>
            <span className="title-line">Sinh Nhật</span>
            <span className="title-name">Diệu Hiền</span>
          </h1>
          <div className="hero-subtitle">
            <p>🎉 Một ngày đặc biệt dành cho một người đặc biệt 🎂</p>
          </div>
        </div>

        <div className="floating-elements">
          <div className="floating-heart">💖</div>
          <div className="floating-heart">💝</div>
          <div className="floating-heart">🎈</div>
          <div className="floating-heart">🎊</div>
          <div className="floating-heart">✨</div>
          <div className="floating-heart">🌟</div>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <p>Cuộn xuống để xem thêm</p>
      </div>
    </section>
  );
}

export default HeroSection;
