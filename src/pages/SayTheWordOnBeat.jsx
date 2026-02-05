import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './SayTheWordOnBeat.css'

// 난이도별 음악 파일 경로 (쉬움/어려움은 보통 음악을 속도 조절해서 사용)
const BEAT_URLS = {
  easy: '/normalbeat.mp3',    // 쉬움: 보통 음악을 느리게 재생
  normal: '/normalbeat.mp3',  // 보통용 음악
  hard: '/normalbeat.mp3',    // 어려움: 보통 음악을 빠르게 재생
}

// BPM 설정 (challenge music = 186 BPM 기준, 93의 2배)
const BPM_CONFIG = {
  easy: { start: 186, increment: 20 },   // 186, 206, 226, 246, 266
  normal: { start: 220, increment: 30 }, // 220, 250, 280, 310, 340
  hard: { start: 260, increment: 40 },   // 260, 300, 340, 380, 420
}

const TOTAL_ROUNDS = 2
const CYCLES_PER_ROUND = 4  // 라운드당 미리보기-챌린지 반복 횟수
const PHOTOS_PER_ROUND = 8  // 2x4 그리드
const MIN_PHOTOS_REQUIRED = 2
// Round 1 기준 preview 시간 (ms)
const BASE_PREVIEW_DURATIONS = [5600, 2890, 2990, 2990] // 사이클 1,2,3,4 (각 100ms 앞당김)
// Round 1 기준 challenge 시간 (ms)
const BASE_CHALLENGE_DURATION = 2210 // 8장 기준
// 난이도별 라운드 속도 배율 (보통 기준 1.0)
const ROUND_SPEED = {
  easy: [0.95, 0.98],    // 쉬움: Round 1 = 0.95배, Round 2 = 0.98배
  normal: [1.0, 1.02],   // 보통: Round 1 = 1.0배, Round 2 = 1.02배
  hard: [1.05, 1.1],     // 어려움: Round 1 = 1.05배, Round 2 = 1.1배
}

// Preview 사진 등장 딜레이 (사이클별, preview 시작 기준)
const PHOTO_ANIM_DELAYS = [2500, 0, 0, 0] // 사이클 1,2,3,4
// BPM 기반 사진 등장 간격 (186 BPM)
const PHOTO_ANIM_INTERVAL = Math.round(60000 / 186) // ~322ms

// 난이도 순서 (라운드 진행시 다음 난이도로)
const DIFFICULTY_ORDER = ['easy', 'normal', 'hard']

// BPM → 밀리초 간격 계산
const bpmToMs = (bpm) => Math.round(60000 / bpm)

// 현재 BPM 계산
const getCurrentBpm = (difficulty, level) => {
  const config = BPM_CONFIG[difficulty]
  return config.start + (level - 1) * config.increment
}

// 이미지 리사이징
function resizeImage(file, minWidth = 800) {
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
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

// 중복 허용하여 N개 랜덤 선택
function selectRandomPhotos(photos, count) {
  const result = []
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * photos.length)
    result.push(photos[randomIndex])
  }
  return result
}

