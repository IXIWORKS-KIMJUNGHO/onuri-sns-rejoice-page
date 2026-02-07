import { useState } from 'react'
import { Link } from 'react-router-dom'
import './CatchMindGame.css'

const prompts = {
  속담: [
    '가는 말이 고와야 오는 말이 곱다',
    '개구리 올챙이 적 생각 못한다',
    '고래 싸움에 새우 등 터진다',
    '꿩 먹고 알 먹기',
    '남의 떡이 더 커 보인다',
    '돌다리도 두들겨 보고 건너라',
    '등잔 밑이 어둡다',
    '말 한마디로 천 냥 빚 갚는다',
    '바늘 도둑이 소 도둑 된다',
  ],
  예능: [
    '무한도전',
    '모태솔로지만 연애는 하고싶어',
    '런닝맨',
    '환승연애',
    '슈퍼맨이 돌아왔다',
    '전국노래자랑',
    '복면가왕',
    '신서유기',
    '하트시그널',
    '나는 SOLO',
  ],
  스포츠: [
    '배구',
    '탁구',
    '배드민턴',
    '육상',
    '리듬체조',
    '태권도',
    '펜싱',
    '피겨스케이팅',
    '클라이밍',
    '승마',
  ],
}

const categories = Object.keys(prompts)

function CatchMindGame() {
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
    <div className="cmg">
      <div className="cmg__bg"></div>

      {/* 카테고리 선택 화면 */}
      {screen === 'select' && (
        <div className="cmg__screen cmg__select">
          <Link to="/recreation" className="cmg__back-link">← 레크레이션 목록</Link>

          <h1 className="cmg__title">캐치마인드</h1>
          <p className="cmg__subtitle">카테고리를 선택하세요</p>

          <div className="cmg__categories">
            {categories.map((category) => (
              <button
                key={category}
                className="cmg__category-btn"
                onClick={() => startCategory(category)}
              >
                <span className="cmg__category-icon">
                  {category === '속담' && '📜'}
                  {category === '예능' && '📺'}
                  {category === '스포츠' && '⚽'}
                </span>
                <span className="cmg__category-name">{category}</span>
                <span className="cmg__category-count">{prompts[category].length}개</span>
              </button>
            ))}
          </div>

          <div className="cmg__rules">
            <h3 className="cmg__rules-title">게임 방법</h3>
            <ol className="cmg__rules-list">
              <li>팀을 나누고 그림 그릴 사람을 정합니다</li>
              <li>"제시어 보기"를 눌러 제시어를 확인합니다</li>
              <li>제한시간 동안 제시어를 그림으로 표현합니다</li>
              <li>나머지 팀원들이 그림을 보고 정답을 맞춥니다</li>
            </ol>
          </div>
        </div>
      )}

      {/* 게임 화면 */}
      {screen === 'game' && (
        <div className="cmg__screen cmg__game">
          <button className="cmg__back-btn" onClick={goBack}>
            ← 카테고리 선택
          </button>

          <div className="cmg__category-badge">
            {selectedCategory === '속담' && '📜'}
            {selectedCategory === '예능' && '📺'}
            {selectedCategory === '스포츠' && '⚽'}
            {selectedCategory}
          </div>

          <div className="cmg__prompt-area">
            {!showPrompt ? (
              <div className="cmg__prompt-hidden">
                <div className="cmg__prompt-icon">🎨</div>
                <p className="cmg__prompt-hint">그리는 사람만 보세요!</p>
                <button className="cmg__reveal-btn" onClick={revealPrompt}>
                  제시어 보기
                </button>
              </div>
            ) : (
              <div className="cmg__prompt-visible">
                <p className="cmg__prompt-text">{currentPrompt}</p>
                <button className="cmg__next-btn" onClick={nextPrompt}>
                  다음 제시어
                </button>
              </div>
            )}
          </div>

          <div className="cmg__tip">
            🖌️ 팀원들에게 화면이 보이지 않도록 주의하세요!
          </div>
        </div>
      )}
    </div>
  )
}

export default CatchMindGame
