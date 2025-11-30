import React, { useState, useEffect } from 'react'
import '../styles/QuotesSection.css'
import { getAllWishes, updateWish, deleteWish } from '../services/api'

function QuotesSection() {
  const [wishes, setWishes] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [editingWish, setEditingWish] = useState(null)
  const [editText, setEditText] = useState('')
  const [editNickname, setEditNickname] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedWishes, setExpandedWishes] = useState(new Set())
  
  // Giới hạn số ký tự hiển thị ban đầu
  const MAX_TEXT_LENGTH = 150
  
  const toggleExpand = (wishId) => {
    setExpandedWishes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(wishId)) {
        newSet.delete(wishId)
      } else {
        newSet.add(wishId)
      }
      return newSet
    })
  }
  
  const isExpanded = (wishId) => expandedWishes.has(wishId)
  
  const shouldTruncate = (text) => text && text.length > MAX_TEXT_LENGTH

  useEffect(() => {
    // Load lời chúc từ API
    const loadWishes = async () => {
      try {
        setLoading(true)
        const data = await getAllWishes()
        
        // Chỉ hiển thị lời chúc đã xem (admin đã click vào bong bóng)
        // Sắp xếp mới nhất trước
        const viewedWishes = (data || [])
          .filter(wish => wish.isViewed === true)
          .sort((a, b) => {
            // Sắp xếp theo thời gian tạo (mới nhất trước)
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0)
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0)
            return dateB - dateA
          })
        
        setWishes(viewedWishes)
        setError(null)
      } catch (err) {
        console.error('Lỗi khi tải lời chúc:', err)
        setError('Không thể tải lời chúc. Vui lòng thử lại sau.')
        // Fallback: thử load từ localStorage nếu API lỗi
        const savedWishes = JSON.parse(localStorage.getItem('birthdayWishes') || '[]')
        const viewedWishes = savedWishes
          .filter(wish => wish.isViewed === true)
        setWishes(viewedWishes)
      } finally {
        setLoading(false)
      }
    }

    loadWishes()

    // Lắng nghe event khi có lời chúc mới được thêm (từ BubblesSection)
    const handleWishAdded = () => {
      loadWishes()
    }

    window.addEventListener('wishAdded', handleWishAdded)

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
      window.removeEventListener('wishAdded', handleWishAdded)
      window.removeEventListener('adminStatusChanged', handleAdminStatusChange)
    }
  }, [])

  const handleDeleteWish = async (id) => {
    if (!isAdmin) return
    try {
      await deleteWish(id)
      setWishes(wishes.filter(wish => wish.id !== id))
    } catch (err) {
      console.error('Lỗi khi xóa lời chúc:', err)
      alert('Không thể xóa lời chúc. Vui lòng thử lại.')
    }
  }

  const handleEditWish = (wish) => {
    if (!isAdmin) {
      alert('Vui lòng đăng nhập admin từ nút Sửa trên thanh menu!')
      return
    }
    setEditingWish(wish)
    setEditText(wish.text)
    setEditNickname(wish.nickname)
  }

  const handleSaveEdit = async () => {
    if (!isAdmin || !editingWish) return
    try {
      const updatedWish = await updateWish(editingWish.id, {
        text: editText.trim(),
        friendName: editingWish.friendName,
        nickname: editNickname.trim()
      })
      setWishes(wishes.map(wish =>
        wish.id === editingWish.id ? updatedWish : wish
      ))
      setEditingWish(null)
      setEditText('')
      setEditNickname('')
    } catch (err) {
      console.error('Lỗi khi cập nhật lời chúc:', err)
      alert('Không thể cập nhật lời chúc. Vui lòng thử lại.')
    }
  }


  return (
    <section className="quotes-section" id="quotes">
      <div className="quotes-container">
        <div className="quotes-header">
          <h2 className="quotes-title">💭 Những Lời Chúc Đã Nhận Được</h2>
        </div>
        {loading ? (
          <div className="no-wishes-message">
            <p>Đang tải lời chúc...</p>
          </div>
        ) : error ? (
          <div className="no-wishes-message">
            <p style={{ color: 'red' }}>{error}</p>
          </div>
        ) : wishes.length === 0 ? (
          <div className="no-wishes-message">
            <p>Chưa có lời chúc nào đã được xem. Hãy click vào các bong bóng ở phần trên để xem lời chúc nhé! 💝</p>
          </div>
        ) : (
          <div className="quotes-list">
            {wishes.map((wish) => (
              <div key={wish.id} className="quote-card">
                {isAdmin && editingWish?.id !== wish.id && (
                  <div className="wish-actions">
                    <button
                      className="delete-wish-btn"
                      onClick={() => handleDeleteWish(wish.id)}
                      title="Xóa lời chúc"
                    >
                      🗑️
                    </button>
                    <button
                      className="edit-wish-btn"
                      onClick={() => handleEditWish(wish)}
                      title="Sửa lời chúc"
                    >
                      ✏️
                    </button>
                  </div>
                )}
                {editingWish?.id === wish.id && isAdmin ? (
                  <div className="edit-wish-form">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="edit-wish-text"
                      rows="3"
                    />
                    <input
                      type="text"
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      className="edit-wish-nickname"
                      placeholder="Biệt danh"
                    />
                    <div className="edit-wish-actions">
                      <button
                        className="save-edit-btn"
                        onClick={handleSaveEdit}
                      >
                        Lưu
                      </button>
                      <button
                        className="cancel-edit-btn"
                        onClick={() => {
                          setEditingWish(null)
                          setEditText('')
                          setEditNickname('')
                        }}
                        title="Hủy sửa"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="quote-text-wrapper">
                      <p className="quote-text">
                        "{isExpanded(wish.id) || !shouldTruncate(wish.text) 
                          ? wish.text 
                          : wish.text.substring(0, MAX_TEXT_LENGTH) + '...'}
                      </p>
                      {shouldTruncate(wish.text) && (
                        <button 
                          className="expand-text-btn"
                          onClick={() => toggleExpand(wish.id)}
                        >
                          {isExpanded(wish.id) ? 'Thu gọn' : 'Xem thêm'}
                        </button>
                      )}
                    </div>
                    <p className="quote-author">— {wish.nickname}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default QuotesSection

