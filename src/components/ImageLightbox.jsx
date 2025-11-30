import React, { useEffect } from "react";
import "../styles/ImageLightbox.css";

function ImageLightbox({ isOpen, image, images, currentIndex, onClose, onNext, onPrev }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && onPrev) {
        onPrev();
      } else if (e.key === "ArrowRight" && onNext) {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || !image) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="image-lightbox" onClick={handleBackdropClick}>
      <button className="lightbox-close-btn" onClick={onClose} title="Đóng (ESC)">
        ✕
      </button>

      {images && images.length > 1 && (
        <>
          <button
            className="lightbox-nav-btn lightbox-prev-btn"
            onClick={onPrev}
            title="Ảnh trước (←)"
          >
            ‹
          </button>
          <button
            className="lightbox-nav-btn lightbox-next-btn"
            onClick={onNext}
            title="Ảnh sau (→)"
          >
            ›
          </button>
          <div className="lightbox-counter">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}

      <div className="lightbox-content">
        <img src={image.url || image} alt={image.caption || image.alt || "Ảnh"} className="lightbox-image" />
        {(image.caption || image.title) && (
          <div className="lightbox-caption">
            {image.caption || image.title}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageLightbox;

