import React, { useState, useEffect } from "react";
import "../styles/Navigation.css";
import PasswordModal from "./PasswordModal";

function Navigation({ onHeartClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    // Kiểm tra trạng thái admin
    const checkAdminStatus = () => {
      const adminStatus = localStorage.getItem("isAdmin") === "true";
      setIsAdmin(adminStatus);
    };

    checkAdminStatus();

    // Lắng nghe event khi admin status thay đổi
    const handleAdminStatusChange = () => {
      checkAdminStatus();
    };

    window.addEventListener("adminStatusChanged", handleAdminStatusChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("adminStatusChanged", handleAdminStatusChange);
    };
  }, []);

  const handlePasswordSuccess = () => {
    setIsAdmin(true);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const nav = document.querySelector(".navigation");
      const navHeight = nav ? nav.offsetHeight : 70;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Đóng mobile menu sau khi click
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className={`navigation ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <div className="nav-logo" onClick={() => scrollToSection("home")}>
          Chúc Mừng Sinh Nhật
        </div>

        {/* Hamburger Menu Button (Mobile) */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <ul className={`nav-menu ${isMobileMenuOpen ? "mobile-open" : ""}`}>
          <li>
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("home");
              }}
            >
              Trang Chủ
            </a>
          </li>
          <li>
            <a
              href="#wish"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("wish");
              }}
            >
              DIUHIN
            </a>
          </li>
          <li>
            <a
              href="#photos"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("photos");
              }}
            >
              Ảnh
            </a>
          </li>
          <li>
            <a
              href="#quotes"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("quotes");
              }}
            >
              Lời Chúc
            </a>
          </li>
          <li>
            <a
              href="#gallery"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("gallery");
              }}
            >
              Thư Viện
            </a>
          </li>
          <li>
            <a
              href="#memories"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("memories");
              }}
            >
              Kỷ Niệm
            </a>
          </li>
        </ul>
        <div className={`nav-icons ${isMobileMenuOpen ? "mobile-open" : ""}`}>
          {!isAdmin ? (
            <button
              className="nav-edit-btn"
              onClick={() => {
                setShowPasswordModal(true);
                setIsMobileMenuOpen(false);
              }}
              title="Sửa"
            >
              ✏️
            </button>
          ) : (
            <div className="nav-edit-btn-wrapper">
              <button
                className="nav-edit-btn"
                disabled
                style={{ opacity: 0.5 }}
                title="Đang ở chế độ quản trị"
              >
                ✏️
              </button>
              <button
                className="nav-exit-admin-btn"
                onClick={() => {
                  if (
                    window.confirm("Bạn có chắc muốn thoát chế độ quản trị?")
                  ) {
                    localStorage.removeItem("isAdmin");
                    setIsAdmin(false);
                    window.dispatchEvent(new CustomEvent("adminStatusChanged"));
                    setIsMobileMenuOpen(false);
                  }
                }}
                title="Thoát chế độ quản trị"
              >
                ✕
              </button>
            </div>
          )}
          <span 
            className="nav-icon heart-icon" 
            onClick={() => {
              if (onHeartClick) {
                onHeartClick();
                setIsMobileMenuOpen(false);
              }
            }}
            style={{ cursor: 'pointer' }}
            title="Heart of Stars"
          >
            ❤️
          </span>
        </div>

        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSuccess={handlePasswordSuccess}
        />
      </div>
    </nav>
  );
}

export default Navigation;
