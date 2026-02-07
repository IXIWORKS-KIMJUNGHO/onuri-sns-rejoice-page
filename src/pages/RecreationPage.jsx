import { Link } from 'react-router-dom'
import './RecreationPage.css'

const recreations = [
  {
    id: 1,
    name: '1교시 돋보기로 보는 탐구생활',
    participants: '제한 없음',
    duration: '15~30분',
    description: '점점 커지는 원 안에서 사진 속 인물을 맞히는 게임입니다. 사진을 업로드하고 확대 시작 위치를 설정하면, 12단계로 점점 드러나는 사진 속 인물을 맞춰보세요!',
    rules: [
      '진행자가 사진을 업로드하고 확대 시작 위치를 설정합니다',
      '작은 원에서 시작해 12단계로 점점 확대됩니다',
      '참가자들이 누구인지 맞추면 정답 공개!',
      '화살표(→) 또는 스페이스바로 다음 단계를 진행합니다',
    ],
    link: '/recreation/guess-leader',
  },
  {
    id: 2,
    name: '2교시 리듬 탐구생활',
    participants: '1명씩 도전',
    duration: '10~20분',
    description: '비트에 맞춰 사진 속 단어를 말하는 리듬 게임입니다. 사진을 업로드하고 난이도를 선택하면, 점점 빨라지는 비트에 맞춰 클리어해보세요!',
    rules: [
      '진행자가 사진 2장 이상을 업로드하고 난이도(쉬움/보통/어려움)를 선택합니다',
      '학습 페이즈: 업로드된 사진 중 랜덤 8장이 비트에 맞춰 순서대로 공개됩니다',
      '도전 페이즈: 같은 순서로 사진이 나오면 참가자가 비트에 맞춰 단어를 말합니다',
      '레벨이 올라갈수록 BPM이 빨라집니다!',
    ],
    link: '/recreation/say-the-word',
  },
  {
    id: 3,
    name: '3교시 친구 탐구생활',
    participants: '2명 이상',
    duration: '15~30분',
    description: '호스트가 문제를 내면 참가자들이 각자 핸드폰으로 답을 제출하는 실시간 퀴즈 게임입니다. 방 코드를 공유해 누구나 쉽게 참여할 수 있습니다!',
    rules: [
      '호스트가 방을 만들고, 참가자들이 방 코드와 닉네임으로 입장합니다',
      '호스트가 문제를 작성해 전송하면, 참가자 화면에 문제가 표시됩니다',
      '참가자들은 각자 답을 작성해 제출합니다',
      '호스트 화면에 모든 참가자의 답이 실시간으로 표시됩니다',
    ],
    link: '/recreation/golden-bell',
  },
  {
    id: 4,
    name: '[방과후학교] 눈으로 보는 노래반',
    participants: '제한 없음',
    duration: '10~20분',
    description: '이모지를 보고 어떤 찬양인지 맞춰보는 게임입니다. 이모지 속에 숨겨진 찬양 제목을 맞춰보세요!',
    rules: [
      '화면에 이모지 조합이 표시됩니다',
      '참가자들이 이모지를 보고 찬양 제목을 추측합니다',
      '힌트가 필요하면 힌트 버튼을 누릅니다',
      '스페이스바 또는 정답 공개 버튼으로 정답을 확인합니다',
    ],
    link: '/recreation/emoji-song',
  },
  {
    id: 5,
    name: '[방과후학교] 심폐지구력 향상반',
    participants: '팀 대항',
    duration: '10~20분',
    description: '돌아가면서 기도제목을 말하고 촛불을 끄는 게임입니다. 누적된 꺼진 촛불이 가장 많은 팀이 승리!',
    rules: [
      '팀을 나누고 촛불을 준비합니다',
      '참가자가 돌아가면서 기도제목을 말합니다',
      '기도제목을 말한 후 촛불을 불어서 끕니다',
      '누적된 꺼진 촛불이 가장 많은 팀이 승리합니다',
    ],
    link: null,
  },
  {
    id: 6,
    name: '[방과후학교] 언어 표현력 심화반',
    participants: '팀 대항',
    duration: '15~30분',
    description: '팀별 대표자가 몸으로 표현하고 팀원들이 맞추는 게임입니다. 키워드만 맞으면 정답 인정!',
    rules: [
      '팀을 나누고 팀별 대표자 2명이 앞으로 나옵니다',
      '대표자가 제시어를 몸으로 표현합니다 (말 금지!)',
      '팀원들이 키워드를 맞추면 정답 인정',
      '맞춘 만큼 점수를 획득합니다',
    ],
    link: '/recreation/body-language',
  },
  {
    id: 7,
    name: '[방과후학교] 창의적 시각 사고반: 캐치마인드',
    participants: '팀 대항',
    duration: '15~30분',
    description: '제한시간 동안 한 명이 그림을 그리고 나머지 팀원이 맞추는 게임입니다.',
    rules: [
      '팀을 나누고 그림 그릴 사람을 정합니다',
      '제한시간 동안 제시어를 그림으로 표현합니다',
      '나머지 팀원들이 그림을 보고 정답을 맞춥니다',
      '그림 그리는 사람은 문제마다 교체됩니다',
    ],
    link: '/recreation/catch-mind',
  },
]

// 카드 내용 컴포넌트
function CardContent({ item }) {
  return (
    <>
      <div className="recreation__card-header">
        <h3 className="recreation__card-name">{item.name}</h3>
        <p className="recreation__card-description">{item.description}</p>
      </div>

      <div className="recreation__card-meta">
        <div className="recreation__card-meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>{item.participants}</span>
        </div>
        <div className="recreation__card-meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>{item.duration}</span>
        </div>
      </div>

      <div className="recreation__card-rules">
        <h4 className="recreation__card-rules-title">진행 방법</h4>
        <ol className="recreation__card-rules-list">
          {item.rules.map((rule, index) => (
            <li key={index} className="recreation__card-rules-item">{rule}</li>
          ))}
        </ol>
      </div>

      <div className="recreation__card-action">
        <span className="recreation__card-btn">
          {item.link ? '게임 시작하기 →' : '준비중'}
        </span>
      </div>
    </>
  )
}

function RecreationPage() {
  return (
    <section className="recreation">
      <div className="recreation__background">
        <div className="recreation__overlay"></div>
      </div>

      <div className="recreation__container">
        {/* Header */}
        <div className="recreation__header">
          <div className="recreation__badge">Recreation</div>
          <h1 className="recreation__title">레크레이션</h1>
          <p className="recreation__subtitle">
            순모임과 공동체 활동에서 활용할 수 있는 레크레이션을 소개합니다
          </p>
        </div>

        {/* Recreation Cards */}
        <div className="recreation__grid">
          {recreations.map((item) => (
            item.link ? (
              <Link
                key={item.id}
                to={item.link}
                className="recreation__card recreation__card--clickable"
              >
                <CardContent item={item} />
              </Link>
            ) : (
              <div key={item.id} className="recreation__card recreation__card--disabled">
                <CardContent item={item} />
              </div>
            )
          ))}
        </div>

        {/* Tip */}
        <div className="recreation__tip">
          <svg className="recreation__tip-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          <div className="recreation__tip-content">
            <p className="recreation__tip-title">레크레이션 활용 팁</p>
            <p className="recreation__tip-text">
              순모임 시작 전 아이스브레이커로 분위기를 풀어주면 더 깊은 나눔이 가능합니다.
              활동 후에는 자연스럽게 말씀 나눔으로 연결해 보세요!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RecreationPage
