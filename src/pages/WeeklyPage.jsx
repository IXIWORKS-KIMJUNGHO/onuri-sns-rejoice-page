import './WeeklyPage.css'

const icareItems = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: '출석체크',
    description: '순모임 참석 순원들의 출석을 기록합니다.',
    details: ['순원별 출석 여부 체크', '결석 사유 기록']
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: '기도제목',
    description: '순모임에서 나눈 기도제목을 등록합니다.',
    details: ['순원들의 기도 요청', '순모임 공동 기도제목']
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: '순모임 현황',
    description: '순모임 전반적인 상황을 기록합니다.',
    details: ['순모임 분위기 및 진행상황', '참석 인원 및 현황']
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: '특이사항',
    description: '순모임 중 발생한 특별한 사항을 기록합니다.',
    details: ['순원들의 중요한 소식', '관심이 필요한 사항']
  }
]

function WeeklyPage() {
  return (
    <div className="weekly">
      <div className="weekly__background">
        <div className="weekly__overlay"></div>
      </div>

      <div className="weekly__container">
        <header className="weekly__header">
          <span className="weekly__badge">Weekly</span>
          <h1 className="weekly__title">Weekly TO DO</h1>
        </header>

        {/* 중요 안내 */}
        <p className="weekly__subtitle">순모임 후 반드시 아래 2가지를 완료해주세요.</p>

        {/* 1. 순모임 출첵 링크 작성 */}
        <section className="weekly__section">
          <div className="weekly__section-header">
            <span className="weekly__section-number">1</span>
            <h2 className="weekly__section-title">순모임 출첵 링크 작성</h2>
          </div>
          <p className="weekly__section-description">
            순모임이 끝난 후 <strong>출석 체크 설문조사</strong>를 작성해주세요.
          </p>

          <div className="weekly__attendance-wrapper">
            <a
              href="https://forms.gle/FiFbeNC7wCrkA1uR8"
              target="_blank"
              rel="noopener noreferrer"
              className="weekly__attendance"
            >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            순모임 출석 체크하기
            </a>
          </div>
        </section>

        {/* 2. iCare 정보 등록 */}
        <section className="weekly__section">
          <div className="weekly__section-header">
            <span className="weekly__section-number">2</span>
            <h2 className="weekly__section-title">iCare 정보 등록</h2>
          </div>
          <p className="weekly__section-description">
            <strong>iCare</strong>는 온누리교회에서 제공하는 <strong>순모임 관리 시스템</strong>입니다. 순장님들은 순모임 후 다음 <strong>4가지 정보</strong>를 등록해주셔야 합니다.
          </p>

          <div className="weekly__icare-grid">
            {icareItems.map((item, index) => (
              <div key={index} className="weekly__icare-card">
                <div className="weekly__icare-header">
                  <span className="weekly__icare-icon">{item.icon}</span>
                  <h4 className="weekly__icare-title">{item.title}</h4>
                </div>
                <p className="weekly__icare-description">{item.description}</p>
                <ul className="weekly__icare-details">
                  {item.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="weekly__attendance-wrapper">
            <a
              href="https://www.ionnuri.org/index.do"
              target="_blank"
              rel="noopener noreferrer"
              className="weekly__attendance"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              iCare 바로가기
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}

export default WeeklyPage
