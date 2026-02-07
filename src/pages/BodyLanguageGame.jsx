import { useState } from 'react'
import { Link } from 'react-router-dom'
import './BodyLanguageGame.css'

const prompts = {
  시범: [
    '노래하는 너구리가 뛰면서 춤을 춘다',
    '파마한 쥐가 누워서 발레한다',
  ],
  운동: [
    '다리가 짧은 기린이 숨차게 마라톤을 뛴다',
    '날개 다친 참새가 미끄러지며 스케이트를 탄다',
    '땀범벅 고릴라가 힘자랑하며 역기를 든다',
    '꼬리 긴 도마뱀이 엑스자 줄넘기를 한다',
    '졸린 나무늘보가 눈 비비며 철봉을 한다',
    '뚱뚱한 펭귄이 중심 잃은 채 훌라후프를 돌린다',
    '노래듣는 돼지가 진지한 얼굴로 태권도를 한다',
    '허리 아픈 캥거루가 허리를 잡고 뜀틀을 한다',
  ],
  음식: [
    '이 빠진 토끼가 당근을 맛있게 먹는다',
    '배탈 난 곰이 울먹이며 꿀을 퍼먹는다',
    '춤추는 고양이가 투덜대며 생선을 핥는다',
    '살찐 너구리가 몰래 라면을 끓인다',
    '손 떨리는 원숭이가 바나나를 껍질째 먹는다',
    '코 막힌 돼지가 냄새 맡으며 김치를 먹는다',
    '졸린 펭귄이 급하게 수박을 먹는다',
    '배고픈 메뚜기가 분노한 채 사과를 깨문다',
  ],
  예술: [
    '목 쉰 까마귀가 감정 담아 노래를 부른다',
    '손가락이 짧은 티라노사우루스가 진지하게 피아노를 친다',
    '귀 작은 쥐가 박자 놓치며 드럼을 친다',
    '눈 나쁜 거미가 발레를 한다',
    '젖은 청개구리가 악보 거꾸로 들고 지휘를 한다',
    '비틀거리는 사자가 심각하게 랩을 한다',
    '긴 수염의 바다가재가 첼로를 켠다',
    '졸린 판다가 하품하며 연극을 한다',
  ],
}

const categories = Object.keys(prompts)

function BodyLanguageGame() {
  const [screen, setScreen] = useState('select') // 'select' | 'game'
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showPrompt, setShowPrompt] = useState(false)
  const [usedIndices, setUsedIndices] = useState([])

  function startCategory(category) {
    setSelectedCategory(category)
    setCurrentIndex(0)
    setUsedIndices([])
    setShowPrompt(false)
    setScreen('game')
  }

  function revealPrompt() {
    setShowPrompt(true)
  }

  function nextPrompt() {
    const categoryPrompts = prompts[selectedCategory]
    const newUsed = [...usedIndices, currentIndex]

    if (newUsed.length >= categoryPrompts.length) {
      // 모든 제시어 사용 완료, 다시 섞기
      setUsedIndices([])
      const randomIndex = Math.floor(Math.random() * categoryPrompts.length)
      setCurrentIndex(randomIndex)
    } else {
      // 사용하지 않은 제시어 중에서 랜덤 선택
      const availableIndices = categoryPrompts
        .map((_, i) => i)
        .filter(i => !newUsed.includes(i))
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
      setUsedIndices(newUsed)
      setCurrentIndex(randomIndex)
    }
    setShowPrompt(false)
  }

  function goBack() {
    setScreen('select')
    setSelectedCategory(null)
    setShowPrompt(false)
  }

  const currentPrompt = selectedCategory ? prompts[selectedCategory][currentIndex] : ''

  return (
    <div className="blg">
      <div className="blg__bg"></div>

      {/* 카테고리 선택 화면 */}
      {screen === 'select' && (
        <div className="blg__screen blg__select">
          <Link to="/recreation" className="blg__back-link">← 레크레이션 목록</Link>

          <h1 className="blg__title">몸으로 말해요</h1>
          <p className="blg__subtitle">카테고리를 선택하세요</p>

          <div className="blg__categories">
            {categories.map((category) => (
              <button
                key={category}
                className="blg__category-btn"
                onClick={() => startCategory(category)}
              >
                <span className="blg__category-icon">
                  {category === '시범' && '🎬'}
                  {category === '운동' && '🏃'}
                  {category === '음식' && '🍽️'}
                  {category === '예술' && '🎨'}
                </span>
                <span className="blg__category-name">{category}</span>
                <span className="blg__category-count">{prompts[category].length}개</span>
              </button>
            ))}
          </div>

          <div className="blg__rules">
            <h3 className="blg__rules-title">게임 방법</h3>
            <ol className="blg__rules-list">
              <li>팀별 대표자 2명이 앞으로 나옵니다</li>
              <li>"제시어 보기"를 눌러 제시어를 확인합니다</li>
              <li>대표자가 몸으로 표현합니다 (말 금지!)</li>
              <li>팀원들이 키워드를 맞추면 정답!</li>
            </ol>
          </div>
        </div>
      )}

      {/* 게임 화면 */}
      {screen === 'game' && (
        <div className="blg__screen blg__game">
          <button className="blg__back-btn" onClick={goBack}>
            ← 카테고리 선택
          </button>

          <div className="blg__category-badge">
            {selectedCategory === '시범' && '🎬'}
            {selectedCategory === '운동' && '🏃'}
            {selectedCategory === '음식' && '🍽️'}
            {selectedCategory === '예술' && '🎨'}
            {selectedCategory}
          </div>

          <div className="blg__prompt-area">
            {!showPrompt ? (
              <div className="blg__prompt-hidden">
                <div className="blg__prompt-icon">🤫</div>
                <p className="blg__prompt-hint">대표자만 보세요!</p>
                <button className="blg__reveal-btn" onClick={revealPrompt}>
                  제시어 보기
                </button>
              </div>
            ) : (
              <div className="blg__prompt-visible">
                <p className="blg__prompt-text">{currentPrompt}</p>
                <button className="blg__next-btn" onClick={nextPrompt}>
                  다음 제시어
                </button>
              </div>
            )}
          </div>

          <div className="blg__tip">
            💡 팀원들에게 화면이 보이지 않도록 주의하세요!
          </div>
        </div>
      )}
    </div>
  )
}

export default BodyLanguageGame
