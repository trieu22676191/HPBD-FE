import React from 'react'
import Navigation from './components/Navigation'
import HeroSection from './components/HeroSection'
import WishSection from './components/WishSection'
import BubblesSection from './components/BubblesSection'
import PhotosSection from './components/PhotosSection'
import QuotesSection from './components/QuotesSection'
import GallerySection from './components/GallerySection'
import MemoriesSection from './components/MemoriesSection'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navigation />
      <HeroSection />
      <WishSection />
      <BubblesSection />
      <PhotosSection />
      <QuotesSection />
      <GallerySection />
      <MemoriesSection />
    </div>
  )
}

export default App
