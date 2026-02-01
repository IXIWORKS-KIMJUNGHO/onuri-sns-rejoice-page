import { Link } from 'react-router-dom'
import './RecreationPage.css'

const recreations = [
  {
    id: 1,
    name: '순장님 맞히기',
    participants: '제한 없음',
    duration: '15~30분',
    description: '점점 커지는 원 안에서 순장님 얼굴을 맞히는 게임입니다. 사진을 업로드하고 확대 시작 위치를 설정하면, 12단계로 점점 드러나는 사진 속 인물을 맞춰보세요!',
    rules: [
      '진행자가 순장님 사진을 업로드하고 확대 시작 위치를 설정합니다',
      '작은 원에서 시작해 12단계로 점점 확대됩니다',
      '참가자들이 누구인지 맞추면 성공!',
      '화살표(→) 또는 스페이스바로 다음 단계를 진행합니다',
    ],
    link: '/recreation/guess-leader',
  },
  {
    id: 2,
    name: '도전! 골든벨',
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
]

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
            <div key={item.id} className="recreation__card">
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

              {item.link && (
                <div className="recreation__card-action">
                  <Link to={item.link} className="recreation__card-btn">
                    게임 시작하기
                  </Link>
                </div>
              )}
            </div>
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
