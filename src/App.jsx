import React, { useState } from "react";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import WishSection from "./components/WishSection";
import BubblesSection from "./components/BubblesSection";
import PhotosSection from "./components/PhotosSection";
import QuotesSection from "./components/QuotesSection";
import GallerySection from "./components/GallerySection";
import MemoriesSection from "./components/MemoriesSection";
import AudioPlayer from "./components/AudioPlayer";
import Fireworks from "./components/Fireworks";
import HeartStar from "./components/HeartStar";
import "./App.css";
import birthdaySong from "./audio/Happy Birthday Bouncy - E's Jammy Jams.mp3";

function App() {
  // Sử dụng file nhạc đã thêm vào
  const audioUrl = birthdaySong;
  const [showHeartStar, setShowHeartStar] = useState(false);

  return (
    <div className="app">
      <Fireworks autoStart={true} duration={5000} />
      <Navigation onHeartClick={() => setShowHeartStar(true)} />
      {showHeartStar && <HeartStar onClose={() => setShowHeartStar(false)} />}
      <HeroSection />
      <WishSection />
      <BubblesSection />
      <PhotosSection />
      <QuotesSection />
      <GallerySection />
      <MemoriesSection />
      <AudioPlayer audioUrl={audioUrl} />
    </div>
  );
}

export default App;
