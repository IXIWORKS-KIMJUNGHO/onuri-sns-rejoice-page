import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { database } from '../lib/firebase'
import { ref, onValue, get } from 'firebase/database'
import './GoldenBellGame.css'

function normalizeAnswer(text) {
  return text.trim().toLowerCase().replace(/\s+/g, '')
}

function GoldenBellDisplay() {
  const [searchParams] = useSearchParams()
  const roomCodeFromUrl = searchParams.get('room') || ''

  const [screen, setScreen] = useState(roomCodeFromUrl ? 'connecting' : 'enter-code')
  const [roomCode, setRoomCode] = useState(roomCodeFromUrl)
  const [inputCode, setInputCode] = useState('')
  const [error, setError] = useState('')

  // Game state from Firebase
  const [participants, setParticipants] = useState([])
  const [questionNumber, setQuestionNumber] = useState(0)
  const [questionText, setQuestionText] = useState('')
  const [answers, setAnswers] = useState([])
  const [scores, setScores] = useState({})
  const [phase, setPhase] = useState('waiting')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [pointValue, setPointValue] = useState(10)
  const [currentQuestionType, setCurrentQuestionType] = useState('subjective')
  const [roomStatus, setRoomStatus] = useState('waiting')

  // Connect to room on mount if room code in URL
  useEffect(() => {
    if (roomCodeFromUrl) {
      connectToRoom(roomCodeFromUrl)
    }
  }, [])

  async function connectToRoom(code) {
    setError('')
    try {
      const roomRef = ref(database, `rooms/${code}`)
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

  // Listen to room status
  useEffect(() => {
    if (!roomCode || screen !== 'display') return

    const statusRef = ref(database, `rooms/${roomCode}/status`)
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const status = snapshot.val()
      setRoomStatus(status || 'waiting')
      if (status === 'ended') {
        setScreen('ended')
      }
    })

    return () => unsubscribe()
  }, [roomCode, screen])

  // Listen to participants
  useEffect(() => {
    if (!roomCode || screen !== 'display') return

    const participantsRef = ref(database, `rooms/${roomCode}/participants`)
    const unsubscribe = onValue(participantsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }))
        setParticipants(list)
      } else {
        setParticipants([])
      }
    })

    return () => unsubscribe()
  }, [roomCode, screen])

  // Listen to current question
  useEffect(() => {
    if (!roomCode || screen !== 'display') return

    const questionRef = ref(database, `rooms/${roomCode}/currentQuestion`)
    const unsubscribe = onValue(questionRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        setPhase('waiting')
        return
      }

      setQuestionNumber(data.questionNumber || 0)
      setQuestionText(data.text || '')
      setPointValue(data.pointValue || 10)
      setCurrentQuestionType(data.questionType || 'subjective')

      if (data.phase === 'reviewing') {
        setCorrectAnswer(data.correctAnswer || '')
        setPhase('reviewing')
      } else if (data.phase === 'revealing') {
        setCorrectAnswer('')
        setPhase('revealing')
      } else if (data.phase === 'answering') {
        setCorrectAnswer('')
        setPhase('answering')
      }
    })

    return () => unsubscribe()
  }, [roomCode, screen])

  // Listen to answers
  useEffect(() => {
    if (!roomCode || screen !== 'display') return

    const answersRef = ref(database, `rooms/${roomCode}/answers`)
    const unsubscribe = onValue(answersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }))
        const latest = {}
        list.forEach((a) => {
          if (!latest[a.participantId] || a.submittedAt > latest[a.participantId].submittedAt) {
            latest[a.participantId] = a
          }
        })
        setAnswers(Object.values(latest))
      } else {
        setAnswers([])
      }
    })

    return () => unsubscribe()
  }, [roomCode, screen])

  // Listen to scores
  useEffect(() => {
    if (!roomCode) return

    const scoresRef = ref(database, `rooms/${roomCode}/scores`)
    const unsubscribe = onValue(scoresRef, (snapshot) => {
      const data = snapshot.val()
      setScores(data || {})
    })

    return () => unsubscribe()
  }, [roomCode])

  // Check if answer is correct
  function isAnswerCorrect(answer) {
    if (currentQuestionType === 'objective') {
      if (answer.choiceIndex == null) return null
      if (!correctAnswer) return null
      return normalizeAnswer(answer.text) === normalizeAnswer(correctAnswer)
    }
    if (!correctAnswer) return null
    return normalizeAnswer(answer.text) === normalizeAnswer(correctAnswer)
  }

  const answeredCount = answers.length
  const totalCount = participants.length

  const scoreboard = participants
    .map((p) => ({
      id: p.id,
      nickname: p.nickname,
      total: scores[p.id]?.total || 0,
    }))
    .sort((a, b) => b.total - a.total)

  return (
    <div className="gb gb--display">
      <div className="gb__bg"></div>

      {/* ========== ENTER CODE ========== */}
      {screen === 'enter-code' && (
        <div className="gb__screen gb__lobby">
          <Link to="/recreation/golden-bell" className="gb__back-link">← 골든벨 게임</Link>
          <h1 className="gb__title">프로젝터<br />디스플레이</h1>
          <p className="gb__subtitle">프로젝터에 표시할 화면입니다</p>

          {error && <div className="gb__error">{error}</div>}

          <div className="gb__lobby-card" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div className="gb__lobby-card-icon">📺</div>
            <h3 className="gb__lobby-card-title">방 코드 입력</h3>
            <p className="gb__lobby-card-desc">호스트가 생성한 방 코드를 입력하세요</p>
            <input
              className="gb__input gb__input--code"
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
              className="gb__btn gb__btn--primary"
              onClick={handleJoin}
            >
              연결하기
            </button>
          </div>
        </div>
      )}

      {/* ========== CONNECTING ========== */}
      {screen === 'connecting' && (
        <div className="gb__screen gb__participant-waiting">
          <div className="gb__waiting-animation">
            <div className="gb__waiting-ring"></div>
            <div className="gb__waiting-ring gb__waiting-ring--2"></div>
            <div className="gb__waiting-ring gb__waiting-ring--3"></div>
          </div>
          <p>연결 중...</p>
        </div>
      )}

      {/* ========== DISPLAY ========== */}
      {screen === 'display' && (
        <div className="gb__screen gb__display-screen">
          <div className="gb__display-header">
            <div className="gb__display-badge">📺 프로젝터 화면</div>
            <div className="gb__display-room">방 코드: {roomCode}</div>
            <div className="gb__game-stats">
              <span className="gb__stat">참가자 {totalCount}명</span>
              {phase === 'answering' && (
                <span className="gb__stat gb__stat--highlight">답변 {answeredCount}/{totalCount}</span>
              )}
            </div>
          </div>

          {/* Waiting for game to start or next question */}
          {(phase === 'waiting' || roomStatus === 'waiting') && (
            <div className="gb__display-waiting">
              <div className="gb__display-waiting-icon">🔔</div>
              <h2 className="gb__display-waiting-title">
                {roomStatus === 'waiting' ? '게임 시작 대기 중' : '다음 문제 준비 중'}
              </h2>
              {participants.length > 0 && (
                <div className="gb__display-participants">
                  <h3>참가자 ({participants.length}명)</h3>
                  <div className="gb__participants-grid">
                    {participants.map((p) => (
                      <div key={p.id} className="gb__participant-chip">
                        {p.nickname}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question display */}
          {phase !== 'waiting' && roomStatus === 'active' && questionNumber > 0 && (
            <div className="gb__display-layout">
              <div className="gb__display-main">
                <div className="gb__display-question">
                  <div className="gb__question-badge gb__question-badge--large">Q{questionNumber}</div>
                  <p className="gb__display-question-text">{questionText}</p>
                </div>

                {/* Correct answer reveal (reviewing phase) */}
                {phase === 'reviewing' && correctAnswer && (
                  <div className="gb__display-answer-reveal">
                    <span className="gb__display-answer-label">정답</span>
                    <span className="gb__display-answer-text">{correctAnswer}</span>
                  </div>
                )}

                {/* Answers grid */}
                <div className="gb__display-answers">
                  <h3 className="gb__display-answers-title">
                    {phase === 'reviewing' ? '채점 결과' : '참가자 답변'}
                    {phase === 'answering' && <span className="gb__display-answers-count">({answeredCount}/{totalCount})</span>}
                  </h3>
                  {phase === 'reviewing' && (
                    <p className="gb__answers-hint">1등 10점 / 2등 7점 / 3등 4점 / 정답 1점</p>
                  )}
                  {answers.length === 0 ? (
                    <div className="gb__display-no-answers">
                      <div className="gb__waiting-dots">
                        <span></span><span></span><span></span>
                      </div>
                      <p>답변을 기다리는 중...</p>
                    </div>
                  ) : (
                    <div className="gb__display-answers-grid">
                      {answers.map((a) => {
                        const correct = phase === 'reviewing' ? isAnswerCorrect(a) : null
                        const lastRank = scores[a.participantId]?.lastRank
                        const lastPoints = scores[a.participantId]?.lastPoints
                        const rankEmojis = ['🥇', '🥈', '🥉']
                        return (
                          <div
                            key={a.id}
                            className={`gb__display-answer-card ${
                              phase === 'answering' ? 'gb__display-answer-card--submitted' :
                              phase === 'revealing' ? '' :
                              correct === true ? 'gb__display-answer-card--correct' :
                              correct === false ? 'gb__display-answer-card--wrong' : ''
                            }`}
                          >
                            <div className="gb__display-answer-nickname">
                              {phase === 'reviewing' && correct === true && <span>✅ </span>}
                              {phase === 'reviewing' && correct === false && <span>❌ </span>}
                              {a.nickname}
                              {phase === 'reviewing' && lastRank && (
                                <span className="gb__speed-rank gb__speed-rank--large">{rankEmojis[lastRank - 1]} +{lastPoints}</span>
                              )}
                              {phase === 'reviewing' && correct === true && !lastRank && lastPoints && (
                                <span className="gb__speed-rank gb__speed-rank--large">+{lastPoints}</span>
                              )}
                            </div>
                            <div className="gb__display-answer-text">
                              {phase === 'answering' ? (
                                <span className="gb__display-answer-hidden">
                                  <span className="gb__answer-hidden-icon">✅</span>
                                  <span>제출 완료</span>
                                </span>
                              ) : (
                                a.text
                              )}
                            </div>
                            <div className="gb__display-answer-score">
                              {scores[a.participantId]?.total || 0}점
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Mini scoreboard - right side */}
              {scoreboard.length > 0 && (
                <div className="gb__display-scoreboard">
                  <h3 className="gb__display-scoreboard-title">현재 순위</h3>
                  <div className="gb__display-scoreboard-list">
                    {scoreboard.slice(0, 5).map((s, i) => (
                      <div key={s.id} className={`gb__display-scoreboard-item ${i < 3 ? `gb__display-scoreboard-item--top${i + 1}` : ''}`}>
                        <span className="gb__display-scoreboard-rank">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                        </span>
                        <span className="gb__display-scoreboard-name">{s.nickname}</span>
                        <span className="gb__display-scoreboard-total">{s.total}점</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========== ENDED ========== */}
      {screen === 'ended' && (
        <div className="gb__screen gb__ended">
          <div className="gb__ended-icon">🏆</div>
          <h2 className="gb__ended-title">게임 종료!</h2>
          <p className="gb__ended-subtitle">수고하셨습니다</p>

          {scoreboard.length > 0 && (
            <div className="gb__scoreboard gb__scoreboard--final">
              <h3 className="gb__scoreboard-title">최종 점수판</h3>
              <div className="gb__scoreboard-list">
                {scoreboard.map((s, i) => (
                  <div key={s.id} className={`gb__scoreboard-item ${i < 3 ? `gb__scoreboard-item--top${i + 1}` : ''}`}>
                    <span className="gb__scoreboard-rank">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </span>
                    <span className="gb__scoreboard-name">{s.nickname}</span>
                    <span className="gb__scoreboard-total">{s.total}점</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="gb__actions">
            <button className="gb__btn gb__btn--primary" onClick={() => window.location.reload()}>
              새로고침
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoldenBellDisplay
