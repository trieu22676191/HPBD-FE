import React, { useEffect, useRef, useState } from "react";
import "../styles/HeartStar.css";
import bgMusic from "../audio/Beneath the Rain.mp3";

function HeartStar({ onClose }) {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const animationFrameRef = useRef(null);
  const intervalRef = useRef(null);
  const meteorIntervalRef = useRef(null);

  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const [mouseX, setMouseX] = useState(width / 2);
  const [mouseY, setMouseY] = useState(height / 2);
  const heartBeatRef = useRef(1);
  const [heartScale, setHeartScale] = useState(
    Math.min(window.innerWidth, window.innerHeight) * 0.015
  );

  const starsRef = useRef([]);
  const heartStarsRef = useRef([]);
  const meteorsRef = useRef([]);
  const fallingTextsRef = useRef([]);

  const messages = [
    "I love you",
    "Je t’aime",
    "사랑해",
    "愛してる",
    "我爱你",
    "Te amo",
    "Ich liebe dich",
    "Ti amo",
    "ผมรักคุณ",
    "Я тебя люблю",
  ];

  function heartShape(t, scale = 1) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    );
    return { x: x * scale, y: y * scale };
  }

  function createHeartStars(count = 1600) {
    const centerX = width / 2;
    const centerY = height / 2 + 20;
    heartStarsRef.current = [];

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const heart = heartShape(t, heartScale);
      const offsetX = (Math.random() - 0.5) * 15;
      const offsetY = (Math.random() - 0.5) * 15;

      const targetX = centerX + heart.x + offsetX;
      const targetY = centerY + heart.y + offsetY;

      heartStarsRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        targetX,
        targetY,
        originalX: targetX,
        originalY: targetY,
        size: Math.random() * 3 + 1,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        brightness: Math.random() * 0.5 + 0.5,
        hue: Math.random() * 60 + 300,
        mode: "flying",
      });
    }
  }

  function createBackgroundStars() {
    starsRef.current = [];
    for (let i = 0; i < 200; i++) {
      starsRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.01 + 0.005,
        brightness: Math.random() * 0.3 + 0.2,
      });
    }
  }

  function createMeteor() {
    meteorsRef.current.push({
      x: Math.random() * width,
      y: -50,
      length: Math.random() * 80 + 50,
      speed: Math.random() * 6 + 6,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
      alpha: 1,
    });
  }

  function createFallingText(ctx) {
    const text = messages[Math.floor(Math.random() * messages.length)];
    const fontSize = Math.random() * 10 + 10;

    ctx.font = `bold ${fontSize}px Pacifico`;
    const textWidth = ctx.measureText(text).width;

    const x = Math.random() * (width - textWidth);

    fallingTextsRef.current.push({
      text,
      x,
      y: -10,
      speed: Math.random() * 2 + 2,
      alpha: 1,
      fontSize,
      hue: Math.random() * 360,
    });
  }

  function animate() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);

    heartBeatRef.current += 0.1;
    const currentHeartBeat = heartBeatRef.current;

    // Draw background stars
    starsRef.current.forEach((star) => {
      star.twinkle += star.twinkleSpeed;
      const flicker = Math.random() < 0.005 ? 1 : 0;
      const baseOpacity =
        star.brightness * (0.4 + 0.6 * Math.sin(star.twinkle));
      const opacity = Math.min(1, baseOpacity + flicker);

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = flicker ? 20 : 0;
      ctx.shadowColor = flicker ? "#fff" : "transparent";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw meteors
    meteorsRef.current.forEach((m, i) => {
      const dx = Math.cos(m.angle) * m.length;
      const dy = Math.sin(m.angle) * m.length;
      ctx.save();
      ctx.globalAlpha = m.alpha;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - dx, m.y - dy);
      ctx.stroke();
      ctx.restore();
      m.x += Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      m.alpha -= 0.005;
      if (m.alpha <= 0) meteorsRef.current.splice(i, 1);
    });

    // Draw falling texts
    fallingTextsRef.current.forEach((t, i) => {
      ctx.save();
      ctx.font = `bold ${t.fontSize}px Pacifico`;
      ctx.fillStyle = `hsla(${t.hue}, 100%, 85%, ${t.alpha})`;
      ctx.shadowBlur = 5;
      ctx.shadowColor = `hsla(${t.hue}, 100%, 70%, ${t.alpha})`;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();

      t.y += t.speed;
      t.alpha -= 0.002;

      if (t.y > height + 30 || t.alpha <= 0) {
        fallingTextsRef.current.splice(i, 1);
      }
    });

    // Draw heart stars
    const centerX = width / 2;
    const centerY = height / 2 + 20;

    heartStarsRef.current.forEach((star, i) => {
      star.twinkle += star.twinkleSpeed;

      if (star.mode === "flying") {
        const dx = star.targetX - star.x;
        const dy = star.targetY - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 0.07;
        if (dist > 1) {
          star.x += dx * speed;
          star.y += dy * speed;
        } else {
          star.mode = "heart";
        }
      } else {
        const deltaX = star.originalX - centerX;
        const deltaY = star.originalY - centerY;
        const beatScale = 1 + Math.sin(currentHeartBeat) * 0.05;
        star.x = centerX + deltaX * beatScale;
        star.y = centerY + deltaY * beatScale;

        const distanceToMouse = Math.hypot(mouseX - star.x, mouseY - star.y);
        let interactionForce = 0;
        if (distanceToMouse < 100) {
          interactionForce = (100 - distanceToMouse) / 100;
          const angle = Math.atan2(star.y - mouseY, star.x - mouseX);
          star.x += Math.cos(angle) * interactionForce * 10;
          star.y += Math.sin(angle) * interactionForce * 10;
        }
      }

      const twinkleOpacity =
        star.brightness * (0.3 + 0.7 * Math.sin(star.twinkle));
      ctx.save();
      ctx.globalAlpha = twinkleOpacity;
      ctx.fillStyle = `hsl(${star.hue}, 70%, 80%)`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsl(${star.hue}, 70%, 60%)`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = width / 2;
    const centerY = height / 2 + 20;
    const newScale = heartScale * 1.015;
    setHeartScale(newScale);

    heartStarsRef.current.forEach((star, i) => {
      if (star.mode === "heart") {
        const t = (i / heartStarsRef.current.length) * Math.PI * 2;
        const heart = heartShape(t, newScale);
        const offsetX = (Math.random() - 0.5) * 15;
        const offsetY = (Math.random() - 0.5) * 15;
        star.originalX = centerX + heart.x + offsetX;
        star.originalY = centerY + heart.y + offsetY;
      }
    });

    for (let i = 0; i < 10; i++) {
      const t = Math.random() * Math.PI * 2;
      const heart = heartShape(t, newScale);
      const targetX = centerX + heart.x;
      const targetY = centerY + heart.y;

      heartStarsRef.current.push({
        x: clickX + (Math.random() - 0.5) * 50,
        y: clickY + (Math.random() - 0.5) * 50,
        targetX,
        targetY,
        originalX: targetX,
        originalY: targetY,
        size: Math.random() * 3 + 2,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.03 + 0.02,
        brightness: Math.random() * 0.8 + 0.6,
        hue: Math.random() * 60 + 300,
        mode: "flying",
      });
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
    setMouseY(e.clientY - rect.top);
  };

  const handleResize = () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    setWidth(newWidth);
    setHeight(newHeight);
    setHeartScale(Math.min(newWidth, newHeight) * 0.015);

    if (canvasRef.current) {
      canvasRef.current.width = newWidth;
      canvasRef.current.height = newHeight;
    }

    heartStarsRef.current = [];
    starsRef.current = [];
    createHeartStars();
    createBackgroundStars();
  };

  const playMusicOnce = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .catch((e) => console.log("Music play blocked:", e));
      window.removeEventListener("click", playMusicOnce);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    createHeartStars();
    createBackgroundStars();
    animate();

    // Create falling texts interval
    intervalRef.current = setInterval(() => {
      if (Math.random() < 0.8 && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        createFallingText(ctx);
      }
    }, 2000);

    // Create meteors interval
    meteorIntervalRef.current = setInterval(() => {
      if (Math.random() < 0.7) createMeteor();
    }, 3000);

    // Play music on first click
    window.addEventListener("click", playMusicOnce);

    // Handle resize
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (meteorIntervalRef.current) {
        clearInterval(meteorIntervalRef.current);
      }
      window.removeEventListener("click", playMusicOnce);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    createHeartStars();
    createBackgroundStars();
  }, [width, height, heartScale]);

  return (
    <div className="heartstar-container">
      <div className="cosmic-bg"></div>
      <canvas
        ref={canvasRef}
        className="heartstar-canvas"
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
      />
      <div className="message">
        <div>I love you in every universe</div>
        <div className="subtitle">
          Thế giới của anh gói gọn trong đôi mắt ấy !
        </div>
      </div>
      <button className="heartstar-close-btn" onClick={onClose}>
        ✕
      </button>
      <audio ref={audioRef} loop>
        <source src={bgMusic} type="audio/mpeg" />
      </audio>
    </div>
  );
}

export default HeartStar;
