import { useState } from 'react'
import './PlacesPage.css'
import placementImage from '../assets/images/onnuri-placement.png'

const places = [
  {
    id: 'sarang',
    name: '사랑홀',
    description: '순모임 및 그룹모임 장소',
    isGroupMeeting: true,
    currentMonth: ['김명현', '김수민', '조경원'],
    leaders: [
      { darakbang: '김명현', members: ['서수환', '김동연', '배혜란', '배장호', '권효주'] },
      { darakbang: '김수민', members: ['이한나', '조현재', '김예림', '정지은', '신민철'] },
      { darakbang: '조경원', members: ['이연주', '장동은', '김지현', '전소현', '문송'] },
    ],
  },
  {
    id: 'aaron',
    name: '아론홀',
    description: '순모임 장소',
    isGroupMeeting: false,
    currentMonth: ['김정호'],
    leaders: [
      { darakbang: '김정호', members: ['황영택', '김재현', '조우신', '윤혜인', '최현지'] },
    ],
  },
  {
    id: 'hul',
    name: '훌홀',
    description: '순모임 장소',
    isGroupMeeting: false,
    currentMonth: ['신지원'],
    leaders: [
      { darakbang: '신지원', members: ['곽혜정', '양동하', '장승원', '양시영', '주세빈'] },
    ],
  },
  {
    id: 'singwan',
    name: '선교관 202호',
    description: '순모임 장소',
    isGroupMeeting: false,
    currentMonth: ['김동권'],
    leaders: [
      { darakbang: '김동권', members: ['김병찬', '심지혜', '이영원', '김다솜', '김상엽'] },
    ],
  }
]

const trashRules = [
  {
    title: '남은 음식물',
    description: '밀봉해서 버려주세요'
  },
  {
    title: '큰 박스',
    description: '비우고 펴서 쓰레기통 옆에 버려주세요',
    warning: '쓰레기봉투에 넣지 마세요! 분리해서 버려주세요'
  }
]

function PlacesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="places">
      <div className="places__background">
        <div className="places__overlay"></div>
      </div>

      <div className="places__container">
        <header className="places__header">
          <span className="places__badge">Places</span>
          <h1 className="places__title">순모임 장소</h1>
          <p className="places__subtitle">
            리조이스 순모임은 아래 장소에서 진행됩니다
          </p>
          <p className="places__rotation-notice">
            매달 순모임 장소는 다락방별로 로테이션됩니다
          </p>
        </header>

        {/* 위치 안내 이미지 */}
        <section className="places__map-section">
          <div className="places__map-image-wrapper" onClick={() => setIsModalOpen(true)}>
            <img src={placementImage} alt="온누리교회 순모임 장소 안내" className="places__map-image" />
            <div className="places__map-zoom-hint">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11 8V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 11H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>클릭하여 크게 보기</span>
            </div>
          </div>
        </section>

        {/* 이미지 모달 */}
        {isModalOpen && (
          <div className="places__modal" onClick={() => setIsModalOpen(false)}>
            <div className="places__modal-content">
              <img src={placementImage} alt="온누리교회 순모임 장소 안내" className="places__modal-image" />
              <button className="places__modal-close" onClick={() => setIsModalOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* 장소 카드 그리드 */}
        <section className="places__section">
          <div className="places__grid">
            {places.map((place) => (
              <div key={place.id} className={`places__card ${place.isGroupMeeting ? 'places__card--highlight' : ''}`}>
                <div className="places__card-header">
                  <h3 className="places__card-name">{place.name}</h3>
                  {place.isGroupMeeting && (
                    <span className="places__card-badge">그룹모임</span>
                  )}
                </div>
                <p className="places__card-description">{place.description}</p>
                <div className="places__card-month">
                  <span className="places__card-month-label">이번 달</span>
                  <span className="places__card-month-teams">
                    {place.currentMonth.join(', ')} 다락방
                  </span>
                </div>
                <div className="places__card-leaders">
                  {place.leaders.map((leader, index) => (
                    <div key={index} className="places__card-leader">
                      <span className="places__card-leader-darakbang">{leader.darakbang} 다락방</span>
                      <span className="places__card-leader-members">{leader.members.join(', ')} 순</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 쓰레기 정리 안내 */}
        <section className="places__trash-section">
          <div className="places__trash-header">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.64 1.55 19C1.55 19.36 1.64 19.7 1.82 20C2 20.3 2.26 20.56 2.56 20.74C2.86 20.92 3.2 21.01 3.55 21.01H20.49C20.84 21.01 21.18 20.92 21.48 20.74C21.78 20.56 22.04 20.3 22.22 20C22.4 19.7 22.49 19.36 22.49 19C22.49 18.64 22.4 18.3 22.22 18L13.75 3.86C13.57 3.56 13.31 3.32 13.01 3.15C12.71 2.98 12.37 2.89 12.02 2.89C11.67 2.89 11.33 2.98 11.03 3.15C10.73 3.32 10.47 3.56 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2 className="places__trash-title">쓰레기 정리 안내</h2>
          </div>
          <p className="places__trash-subtitle">
            순모임 후 깨끗하게 정리해주세요!
          </p>

          <div className="places__trash-rules">
            {trashRules.map((rule, index) => (
              <div key={index} className="places__trash-rule">
                <div className="places__trash-rule-content">
                  <h4 className="places__trash-rule-title">{rule.title}</h4>
                  <p className="places__trash-rule-description">{rule.description}</p>
                  {rule.warning && (
                    <p className="places__trash-rule-warning">{rule.warning}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default PlacesPage
