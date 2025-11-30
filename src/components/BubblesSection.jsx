import React, { useState, useCallback, useEffect } from 'react'
import '../styles/BubblesSection.css'
import { createWish, getAllWishes, markWishAsViewed } from '../services/api'

function BubblesSection() {
  const [friendName, setFriendName] = useState('')
  const [nickname, setNickname] = useState('')
  const [wishText, setWishText] = useState('')
  const [bubbles, setBubbles] = useState([])
  const [floatingMessages, setFloatingMessages] = useState([])
  const [explosions, setExplosions] = useState([])
  const [dragging, setDragging] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [submitting, setSubmitting] = useState(false)
  const [allWishes, setAllWishes] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)

  const handleSubmitWish = async (e) => {
    e.preventDefault()
    if (!wishText.trim() || !friendName.trim() || !nickname.trim()) {
      return
    }

    try {
      setSubmitting(true)
      
      // Lưu lời chúc vào API
      const newWish = await createWish({
        text: wishText,
        friendName: friendName,
        nickname: nickname.trim()
      })
      
      // Tạo bubble UI cho lời chúc mới (chưa xem)
      const newBubble = {
        id: `wish-${newWish.id}`,
        wishId: newWish.id,
        text: wishText,
        friendName: friendName,
        left: Math.random() * 80 + 10,
        top: Math.random() * 60 + 20,
        size: Math.random() * 30 + 60,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#FFB6C1', '#87CEEB'][Math.floor(Math.random() * 8)],
        animationDelay: Math.random() * 2
      }
      setBubbles(prev => [...prev, newBubble])
      
      // Cập nhật allWishes
      setAllWishes(prev => [newWish, ...prev])
      
      // Dispatch event để QuotesSection cập nhật
      window.dispatchEvent(new CustomEvent('wishAdded'))
      
      setWishText('')
      setFriendName('')
      setNickname('')
    } catch (err) {
      console.error('Lỗi khi tạo lời chúc:', err)
      alert('Không thể gửi lời chúc. Vui lòng thử lại.')
      // Xóa bubble nếu API lỗi
      setBubbles(bubbles)
    } finally {
      setSubmitting(false)
    }
  }

  const handleBubbleClick = async (bubble) => {
    // Đánh dấu đã xem nếu có wishId
    if (bubble.wishId) {
      try {
        await markWishAsViewed(bubble.wishId)
        // Cập nhật allWishes
        setAllWishes(prev => prev.map(w => 
          w.id === bubble.wishId ? { ...w, isViewed: true } : w
        ))
      } catch (err) {
        console.error('Lỗi khi đánh dấu đã xem:', err)
      }
    }
    
    // Xóa bong bóng khi click
    setBubbles(prev => prev.filter(b => b.id !== bubble.id))
    
    // Tạo floating message chỉ với lời chúc (không có tên)
    const newMessage = {
      id: bubble.wishId || Date.now(),
      text: bubble.text,
      left: bubble.left,
      top: bubble.top,
      color: bubble.color,
      isDragging: false,
      baseLeft: bubble.left,
      baseTop: bubble.top
    }
    setFloatingMessages(prev => [...prev, newMessage])
    
    // Hiệu ứng nổ
    const explosionId = Date.now()
    setExplosions(prev => [...prev, { id: explosionId, left: bubble.left, top: bubble.top }])
    
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== explosionId))
    }, 1000)
  }

  const handleMouseDown = (e, messageId) => {
    e.preventDefault()
    e.stopPropagation()
    const message = floatingMessages.find(m => m.id === messageId)
    if (message) {
      const rect = e.currentTarget.getBoundingClientRect()
      // Tính offset từ center của element
      const offsetX = e.clientX - (rect.left + rect.width / 2)
      const offsetY = e.clientY - (rect.top + rect.height / 2)
      setDragOffset({ x: offsetX, y: offsetY })
      setDragging(messageId)
    }
  }

  const handleMouseMove = useCallback((e) => {
    if (dragging) {
      setFloatingMessages(prev => {
        const message = prev.find(m => m.id === dragging)
        if (!message) return prev
        
        const newX = ((e.clientX - dragOffset.x) / window.innerWidth) * 100
        const newY = ((e.clientY - dragOffset.y) / window.innerHeight) * 100
        
        // Giới hạn trong viewport
        const clampedX = Math.max(0, Math.min(100, newX))
        const clampedY = Math.max(0, Math.min(100, newY))
        
        return prev.map(msg => 
          msg.id === dragging 
            ? { ...msg, left: clampedX, top: clampedY, isDragging: true, baseLeft: clampedX, baseTop: clampedY }
            : msg
        )
      })
    }
  }, [dragging, dragOffset])

  const handleMouseUp = useCallback(() => {
    setFloatingMessages(prev => prev.map(msg => 
      msg.id === dragging 
        ? { ...msg, isDragging: false }
        : msg
    ))
    setDragging(null)
  }, [dragging])

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragging, handleMouseMove, handleMouseUp])

  // Load tất cả lời chúc (dùng useCallback để tránh re-render)
  const loadAllWishes = useCallback(async () => {
    try {
      const wishes = await getAllWishes()
      if (wishes && wishes.length > 0) {
        setAllWishes(wishes)
        
        // Chỉ admin mới thấy bong bóng (lời chúc chưa xem)
        if (isAdmin) {
          // Tạo bubbles cho lời chúc chưa xem
          const unviewedBubbles = wishes
            .filter(wish => !wish.isViewed)
            .map((wish, index) => ({
              id: `wish-${wish.id}`,
              wishId: wish.id,
              text: wish.text,
              friendName: wish.friendName,
              left: Math.random() * 80 + 10,
              top: Math.random() * 60 + 20,
              size: Math.random() * 30 + 60,
              color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#FFB6C1', '#87CEEB'][Math.floor(Math.random() * 8)],
              animationDelay: index * 0.2
            }))
          setBubbles(unviewedBubbles)
        } else {
          // Người dùng thường không thấy bong bóng
          setBubbles([])
        }
        
        // Tất cả người dùng đều thấy floating messages (lời chúc đã xem)
        const viewedMessages = wishes
          .filter(wish => wish.isViewed)
          .map((wish, index) => ({
            id: wish.id,
            text: wish.text,
            left: Math.random() * 80 + 10,
            top: Math.random() * 60 + 20,
            color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#FFB6C1', '#87CEEB'][Math.floor(Math.random() * 8)],
            isDragging: false,
            baseLeft: Math.random() * 80 + 10,
            baseTop: Math.random() * 60 + 20
          }))
        setFloatingMessages(viewedMessages)
      }
    } catch (err) {
      console.error('Lỗi khi tải lời chúc:', err)
    }
  }, [isAdmin])

  useEffect(() => {
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
    
    loadAllWishes()
    
    // Lắng nghe event khi có lời chúc mới
    const handleWishAdded = () => {
      loadAllWishes()
    }
    
    window.addEventListener('wishAdded', handleWishAdded)
    
    return () => {
      window.removeEventListener('adminStatusChanged', handleAdminStatusChange)
      window.removeEventListener('wishAdded', handleWishAdded)
    }
  }, [isAdmin, loadAllWishes])

  return (
    <section className="bubbles-section" id="bubbles">
      <div className="bubbles-container-wrapper">
        <div className="bubbles-content-card">
          <h2 className="bubbles-title">💬 Viết Lời Chúc Của Bạn</h2>
          
          <form onSubmit={handleSubmitWish} className="bubbles-wish-form">
            <div className="bubbles-input-section">
              <input
                type="text"
                placeholder="Tên của bạn"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="bubbles-name-input"
                required
              />
            </div>

            <div className="bubbles-input-section">
              <input
                type="text"
                placeholder="Biệt danh"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="bubbles-name-input"
                required
              />
            </div>

            <textarea
              placeholder="Nhập lời chúc của bạn..."
              value={wishText}
              onChange={(e) => setWishText(e.target.value)}
              className="bubbles-wish-input"
              rows="4"
              required
            />
            <button type="submit" className="bubbles-wish-button">
              Tạo Bong Bóng 🫧
            </button>
          </form>
        </div>
      </div>

      {/* Bubbles Container */}
      <div className="bubbles-floating-container">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="wish-bubble free-moving"
            style={{
              left: `${bubble.left}%`,
              top: `${bubble.top}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              backgroundColor: bubble.color,
              animationDelay: `${bubble.animationDelay}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
            onClick={() => handleBubbleClick(bubble)}
          >
            <span className="bubble-text">💬</span>
          </div>
        ))}
      </div>

      {/* Floating Messages Container */}
      <div className="floating-messages-container">
        {floatingMessages.map((message, index) => {
          const isCurrentlyDragging = dragging === message.id
          const uniqueId = message.id
          const animationDuration = `${20 + Math.random() * 10}s`
          const animationDelay = `${index * 0.5}s`
          
          return (
            <div
              key={uniqueId}
              className={`floating-message ${isCurrentlyDragging ? 'dragging' : 'free-moving-text'}`}
              style={{
                left: `${message.left}%`,
                top: `${message.top}%`,
                color: message.color,
                animationDelay: isCurrentlyDragging ? '0s' : animationDelay,
                animationDuration: isCurrentlyDragging ? 'none' : animationDuration,
                cursor: isCurrentlyDragging ? 'grabbing' : 'grab',
                transform: isCurrentlyDragging ? 'translate(-50%, -50%)' : undefined
              }}
              onMouseDown={(e) => handleMouseDown(e, message.id)}
            >
              <div className="floating-message-content">
                <div className="floating-message-text">{message.text}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Explosions Container */}
      <div className="explosions-container">
        {explosions.map((explosion) => (
          <div
            key={explosion.id}
            className="explosion-effect"
            style={{
              left: `${explosion.left}%`,
              top: `${explosion.top}%`
            }}
          >
            <div className="explosion-particle"></div>
            <div className="explosion-particle"></div>
            <div className="explosion-particle"></div>
            <div className="explosion-particle"></div>
            <div className="explosion-particle"></div>
            <div className="explosion-particle"></div>
            <div className="explosion-particle"></div>
            <div className="explosion-particle"></div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default BubblesSection

