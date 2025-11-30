import React, { useState, useEffect, useRef } from "react";
import "../styles/MemoriesSection.css";
import {
  getAllVideos,
  uploadVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleLockVideo,
} from "../services/api";

function MemoriesSection() {
  const [videos, setVideos] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load video từ API
    const loadVideos = async () => {
      try {
        setLoading(true);
        const data = await getAllVideos();
        if (data && data.length > 0) {
          setVideos(data);
        } else {
          // Fallback: thử load từ localStorage nếu API trống
          const savedVideos = JSON.parse(
            localStorage.getItem("memoriesVideos") || "[]"
          );
          if (savedVideos.length > 0) {
            setVideos(savedVideos);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải video:", err);
        // Fallback: load từ localStorage nếu API lỗi
        const savedVideos = JSON.parse(
          localStorage.getItem("memoriesVideos") || "[]"
        );
        setVideos(savedVideos);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();

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
      window.removeEventListener("adminStatusChanged", handleAdminStatusChange);
    };
  }, []);

  const handleFileChange = async (e) => {
    // Kiểm tra tiêu đề bắt buộc
    if (!videoTitle.trim()) {
      alert("Vui lòng nhập tiêu đề video trước khi chọn video!");
      e.target.value = "";
      return;
    }

    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      try {
        setUploading(true);
        setUploadSuccess(false);

        // Upload video lên Cloudinary và lấy URL
        const title = videoTitle.trim();
        const description = videoDescription || "Video đã tải lên";

        const newVideo = await uploadVideo(file, title, description);
        setVideos([...videos, newVideo]);

        // Hiển thị thông báo thành công
        setUploadSuccess(true);
        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);

        // Reset form
        setVideoUrl("");
        setVideoTitle("");
        setVideoDescription("");
        setShowAddForm(false);
      } catch (err) {
        console.error("Lỗi khi upload video:", err);
        alert("Không thể upload video. Vui lòng thử lại.");
      } finally {
        setUploading(false);
      }
    }
    e.target.value = "";
  };

  const handleAddVideo = async () => {
    if (!videoTitle.trim()) {
      alert("Vui lòng nhập tiêu đề video.");
      return;
    }

    if (!videoUrl.trim() && !fileInputRef.current?.files[0]) {
      alert("Vui lòng nhập URL video hoặc chọn file video.");
      return;
    }

    try {
      setUploading(true);
      setUploadSuccess(false);

      // Kiểm tra xem là YouTube/Vimeo URL hay video file URL
      let videoType = "video";
      let processedUrl = videoUrl;

      if (videoUrl.trim()) {
        if (
          videoUrl.includes("youtube.com/watch") ||
          videoUrl.includes("youtu.be")
        ) {
          // Chuyển đổi YouTube URL sang embed format
          const youtubeId = videoUrl.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
          )?.[1];
          if (youtubeId) {
            processedUrl = `https://www.youtube.com/embed/${youtubeId}`;
            videoType = "iframe";
          }
        } else if (videoUrl.includes("vimeo.com")) {
          // Chuyển đổi Vimeo URL sang embed format
          const vimeoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
          if (vimeoId) {
            processedUrl = `https://player.vimeo.com/video/${vimeoId}`;
            videoType = "iframe";
          }
        } else if (
          videoUrl.includes("embed") ||
          videoUrl.includes("player.vimeo.com")
        ) {
          videoType = "iframe";
        }
      }

      if (editingVideo) {
        // Sửa video
        const updatedVideo = await updateVideo(editingVideo.id, {
          title: videoTitle.trim(),
          url: processedUrl,
          type: videoType,
          description: videoDescription || "Video kỷ niệm",
        });
        setVideos(
          videos.map((video) =>
            video.id === editingVideo.id ? updatedVideo : video
          )
        );
        setEditingVideo(null);
      } else {
        // Thêm video mới
        const newVideo = await createVideo({
          title: videoTitle.trim(),
          url: processedUrl,
          type: videoType,
          description: videoDescription || "Video kỷ niệm",
        });
        setVideos([...videos, newVideo]);
      }

      // Hiển thị thông báo thành công
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);

      // Reset form
      setVideoUrl("");
      setVideoTitle("");
      setVideoDescription("");
      setShowAddForm(false);
    } catch (err) {
      console.error("Lỗi khi thêm/sửa video:", err);
      alert("Không thể thêm/sửa video. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!isAdmin) {
      alert("Vui lòng đăng nhập admin từ nút Sửa trên thanh menu!");
      return;
    }
    try {
      await deleteVideo(id);
      setVideos(videos.filter((video) => video.id !== id));
    } catch (err) {
      console.error("Lỗi khi xóa video:", err);
      alert("Không thể xóa video. Vui lòng thử lại.");
    }
  };

  const handleEditVideo = (video) => {
    if (!isAdmin) {
      alert("Vui lòng đăng nhập admin từ nút Sửa trên thanh menu!");
      return;
    }
    setEditingVideo(video);
    setVideoTitle(video.title);
    setVideoDescription(video.description || "");
    setVideoUrl(video.url);
    setShowAddForm(true);
  };

  const handleToggleLock = async (id, e) => {
    e.stopPropagation();
    if (!isAdmin) {
      alert("Vui lòng đăng nhập admin từ nút Sửa trên thanh menu!");
      return;
    }
    try {
      const updatedVideo = await toggleLockVideo(id);
      setVideos(
        videos.map((video) => (video.id === id ? updatedVideo : video))
      );
    } catch (err) {
      console.error("Lỗi khi khóa/mở khóa video:", err);
      alert("Không thể khóa/mở khóa video. Vui lòng thử lại.");
    }
  };

  const renderVideo = (video) => {
    if (video.type === "iframe") {
      return (
        <iframe
          src={video.url}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="video-iframe"
        ></iframe>
      );
    } else {
      return (
        <video
          src={video.url}
          controls
          className="video-iframe"
          style={{ objectFit: "contain" }}
        >
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      );
    }
  };

  return (
    <section className="memories-section" id="memories">
      <div className="memories-container">
        <div className="memories-header">
          <h2 className="memories-title">🎬 Kỷ Niệm</h2>
          <div className="memories-header-actions">
            <button
              className="add-video-btn"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              ➕ Thêm Video
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="add-video-form">
            <h3>{editingVideo ? "Sửa Video" : "Thêm Video Mới"}</h3>
            {uploadSuccess && (
              <div className="success-message">✅ Upload video thành công!</div>
            )}
            <div className="form-group">
              <label>
                Tiêu đề <span className="required">*</span>:
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Nhập tiêu đề video (bắt buộc)"
                className="form-input"
                required
                disabled={uploading}
              />
            </div>
            <div className="form-group">
              <label>URL Video (YouTube, Vimeo hoặc link video):</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... hoặc link video"
                className="form-input"
                disabled={uploading}
              />
            </div>
            <div className="form-group">
              <label>Hoặc tải video từ máy:</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
                disabled={uploading}
              />
              <button
                className="upload-video-btn"
                onClick={() => {
                  if (!videoTitle.trim()) {
                    alert("Vui lòng nhập tiêu đề video trước khi chọn video!");
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                disabled={uploading || !videoTitle.trim()}
              >
                {uploading ? "⏳ Đang tải lên..." : "Chọn Video"}
              </button>
            </div>
            <div className="form-group">
              <label>Mô tả (tùy chọn):</label>
              <textarea
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                placeholder="Nhập mô tả video"
                className="form-textarea"
                rows="3"
              />
            </div>
            {uploading && (
              <div className="upload-progress">
                <div className="spinner"></div>
                <p>Đang upload video lên Cloudinary...</p>
              </div>
            )}
            <div className="form-actions">
              <button
                className="submit-btn"
                onClick={handleAddVideo}
                disabled={uploading}
              >
                {editingVideo ? "Lưu Thay Đổi" : "Thêm Video"}
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowAddForm(false);
                  setVideoUrl("");
                  setVideoTitle("");
                  setVideoDescription("");
                  setEditingVideo(null);
                  setUploading(false);
                  setUploadSuccess(false);
                }}
                disabled={uploading}
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        <div className="videos-grid">
          {videos
            .filter((video) => !video.isLocked || isAdmin) // Ẩn video đã khóa nếu không phải admin
            .map((video) => (
              <div
                key={video.id}
                className={`video-card ${video.isLocked ? "locked" : ""}`}
              >
                {video.isLocked && isAdmin && (
                  <div className="locked-badge">🔒 Đã khóa</div>
                )}
                {isAdmin && (
                  <div className="video-actions">
                    <button
                      className="delete-video-btn"
                      onClick={() => handleDeleteVideo(video.id)}
                      title="Xóa video"
                    >
                      🗑️
                    </button>
                    <button
                      className="edit-video-btn"
                      onClick={() => handleEditVideo(video)}
                      title="Sửa video"
                    >
                      ✏️
                    </button>
                    <button
                      className="lock-video-btn"
                      onClick={(e) => handleToggleLock(video.id, e)}
                      title={video.isLocked ? "Mở khóa video" : "Khóa video"}
                    >
                      {video.isLocked ? "🔓" : "🔒"}
                    </button>
                  </div>
                )}
                <div
                  className="video-wrapper"
                  style={video.isLocked && isAdmin ? { opacity: 0.6 } : {}}
                >
                  {renderVideo(video)}
                </div>
                <div className="video-info">
                  <h3 className="video-title">{video.title}</h3>
                  <p className="video-description">{video.description}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

export default MemoriesSection;
