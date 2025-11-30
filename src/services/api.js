// API Base URL - Thay đổi theo địa chỉ backend của bạn
const API_BASE_URL = 'http://localhost:8080/api'

// Helper function để xử lý response
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = 'Có lỗi xảy ra'
    try {
      const error = await response.json()
      errorMessage = error.error || error.message || errorMessage
    } catch (e) {
      // Nếu không parse được JSON, dùng status text
      errorMessage = response.statusText || errorMessage
    }
    throw new Error(errorMessage)
  }
  
  // Nếu response không có body (như DELETE 204), trả về null
  if (response.status === 204) {
    return null
  }
  
  return response.json()
}

// Helper function để tạo request options
const createRequestOptions = (method, body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }
  
  if (body) {
    options.body = JSON.stringify(body)
  }
  
  return options
}

// ==================== WISHES API ====================

/**
 * Lấy tất cả lời chúc
 * @returns {Promise<Array>} Danh sách lời chúc
 */
export const getAllWishes = async () => {
  const response = await fetch(`${API_BASE_URL}/wishes`)
  return handleResponse(response)
}

/**
 * Tạo lời chúc mới
 * @param {Object} wishData - Dữ liệu lời chúc { text, friendName, nickname }
 * @returns {Promise<Object>} Lời chúc đã tạo
 */
export const createWish = async (wishData) => {
  const response = await fetch(
    `${API_BASE_URL}/wishes`,
    createRequestOptions('POST', wishData)
  )
  return handleResponse(response)
}

/**
 * Cập nhật lời chúc
 * @param {number} id - ID của lời chúc
 * @param {Object} wishData - Dữ liệu lời chúc cần cập nhật
 * @returns {Promise<Object>} Lời chúc đã cập nhật
 */
export const updateWish = async (id, wishData) => {
  const response = await fetch(
    `${API_BASE_URL}/wishes/${id}`,
    createRequestOptions('PUT', wishData)
  )
  return handleResponse(response)
}

/**
 * Xóa lời chúc
 * @param {number} id - ID của lời chúc
 * @returns {Promise<void>}
 */
export const deleteWish = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/wishes/${id}`,
    createRequestOptions('DELETE')
  )
  return handleResponse(response)
}

/**
 * Đánh dấu lời chúc đã xem
 * @param {number} id - ID của lời chúc
 * @returns {Promise<Object>} Lời chúc đã cập nhật
 */
export const markWishAsViewed = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/wishes/${id}/mark-viewed`,
    createRequestOptions('PUT')
  )
  return handleResponse(response)
}

// ==================== PHOTOS API ====================

/**
 * Lấy tất cả ảnh
 * @returns {Promise<Array>} Danh sách ảnh
 */
export const getAllPhotos = async () => {
  const response = await fetch(`${API_BASE_URL}/photos`)
  return handleResponse(response)
}

/**
 * Tạo ảnh mới
 * @param {Object} photoData - Dữ liệu ảnh { url, caption }
 * @returns {Promise<Object>} Ảnh đã tạo
 */
export const createPhoto = async (photoData) => {
  const response = await fetch(
    `${API_BASE_URL}/photos`,
    createRequestOptions('POST', photoData)
  )
  return handleResponse(response)
}

/**
 * Upload ảnh lên Cloudinary và tạo ảnh mới
 * @param {File} file - File ảnh cần upload
 * @param {string} caption - Tiêu đề ảnh
 * @returns {Promise<Object>} Ảnh đã tạo với URL từ Cloudinary
 */
export const uploadPhoto = async (file, caption) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('caption', caption || file.name.replace(/\.[^/.]+$/, '') || 'Ảnh mới')
  
  const response = await fetch(
    `${API_BASE_URL}/photos/upload`,
    {
      method: 'POST',
      body: formData
    }
  )
  return handleResponse(response)
}

/**
 * Cập nhật ảnh
 * @param {number} id - ID của ảnh
 * @param {Object} photoData - Dữ liệu ảnh cần cập nhật
 * @returns {Promise<Object>} Ảnh đã cập nhật
 */
export const updatePhoto = async (id, photoData) => {
  const response = await fetch(
    `${API_BASE_URL}/photos/${id}`,
    createRequestOptions('PUT', photoData)
  )
  return handleResponse(response)
}

/**
 * Xóa ảnh
 * @param {number} id - ID của ảnh
 * @returns {Promise<void>}
 */
export const deletePhoto = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/photos/${id}`,
    createRequestOptions('DELETE')
  )
  return handleResponse(response)
}

/**
 * Khóa/Mở khóa ảnh
 * @param {number} id - ID của ảnh
 * @returns {Promise<Object>} Ảnh đã cập nhật
 */
export const toggleLockPhoto = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/photos/${id}/toggle-lock`,
    createRequestOptions('PUT')
  )
  return handleResponse(response)
}

// ==================== VIDEOS API ====================

/**
 * Lấy tất cả video
 * @returns {Promise<Array>} Danh sách video
 */
export const getAllVideos = async () => {
  const response = await fetch(`${API_BASE_URL}/videos`)
  return handleResponse(response)
}

/**
 * Tạo video mới
 * @param {Object} videoData - Dữ liệu video { title, url, type, description }
 * @returns {Promise<Object>} Video đã tạo
 */
export const createVideo = async (videoData) => {
  const response = await fetch(
    `${API_BASE_URL}/videos`,
    createRequestOptions('POST', videoData)
  )
  return handleResponse(response)
}

/**
 * Upload video lên Cloudinary và tạo video mới
 * @param {File} file - File video cần upload
 * @param {string} title - Tiêu đề video
 * @param {string} description - Mô tả video
 * @returns {Promise<Object>} Video đã tạo với URL từ Cloudinary
 */
export const uploadVideo = async (file, title, description) => {
  const formData = new FormData()
  formData.append('file', file)
  if (title) formData.append('title', title)
  if (description) formData.append('description', description)
  
  const response = await fetch(
    `${API_BASE_URL}/videos/upload`,
    {
      method: 'POST',
      body: formData
    }
  )
  return handleResponse(response)
}

/**
 * Cập nhật video
 * @param {number} id - ID của video
 * @param {Object} videoData - Dữ liệu video cần cập nhật
 * @returns {Promise<Object>} Video đã cập nhật
 */
export const updateVideo = async (id, videoData) => {
  const response = await fetch(
    `${API_BASE_URL}/videos/${id}`,
    createRequestOptions('PUT', videoData)
  )
  return handleResponse(response)
}

/**
 * Xóa video
 * @param {number} id - ID của video
 * @returns {Promise<void>}
 */
export const deleteVideo = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/videos/${id}`,
    createRequestOptions('DELETE')
  )
  return handleResponse(response)
}

/**
 * Khóa/Mở khóa video
 * @param {number} id - ID của video
 * @returns {Promise<Object>} Video đã cập nhật
 */
export const toggleLockVideo = async (id) => {
  const response = await fetch(
    `${API_BASE_URL}/videos/${id}/toggle-lock`,
    createRequestOptions('PUT')
  )
  return handleResponse(response)
}

