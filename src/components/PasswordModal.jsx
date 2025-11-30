import React, { useState } from "react";
import "../styles/PasswordModal.css";

function PasswordModal({ isOpen, onClose, onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const PASSWORD = "0812200422676191";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === PASSWORD) {
      localStorage.setItem("isAdmin", "true");
      // Dispatch event để Navigation và các components khác cập nhật
      window.dispatchEvent(new CustomEvent("adminStatusChanged"));
      onSuccess();
      setPassword("");
      setError("");
      onClose();
    } else {
      setError("Mật khẩu sai rồi, nhắn Anh Triệu ảnh chỉ cho!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="password-modal-overlay" onClick={onClose}>
      <div className="password-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Nhập Mật Khẩu</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Nhập mật khẩu"
            className="password-input"
            autoFocus
          />
          {error && <p className="password-error">{error}</p>}
          <div className="password-modal-actions">
            <button type="submit" className="password-submit-btn">
              Xác Nhận
            </button>
            <button
              type="button"
              className="password-cancel-btn"
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PasswordModal;
