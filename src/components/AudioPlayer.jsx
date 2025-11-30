import React, { useState, useEffect, useRef } from "react";
import "../styles/AudioPlayer.css";

function AudioPlayer({ audioUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);

  useEffect(() => {
    // Load volume từ localStorage (không load isPlaying để luôn tự động phát)
    const savedState = localStorage.getItem("audioPlayerState");
    let initialVolume = 0.5;
    if (savedState) {
      const { volume: savedVolume } = JSON.parse(savedState);
      initialVolume = savedVolume || 0.5;
      setVolume(initialVolume);
    }

    // Thử tự động phát khi trang load (mặc định luôn phát)
    const tryAutoPlay = async () => {
      if (audioRef.current) {
        // Set volume trước
        audioRef.current.volume = initialVolume;
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (err) {
          // Browser chặn autoplay, thử phát lại khi user tương tác
          console.log("Autoplay bị chặn, sẽ thử phát khi user tương tác");

          // Thử phát lại khi user scroll, click hoặc touch
          const handleUserInteraction = async () => {
            if (audioRef.current && audioRef.current.paused) {
              try {
                await audioRef.current.play();
                setIsPlaying(true);
                // Xóa event listeners sau khi phát thành công
                window.removeEventListener("scroll", handleUserInteraction);
                window.removeEventListener("click", handleUserInteraction);
                window.removeEventListener("touchstart", handleUserInteraction);
                document.removeEventListener("keydown", handleUserInteraction);
              } catch (e) {
                // Vẫn chưa phát được
              }
            }
          };

          // Lắng nghe các sự kiện user interaction
          window.addEventListener("scroll", handleUserInteraction, {
            once: true,
          });
          window.addEventListener("click", handleUserInteraction, {
            once: true,
          });
          window.addEventListener("touchstart", handleUserInteraction, {
            once: true,
          });
          document.addEventListener("keydown", handleUserInteraction, {
            once: true,
          });
        }
      }
    };

    // Delay một chút để đảm bảo audio element đã sẵn sàng
    const timer = setTimeout(() => {
      tryAutoPlay();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    // Chỉ lưu volume vào localStorage (không lưu isPlaying để luôn tự động phát)
    localStorage.setItem(
      "audioPlayerState",
      JSON.stringify({
        volume,
      })
    );
  }, [volume]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Lỗi khi phát nhạc:", err);
      alert("Không thể phát nhạc. Vui lòng thử lại.");
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      audioRef.current.muted = false;
      setIsMuted(false);
    }
  };

  const handleEnded = () => {
    // Tự động phát lại khi hết bài
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  if (!audioUrl) {
    return null;
  }

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        onEnded={handleEnded}
        preload="auto"
      />

      <button
        className="audio-toggle-btn"
        onClick={togglePlay}
        title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
      >
        {isPlaying ? "⏸️" : "▶️"}
      </button>

      <div className="audio-controls">
        <button
          className="audio-mute-btn"
          onClick={toggleMute}
          title={isMuted ? "Bật tiếng" : "Tắt tiếng"}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="audio-volume-slider"
          title="Điều chỉnh âm lượng"
        />
      </div>
    </div>
  );
}

export default AudioPlayer;
