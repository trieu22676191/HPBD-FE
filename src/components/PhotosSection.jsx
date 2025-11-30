import React, { useState, useEffect } from "react";
import "../styles/PhotosSection.css";
import { getAllPhotos } from "../services/api";
import ImageLightbox from "./ImageLightbox";

function PhotosSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Load ảnh từ API
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setLoading(true);
        const data = await getAllPhotos();
        if (data && data.length > 0) {
          // Lọc bỏ ảnh đã khóa (chỉ hiển thị ảnh chưa khóa)
          const unlockedPhotos = data.filter((photo) => !photo.isLocked);
          setPhotos(unlockedPhotos);
        } else {
          // Fallback: thử load từ localStorage nếu API trống
          const savedPhotos = JSON.parse(
            localStorage.getItem("sharedPhotos") || "[]"
          );
          if (savedPhotos.length > 0) {
            setPhotos(savedPhotos);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải ảnh:", err);
        // Fallback: load từ localStorage nếu API lỗi
        const savedPhotos = JSON.parse(
          localStorage.getItem("sharedPhotos") || "[]"
        );
        setPhotos(savedPhotos);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();

    // Lắng nghe event khi có ảnh mới được thêm/xóa (từ GallerySection)
    const handlePhotosUpdate = () => {
      loadPhotos();
    };

    window.addEventListener("photosUpdated", handlePhotosUpdate);

    return () => {
      window.removeEventListener("photosUpdated", handlePhotosUpdate);
    };
  }, []);

  useEffect(() => {
    if (photos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
      setProgress(0);
    }, 3000); // Chuyển hình mỗi 3 giây

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1; // Tăng 1% mỗi 30ms (100% trong 3 giây)
      });
    }, 30);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [photos.length]);

  const handlePhotoClick = (index) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  const handlePhotoView = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleLightboxNext = () => {
    setLightboxIndex((prev) => (prev + 1) % photos.length);
  };

  const handleLightboxPrev = () => {
    setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <section className="photos-section" id="photos">
      <div className="photos-container">
        <h2 className="photos-title">Bạn và tôi</h2>

        <div className="photos-carousel">
          <div className="photos-carousel-wrapper">
            {photos.map((photo, index) => {
              const isActive = index === currentIndex;
              const offset = index - currentIndex;

              let transform = "";
              let opacity = 1;
              let filter = "blur(0)";
              let scale = 1;

              if (!isActive) {
                const translateX = offset * 120;
                const translateZ = offset * -50;
                scale = 1 - Math.abs(offset) * 0.15;
                const rotateY = offset * 15;
                transform = `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`;
                opacity = 0.6;
                filter = "blur(2px)";
              } else {
                transform =
                  "translateX(0) translateZ(0) scale(1.2) rotateY(0deg)";
                opacity = 1;
                filter = "blur(0)";
              }

              return (
                <div
                  key={photo.id}
                  className={`photo-card ${isActive ? "active" : ""}`}
                  onClick={() => handlePhotoClick(index)}
                  style={{
                    transform: transform,
                    opacity: opacity,
                    filter: filter,
                    zIndex: photos.length - Math.abs(offset),
                  }}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="photo-image"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePhotoView(index);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              );
            })}
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <ImageLightbox
        isOpen={lightboxOpen}
        image={photos[lightboxIndex]}
        images={photos}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNext={handleLightboxNext}
        onPrev={handleLightboxPrev}
      />
    </section>
  );
}

export default PhotosSection;
