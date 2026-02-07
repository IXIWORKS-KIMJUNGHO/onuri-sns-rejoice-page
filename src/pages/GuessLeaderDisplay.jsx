import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { database } from '../lib/firebase'
import { ref, onValue, get } from 'firebase/database'
import './GuessLeaderGame.css'

const TOTAL_STEPS = 12
const CIRCLE_SIZES = [5, 8, 12, 17, 23, 30, 38, 47, 57, 70, 85, 100]

function GuessLeaderDisplay() {
  const [searchParams] = useSearchParams()
  const roomCodeFromUrl = searchParams.get('room') || ''

  const [screen, setScreen] = useState(roomCodeFromUrl ? 'connecting' : 'enter-code')
  const [roomCode, setRoomCode] = useState(roomCodeFromUrl)
  const [inputCode, setInputCode] = useState('')
  const [error, setError] = useState('')

  // Game state from Firebase
  const [status, setStatus] = useState('waiting')
  const [images, setImages] = useState([])
  const [currentRound, setCurrentRound] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [showComplete, setShowComplete] = useState(false)
  const [totalRounds, setTotalRounds] = useState(0)
  const [glowSize, setGlowSize] = useState(0)
  const [isGameReady, setIsGameReady] = useState(false)

  const imageContainerRef = useRef(null)
  const prevRoundRef = useRef(0)

  // Connect to room on mount if room code in URL
  useEffect(() => {
    if (roomCodeFromUrl) {
      connectToRoom(roomCodeFromUrl)
    }
  }, [])

  async function connectToRoom(code) {
    setError('')
    try {
      const roomRef = ref(database, `rooms/guessLeader/${code}`)
      const snapshot = await get(roomRef)

      if (!snapshot.exists()) {
        setError('존재하지 않는 방입니다.')
        setScreen('enter-code')
        return
      }

      setRoomCode(code)
      setScreen('display')
    } catch (e) {
      setError('연결할 수 없습니다. 인터넷 연결을 확인해주세요.')
      setScreen('enter-code')
    }
  }

  function handleJoin() {
    const code = inputCode.trim()
    if (!code || code.length !== 6) {
      setError('6자리 방 코드를 입력해주세요.')
      return
    }
    connectToRoom(code)
  }

  // Listen to room data
  useEffect(() => {
    if (!roomCode || screen !== 'display') return

    const roomRef = ref(database, `rooms/guessLeader/${roomCode}`)
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        setScreen('ended')
        return
      }

      setStatus(data.status || 'waiting')
      setTotalRounds(data.totalRounds || 0)

      if (data.status === 'playing' && data.images) {
        // Check if round changed
        if (data.currentRound !== prevRoundRef.current) {
          setIsGameReady(false)
          prevRoundRef.current = data.currentRound
        }

        setImages(data.images)
        setCurrentRound(data.currentRound || 0)
        setCurrentStep(data.currentStep || 0)
        setShowComplete(data.showComplete || false)
      }

      if (data.status === 'ended') {
        setScreen('ended')
      }
    })

    return () => unsubscribe()
  }, [roomCode, screen])

  // Game ready delay (prevent image flash before clipPath applies)
  useEffect(() => {
    if (status !== 'playing') {
      setIsGameReady(false)
      return
    }

    // Delay to ensure clipPath is applied before showing image
    setIsGameReady(false)
    const timer = setTimeout(() => setIsGameReady(true), 150)
    return () => clearTimeout(timer)
  }, [status, currentRound])

  // Glow size calculation
  useEffect(() => {
    if (status !== 'playing' || !imageContainerRef.current) return

    const updateGlowSize = () => {
      const container = imageContainerRef.current
      if (!container) return
      const containerSize = Math.min(container.offsetWidth, container.offsetHeight)
      setGlowSize((containerSize * CIRCLE_SIZES[currentStep] * 2) / 100)
    }

    updateGlowSize()
    window.addEventListener('resize', updateGlowSize)
    return () => window.removeEventListener('resize', updateGlowSize)
  }, [currentStep, status])

  const currentImage = images[currentRound] || {}
  const currentSize = CIRCLE_SIZES[currentStep]
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100

  return (
    <div className="glg glg--display">
      <div className="glg__bg"></div>

      {/* Enter Code Screen */}
      {screen === 'enter-code' && (
        <div className="glg__screen glg__lobby">
          <Link to="/recreation/guess-leader" className="glg__back-link">← 돋보기 탐구생활</Link>
          <h1 className="glg__title">프로젝터<br />디스플레이</h1>
          <p className="glg__subtitle">프로젝터에 표시할 화면입니다</p>

          {error && <div className="glg__error">{error}</div>}

          <div className="glg__lobby-card">
            <div className="glg__lobby-card-icon">📺</div>
            <h3 className="glg__lobby-card-title">방 코드 입력</h3>
            <p className="glg__lobby-card-desc">호스트가 생성한 방 코드를 입력하세요</p>
            <input
              className="glg__input glg__input--code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="방 코드 6자리"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
            <button
              className="glg__btn glg__btn--primary"
              onClick={handleJoin}
            >
              연결하기
            </button>
          </div>
        </div>
      )}

      {/* Connecting Screen */}
      {screen === 'connecting' && (
        <div className="glg__screen glg__waiting">
          <div className="glg__waiting-animation">
            <div className="glg__waiting-ring"></div>
            <div className="glg__waiting-ring glg__waiting-ring--2"></div>
            <div className="glg__waiting-ring glg__waiting-ring--3"></div>
          </div>
          <p className="glg__waiting-text">연결 중...</p>
        </div>
      )}

      {/* Display Screen */}
      {screen === 'display' && (
        <div className="glg__screen glg__display-screen">
          {/* Waiting for game to start */}
          {(status === 'setting' || status === 'waiting') && (
            <div className="glg__display-waiting">
              <div className="glg__display-waiting-icon">🔍</div>
              <h1 className="glg__display-waiting-title">1교시 돋보기 탐구생활</h1>
              <p className="glg__display-waiting-subtitle">호스트가 게임을 준비하고 있습니다...</p>
              <div className="glg__waiting-animation glg__waiting-animation--small">
                <div className="glg__waiting-ring"></div>
                <div className="glg__waiting-ring glg__waiting-ring--2"></div>
                <div className="glg__waiting-ring glg__waiting-ring--3"></div>
              </div>
            </div>
          )}

          {/* Game playing */}
          {status === 'playing' && images.length > 0 && (
            <div className="glg__game glg__game--display">
              <div className="glg__display-header">
                <div className="glg__display-badge">📺 프로젝터 화면</div>
                <div className="glg__round-display glg__round-display--large">
                  ROUND {currentRound + 1} / {totalRounds}
                </div>
              </div>

              <div className="glg__progress-info glg__progress-info--display">
                <div className="glg__step-counter glg__step-counter--large">
                  {currentStep + 1} / {TOTAL_STEPS}
                </div>
                <div className="glg__progress-bar glg__progress-bar--large">
                  <div className="glg__progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="glg__image-container glg__image-container--display" ref={imageContainerRef}>
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

              {/* Complete Overlay */}
              {showComplete && (
                <div className="glg__complete-overlay">
                  <div className="glg__complete-content glg__complete-content--display">
                    <div className="glg__complete-title glg__complete-title--large">🎉 정답!</div>
                    <img className="glg__complete-image glg__complete-image--display" src={currentImage.url} alt="완성" />
                    {currentRound < totalRounds - 1 && (
                      <p className="glg__auto-next">다음 라운드를 준비하고 있습니다...</p>
                    )}
                    {currentRound >= totalRounds - 1 && (
                      <p className="glg__auto-next glg__auto-next--final">🎊 모든 라운드 완료!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ended Screen */}
      {screen === 'ended' && (
        <div className="glg__screen glg__ended">
          <div className="glg__ended-icon">🏆</div>
          <h2 className="glg__ended-title">게임 종료!</h2>
          <p className="glg__ended-subtitle">수고하셨습니다</p>

          <button className="glg__btn glg__btn--primary" onClick={() => window.location.reload()}>
            새로고침
          </button>
        </div>
      )}
    </div>
  )
}

export default GuessLeaderDisplay
