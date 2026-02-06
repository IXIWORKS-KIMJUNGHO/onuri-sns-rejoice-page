import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './EmojiSongGame.css'

// 난이도별 문제 데이터
const quizDataByDifficulty = {
  easy: [
    { id: 1, emoji: '👀', answer: '시선' },
    { id: 2, emoji: '🧔👑💚', answer: '주님의 선하심' },
    { id: 3, emoji: '☔✅', answer: '비 준비하시니' },
    { id: 4, emoji: '👫🧔👑🎵', answer: '우리 주안에서 노래하며' },
    { id: 5, emoji: '🔙✝️👑', answer: '여호와께 돌아가자' },
    { id: 6, emoji: '👀🧔👑', answer: '주를 바라보며' },
    { id: 7, emoji: '👉🌸', answer: '너는 꽃이야' },
    { id: 8, emoji: '🧔👑📞', answer: '하나님의 부르심' },
    { id: 9, emoji: '🎄🧔👑👶', answer: '기쁘다 구주 오셨네' },
    { id: 10, emoji: '⬇️', answer: '낮은 곳으로' },
  ],
  normal: [
    { id: 1, emoji: '👫🤝🧔👑', answer: '우린 주를 만나고' },
    { id: 2, emoji: '🙏🎁👑', answer: 'I thank GOD' },
    { id: 3, emoji: '👫❤️🧔👑', answer: '우리가 주를 더욱 사랑하고' },
    { id: 4, emoji: '🔍🧔👑👨‍👩‍👧‍👦', answer: '주를 찾는 모든 자들이' },
    { id: 5, emoji: '🧔👑👶🚶➡️', answer: '주의 자녀로 산다는 것은' },
    { id: 6, emoji: '👑🌍', answer: '하나님의 세계' },
    { id: 7, emoji: '💪⛪🧔👑', answer: '내 몸은 구주의 성전이니' },
    { id: 8, emoji: '👑🔥', answer: '하나님의 열심' },
    { id: 9, emoji: '⏰🚀➡️', answer: '시간을 뚫고' },
  ],
  hard: [
    { id: 1, emoji: '🌈🏰✨', answer: '아름다운 나라' },
    { id: 2, emoji: '🙋🧔👑😮‍💨🙅', answer: '나는 주를 섬기는 것에 후회가 없습니다' },
    { id: 3, emoji: '🙋‍♀️🙋‍♂️🎶⛪', answer: '회중찬양' },
    { id: 4, emoji: '🔄🌙❌', answer: '다시 밤이 없겠고' },
    { id: 5, emoji: '🤝🧱⛪', answer: '함께 지어져 가네' },
    { id: 6, emoji: '🧔👑❤️👉💯', answer: '하나님이 너를 엄청 사랑하신대' },
    { id: 7, emoji: '🙋🙏😊🍀', answer: '나의 삶은 복되다' },
    { id: 8, emoji: '❤️🧑‍🤝‍🧑🧑‍🤝‍🧑🎶', answer: '사친다노' },
    { id: 9, emoji: '❤️🌸📅', answer: '사랑의 계절은' },
    { id: 10, emoji: '👁️👂📢', answer: '보고 들은 자' },
  ],
}

const difficultyInfo = {
  easy: { label: 'Easy', color: '#ffa559', description: '쉬움' },
  normal: { label: 'Normal', color: '#ff6b35', description: '보통' },
  hard: { label: 'Hard', color: '#e04b1a', description: '어려움' },
}

// 초성 추출 함수
const getChosung = (text) => {
  const chosung = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
  let result = ''

  for (const char of text) {
    const code = char.charCodeAt(0) - 44032
    if (code >= 0 && code <= 11171) {
      result += chosung[Math.floor(code / 588)]
    } else if (char === ' ') {
      result += ' '
    } else {
      // 영어나 특수문자는 그대로
      result += char
    }
  }
  return result
}

// 글자 수 힌트 함수 (공백 제외한 글자 수)
const getLetterCountHint = (text) => {
  const withoutSpaces = text.replace(/\s/g, '')
  return `${withoutSpaces.length}글자`
}

