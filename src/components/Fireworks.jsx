import React, { useEffect, useState } from "react";
import "../styles/Fireworks.css";

function Fireworks({ autoStart = true, duration = 5000 }) {
  const [isActive, setIsActive] = useState(autoStart);

  useEffect(() => {
    if (!autoStart) return;

    // Tự động ẩn sau duration (mặc định 5 giây)
    const timer = setTimeout(() => {
      setIsActive(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [autoStart, duration]);

  const colors = [
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#f7dc6f",
    "#ffa07a",
    "#98d8c8",
    "#ffb6c1",
    "#dda0dd",
  ];

  // Hàm tạo số ngẫu nhiên dựa trên seed để đảm bảo mỗi pháo hoa có vị trí khác nhau
  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  if (!isActive) return null;

  return (
    <div className="fireworks-container">
      {[...Array(12)].map((_, i) => {
        const seed = i;
        
        // Tạo vị trí ngẫu nhiên cho mỗi pháo hoa
        const left = 5 + seededRandom(seed) * 90; // 5% đến 95%
        const top = 10 + seededRandom(seed + 1) * 60; // 10% đến 70%
        
        // Tính khoảng cách từ dưới màn hình lên đến vị trí đích
        const distanceFromBottom = 100 - top; // Khoảng cách từ bottom đến top (tính bằng %)
        
        return (
          <div
            key={i}
            className="firework"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              "--distance": `${distanceFromBottom + 20}vh`, // Thêm 20vh để đảm bảo bắt đầu từ dưới màn hình
              animationDelay: `${i * 0.2}s`,
            }}
          >
            <div className="explosion">
              {[...Array(8)].map((_, j) => (
                <div
                  key={j}
                  className={`particle particle-${j + 1}`}
                  style={{
                    "--color": colors[j % 8],
                    "--delay": j * 0.05 + "s",
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Fireworks;
