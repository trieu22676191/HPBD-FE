import React, { useState, useEffect, useRef } from 'react'
import '../styles/GallerySection.css'
import { getAllPhotos, uploadPhoto, updatePhoto, deletePhoto, toggleLockPhoto } from '../services/api'

function GallerySection() {
  const [photos, setPhotos] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [photoTitle, setPhotoTitle] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState(null)
  const [editCaption, setEditCaption] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Load ảnh từ API
    const loadPhotos = async () => {
      try {
        setLoading(true)
        const data = await getAllPhotos()
        if (data && data.length > 0) {
          setPhotos(data)
        } else {
          // Fallback: thử load từ localStorage nếu API trống
          const savedPhotos = JSON.parse(localStorage.getItem('sharedPhotos') || '[]')
          if (savedPhotos.length > 0) {
            setPhotos(savedPhotos)
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải ảnh:', err)
        // Fallback: load từ localStorage nếu API lỗi
        const savedPhotos = JSON.parse(localStorage.getItem('sharedPhotos') || '[]')
        setPhotos(savedPhotos)
      } finally {
        setLoading(false)
      }
    }

    loadPhotos()

    // Lắng nghe event khi có ảnh mới được thêm/xóa
    const handlePhotosUpdate = () => {
      loadPhotos()
    }

    window.addEventListener('photosUpdated', handlePhotosUpdate)

    // Kiểm tra trạng thái admin
    const checkAdminStatus = () => {
      const adminStatus = localStorage.getItem('isAdmin') === 'true'
      setIsAdmin(adminStatus)
    }
    
    checkAdminStatus()
    
    // Lắng nghe event khi admin status thay đổi
    const handleAdminStatusChange = () => {
      checkAdminStatus()
    }
    
    window.addEventListener('adminStatusChanged', handleAdminStatusChange)

    return () => {
      window.removeEventListener('photosUpdated', handlePhotosUpdate)
      window.removeEventListener('adminStatusChanged', handleAdminStatusChange)
    }
  }, [])

  const handleFileChange = async (e) => {
    // Kiểm tra tiêu đề bắt buộc
    if (!photoTitle.trim()) {
      alert('Vui lòng nhập tiêu đề ảnh trước khi chọn ảnh!')
      e.target.value = ''
      return
    }

    const files = Array.from(e.target.files)
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          setUploading(true)
          setUploadSuccess(false)
          
          const caption = photoTitle.trim()
          
          // Upload ảnh lên Cloudinary và lấy URL
          const newPhoto = await uploadPhoto(file, caption)
          
          setPhotos([...photos, newPhoto])
          // Dispatch event để PhotosSection cập nhật
          window.dispatchEvent(new CustomEvent('photosUpdated'))
          
          // Hiển thị thông báo thành công
          setUploadSuccess(true)
          setTimeout(() => {
            setUploadSuccess(false)
          }, 3000)
        } catch (err) {
          console.error('Lỗi khi upload ảnh:', err)
          alert('Không thể upload ảnh. Vui lòng thử lại.')
        } finally {
          setUploading(false)
        }
      }
    }
    
    // Reset form
    e.target.value = ''
    setPhotoTitle('')
    setShowAddForm(false)
  }

  const handleAddPhoto = () => {
    setShowAddForm(!showAddForm)
  }

  const handleSelectFiles = () => {
    fileInputRef.current?.click()
  }

  const handleDeletePhoto = async (id, e) => {
    e.stopPropagation()
    if (!isAdmin) return
    try {
      await deletePhoto(id)
      setPhotos(photos.filter(photo => photo.id !== id))
      // Dispatch event để PhotosSection cập nhật
      window.dispatchEvent(new CustomEvent('photosUpdated'))
    } catch (err) {
      console.error('Lỗi khi xóa ảnh:', err)
      alert('Không thể xóa ảnh. Vui lòng thử lại.')
    }
  }

  const handleEditPhoto = (photo) => {
    if (!isAdmin) {
      alert('Vui lòng đăng nhập admin từ nút Sửa trên thanh menu!')
      return
    }
    setEditingPhoto(photo)
    setEditCaption(photo.caption)
  }

  const handleSaveEdit = async () => {
    if (!isAdmin || !editingPhoto) return
    try {
      const updatedPhoto = await updatePhoto(editingPhoto.id, {
        url: editingPhoto.url,
        caption: editCaption.trim() || editingPhoto.caption
      })
      setPhotos(photos.map(photo =>
        photo.id === editingPhoto.id ? updatedPhoto : photo
      ))
      window.dispatchEvent(new CustomEvent('photosUpdated'))
      setEditingPhoto(null)
      setEditCaption('')
    } catch (err) {
      console.error('Lỗi khi cập nhật ảnh:', err)
      alert('Không thể cập nhật ảnh. Vui lòng thử lại.')
    }
  }

  const handleToggleLock = async (id, e) => {
    e.stopPropagation()
    if (!isAdmin) {
      alert('Vui lòng đăng nhập admin từ nút Sửa trên thanh menu!')
      return
    }
    try {
      const updatedPhoto = await toggleLockPhoto(id)
      setPhotos(photos.map(photo =>
        photo.id === id ? updatedPhoto : photo
      ))
      window.dispatchEvent(new CustomEvent('photosUpdated'))
    } catch (err) {
      console.error('Lỗi khi khóa/mở khóa ảnh:', err)
      alert('Không thể khóa/mở khóa ảnh. Vui lòng thử lại.')
    }
  }

  return (
    <section className="gallery-section" id="gallery">
      <div className="gallery-container">
        <div className="gallery-header">
          <h2 className="gallery-title">📸 Thư Viện</h2>
          <div className="gallery-header-actions">
            <button className="add-photo-btn" onClick={handleAddPhoto}>
              ➕ Thêm Ảnh
            </button>
          </div>
        </div>


        {showAddForm && (
          <div className="add-photo-form">
            <h3>Thêm Ảnh Mới</h3>
            {uploadSuccess && (
              <div className="success-message">
                ✅ Upload ảnh thành công!
              </div>
            )}
            <div className="form-group">
              <label>Tiêu đề ảnh <span className="required">*</span>:</label>
              <input
                type="text"
                value={photoTitle}
                onChange={(e) => setPhotoTitle(e.target.value)}
                placeholder="Nhập tiêu đề cho ảnh (bắt buộc)"
                className="form-input"
                required
                disabled={uploading}
              />
            </div>
            <div className="form-group">
              <label>Chọn ảnh:</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={uploading}
              />
              <button 
                className="select-files-btn" 
                onClick={handleSelectFiles}
                disabled={uploading || !photoTitle.trim()}
              >
                {uploading ? '⏳ Đang tải lên...' : 'Chọn Ảnh'}
              </button>
            </div>
            {uploading && (
              <div className="upload-progress">
                <div className="spinner"></div>
                <p>Đang upload ảnh lên Cloudinary...</p>
              </div>
            )}
            <div className="form-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowAddForm(false)
                  setPhotoTitle('')
                  setUploading(false)
                  setUploadSuccess(false)
                }}
                disabled={uploading}
              >
                Hủy
              </button>
            </div>
          </div>
        )}
        <div className="gallery-masonry">
          {photos
            .filter(photo => !photo.isLocked || isAdmin) // Ẩn ảnh đã khóa nếu không phải admin
            .map((photo) => (
            <div 
              key={photo.id} 
              className={`gallery-photo ${photo.isLocked ? 'locked' : ''}`}
            >
              {photo.isLocked && isAdmin && (
                <div className="locked-badge">
                  🔒 Đã khóa
                </div>
              )}
              <img 
                src={photo.url} 
                alt={photo.caption} 
                className="gallery-image"
                loading="lazy"
                style={photo.isLocked && isAdmin ? { opacity: 0.6 } : {}}
              />
              {isAdmin && (
                <>
                  <div className="photo-actions">
                    <button 
                      className="delete-photo-btn"
                      onClick={(e) => handleDeletePhoto(photo.id, e)}
                      title="Xóa ảnh"
                    >
                      🗑️
                    </button>
                    <button
                      className="edit-photo-btn"
                      onClick={() => handleEditPhoto(photo)}
                      title="Sửa tiêu đề"
                    >
                      ✏️
                    </button>
                    <button
                      className="lock-photo-btn"
                      onClick={(e) => handleToggleLock(photo.id, e)}
                      title={photo.isLocked ? "Mở khóa ảnh" : "Khóa ảnh"}
                    >
                      {photo.isLocked ? "🔓" : "🔒"}
                    </button>
                  </div>
                </>
              )}
              <div className="gallery-overlay">
                {editingPhoto?.id === photo.id && isAdmin ? (
                  <div className="edit-caption-form">
                    <input
                      type="text"
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="edit-caption-input"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSaveEdit()
                        }
                        if (e.key === 'Escape') {
                          setEditingPhoto(null)
                          setEditCaption('')
                        }
                      }}
                      autoFocus
                    />
                    <div className="edit-caption-actions">
                      <button
                        className="save-edit-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSaveEdit()
                        }}
                      >
                        ✓
                      </button>
                      <button
                        className="cancel-edit-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingPhoto(null)
                          setEditCaption('')
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="gallery-caption">{photo.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default GallerySection