function EmojiSongGame() {
  const [difficulty, setDifficulty] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [hintLevel, setHintLevel] = useState(0) // 0: 힌트 없음, 1: 글자 수, 2: 초성
  const [gameStarted, setGameStarted] = useState(false)

  const quizData = difficulty ? quizDataByDifficulty[difficulty] : []
  const currentQuiz = quizData[currentIndex]
  const totalQuizzes = quizData.length

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted) return

      if (e.code === 'Space' || e.code === 'ArrowRight') {
        e.preventDefault()
        if (showAnswer) {
          handleNext()
        } else {
          setShowAnswer(true)
        }
      } else if (e.code === 'ArrowLeft') {
        handlePrevious()
      } else if (e.code === 'KeyH') {
        handleHint()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted, showAnswer, hintLevel, currentIndex])

  const handleSelectDifficulty = (diff) => {
    if (quizDataByDifficulty[diff].length === 0) {
      return // 문제가 없는 난이도는 선택 불가
    }
    setDifficulty(diff)
  }

  const handleStart = () => {
    setGameStarted(true)
    setCurrentIndex(0)
    setShowAnswer(false)
    setHintLevel(0)
  }

  const handleNext = () => {
    if (currentIndex < totalQuizzes - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
      setHintLevel(0)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowAnswer(false)
      setHintLevel(0)
    }
  }

  const handleRevealAnswer = () => {
    setShowAnswer(true)
  }

  const handleHint = () => {
    if (hintLevel < 2) {
      setHintLevel(hintLevel + 1)
    }
  }

  const handleReset = () => {
    setGameStarted(false)
    setDifficulty(null)
    setCurrentIndex(0)
    setShowAnswer(false)
    setHintLevel(0)
  }

  const handleBackToDifficulty = () => {
    setGameStarted(false)
    setDifficulty(null)
    setCurrentIndex(0)
    setShowAnswer(false)
    setHintLevel(0)
  }

  // 현재 힌트 텍스트 생성
  const getHintText = () => {
    if (!currentQuiz) return ''
    if (hintLevel === 1) {
      return getLetterCountHint(currentQuiz.answer)
    } else if (hintLevel === 2) {
      return getChosung(currentQuiz.answer)
    }
    return ''
  }

  // 난이도 선택 화면
  if (!difficulty) {
    return (
      <section className="emoji-song-game">
        <div className="emoji-song-game__container">
          <Link to="/recreation" className="emoji-song-game__back">
            ← 레크레이션 목록
          </Link>

          <div className="emoji-song-game__badge">방과후학교</div>
          <h1 className="emoji-song-game__title">눈으로 보는 노래반</h1>
          <p className="emoji-song-game__subtitle">이모지를 보고 어떤 찬양인지 맞춰보세요!</p>

          <div className="emoji-song-game__card">
            <div className="emoji-song-game__card-description">
              <p>난이도를 선택해주세요</p>
            </div>

            <div className="emoji-song-game__difficulty-select">
              {Object.entries(difficultyInfo).map(([key, info]) => {
                const count = quizDataByDifficulty[key].length
                const isDisabled = count === 0
                return (
                  <button
                    key={key}
                    className={`emoji-song-game__difficulty-btn ${isDisabled ? 'disabled' : ''}`}
                    style={{ '--difficulty-color': info.color }}
                    onClick={() => handleSelectDifficulty(key)}
                    disabled={isDisabled}
                  >
                    <span className="emoji-song-game__difficulty-label">{info.label}</span>
                    <span className="emoji-song-game__difficulty-desc">{info.description}</span>
                    <span className="emoji-song-game__difficulty-count">
                      {isDisabled ? '준비중' : `${count}문제`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // 시작 화면 (난이도 선택 후)
  if (!gameStarted) {
    return (
      <section className="emoji-song-game">
        <div className="emoji-song-game__container">
          <button onClick={handleBackToDifficulty} className="emoji-song-game__back">
            ← 난이도 선택
          </button>

          <div className="emoji-song-game__badge">방과후학교</div>
          <h1 className="emoji-song-game__title">눈으로 보는 노래반</h1>
          <p className="emoji-song-game__subtitle">이모지를 보고 어떤 찬양인지 맞춰보세요!</p>

          <div className="emoji-song-game__card">
            <div
              className="emoji-song-game__selected-difficulty"
              style={{ '--difficulty-color': difficultyInfo[difficulty].color }}
            >
              {difficultyInfo[difficulty].label}
            </div>

            <div className="emoji-song-game__card-description">
              <p>총 <strong>{totalQuizzes}문제</strong>가 준비되어 있습니다.</p>
            </div>

            <div className="emoji-song-game__card-controls">
              <h3>조작 방법</h3>
              <ul>
                <li><kbd>Space</kbd> / <kbd>→</kbd> 정답 공개 / 다음 문제</li>
                <li><kbd>←</kbd> 이전 문제</li>
                <li><kbd>H</kbd> 힌트 보기 (글자 수 → 초성)</li>
              </ul>
            </div>

            <button
              className="emoji-song-game__start-btn"
              onClick={handleStart}
            >
              게임 시작하기
            </button>
          </div>
        </div>
      </section>
    )
  }

  // 게임 완료 화면
  if (currentIndex >= totalQuizzes) {
    return (
      <section className="emoji-song-game">
        <div className="emoji-song-game__container">
          <div className="emoji-song-game__complete">
            <div className="emoji-song-game__complete-icon">🎉</div>
            <h1 className="emoji-song-game__complete-title">게임 완료!</h1>
            <p className="emoji-song-game__complete-text">
              모든 문제를 완료했습니다!
            </p>
            <div className="emoji-song-game__complete-actions">
              <button
                className="emoji-song-game__btn emoji-song-game__btn--primary"
                onClick={handleReset}
              >
                다시 시작
              </button>
              <Link
                to="/recreation"
                className="emoji-song-game__btn emoji-song-game__btn--secondary"
              >
                목록으로
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // 게임 플레이 화면
  return (
    <section className="emoji-song-game">
      <div className="emoji-song-game__container">
        {/* 상단 바 */}
        <div className="emoji-song-game__header">
          <button onClick={handleReset} className="emoji-song-game__back">
            ← 목록
          </button>
          <div className="emoji-song-game__header-center">
            <div
              className="emoji-song-game__difficulty-badge"
              style={{ '--difficulty-color': difficultyInfo[difficulty].color }}
            >
              {difficultyInfo[difficulty].label}
            </div>
            <div className="emoji-song-game__progress">
              <span className="emoji-song-game__progress-current">{currentIndex + 1}</span>
              <span className="emoji-song-game__progress-divider">/</span>
              <span className="emoji-song-game__progress-total">{totalQuizzes}</span>
            </div>
          </div>
          <button
            className="emoji-song-game__reset-btn"
            onClick={handleReset}
          >
            처음으로
          </button>
        </div>

        {/* 문제 영역 */}
        <div className="emoji-song-game__quiz">
          <div className="emoji-song-game__question-number">
            Q{currentIndex + 1}
          </div>

          <div className="emoji-song-game__emoji">
            {currentQuiz.emoji}
          </div>

          {/* 힌트 */}
          {hintLevel > 0 && (
            <div className="emoji-song-game__hint">
              <span className="emoji-song-game__hint-label">
                {hintLevel === 1 ? '힌트 1:' : '힌트 2:'}
              </span>
              {getHintText()}
            </div>
          )}

          {/* 정답 */}
          <div className={`emoji-song-game__answer ${showAnswer ? 'emoji-song-game__answer--visible' : ''}`}>
            {showAnswer ? (
              <>
                <div className="emoji-song-game__answer-label">정답</div>
                <div className="emoji-song-game__answer-text">{currentQuiz.answer}</div>
              </>
            ) : (
              <div className="emoji-song-game__answer-placeholder">?</div>
            )}
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="emoji-song-game__controls">
          <button
            className="emoji-song-game__btn emoji-song-game__btn--nav"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            ← 이전
          </button>

          <button
            className={`emoji-song-game__btn emoji-song-game__btn--hint ${hintLevel > 0 ? 'active' : ''}`}
            onClick={handleHint}
            disabled={hintLevel >= 2}
          >
            💡 힌트 {hintLevel > 0 && `(${hintLevel}/2)`}
          </button>

          {!showAnswer ? (
            <button
              className="emoji-song-game__btn emoji-song-game__btn--reveal"
              onClick={handleRevealAnswer}
            >
              정답 공개
            </button>
          ) : (
            <button
              className="emoji-song-game__btn emoji-song-game__btn--next"
              onClick={handleNext}
              disabled={currentIndex === totalQuizzes - 1}
            >
              다음 →
            </button>
          )}
        </div>

        {/* 진행 바 */}
        <div className="emoji-song-game__progress-bar">
          <div
            className="emoji-song-game__progress-fill"
            style={{ width: `${((currentIndex + 1) / totalQuizzes) * 100}%` }}
          />
        </div>
      </div>
    </section>
  )
}

export default EmojiSongGame
