import './AboutRejoice.css'

function AboutRejoice() {
  const leaderRoles = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      title: '순모임 인도',
      description: '주일 순모임을 준비하고 인도합니다.',
      detail: '순모임은 한주간 삶에서 각자 드린 예배와 주일 교회에 함께 모여 드린 예배의 연장선입니다.'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      ),
      title: 'QT & 기도',
      description: '매일 QT와 기도로 하나님과 동행합니다.',
      detail: '하나님과의 동행을 순톡방에서 나눕니다.'
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      title: '에센스',
      description: '목요일 LTC 티칭 및 나눔 참석하기',
      details: [
        '참여 어려울 시, 당일 3시까지 다락방장에게 사유와 함께 연락 & 에센스Q 제출 필수',
        '주일 순모임 인도가 어려울 경우, 부순장이 대신 참석'
      ]
    }
  ]

  return (
    <section className="about" id="about">
      <div className="about__background">
        <div className="about__overlay"></div>
      </div>

      <div className="about__container">
        {/* Rejoice 소개 */}
        <div className="about__intro">
          <div className="about__badge">About</div>
          <h1 className="about__title">
            예배하는 그룹, <span className="about__title-highlight">REJOICE</span>
          </h1>
          <p className="about__description">
            <strong>Rejoice</strong>는 <strong>온누리교회 청년부 SNS</strong>의 <strong>예배 그룹</strong>입니다.<br />
            <strong>어린아이</strong>처럼 순수한 마음으로 <strong>하나님</strong> 앞에 나아가 <strong>힘을 다해 예배</strong>하는 그룹을 꿈꿉니다.
          </p>
          <div className="about__verse">
            <p className="about__verse-theme">Worship like a child</p>
            <p className="about__verse-text">
              "David, wearing a linen ephod, danced before the Lord with all his might."
            </p>
            <p className="about__verse-ref">2 Samuel 6:14</p>
          </div>
        </div>

        {/* 순장의 역할 */}
        <div className="about__roles">
          <div className="about__roles-header">
            <svg className="about__roles-header-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <h2 className="about__roles-title">순장의 역할</h2>
          </div>
          <p className="about__roles-intro">
            순장님은 Rejoice 그룹의 핵심 리더로서 세 가지 중요한 역할을 담당합니다.
          </p>

          <div className="about__roles-grid">
            {leaderRoles.map((role, index) => (
              <div className="about__role-card" key={index}>
                <div className="about__role-header">
                  <span className="about__role-icon">{role.icon}</span>
                  <h4 className="about__role-title">{role.title}</h4>
                </div>
                <p className="about__role-description">{role.description}</p>
                {role.detail && (
                  <p className="about__role-detail">{role.detail}</p>
                )}
                {role.details && (
                  <ul className="about__role-details">
                    {role.details.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutRejoice
