import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { database } from '../lib/firebase'
import { ref, set, get, onValue, remove, onDisconnect } from 'firebase/database'
import './GuessLeaderGame.css'

const TOTAL_STEPS = 12
const CIRCLE_SIZES = [5, 8, 12, 17, 23, 30, 38, 47, 57, 70, 85, 100]

function generateRoomCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function resizeImage(file, maxWidth = 800) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height
        if (width > maxWidth) {
          const scale = maxWidth / width
          width = maxWidth
          height = Math.round(height * scale)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

function GuessLeaderGame() {
  const [screen, setScreen] = useState('lobby')
  const [roomCode, setRoomCode] = useState('')
  const [images, setImages] = useState([])
  const [positionIndex, setPositionIndex] = useState(0)
  const [currentRound, setCurrentRound] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [showComplete, setShowComplete] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [glowSize, setGlowSize] = useState(0)
  const [isGameReady, setIsGameReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const fileInputRef = useRef(null)
  const imageContainerRef = useRef(null)
  const autoNextTimerRef = useRef(null)
  const revealTimerRef = useRef(null)
  const disconnectRefs = useRef([])

  // Handle file upload
  const handleFiles = async (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    const newImages = []
    for (const file of imageFiles) {
      const url = await resizeImage(file)
      newImages.push({ url, centerX: 50, centerY: 50 })
    }
    setImages(prev => [...prev, ...newImages])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) handleFiles(files)
  }

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) handleFiles(e.target.files)
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // Position click
  const handlePositionClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = ((e.clientX - rect.left) / rect.width) * 100
    const centerY = ((e.clientY - rect.top) / rect.height) * 100
    setImages(prev => {
      const updated = [...prev]
      updated[positionIndex] = { ...updated[positionIndex], centerX, centerY }
      return updated
    })
  }

  // Create room
  async function createRoom() {
    setIsLoading(true)
    setError('')
    try {
      const code = generateRoomCode()
      const roomRef = ref(database, `rooms/guessLeader/${code}`)
      const snapshot = await get(roomRef)

      if (snapshot.exists()) {
        setIsLoading(false)
        return createRoom()
      }

      await set(roomRef, {
        status: 'setting',
        createdAt: Date.now(),
      })

      const disconnectRefObj = onDisconnect(roomRef)
      disconnectRefObj.remove()
      disconnectRefs.current.push(() => remove(roomRef))

      setRoomCode(code)
      setScreen('upload')
    } catch (e) {
      setError('방을 만들 수 없습니다. 인터넷 연결을 확인해주세요.')
    }
    setIsLoading(false)
  }

  // Save images to Firebase and start game
  async function saveAndStartGame() {
    setIsLoading(true)
    try {
      await set(ref(database, `rooms/guessLeader/${roomCode}`), {
        status: 'playing',
        images: images,
        currentRound: 0,
        currentStep: 0,
        showComplete: false,
        totalRounds: images.length,
        createdAt: Date.now(),
      })
      setCurrentRound(0)
      setCurrentStep(0)
      setShowComplete(false)
      setScreen('game')
    } catch (e) {
      setError('게임을 시작할 수 없습니다.')
    }
    setIsLoading(false)
  }

  // Sync game state to Firebase
  async function syncGameState(updates) {
    if (!roomCode) return
    try {
      const roomRef = ref(database, `rooms/guessLeader/${roomCode}`)
      const snapshot = await get(roomRef)
      if (snapshot.exists()) {
        await set(roomRef, { ...snapshot.val(), ...updates })
      }
    } catch (e) {
      console.error('Sync error:', e)
    }
  }

  // Game step navigation
  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1 && !showComplete) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      syncGameState({ currentStep: newStep })
    }
  }, [currentStep, showComplete, roomCode])

  const prevStep = useCallback(() => {
    if (currentStep > 0 && !showComplete) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      syncGameState({ currentStep: newStep })
    }
  }, [currentStep, showComplete, roomCode])

  // Reveal answer
  const revealAnswer = useCallback(() => {
    setShowComplete(true)
    syncGameState({ showComplete: true })
  }, [roomCode])

  // Show complete after reaching last step
  useEffect(() => {
    if (currentStep !== TOTAL_STEPS - 1 || screen !== 'game') return

    revealTimerRef.current = setTimeout(() => {
      setShowComplete(true)
      syncGameState({ showComplete: true })
    }, 800)
    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
    }
  }, [currentStep, screen])

  // Game ready delay (prevent image flash before clipPath applies)
  useEffect(() => {
    if (screen !== 'game') {
      setIsGameReady(false)
      return
    }

    // Delay to ensure clipPath is applied before showing image
    const timer = setTimeout(() => setIsGameReady(true), 150)
    return () => clearTimeout(timer)
  }, [screen, currentRound])

  // Glow size calculation
  useEffect(() => {
    if (screen !== 'game' || !imageContainerRef.current) return

    const updateGlowSize = () => {
      const container = imageContainerRef.current
      if (!container) return
      const containerSize = Math.min(container.offsetWidth, container.offsetHeight)
      setGlowSize((containerSize * CIRCLE_SIZES[currentStep] * 2) / 100)
    }

    updateGlowSize()
    window.addEventListener('resize', updateGlowSize)
    return () => window.removeEventListener('resize', updateGlowSize)
  }, [currentStep, screen])

  // Keyboard controls
  useEffect(() => {
    if (screen !== 'game' || showComplete) return
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextStep()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevStep()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [screen, showComplete, nextStep, prevStep])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current)
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
      disconnectRefs.current.forEach((fn) => {
        try { fn() } catch (e) { /* ignore */ }
      })
    }
  }, [])

  const handleNextRound = async () => {
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current)
    setShowComplete(false)
    setIsGameReady(false)

    if (currentRound >= images.length - 1) {
      // End game
      await syncGameState({ status: 'ended', showComplete: false })
      resetGame()
    } else {
      const newRound = currentRound + 1
      setCurrentRound(newRound)
      setCurrentStep(0)
      await syncGameState({ currentRound: newRound, currentStep: 0, showComplete: false })
    }
  }

  const resetGame = () => {
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current)
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
    if (roomCode) {
      remove(ref(database, `rooms/guessLeader/${roomCode}`))
    }
    setImages([])
    setCurrentRound(0)
    setCurrentStep(0)
    setPositionIndex(0)
    setShowComplete(false)
    setRoomCode('')
    setScreen('lobby')
  }

  function copyRoomCode() {
    navigator.clipboard?.writeText(roomCode)
  }

  const currentImage = images[currentRound] || {}
  const currentSize = CIRCLE_SIZES[currentStep]
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100
  const positionImage = images[positionIndex] || {}
  const hasPosition = positionImage.centerX !== 50 || positionImage.centerY !== 50

  return (
    <div className="glg">
      <div className="glg__bg"></div>

      {/* Lobby Screen */}
      {screen === 'lobby' && (
        <div className="glg__screen glg__lobby">
          <Link to="/recreation" className="glg__back-link">← 레크레이션 목록</Link>
          <h1 className="glg__title">1교시 돋보기 탐구생활</h1>
          <p className="glg__subtitle">점점 커지는 원 안에서 사진 속 인물을 맞혀보세요!</p>

          {error && <div className="glg__error">{error}</div>}

          <div className="glg__lobby-card">
            <div className="glg__lobby-card-icon">🎤</div>
            <h3 className="glg__lobby-card-title">호스트</h3>
            <p className="glg__lobby-card-desc">사진을 업로드하고 게임을 진행합니다</p>
            <button
              className="glg__btn glg__btn--primary"
              onClick={createRoom}
              disabled={isLoading}
            >
              {isLoading ? '생성 중...' : '방 만들기'}
            </button>
          </div>
        </div>
      )}

      {/* Upload Screen */}
      {screen === 'upload' && (
        <div className="glg__screen glg__upload">
          <div className="glg__admin-badge">
            🎤 <strong>호스트 화면</strong> - 프로젝터에는 디스플레이 화면을 띄우세요!
          </div>

          <div className="glg__projector-link-section">
            <h3 className="glg__projector-link-title">📺 프로젝터 화면 URL</h3>
            <div
              className="glg__projector-link"
              onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}#/recreation/guess-leader/display?room=${roomCode}`)}
              title="클릭하여 복사"
            >
              {`${window.location.origin}/...display?room=${roomCode}`}
            </div>
            <p className="glg__room-code-hint">터치하면 복사됩니다</p>
          </div>

          <h2 className="glg__section-title">사진 업로드</h2>

          <div
            className={`glg__upload-area ${isDragOver ? 'glg__upload-area--dragover' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="glg__upload-icon">📸</div>
            <p className="glg__upload-text">사진들을 드래그하거나 클릭해서 업로드</p>
            <p className="glg__upload-hint">여러 장을 한번에 선택할 수 있어요!</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {images.length > 0 && (
            <>
              <div className="glg__uploaded-grid">
                {images.map((img, index) => (
                  <div key={index} className="glg__uploaded-item">
                    <img src={img.url} alt={`이미지 ${index + 1}`} />
                    <span className="glg__uploaded-badge">R{index + 1}</span>
                    <button
                      className="glg__uploaded-remove"
                      onClick={(e) => { e.stopPropagation(); removeImage(index) }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <p className="glg__image-count">총 {images.length}장의 사진</p>
            </>
          )}

          <div className="glg__actions">
            <button className="glg__btn glg__btn--secondary" onClick={resetGame}>
              나가기
            </button>
            <button
              className="glg__btn glg__btn--primary"
              disabled={images.length === 0}
              onClick={() => { setPositionIndex(0); setScreen('position') }}
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* Position Screen */}
      {screen === 'position' && (
        <div className="glg__screen glg__position">
          <div className="glg__admin-badge">
            🎤 <strong>호스트 설정 중</strong> - 프로젝터에는 대기 화면이 표시됩니다
          </div>

          <h2 className="glg__position-title">📍 시작 위치 선택</h2>
          <div className="glg__round-info">ROUND {positionIndex + 1}</div>
          <p className="glg__position-subtitle">이미지를 클릭해서 확대를 시작할 위치를 선택하세요</p>

          <div className="glg__preview-container" onClick={handlePositionClick}>
            <img className="glg__preview-image" src={positionImage.url} alt="미리보기" />
            {hasPosition && (
              <div
                className="glg__position-marker"
                style={{ left: `${positionImage.centerX}%`, top: `${positionImage.centerY}%` }}
              />
            )}
          </div>

          <div className="glg__position-controls">
            <button
              className="glg__btn glg__btn--secondary"
              onClick={() => {
                if (positionIndex > 0) setPositionIndex(prev => prev - 1)
                else setScreen('upload')
              }}
            >
              이전
            </button>
            <button
              className="glg__btn glg__btn--primary"
              onClick={() => {
                if (positionIndex < images.length - 1) setPositionIndex(prev => prev + 1)
                else setScreen('ready')
              }}
            >
              {positionIndex === images.length - 1 ? '세팅 완료' : '다음'} ({positionIndex + 1}/{images.length})
            </button>
          </div>
        </div>
      )}

      {/* Ready Screen */}
      {screen === 'ready' && (
        <div className="glg__screen glg__ready">
          <div className="glg__admin-badge">
            🎤 <strong>호스트 화면</strong>
          </div>

          <h1 className="glg__intro-title">준비 완료!</h1>
          <p className="glg__intro-subtitle">프로젝터 연결을 확인하고<br />게임을 시작하세요</p>

          <div className="glg__intro-info">
            <div className="glg__intro-count">{images.length} ROUND{images.length > 1 ? 'S' : ''}</div>
            <div className="glg__intro-label">준비되었습니다</div>
          </div>

          <div className="glg__actions">
            <button className="glg__btn glg__btn--secondary" onClick={() => setScreen('position')}>
              다시 설정
            </button>
            <button
              className="glg__btn glg__btn--primary glg__btn--large"
              onClick={saveAndStartGame}
              disabled={isLoading}
            >
              {isLoading ? '준비 중...' : '🎮 게임 시작하기'}
            </button>
          </div>
        </div>
      )}

      {/* Game Screen */}
      {screen === 'game' && (
        <div className="glg__screen glg__game">
          <div className="glg__admin-badge glg__admin-badge--game">
            🎤 호스트 컨트롤
          </div>

          {/* Host thumbnail */}
          <div className="glg__host-thumbnail">
            <img src={currentImage.url} alt="정답" />
            <span className="glg__host-thumbnail-label">정답</span>
          </div>

          <div className="glg__game-container">
            <div className="glg__progress-info">
              <div className="glg__round-display">ROUND {currentRound + 1}</div>
              <div className="glg__step-counter">{currentStep + 1} / {TOTAL_STEPS}</div>
              <div className="glg__progress-bar">
                <div className="glg__progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="glg__image-container" ref={imageContainerRef}>
              <img
                className={`glg__full-image ${isGameReady ? 'glg__full-image--ready' : ''}`}
                src={currentImage.url}
                alt="게임 이미지"
                style={{
                  clipPath: `circle(${currentSize}% at ${currentImage.centerX}% ${currentImage.centerY}%)`
                }}
              />
              <div
                className={`glg__glow-effect ${isGameReady ? 'glg__glow-effect--ready' : ''}`}
                style={{
                  width: `${glowSize}px`,
                  height: `${glowSize}px`,
                  left: `${currentImage.centerX}%`,
                  top: `${currentImage.centerY}%`,
                }}
              />
            </div>

            <div className="glg__controls">
              <button className="glg__btn glg__btn--secondary glg__btn--small" onClick={resetGame}>
                게임 종료
              </button>
              <button className="glg__btn glg__btn--reveal glg__btn--small" onClick={revealAnswer}>
                정답 공개
              </button>
              <button className="glg__btn glg__btn--primary glg__btn--small" onClick={nextStep}>
                다음 단계
              </button>
            </div>

            <p className="glg__instructions">
              키보드 화살표(→) 또는 스페이스바를 눌러 진행하세요
            </p>
          </div>

          {/* Complete Overlay */}
          {showComplete && (
            <div className="glg__complete-overlay">
              <div className="glg__complete-content">
                <div className="glg__complete-title">🎉 정답!</div>
                <img className="glg__complete-image" src={currentImage.url} alt="완성" />
                <button className="glg__btn glg__btn--primary" onClick={handleNextRound}>
                  {currentRound >= images.length - 1
                    ? '🎊 모든 라운드 완료! 다시 하기'
                    : `다음 라운드 (${currentRound + 2}/${images.length})`
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GuessLeaderGame
