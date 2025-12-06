import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import './EventsPage.css'
import christmasBlessingImg from '../assets/images/events/christmas_blessing.webp'
import worshipWeekImg from '../assets/images/events/rejoice_worshipweek.webp'
import jaksimImg from '../assets/images/events/jaksim.webp'
import reLiveImg from '../assets/images/events/re-live.webp'
import everythanksImg from '../assets/images/events/everythanks.webp'
import rejoinusImg from '../assets/images/events/rejoinus-12.webp'

const communityEvents = [
  {
    id: 'christmas-blessing',
    name: 'Christmas Blessing',
    month: '12월',
    description: 'SNS 공동체가 함께하는 크리스마스 행사',
    image: christmasBlessingImg
  }
]

// 달력에 표시할 이벤트 날짜들
const calendarEvents = [
  { date: new Date(2025, 11, 8), title: 'Rejoice Worship Week', color: 'gold', targetId: 'worship-week' },
  { date: new Date(2025, 11, 9), title: 'Rejoice Worship Week', color: 'gold', targetId: 'worship-week' },
  { date: new Date(2025, 11, 10), title: 'Rejoice Worship Week', color: 'gold', targetId: 'worship-week' },
  { date: new Date(2025, 11, 11), title: 'Rejoice Worship Week', color: 'gold', targetId: 'worship-week' },
  { date: new Date(2025, 11, 12), title: 'Rejoice Worship Week', color: 'gold', targetId: 'worship-week' },
  { date: new Date(2025, 11, 13), title: '리조인어스', color: 'purple', targetId: 'rejoinus' },
  { date: new Date(2025, 11, 24), title: 'Christmas Blessing', color: 'green', targetId: 'christmas-blessing' },
  { date: new Date(2025, 11, 25), title: 'Christmas Blessing', color: 'green', targetId: 'christmas-blessing' },
  { date: new Date(2025, 11, 28), title: 'Re-Live', color: 'blue', targetId: 're-live' },
]

const rejoiceEvents = [
  {
    id: 'worship-week',
    category: '예배',
    name: '리조이스 워십 위크',
    description: '함께 예배하며 하나님을 높이는 시간',
    image: worshipWeekImg
  },
  {
    id: 'jaksim',
    category: '말씀',
    name: '작심한달',
    description: '한 달간 말씀에 집중하며 성장하는 시간',
    image: jaksimImg
  },
  {
    id: 're-live',
    category: '기도',
    name: 'Re-Live',
    description: '기도로 다시 살아나는 영적 회복의 시간',
    image: reLiveImg
  },
  {
    id: 'everythanks',
    category: '감사',
    name: '에브리땡스',
    description: '일상 속 감사를 나누고 고백하는 시간',
    image: everythanksImg
  },
  {
    id: 'rejoinus',
    category: '교제',
    name: '리조인어스',
    description: '리조이스 공동체가 함께하는 교제의 시간 (매달 프로그램 변경)',
    month: '12월',
    image: rejoinusImg
  }
]

function EventsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [highlightedEventId, setHighlightedEventId] = useState(null)

  // 해당 날짜의 이벤트 색상 가져오기
  const getEventColor = (date) => {
    const event = calendarEvents.find(
      (event) =>
        event.date.getFullYear() === date.getFullYear() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getDate() === date.getDate()
    )
    return event ? event.color : null
  }

  // 선택된 날짜의 이벤트 가져오기
  const getEventsForDate = (date) => {
    return calendarEvents.filter(
      (event) =>
        event.date.getFullYear() === date.getFullYear() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getDate() === date.getDate()
    )
  }

  // 날짜 클릭 시 해당 카드로 스크롤
  const handleDateChange = (date) => {
    setSelectedDate(date)
    const events = getEventsForDate(date)
    if (events.length > 0 && events[0].targetId) {
      const targetId = events[0].targetId
      setHighlightedEventId(targetId)

      // 해당 카드로 스크롤
      setTimeout(() => {
        const element = document.getElementById(`event-${targetId}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)

      // 6초 후 하이라이트 제거
      setTimeout(() => {
        setHighlightedEventId(null)
      }, 6000)
    }
  }

  const selectedEvents = getEventsForDate(selectedDate)

  return (
    <div className="events">
      <div className="events__background">
        <div className="events__overlay"></div>
      </div>

      <div className="events__container">
        <header className="events__header">
          <span className="events__badge">Events</span>
          <h1 className="events__title">REJOICE Events</h1>
        </header>

        {/* 달력 섹션 */}
        <section className="events__calendar-section">
          <div className="events__calendar-wrapper">
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              locale="ko-KR"
              tileClassName={({ date }) => {
                const color = getEventColor(date)
                return color ? `events__calendar-has-event events__calendar-has-event--${color}` : null
              }}
            />
          </div>
          {selectedEvents.length > 0 && (
            <div className="events__calendar-events">
              <h3 className="events__calendar-events-title">
                {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
              </h3>
              <ul className="events__calendar-events-list">
                {selectedEvents.map((event, index) => (
                  <li key={index} className={`events__calendar-event-item events__calendar-event-item--${event.color}`}>
                    {event.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* 공동체 행사 */}
        <section className="events__section">
          <div className="events__community-grid">
            {communityEvents.map((event) => (
              <div
                key={event.id}
                id={`event-${event.id}`}
                className={`events__community-card ${highlightedEventId === event.id ? 'events__card--highlighted' : ''}`}
              >
                {event.image && (
                  <div className="events__community-image">
                    <img src={event.image} alt={event.name} />
                  </div>
                )}
                <div className="events__community-content">
                  <span className="events__community-month">{event.month}</span>
                  <h3 className="events__community-name">{event.name}</h3>
                  <p className="events__community-description">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="events__divider">
          <span className="events__divider-line"></span>
          <span className="events__divider-text">Rejoice</span>
          <span className="events__divider-line"></span>
        </div>

        {/* 리조이스 행사 */}
        <section className="events__section">
          <div className="events__rejoice-grid">
            {rejoiceEvents.map((event) => (
              <div
                key={event.id}
                id={`event-${event.id}`}
                className={`events__rejoice-card ${highlightedEventId === event.id ? 'events__card--highlighted' : ''}`}
              >
                {event.image ? (
                  <div className="events__rejoice-image">
                    <img src={event.image} alt={event.name} />
                  </div>
                ) : (
                  <div className="events__rejoice-image events__rejoice-image--placeholder">
                    <span>Coming Soon</span>
                  </div>
                )}
                <div className="events__rejoice-content">
                  <span className="events__rejoice-category">{event.category}</span>
                  <h3 className="events__rejoice-name">{event.name}</h3>
                  <p className="events__rejoice-description">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default EventsPage
