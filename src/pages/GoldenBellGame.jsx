import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { database } from '../lib/firebase'
import { ref, set, push, get, onValue, remove, onDisconnect } from 'firebase/database'
import './GoldenBellGame.css'

function generateRoomCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function normalizeAnswer(text) {
  return text.trim().toLowerCase().replace(/\s+/g, '')
}

function GoldenBellGame() {
  const [screen, setScreen] = useState('lobby')
  const [role, setRole] = useState(null)
  const [roomCode, setRoomCode] = useState('')
  const [hostId, setHostId] = useState(null)
  const [participantId, setParticipantId] = useState(null)
  const [nickname, setNickname] = useState('')
  const [participants, setParticipants] = useState([])
  const [questionNumber, setQuestionNumber] = useState(0)
  const [questionText, setQuestionText] = useState('')
  const [questionInput, setQuestionInput] = useState('')
  const [correctAnswerInput, setCorrectAnswerInput] = useState('')
  const [pointValueInput, setPointValueInput] = useState('10')
  const [answerText, setAnswerText] = useState('')
  const [answers, setAnswers] = useState([])
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinNickname, setJoinNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [scores, setScores] = useState({})
  const [scoreInputs, setScoreInputs] = useState({})
  const [showScoreboard, setShowScoreboard] = useState(false)

  // Phase: 'writing' | 'answering' | 'reviewing'
  const [phase, setPhase] = useState('writing')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [pointValue, setPointValue] = useState(10)

  // Question type: 'subjective' | 'objective'
  const [questionType, setQuestionType] = useState('subjective')
  const [choices, setChoices] = useState(['', '', '', ''])
  const [correctChoiceIndex, setCorrectChoiceIndex] = useState(null)
  // Participant-side
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [currentChoices, setCurrentChoices] = useState([])
  const [currentQuestionType, setCurrentQuestionType] = useState('subjective')

  // Track which participants were auto-scored this round
  const autoScoredRef = useRef(new Set())

  const disconnectRefs = useRef([])
  const prevQuestionNumberRef = useRef(0)

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      disconnectRefs.current.forEach((fn) => {
        try { fn() } catch (e) { /* ignore */ }
      })
    }
  }, [])

  // --- Host: listen to participants ---
  useEffect(() => {
    if (!roomCode || role !== 'host') return
    if (screen !== 'host-waiting' && screen !== 'host-game') return

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
  }, [roomCode, role, screen])

  // --- Host: listen to answers ---
  useEffect(() => {
    if (!roomCode || role !== 'host' || screen !== 'host-game') return

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
  }, [roomCode, role, screen])

  // --- Participant: listen to room status ---
  useEffect(() => {
    if (!roomCode || role !== 'participant') return

    const statusRef = ref(database, `rooms/${roomCode}/status`)
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const status = snapshot.val()
      if (status === 'active' && screen === 'participant-waiting') {
        setScreen('participant-game')
      } else if (status === 'ended') {
        setScreen('ended')
      }
    })

    return () => unsubscribe()
  }, [roomCode, role, screen])

  // --- Listen to scores (host + participant) ---
  useEffect(() => {
    if (!roomCode) return

    const scoresRef = ref(database, `rooms/${roomCode}/scores`)
    const unsubscribe = onValue(scoresRef, (snapshot) => {
      const data = snapshot.val()
      setScores(data || {})
    })

    return () => unsubscribe()
  }, [roomCode])

  // --- Participant: listen to current question ---
  useEffect(() => {
    if (!roomCode || role !== 'participant') return
    if (screen !== 'participant-game' && screen !== 'participant-waiting') return

    const questionRef = ref(database, `rooms/${roomCode}/currentQuestion`)
    const unsubscribe = onValue(questionRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) return

      // New question arrived
      if (data.questionNumber !== prevQuestionNumberRef.current) {
        prevQuestionNumberRef.current = data.questionNumber
        setQuestionText(data.text)
        setQuestionNumber(data.questionNumber)
        setPointValue(data.pointValue || 10)
        setCurrentQuestionType(data.questionType || 'subjective')
        setCurrentChoices(data.choices || [])
        setCorrectAnswer('')
        setAnswerText('')
        setSelectedChoice(null)
        setHasSubmitted(false)
        setPhase('answering')
      }

      // Phase changed to reviewing
      if (data.phase === 'reviewing' && data.correctAnswer != null) {
        setCorrectAnswer(data.correctAnswer)
        setPhase('reviewing')
      } else if (data.phase === 'answering') {
        setPhase('answering')
      }
    })

    return () => unsubscribe()
  }, [roomCode, role, screen])

  // --- Create Room ---
  async function createRoom() {
    setIsLoading(true)
    setError('')
    try {
      const code = generateRoomCode()
      const roomRef = ref(database, `rooms/${code}`)
      const snapshot = await get(roomRef)

      if (snapshot.exists()) {
        setIsLoading(false)
        return createRoom()
      }

      const newHostId = crypto.randomUUID()
      await set(roomRef, {
        hostId: newHostId,
        status: 'waiting',
        createdAt: Date.now(),
      })

      const disconnectRefObj = onDisconnect(roomRef)
      disconnectRefObj.remove()
      disconnectRefs.current.push(() => remove(roomRef))

      setRoomCode(code)
      setHostId(newHostId)
      setRole('host')
      setScreen('host-waiting')
    } catch (e) {
      setError('방을 만들 수 없습니다. 인터넷 연결을 확인해주세요.')
    }
    setIsLoading(false)
  }

  // --- Join Room ---
  async function joinRoom() {
    setIsLoading(true)
    setError('')

    const code = joinCode.trim()
    const name = joinNickname.trim()

    if (!code || code.length !== 6) {
      setError('6자리 방 코드를 입력해주세요.')
      setIsLoading(false)
      return
    }
    if (!name) {
      setError('닉네임을 입력해주세요.')
      setIsLoading(false)
      return
    }

    try {
      const roomRef = ref(database, `rooms/${code}`)
      const snapshot = await get(roomRef)

      if (!snapshot.exists()) {
        setError('존재하지 않는 방입니다.')
        setIsLoading(false)
        return
      }

      const roomData = snapshot.val()
      if (roomData.status === 'ended') {
        setError('이미 종료된 게임입니다.')
        setIsLoading(false)
        return
      }

      const participantsRef = ref(database, `rooms/${code}/participants`)
      const newParticipantRef = push(participantsRef)
      const pId = newParticipantRef.key

      await set(newParticipantRef, {
        nickname: name,
        joinedAt: Date.now(),
      })

      const disconnectRefObj = onDisconnect(newParticipantRef)
      disconnectRefObj.remove()
      disconnectRefs.current.push(() => remove(newParticipantRef))

      setRoomCode(code)
      setParticipantId(pId)
      setNickname(name)
      setRole('participant')
      setScreen(roomData.status === 'active' ? 'participant-game' : 'participant-waiting')
    } catch (e) {
      setError('방에 입장할 수 없습니다. 인터넷 연결을 확인해주세요.')
    }
    setIsLoading(false)
  }

  // --- Start Game (Host) ---
  async function startGame() {
    await set(ref(database, `rooms/${roomCode}/status`), 'active')
    setPhase('writing')
    setScreen('host-game')
  }

  // --- Send Question (Host) ---
  async function sendQuestion() {
    const text = questionInput.trim()
    if (!text) return

    const newNumber = questionNumber + 1
    const pv = parseInt(pointValueInput, 10) || 10

    const questionData = {
      text,
      questionNumber: newNumber,
      questionType,
      pointValue: pv,
      phase: 'answering',
      sentAt: Date.now(),
    }

    if (questionType === 'objective') {
      questionData.choices = choices.map((c) => c.trim())
      questionData.correctChoiceIndex = correctChoiceIndex
      questionData.correctAnswer = correctChoiceIndex != null ? choices[correctChoiceIndex].trim() : null
    } else {
      questionData.correctAnswer = correctAnswerInput.trim() || null
    }

    await remove(ref(database, `rooms/${roomCode}/answers`))
    await set(ref(database, `rooms/${roomCode}/currentQuestion`), questionData)

    setQuestionNumber(newNumber)
    setQuestionText(text)
    setCorrectAnswer(questionData.correctAnswer || '')
    setPointValue(pv)
    setCurrentQuestionType(questionType)
    setCurrentChoices(questionData.choices || [])
    setQuestionInput('')
    setCorrectAnswerInput('')
    setPointValueInput('10')
    setChoices(['', '', '', ''])
    setCorrectChoiceIndex(null)
    setAnswers([])
    setScoreInputs({})
    autoScoredRef.current = new Set()
    setPhase('answering')
  }

  // --- Close Answers & Reveal (Host) ---
  async function revealAnswer() {
    // Fetch current question data once for objective scoring
    let cqi = null
    if (currentQuestionType === 'objective') {
      const cqData = await get(ref(database, `rooms/${roomCode}/currentQuestion`))
      cqi = cqData.val()?.correctChoiceIndex
    }

    // Auto-score
    for (const a of answers) {
      if (autoScoredRef.current.has(a.participantId)) continue

      let isCorrect = false
      if (currentQuestionType === 'objective') {
        if (cqi != null && a.choiceIndex === cqi) isCorrect = true
      } else {
        if (correctAnswer && normalizeAnswer(a.text) === normalizeAnswer(correctAnswer)) isCorrect = true
      }

      if (isCorrect) {
        const current = scores[a.participantId]?.total || 0
        await set(ref(database, `rooms/${roomCode}/scores/${a.participantId}`), {
          nickname: a.nickname,
          total: current + pointValue,
        })
        autoScoredRef.current.add(a.participantId)
      }
    }

    // Update phase in Firebase so participants see the correct answer
    await set(ref(database, `rooms/${roomCode}/currentQuestion/phase`), 'reviewing')
    setPhase('reviewing')
  }

  // --- Go to next question (Host) ---
  function nextQuestion() {
    setPhase('writing')
    setCorrectAnswer('')
    setScoreInputs({})
    setQuestionType('subjective')
    setChoices(['', '', '', ''])
    setCorrectChoiceIndex(null)
    autoScoredRef.current = new Set()
  }

  // --- Submit Answer (Participant) ---
  async function submitAnswer() {
    if (currentQuestionType === 'objective') {
      if (selectedChoice == null) return
      const text = currentChoices[selectedChoice] || `${selectedChoice + 1}번`
      const answerRef = push(ref(database, `rooms/${roomCode}/answers`))
      await set(answerRef, {
        participantId,
        nickname,
        text,
        choiceIndex: selectedChoice,
        submittedAt: Date.now(),
      })
      setAnswerText(text)
    } else {
      const text = answerText.trim()
      if (!text) return
      const answerRef = push(ref(database, `rooms/${roomCode}/answers`))
      await set(answerRef, {
        participantId,
        nickname,
        text,
        submittedAt: Date.now(),
      })
    }
    setHasSubmitted(true)
  }

  // --- Give Score (Host) ---
  async function giveScore(pId, pNickname) {
    const value = parseInt(scoreInputs[pId], 10)
    if (isNaN(value)) return

    const current = scores[pId]?.total || 0
    await set(ref(database, `rooms/${roomCode}/scores/${pId}`), {
      nickname: pNickname,
      total: current + value,
    })
    setScoreInputs((prev) => ({ ...prev, [pId]: '' }))
  }

  // --- End Game (Host) ---
  async function endGame() {
    await set(ref(database, `rooms/${roomCode}/status`), 'ended')
    setScreen('ended')
  }

  // --- Reset ---
  function resetGame() {
    if (role === 'host' && roomCode) {
      remove(ref(database, `rooms/${roomCode}`))
    }
    setScreen('lobby')
    setRole(null)
    setRoomCode('')
    setHostId(null)
    setParticipantId(null)
    setNickname('')
    setParticipants([])
    setQuestionNumber(0)
    setQuestionText('')
    setQuestionInput('')
    setCorrectAnswerInput('')
    setPointValueInput('10')
    setAnswerText('')
    setAnswers([])
    setHasSubmitted(false)
    setJoinCode('')
    setJoinNickname('')
    setError('')
    setScores({})
    setScoreInputs({})
    setShowScoreboard(false)
    setPhase('writing')
    setCorrectAnswer('')
    setPointValue(10)
    setQuestionType('subjective')
    setChoices(['', '', '', ''])
    setCorrectChoiceIndex(null)
    setSelectedChoice(null)
    setCurrentChoices([])
    setCurrentQuestionType('subjective')
    autoScoredRef.current = new Set()
    prevQuestionNumberRef.current = 0
  }

  function copyRoomCode() {
    navigator.clipboard?.writeText(roomCode)
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

  // Check if a participant's answer is correct
  function isAnswerCorrect(answer) {
    if (currentQuestionType === 'objective') {
      if (answer.choiceIndex == null) return null
      // Get correctChoiceIndex from Firebase data cached in correctAnswer
      // For objective, correctAnswer = choices[correctChoiceIndex]
      if (!correctAnswer) return null
      return normalizeAnswer(answer.text) === normalizeAnswer(correctAnswer)
    }
    if (!correctAnswer) return null
    return normalizeAnswer(answer.text) === normalizeAnswer(correctAnswer)
  }

  return (
    <div className="gb">
      <div className="gb__bg"></div>

      {/* ========== LOBBY ========== */}
      {screen === 'lobby' && (
        <div className="gb__screen gb__lobby">
          <Link to="/recreation" className="gb__back-link">← 레크레이션 목록</Link>
          <h1 className="gb__title">도전!<br />골든벨</h1>
          <p className="gb__subtitle">실시간 퀴즈 게임으로 순모임을 더 즐겁게!</p>

          {error && <div className="gb__error">{error}</div>}

          <div className="gb__lobby-actions">
            <div className="gb__lobby-card">
              <div className="gb__lobby-card-icon">🎤</div>
              <h3 className="gb__lobby-card-title">호스트</h3>
              <p className="gb__lobby-card-desc">방을 만들고 문제를 출제합니다</p>
              <button
                className="gb__btn gb__btn--primary"
                onClick={createRoom}
                disabled={isLoading}
              >
                {isLoading ? '생성 중...' : '방 만들기'}
              </button>
            </div>

            <div className="gb__lobby-divider">
              <span>또는</span>
            </div>

            <div className="gb__lobby-card">
              <div className="gb__lobby-card-icon">✋</div>
              <h3 className="gb__lobby-card-title">참가자</h3>
              <p className="gb__lobby-card-desc">방에 들어가서 퀴즈에 참여합니다</p>
              <input
                className="gb__input gb__input--code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="방 코드 6자리"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, ''))}
              />
              <input
                className="gb__input"
                type="text"
                maxLength={10}
                placeholder="닉네임"
                value={joinNickname}
                onChange={(e) => setJoinNickname(e.target.value)}
              />
              <button
                className="gb__btn gb__btn--primary"
                onClick={joinRoom}
                disabled={isLoading}
              >
                {isLoading ? '입장 중...' : '참여하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== HOST WAITING ========== */}
      {screen === 'host-waiting' && (
        <div className="gb__screen gb__host-waiting">
          <div className="gb__admin-badge">
            🎤 <strong>호스트 화면</strong>
          </div>

          <h2 className="gb__section-title">방 코드를 공유하세요</h2>
          <div className="gb__room-code" onClick={copyRoomCode} title="클릭하여 복사">
            {roomCode}
          </div>
          <p className="gb__room-code-hint">터치하면 복사됩니다</p>

          <div className="gb__participants-section">
            <h3 className="gb__participants-title">
              참가자 ({participants.length}명)
            </h3>
            {participants.length === 0 ? (
              <div className="gb__waiting-message">
                <div className="gb__waiting-dots">
                  <span></span><span></span><span></span>
                </div>
                <p>참가자를 기다리는 중...</p>
              </div>
            ) : (
              <div className="gb__participants-grid">
                {participants.map((p) => (
                  <div key={p.id} className="gb__participant-chip">
                    {p.nickname}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="gb__actions">
            <button className="gb__btn gb__btn--secondary" onClick={resetGame}>
              나가기
            </button>
            <button
              className="gb__btn gb__btn--primary"
              onClick={startGame}
              disabled={participants.length === 0}
            >
              게임 시작 ({participants.length}명)
            </button>
          </div>
        </div>
      )}

      {/* ========== HOST GAME ========== */}
      {screen === 'host-game' && (
        <div className="gb__screen gb__host-game">
          <div className="gb__game-header">
            <div className="gb__admin-badge">🎤 <strong>호스트</strong></div>
            <div className="gb__game-stats">
              <span className="gb__stat">참가자 {totalCount}명</span>
              {phase === 'answering' && (
                <span className="gb__stat">답변 {answeredCount}/{totalCount}</span>
              )}
            </div>
          </div>

          {questionNumber > 0 && (
            <div className="gb__question-badge">Q{questionNumber}</div>
          )}

          {/* PHASE: WRITING */}
          {phase === 'writing' && (
            <div className="gb__question-area">
              <div className="gb__type-toggle">
                <button
                  className={`gb__type-btn ${questionType === 'subjective' ? 'gb__type-btn--active' : ''}`}
                  onClick={() => setQuestionType('subjective')}
                >
                  주관식
                </button>
                <button
                  className={`gb__type-btn ${questionType === 'objective' ? 'gb__type-btn--active' : ''}`}
                  onClick={() => setQuestionType('objective')}
                >
                  객관식
                </button>
              </div>

              <textarea
                className="gb__textarea"
                placeholder="문제를 입력하세요..."
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                rows={3}
              />

              {questionType === 'subjective' ? (
                <div className="gb__question-options">
                  <input
                    className="gb__input"
                    type="text"
                    placeholder="정답 (선택사항 - 입력하면 자동 채점)"
                    value={correctAnswerInput}
                    onChange={(e) => setCorrectAnswerInput(e.target.value)}
                  />
                  <input
                    className="gb__input gb__input--point"
                    type="number"
                    inputMode="numeric"
                    placeholder="배점"
                    value={pointValueInput}
                    onChange={(e) => setPointValueInput(e.target.value)}
                  />
                </div>
              ) : (
                <div className="gb__choices-input">
                  {choices.map((choice, i) => (
                    <div key={i} className="gb__choice-input-row">
                      <span className="gb__choice-number">{i + 1}</span>
                      <input
                        className="gb__input gb__input--choice"
                        type="text"
                        placeholder={`${i + 1}번 보기`}
                        value={choice}
                        onChange={(e) => {
                          const next = [...choices]
                          next[i] = e.target.value
                          setChoices(next)
                        }}
                      />
                      <button
                        type="button"
                        className={`gb__choice-correct-check ${correctChoiceIndex === i ? 'gb__choice-correct-check--active' : ''}`}
                        onClick={() => setCorrectChoiceIndex(i)}
                        title="정답으로 설정"
                      >
                        {correctChoiceIndex === i ? '✓ 정답' : '정답'}
                      </button>
                    </div>
                  ))}
                  <div className="gb__question-options">
                    <input
                      className="gb__input gb__input--point"
                      type="number"
                      inputMode="numeric"
                      placeholder="배점"
                      value={pointValueInput}
                      onChange={(e) => setPointValueInput(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button
                className="gb__btn gb__btn--primary"
                onClick={sendQuestion}
                disabled={
                  !questionInput.trim() ||
                  (questionType === 'objective' && choices.some((c) => !c.trim()))
                }
              >
                {questionNumber === 0 ? '첫 번째 문제 보내기' : '다음 문제 보내기'}
              </button>
            </div>
          )}

          {/* PHASE: ANSWERING */}
          {phase === 'answering' && questionNumber > 0 && (
            <>
              <div className="gb__current-question-box">
                <p className="gb__current-question-text">{questionText}</p>
                {correctAnswer && (
                  <p className="gb__current-question-answer-hidden">정답 설정됨 ({pointValue}점)</p>
                )}
              </div>

              <div className="gb__answers-section">
                <h3 className="gb__answers-title">참가자 답변</h3>
                {answers.length === 0 ? (
                  <div className="gb__waiting-message">
                    <div className="gb__waiting-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <p>답변을 기다리는 중...</p>
                  </div>
                ) : (
                  <div className="gb__answers-grid">
                    {answers.map((a) => (
                      <div key={a.id} className="gb__answer-card">
                        <div className="gb__answer-card-top">
                          <div className="gb__answer-nickname">{a.nickname}</div>
                          <div className="gb__answer-score-badge">
                            {scores[a.participantId]?.total || 0}점
                          </div>
                        </div>
                        <div className="gb__answer-text">{a.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="gb__phase-action">
                <button className="gb__btn gb__btn--primary" onClick={revealAnswer}>
                  답변 마감 & 정답 공개
                </button>
              </div>
            </>
          )}

          {/* PHASE: REVIEWING */}
          {phase === 'reviewing' && questionNumber > 0 && (
            <>
              <div className="gb__current-question-box">
                <p className="gb__current-question-text">{questionText}</p>
                {correctAnswer && (
                  <div className="gb__correct-answer-reveal">
                    <span className="gb__correct-answer-label">정답</span>
                    <span className="gb__correct-answer-text">{correctAnswer}</span>
                    <span className="gb__correct-answer-points">{pointValue}점</span>
                  </div>
                )}
              </div>

              <div className="gb__answers-section">
                <h3 className="gb__answers-title">채점 결과</h3>
                {answers.length > 0 && (
                  <div className="gb__answers-grid">
                    {answers.map((a) => {
                      const correct = isAnswerCorrect(a)
                      return (
                        <div key={a.id} className={`gb__answer-card ${correct === true ? 'gb__answer-card--correct' : correct === false ? 'gb__answer-card--wrong' : ''}`}>
                          <div className="gb__answer-card-top">
                            <div className="gb__answer-nickname">
                              {correct === true && <span className="gb__answer-mark">✅ </span>}
                              {correct === false && <span className="gb__answer-mark">❌ </span>}
                              {a.nickname}
                            </div>
                            <div className="gb__answer-score-badge">
                              {scores[a.participantId]?.total || 0}점
                            </div>
                          </div>
                          <div className="gb__answer-text">{a.text}</div>
                          <div className="gb__score-input-row">
                            <input
                              className="gb__input gb__input--score"
                              type="number"
                              inputMode="numeric"
                              placeholder="추가 점수"
                              value={scoreInputs[a.participantId] || ''}
                              onChange={(e) =>
                                setScoreInputs((prev) => ({
                                  ...prev,
                                  [a.participantId]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') giveScore(a.participantId, a.nickname)
                              }}
                            />
                            <button
                              className="gb__btn gb__btn--score"
                              onClick={() => giveScore(a.participantId, a.nickname)}
                              disabled={!scoreInputs[a.participantId]}
                            >
                              부여
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="gb__phase-action">
                <button className="gb__btn gb__btn--primary" onClick={nextQuestion}>
                  다음 문제 작성
                </button>
              </div>
            </>
          )}

          {/* Scoreboard Toggle */}
          <div className="gb__scoreboard-toggle">
            <button
              className={`gb__btn ${showScoreboard ? 'gb__btn--primary' : 'gb__btn--secondary'}`}
              onClick={() => setShowScoreboard((v) => !v)}
            >
              {showScoreboard ? '점수판 숨기기' : '점수판 보기'}
            </button>
          </div>

          {showScoreboard && scoreboard.length > 0 && (
            <div className="gb__scoreboard">
              <h3 className="gb__scoreboard-title">점수판</h3>
              <div className="gb__scoreboard-list">
                {scoreboard.map((s, i) => (
                  <div key={s.id} className={`gb__scoreboard-item ${i < 3 ? `gb__scoreboard-item--top${i + 1}` : ''}`}>
                    <span className="gb__scoreboard-rank">{i + 1}</span>
                    <span className="gb__scoreboard-name">{s.nickname}</span>
                    <span className="gb__scoreboard-total">{s.total}점</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="gb__actions gb__actions--bottom">
            <button className="gb__btn gb__btn--danger" onClick={endGame}>
              게임 종료
            </button>
          </div>
        </div>
      )}

      {/* ========== PARTICIPANT WAITING ========== */}
      {screen === 'participant-waiting' && (
        <div className="gb__screen gb__participant-waiting">
          <div className="gb__participant-badge">
            ✋ <strong>{nickname}</strong>
          </div>

          <h2 className="gb__section-title">입장 완료!</h2>
          <p className="gb__subtitle">호스트가 게임을 시작할 때까지 기다려주세요</p>

          <div className="gb__waiting-animation">
            <div className="gb__waiting-ring"></div>
            <div className="gb__waiting-ring gb__waiting-ring--2"></div>
            <div className="gb__waiting-ring gb__waiting-ring--3"></div>
          </div>

          <p className="gb__room-info">방 코드: {roomCode}</p>
        </div>
      )}

      {/* ========== PARTICIPANT GAME ========== */}
      {screen === 'participant-game' && (
        <div className="gb__screen gb__participant-game">
          <div className="gb__participant-header">
            <div className="gb__participant-badge">
              ✋ <strong>{nickname}</strong>
            </div>
            <div className="gb__my-score">
              {scores[participantId]?.total || 0}점
            </div>
          </div>

          {questionNumber > 0 ? (
            <>
              <div className="gb__question-badge">Q{questionNumber}</div>
              <div className="gb__question-display">
                <p className="gb__question-text">{questionText}</p>
              </div>

              {/* Reviewing phase: show correct answer */}
              {phase === 'reviewing' && correctAnswer && (
                <div className="gb__correct-answer-reveal gb__correct-answer-reveal--participant">
                  <span className="gb__correct-answer-label">정답</span>
                  <span className="gb__correct-answer-text">{correctAnswer}</span>
                </div>
              )}

              {/* Answering phase */}
              {phase === 'answering' && (
                <>
                  {hasSubmitted ? (
                    <div className="gb__submitted">
                      <div className="gb__submitted-icon">✅</div>
                      <p className="gb__submitted-text">제출 완료!</p>
                      <div className="gb__submitted-answer">{answerText}</div>
                      <button
                        className="gb__btn gb__btn--secondary"
                        onClick={() => { setHasSubmitted(false); setSelectedChoice(null) }}
                      >
                        수정하기
                      </button>
                    </div>
                  ) : currentQuestionType === 'objective' ? (
                    <div className="gb__answer-area">
                      <div className="gb__choice-buttons">
                        {currentChoices.map((choice, i) => (
                          <button
                            key={i}
                            className={`gb__choice-btn ${selectedChoice === i ? 'gb__choice-btn--selected' : ''}`}
                            onClick={() => setSelectedChoice(i)}
                          >
                            <span className="gb__choice-btn-number">{i + 1}</span>
                            <span className="gb__choice-btn-text">{choice}</span>
                          </button>
                        ))}
                      </div>
                      <button
                        className="gb__btn gb__btn--primary gb__btn--large"
                        onClick={submitAnswer}
                        disabled={selectedChoice == null}
                      >
                        제출
                      </button>
                    </div>
                  ) : (
                    <div className="gb__answer-area">
                      <textarea
                        className="gb__textarea"
                        placeholder="답을 입력하세요..."
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        rows={3}
                      />
                      <button
                        className="gb__btn gb__btn--primary gb__btn--large"
                        onClick={submitAnswer}
                        disabled={!answerText.trim()}
                      >
                        제출
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Reviewing phase: show result */}
              {phase === 'reviewing' && hasSubmitted && (() => {
                const myCorrect = correctAnswer
                  ? normalizeAnswer(answerText) === normalizeAnswer(correctAnswer)
                  : null
                return (
                  <div className="gb__submitted">
                    <div className="gb__submitted-icon">
                      {myCorrect === true ? '🎉' : myCorrect === false ? '😅' : '📝'}
                    </div>
                    <p className="gb__submitted-text">
                      {myCorrect === true ? '정답!' : myCorrect === false ? '오답' : '제출 완료'}
                    </p>
                    <div className="gb__submitted-answer">내 답: {answerText}</div>
                  </div>
                )
              })()}
            </>
          ) : (
            <div className="gb__waiting-message">
              <div className="gb__waiting-dots">
                <span></span><span></span><span></span>
              </div>
              <p>호스트가 문제를 준비하고 있습니다...</p>
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
            <Link to="/recreation" className="gb__btn gb__btn--secondary">
              레크레이션 목록
            </Link>
            <button className="gb__btn gb__btn--primary" onClick={resetGame}>
              새 게임
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoldenBellGame
