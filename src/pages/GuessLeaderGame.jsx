import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './GuessLeaderGame.css'

const TOTAL_STEPS = 12
const CIRCLE_SIZES = [5, 8, 12, 17, 23, 30, 38, 47, 57, 70, 85, 100]

function resizeImage(file, minWidth = 1024) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height
        if (width < minWidth) {
          const scale = minWidth / width
          width = minWidth
          height = Math.round(height * scale)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.9))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

function GuessLeaderGame() {
  const [screen, setScreen] = useState('upload')
  const [images, setImages] = useState([])
  const [positionIndex, setPositionIndex] = useState(0)
  const [currentRound, setCurrentRound] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [showComplete, setShowComplete] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [glowSize, setGlowSize] = useState(0)

  const fileInputRef = useRef(null)
  const imageContainerRef = useRef(null)
  const autoNextTimerRef = useRef(null)
  const revealTimerRef = useRef(null)

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

  // Game step navigation
  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1 && !showComplete) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, showComplete])

  const prevStep = useCallback(() => {
    if (currentStep > 0 && !showComplete) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep, showComplete])

  // Show complete after reaching last step
  useEffect(() => {
    if (currentStep !== TOTAL_STEPS - 1 || screen !== 'game') return

    revealTimerRef.current = setTimeout(() => setShowComplete(true), 800)
    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
    }
  }, [currentStep, screen])

  // Auto-advance after complete (not last round)
  useEffect(() => {
    if (!showComplete || screen !== 'game') return
    if (currentRound >= images.length - 1) return

    autoNextTimerRef.current = setTimeout(() => {
      setShowComplete(false)
      setCurrentRound(prev => prev + 1)
      setCurrentStep(0)
    }, 2000)

    return () => {
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current)
    }
  }, [showComplete, screen, currentRound, images.length])

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
    }
  }, [])

  const handleNextRound = () => {
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current)
    setShowComplete(false)
    if (currentRound >= images.length - 1) {
      resetGame()
    } else {
      setCurrentRound(prev => prev + 1)
      setCurrentStep(0)
    }
  }

  const resetGame = () => {
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current)
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
    setImages([])
    setCurrentRound(0)
    setCurrentStep(0)
    setPositionIndex(0)
    setShowComplete(false)
    setScreen('upload')
  }

  const currentImage = images[currentRound] || {}
  const currentSize = CIRCLE_SIZES[currentStep]
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100
  const positionImage = images[positionIndex] || {}
  const hasPosition = positionImage.centerX !== 50 || positionImage.centerY !== 50

  return (
    <div className="glg">
      <div className="glg__bg"></div>

      {/* Upload Screen */}
      {screen === 'upload' && (
        <div className="glg__screen glg__upload">
          <Link to="/recreation" className="glg__back-link">← 레크레이션 목록</Link>
          <h1 className="glg__title">REJOICE<br />누구일까요?</h1>
          <p className="glg__subtitle">점점 커지는 원 안에서 사진 속 인물을 맞혀보세요!</p>

          <div className="glg__admin-badge">
            ⚙️ <strong>진행자 설정 화면</strong> - 참가자들이 보지 않도록 주의하세요!
          </div>

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

          <button
            className="glg__btn glg__btn--primary"
            disabled={images.length === 0}
            onClick={() => { setPositionIndex(0); setScreen('position') }}
          >
            다음
          </button>
        </div>
      )}

      {/* Position Screen */}
      {screen === 'position' && (
        <div className="glg__screen glg__position">
          <div className="glg__admin-badge">
            ⚙️ <strong>진행자 설정 중</strong> - 화면 가리고 진행하세요
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
                else setScreen('intro')
              }}
            >
              {positionIndex === images.length - 1 ? '세팅 완료' : '다음'} ({positionIndex + 1}/{images.length})
            </button>
          </div>
        </div>
      )}

      {/* Intro Screen */}
      {screen === 'intro' && (
        <div className="glg__screen glg__intro">
          <h1 className="glg__intro-title">REJOICE<br />누구일까요?</h1>
          <p className="glg__intro-subtitle">점점 커지는 원 안에서<br />사진 속 인물을 맞혀보세요!</p>

          <div className="glg__intro-info">
            <div className="glg__intro-count">{images.length} ROUND{images.length > 1 ? 'S' : ''}</div>
            <div className="glg__intro-label">준비되었습니다</div>
          </div>

          <div className="glg__intro-instructions">
            <h3>게임 방법</h3>
            <ul>
              <li>작은 원에서 시작해 점점 확대됩니다</li>
              <li>화살표(→) 또는 스페이스바로 진행</li>
              <li>누구의 얼굴인지 맞춰보세요!</li>
              <li>각 라운드마다 12단계로 확대됩니다</li>
            </ul>
          </div>

          <button
            className="glg__btn glg__btn--primary glg__btn--large"
            onClick={() => { setCurrentRound(0); setCurrentStep(0); setShowComplete(false); setScreen('game') }}
          >
            🎮 게임 시작하기
          </button>
        </div>
      )}

      {/* Game Screen */}
      {screen === 'game' && (
        <div className="glg__screen glg__game">
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
                className="glg__full-image"
                src={currentImage.url}
                alt="게임 이미지"
                style={{
                  clipPath: `circle(${currentSize}% at ${currentImage.centerX}% ${currentImage.centerY}%)`
                }}
              />
              <div
                className="glg__glow-effect"
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
                다시 시작
              </button>
              <button className="glg__btn glg__btn--reveal glg__btn--small" onClick={() => setShowComplete(true)}>
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
                {currentRound < images.length - 1 && (
                  <p className="glg__auto-next">⏱️ 잠시 후 다음 라운드로 이동합니다...</p>
                )}
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
