import './GuidePage.css'

function GuidePage() {
  const meetingFlow = [
    {
      step: 1,
      title: '시작기도',
      description: '순모임을 하나님께 맡기며 시작합니다'
    },
    {
      step: 2,
      title: '한주간의 삶 나눔',
      description: '지난 한 주간의 삶의 은혜와 감사를 나눕니다'
    },
    {
      step: 3,
      title: '말씀묵상',
      description: '주일 말씀 / QT 말씀을 묵상합니다'
    },
    {
      step: 4,
      title: '묵상나눔',
      description: '말씀을 통해 받은 은혜와 깨달음을 나눕니다'
    },
    {
      step: 5,
      title: '기도제목 나눔',
      description: '서로의 기도제목을 나누고 함께 기도합니다'
    },
    {
      step: 6,
      title: '마무리기도',
      description: '순모임을 감사하며 마무리합니다'
    }
  ]

  const guidelines = [
    {
      number: '01',
      text: '순 배치를 받은 순에서 약속한 순모임 시간에 성실하게 참석하겠습니다. 공동체의 공지를 확인하고 소통에 적극 응하겠습니다.'
    },
    {
      number: '02',
      text: "공동체의 영적 양식을 함께 나누는 지체로서 본인이 속한 'SNS 청년부 주일예배' 시간을 지켜(4시 ON TIME) 꼭 예배를 드리고 순모임에 참석하도록 노력하겠습니다."
    },
    {
      number: '03',
      text: '순모임은 큐티로 이루어지므로 매일 일정 시간 큐티를 포함한 말씀 묵상과 기도생활을 하도록 노력 하겠습니다.'
    },
    {
      number: '04',
      text: '순모임을 섬기는 순장과 순원을 존중하고 귀히 여기며, 배려와 사랑의 마음으로 대하겠습니다. 순모임 중 서로의 나눔을 끝까지 경청하고 순모임 내에서 나눈 모든 이야기를 다른 곳으로 옮겨 말하지 않겠습니다. 순모임 및 순카톡방에서 욕설, 비속어, 판단과 비방과 소문, 정치, 사회이슈 등을 언급하지 않겠습니다.'
    },
    {
      number: '05',
      text: '다른 순원에게 무리한 요구(보험권유, 금전적거래)를 하거나, 외부 성경공부 및 술자리 등의 순밖의 모임을 권하지 않겠습니다.'
    },
    {
      number: '06',
      text: '순 카톡방에 큐티 혹은 묵상나눔을 제외한 소식(공동체 말씀 외 설교, 할인 쿠폰 등)들을 공유하고 싶을 때는 순장님에게 꼭 확인 후 올리겠습니다.'
    },
    {
      number: '07',
      text: '개인정보보호를 위해 상대의 동의없는 사진과 동영상 촬영은 금지하며 무단 배포하지 않습니다. ex) 인스타그램, 페북, 개인블로그, 순톡방 등'
    },
    {
      number: '08',
      text: '순모임을 결석하는 불가피한 사유가 있을 때에는 순장에게 모임 하루 전 혹은 당일에 미리 이야기하고 무단결석을 하지 않겠습니다.'
    },
    {
      number: '09',
      text: '순장에게 명확한 사유를 말하지 않고 5주이상 순모임 무단 결석 및 순장의 연락에 답하지 않을 때는 안내에 따라 순모임 카톡방에서 나와 후속 지침을 그대로 따르겠습니다.'
    },
    {
      number: '10',
      text: '공동체 교역자님과 리더십의 영적 지도와 권면에 충실히 따르겠습니다.'
    }
  ]

  return (
    <section className="guide">
      <div className="guide__background">
        <div className="guide__overlay"></div>
      </div>

      <div className="guide__container">
        {/* Header */}
        <div className="guide__header">
          <div className="guide__badge">Guide</div>
          <h1 className="guide__title">순모임 가이드</h1>
          <p className="guide__subtitle">
            <strong>순모임을 준비</strong>하고 인도하는 데 필요한 모든 정보를 확인하세요
          </p>
        </div>

        {/* 순모임 진행 흐름 */}
        <div className="guide__section">
          <div className="guide__section-header">
            <svg className="guide__section-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            <h2 className="guide__section-title">순모임 진행 흐름</h2>
          </div>
          <p className="guide__section-note">순원들 참여여부 사전 확인 (토요일까지)</p>

          <div className="guide__flow">
            {meetingFlow.map((item, index) => (
              <div className="guide__flow-item" key={item.step}>
                <div className="guide__flow-step">{item.step}</div>
                <div className="guide__flow-content">
                  <h3 className="guide__flow-title">{item.title}</h3>
                  <p className="guide__flow-description">{item.description}</p>
                </div>
                {index < meetingFlow.length - 1 && (
                  <div className="guide__flow-line"></div>
                )}
              </div>
            ))}
          </div>

          <div className="guide__tip">
            <svg className="guide__tip-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            <div className="guide__tip-content">
              <p className="guide__tip-title">온누리 교회 순모임은 생명의 삶 QT말씀을 기반으로 이뤄집니다.</p>
              <p className="guide__tip-text">최소 1시간 이상 충분한 나눔이 이루어질 수 있도록 인도해주세요!</p>
            </div>
          </div>
        </div>

        {/* 순모임 십계명 */}
        <div className="guide__section">
          <div className="guide__section-header">
            <svg className="guide__section-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h2 className="guide__section-title">순모임 서약</h2>
          </div>
          <p className="guide__section-subtitle">첫 만남 시 순원들과 함께 나눠주세요</p>

          <div className="guide__guidelines">
            {guidelines.map((item) => (
              <div className="guide__guideline-item" key={item.number}>
                <span className="guide__guideline-number">{item.number}</span>
                <p className="guide__guideline-text">{item.text}</p>
              </div>
            ))}
          </div>

          <p className="guide__guidelines-footer">
            본 서약을 준수하지 못한 경우에는 공동체와 교역자님의 가이드에 순종하겠습니다.
          </p>
        </div>
      </div>
    </section>
  )
}

export default GuidePage