function SayTheWordOnBeat() {
  // 게임 상태
  const [screen, setScreen] = useState('setup') // setup | game | complete
  const [phase, setPhase] = useState('preview') // preview | challenge
  const [round, setRound] = useState(1)  // 현재 라운드 (1 or 2)
  const [cycle, setCycle] = useState(1)  // 현재 사이클 (1-4)
  const [difficulty, setDifficulty] = useState('normal')
  const [currentDifficulty, setCurrentDifficulty] = useState('normal')  // 실제 게임 중 난이도

  // 사진 관련
  const [uploadedPhotos, setUploadedPhotos] = useState([])
  const [roundPhotos, setRoundPhotos] = useState([]) // 현재 라운드 10장
  const [currentIndex, setCurrentIndex] = useState(-1) // -1이면 하이라이트 없음

  // UI 상태
  const [isDragOver, setIsDragOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const [transitionText, setTransitionText] = useState('')
  const [previewCountdown, setPreviewCountdown] = useState(3)
  const [visiblePhotoCount, setVisiblePhotoCount] = useState(0) // Preview 때 보이는 사진 수

  // Refs
  const fileInputRef = useRef(null)
  const beatIntervalRef = useRef(null)
  const previewTimerRef = useRef(null)
  const transitionTimerRef = useRef(null)
  const photoAnimDelayRef = useRef(null)
  const photoAnimIntervalRef = useRef(null)

  // 음악 오디오 ref
  const beatAudioRef = useRef(null)

  // 오디오 로드 함수
  const loadBeatAudio = useCallback((diff) => {
    if (beatAudioRef.current) {
      beatAudioRef.current.pause()
      beatAudioRef.current = null
    }
    const url = BEAT_URLS[diff]
    if (url) {
      beatAudioRef.current = new Audio(url)
      beatAudioRef.current.loop = false
      beatAudioRef.current.preload = 'auto'
    }
  }, [])

  // 컴포넌트 언마운트 시 오디오 정리
  useEffect(() => {
    return () => {
      if (beatAudioRef.current) {
        beatAudioRef.current.pause()
        beatAudioRef.current = null
      }
    }
  }, [])

  // 순환 참조 해결을 위한 함수 refs
  const startPreviewRef = useRef(null)
  const startLearningRef = useRef(null)
  const startChallengeRef = useRef(null)
  const startNextCycleRef = useRef(null)
  const startNextRoundRef = useRef(null)

  // 현재 BPM (라운드 내에서는 동일한 BPM 유지)
  const currentBpm = BPM_CONFIG[currentDifficulty].start

  // 음악 정지
  const stopAllMusic = useCallback(() => {
    if (beatAudioRef.current) {
      beatAudioRef.current.pause()
      beatAudioRef.current.currentTime = 0
    }
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current)
      previewTimerRef.current = null
    }
  }, [])

  // 비트 음악 재생 (라운드 시작 시 호출, 첫 preview 후 challenge 시작)
  const playBeatMusic = useCallback((onPreviewEnd, roundIndex = 0, diff = 'normal') => {
    stopAllMusic()
    if (beatAudioRef.current) {
      beatAudioRef.current.currentTime = 0
      // 난이도 + 라운드 속도에 맞춰 재생 속도 조절
      const speeds = ROUND_SPEED[diff] || ROUND_SPEED.normal
      beatAudioRef.current.playbackRate = speeds[roundIndex] || 1.0
      beatAudioRef.current.play().catch(() => {})

      // 첫 번째 사이클 preview 시간 (속도 반영)
      const speed = speeds[roundIndex] || 1.0
      const duration = Math.floor(BASE_PREVIEW_DURATIONS[0] / speed)
      previewTimerRef.current = setTimeout(() => {
        onPreviewEnd?.()
      }, duration)
    }
  }, [stopAllMusic])

  // 사진 애니메이션 정지
  const stopPhotoAnim = useCallback(() => {
    if (photoAnimDelayRef.current) {
      clearTimeout(photoAnimDelayRef.current)
      photoAnimDelayRef.current = null
    }
    if (photoAnimIntervalRef.current) {
      clearInterval(photoAnimIntervalRef.current)
      photoAnimIntervalRef.current = null
    }
  }, [])

  // 사진 애니메이션 시작 (Preview 때 1장씩 등장)
  const startPhotoAnim = useCallback((cycleIndex = 0, roundIndex = 0, diff = 'normal') => {
    stopPhotoAnim()
    setVisiblePhotoCount(0)

    const speeds = ROUND_SPEED[diff] || ROUND_SPEED.normal
    const speed = speeds[roundIndex] || 1.0
    const delay = Math.floor((PHOTO_ANIM_DELAYS[cycleIndex] || 0) / speed)
    const interval = Math.floor(PHOTO_ANIM_INTERVAL / speed)

    photoAnimDelayRef.current = setTimeout(() => {
      let count = 0
      // 첫 번째 사진 즉시 표시
      count++
      setVisiblePhotoCount(count)

      photoAnimIntervalRef.current = setInterval(() => {
        count++
        if (count >= PHOTOS_PER_ROUND) {
          clearInterval(photoAnimIntervalRef.current)
          photoAnimIntervalRef.current = null
        }
        setVisiblePhotoCount(count)
      }, interval)
    }, delay)
  }, [stopPhotoAnim])

  // 모든 타이머 정지
  const stopBeat = useCallback(() => {
    if (beatIntervalRef.current) {
      clearInterval(beatIntervalRef.current)
      beatIntervalRef.current = null
    }
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current)
      previewTimerRef.current = null
    }
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current)
      transitionTimerRef.current = null
    }
    stopPhotoAnim()
    stopAllMusic()
    setIsPlaying(false)
    setShowTransition(false)
  }, [stopAllMusic, stopPhotoAnim])

  // 비트 실행 (도전 페이즈) - 라운드 속도 반영
  const runBeatSequence = useCallback((phaseType, onComplete, roundIndex = 0, diff = 'normal') => {
    setPhase(phaseType)
    setIsPlaying(true)
    setCurrentIndex(0)

    // 난이도 + 라운드 속도 반영한 간격 계산
    const speeds = ROUND_SPEED[diff] || ROUND_SPEED.normal
    const speed = speeds[roundIndex] || 1.0
    const baseInterval = Math.floor(BASE_CHALLENGE_DURATION / PHOTOS_PER_ROUND)
    const interval = Math.floor(baseInterval / speed)

    let index = 0
    beatIntervalRef.current = setInterval(() => {
      index++
      if (index >= PHOTOS_PER_ROUND) {
        clearInterval(beatIntervalRef.current)
        setIsPlaying(false)
        setCurrentIndex(-1)
        onComplete()
      } else {
        setCurrentIndex(index)
      }
    }, interval)
  }, [])

  // 미리보기 시작 (isNewRound=true면 음악 재생, cycleIndex로 타이밍 결정)
  const startPreview = useCallback((isNewRound = false, cycleIndex = 0, roundIndex = 0, diff = 'normal') => {
    setPhase('preview')
    setCurrentIndex(-1)

    // 사진 애니메이션 시작
    startPhotoAnim(cycleIndex, roundIndex, diff)

    const speeds = ROUND_SPEED[diff] || ROUND_SPEED.normal
    const speed = speeds[roundIndex] || 1.0

    if (isNewRound) {
      // 새 라운드 시작 시 음악 재생
      playBeatMusic(() => {
        startChallengeRef.current?.()
      }, roundIndex, diff)
    } else {
      // 같은 라운드 내 사이클 - 타이머로 자동 전환 (속도 반영)
      const baseDuration = BASE_PREVIEW_DURATIONS[cycleIndex] || BASE_PREVIEW_DURATIONS[0]
      const duration = Math.floor(baseDuration / speed)
      previewTimerRef.current = setTimeout(() => {
        startChallengeRef.current?.()
      }, duration)
    }
  }, [playBeatMusic, startPhotoAnim])

  // 학습 페이즈 시작
  const startLearning = useCallback(() => {
    runBeatSequence('learning', () => {
      // 학습 완료 → 전환 → 도전
      setShowTransition(true)
      setTransitionText('🎤 도전!')
      transitionTimerRef.current = setTimeout(() => {
        setShowTransition(false)
        startChallengeRef.current?.()
      }, 2000)
    })
  }, [runBeatSequence])

  // 도전 페이즈
  const startChallenge = useCallback(() => {
    stopPhotoAnim()  // 사진 애니메이션 정지
    setVisiblePhotoCount(PHOTOS_PER_ROUND)  // 모든 사진 표시
    runBeatSequence('challenge', () => {
      // 도전 완료 → 다음 사이클 또는 다음 라운드 또는 게임 완료
      if (cycle >= CYCLES_PER_ROUND) {
        // 라운드 내 4사이클 완료
        if (round >= TOTAL_ROUNDS) {
          // 모든 라운드 완료
          stopAllMusic()
          setScreen('complete')
        } else {
          // 다음 라운드로
          stopAllMusic()
          setShowTransition(true)
          setTransitionText(`Round ${round + 1}!`)
          transitionTimerRef.current = setTimeout(() => {
            setShowTransition(false)
            startNextRoundRef.current?.()
          }, 2000)
        }
      } else {
        // 같은 라운드 내 다음 사이클
        startNextCycleRef.current?.()
      }
    }, round - 1, currentDifficulty)  // roundIndex, difficulty 전달
  }, [runBeatSequence, cycle, round, stopAllMusic, stopPhotoAnim, currentDifficulty])

  // 다음 사이클 시작 (같은 라운드 내, 새 사진, 음악 계속)
  const startNextCycle = useCallback(() => {
    const newRoundPhotos = selectRandomPhotos(uploadedPhotos, PHOTOS_PER_ROUND)
    setRoundPhotos(newRoundPhotos)
    const nextCycle = cycle + 1
    setCycle(nextCycle)
    startPreviewRef.current?.(false, nextCycle - 1, round - 1, currentDifficulty)  // cycleIndex, roundIndex, difficulty 전달
  }, [uploadedPhotos, cycle, round, currentDifficulty])

  // 다음 라운드 시작 (속도 상승, 음악 재시작)
  const startNextRound = useCallback(() => {
    const newRoundPhotos = selectRandomPhotos(uploadedPhotos, PHOTOS_PER_ROUND)
    setRoundPhotos(newRoundPhotos)
    const nextRound = round + 1
    setRound(nextRound)
    setCycle(1)

    startPreviewRef.current?.(true, 0, nextRound - 1, currentDifficulty)  // 새 라운드이므로 음악 재생, roundIndex, difficulty 전달
  }, [uploadedPhotos, round, currentDifficulty])

  // Refs에 함수 할당 (순환 참조 해결)
  useEffect(() => {
    startPreviewRef.current = startPreview
    startLearningRef.current = startLearning
    startChallengeRef.current = startChallenge
    startNextCycleRef.current = startNextCycle
    startNextRoundRef.current = startNextRound
  }, [startPreview, startLearning, startChallenge, startNextCycle, startNextRound])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopBeat()
    }
  }, [stopBeat])


  // 파일 업로드 핸들러
  const handleFiles = async (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    const newPhotos = []
    for (const file of imageFiles) {
      const url = await resizeImage(file)
      newPhotos.push(url)
    }
    setUploadedPhotos(prev => [...prev, ...newPhotos])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const removePhoto = (index) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index))
  }

  // 게임 시작
  const startGame = useCallback(() => {
    const selectedPhotos = selectRandomPhotos(uploadedPhotos, PHOTOS_PER_ROUND)
    setRoundPhotos(selectedPhotos)
    setRound(1)
    setCycle(1)
    setCurrentDifficulty(difficulty)  // 선택한 난이도로 시작
    setScreen('game')

    // 선택한 난이도의 음악 로드
    loadBeatAudio(difficulty)

    // 약간의 딜레이 후 미리보기 시작 (화면 전환 후)
    setTimeout(() => {
      setPhase('preview')
      setCurrentIndex(-1)
      startPhotoAnim(0, 0, difficulty)  // Cycle 1, Round 1, difficulty
      playBeatMusic(() => {
        startChallengeRef.current?.()
      }, 0, difficulty)  // Round 1 (roundIndex 0), difficulty
    }, 300)
  }, [uploadedPhotos, playBeatMusic, difficulty, startPhotoAnim, loadBeatAudio])

  // 게임 리셋
  const resetGame = () => {
    stopBeat()
    setScreen('setup')
    setPhase('preview')
    setRound(1)
    setCycle(1)
    setCurrentIndex(-1)
    setRoundPhotos([])
    setVisiblePhotoCount(0)
  }

  // 설정 화면으로 돌아가기
  const goToSetup = () => {
    stopBeat()
    setScreen('setup')
  }

  // ============ 렌더링 ============

  // 설정 화면
  const renderSetupScreen = () => (
    <div className="stw__setup">
      <h1 className="stw__title">Say the Word on the Beat</h1>
      <p className="stw__subtitle">비트에 맞춰 사진 속 단어를 말해보세요!</p>

      {/* 사진 업로드 영역 */}
      <div className="stw__upload-section">
        <div
          className={`stw__dropzone ${isDragOver ? 'stw__dropzone--active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="stw__dropzone-icon">📷</div>
          <p className="stw__dropzone-text">사진을 드래그하거나 클릭하여 업로드</p>
          <p className="stw__dropzone-hint">최소 2장 이상 (중복 허용하여 8장 랜덤 선택)</p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          hidden
        />
      </div>

      {/* 업로드된 사진 미리보기 */}
      {uploadedPhotos.length > 0 && (
        <div className="stw__preview-section">
          <p className="stw__preview-count">업로드된 사진: {uploadedPhotos.length}장</p>
          <div className="stw__preview-grid">
            {uploadedPhotos.map((photo, index) => (
              <div key={index} className="stw__preview-item">
                <img src={photo} alt={`업로드 ${index + 1}`} />
                <button
                  className="stw__preview-remove"
                  onClick={(e) => {
                    e.stopPropagation()
                    removePhoto(index)
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 난이도 선택 */}
      <div className="stw__difficulty-section">
        <p className="stw__difficulty-label">난이도 선택</p>
        <div className="stw__difficulty-buttons">
          <button
            className={`stw__difficulty-btn ${difficulty === 'easy' ? 'stw__difficulty-btn--active' : ''}`}
            onClick={() => setDifficulty('easy')}
          >
            <span className="stw__difficulty-name">쉬움</span>
          </button>
          <button
            className={`stw__difficulty-btn ${difficulty === 'normal' ? 'stw__difficulty-btn--active' : ''}`}
            onClick={() => setDifficulty('normal')}
          >
            <span className="stw__difficulty-name">보통</span>
          </button>
          <button
            className={`stw__difficulty-btn ${difficulty === 'hard' ? 'stw__difficulty-btn--active' : ''}`}
            onClick={() => setDifficulty('hard')}
          >
            <span className="stw__difficulty-name">어려움</span>
          </button>
        </div>
      </div>

      {/* 게임 시작 버튼 */}
      <button
        className={`stw__start-btn ${uploadedPhotos.length >= MIN_PHOTOS_REQUIRED ? 'stw__start-btn--active' : ''}`}
        onClick={startGame}
        disabled={uploadedPhotos.length < MIN_PHOTOS_REQUIRED}
      >
        {uploadedPhotos.length < MIN_PHOTOS_REQUIRED
          ? `사진 ${MIN_PHOTOS_REQUIRED - uploadedPhotos.length}장 더 필요`
          : '게임 시작'}
      </button>
    </div>
  )

  // BPM 기반 펄스 애니메이션 시간 (ms)
  const beatDuration = Math.round(60000 / 186) // ~322ms

  // 게임 화면
  const renderGameScreen = () => (
    <div className="stw__game">
      {/* 4개 모서리 비트 아이콘 */}
      <img
        src="/beat-icon.png"
        alt=""
        className="stw__beat-icon stw__beat-icon--top-left"
        style={{ animationDuration: `${beatDuration}ms`, '--rotate': '-15deg' }}
      />
      <img
        src="/beat-icon.png"
        alt=""
        className="stw__beat-icon stw__beat-icon--top-right"
        style={{ animationDuration: `${beatDuration}ms`, '--rotate': '12deg' }}
      />
      <img
        src="/beat-icon.png"
        alt=""
        className="stw__beat-icon stw__beat-icon--bottom-left"
        style={{ animationDuration: `${beatDuration}ms`, '--rotate': '18deg' }}
      />
      <img
        src="/beat-icon.png"
        alt=""
        className="stw__beat-icon stw__beat-icon--bottom-right"
        style={{ animationDuration: `${beatDuration}ms`, '--rotate': '-10deg' }}
      />

      {/* 헤더 */}
      <div className="stw__game-header">
        <div className="stw__level-display">
          <span className="stw__level-label">Round {round}</span>
          <span className="stw__level-separator">-</span>
          <span className="stw__level-cycle">{cycle}/{CYCLES_PER_ROUND}</span>
        </div>
        <div className="stw__bpm-display">
          {currentDifficulty === 'easy' && '쉬움'}
          {currentDifficulty === 'normal' && '보통'}
          {currentDifficulty === 'hard' && '어려움'}
        </div>
      </div>

      {/* 페이즈 표시 */}
      <div className="stw__phase-badge">
        {phase === 'preview' && '👀 사진을 확인하세요!'}
        {phase === 'challenge' && '🎤 도전!'}
      </div>

      {/* 2x4 그리드 */}
      <div className="stw__grid-container">
        <div className="stw__photo-grid">
          {roundPhotos.map((photo, index) => {
            const isVisible = phase === 'challenge' || index < visiblePhotoCount
            return (
              <div
                key={index}
                className={`stw__grid-item ${currentIndex === index ? 'stw__grid-item--active' : ''} ${phase === 'preview' && isVisible ? 'stw__grid-item--appear' : ''} ${phase === 'preview' && !isVisible ? 'stw__grid-item--hidden' : ''}`}
              >
                <img src={photo} alt={`사진 ${index + 1}`} />
              </div>
            )
          })}
        </div>
      </div>

      {/* 진행 인디케이터 (미리보기가 아닐 때만) */}
      {phase !== 'preview' && (
        <div className="stw__indicators">
          {Array.from({ length: PHOTOS_PER_ROUND }).map((_, i) => (
            <span
              key={i}
              className={`stw__indicator ${i < currentIndex ? 'stw__indicator--done' : ''} ${i === currentIndex ? 'stw__indicator--active' : ''}`}
            />
          ))}
        </div>
      )}

      {/* 전환 오버레이 */}
      {showTransition && (
        <div className="stw__transition-overlay">
          <span className="stw__transition-text">{transitionText}</span>
        </div>
      )}

      {/* 나가기 버튼 */}
      <button className="stw__exit-btn" onClick={goToSetup}>
        ✕ 나가기
      </button>
    </div>
  )

  // 완료 화면
  const renderCompleteScreen = () => (
    <div className="stw__complete">
      <div className="stw__complete-content">
        <div className="stw__complete-icon">🎉</div>
        <h2 className="stw__complete-title">게임 완료!</h2>
        <p className="stw__complete-subtitle">
          모든 라운드를 클리어했습니다!
        </p>
        <div className="stw__complete-buttons">
          <button className="stw__complete-btn stw__complete-btn--primary" onClick={resetGame}>
            다시 하기
          </button>
          <Link to="/recreation" className="stw__complete-btn stw__complete-btn--secondary">
            목록으로
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="stw">
      <div className="stw__bg" />

      {screen === 'setup' && (
        <Link to="/recreation" className="stw__back-link">
          ← 레크레이션 목록
        </Link>
      )}

      <div className="stw__screen">
        {screen === 'setup' && renderSetupScreen()}
        {screen === 'game' && renderGameScreen()}
        {screen === 'complete' && renderCompleteScreen()}
      </div>
    </div>
  )
}

export default SayTheWordOnBeat
