import { Link } from 'react-router-dom'
import './Hero.css'

function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero__background">
        <div className="hero__overlay"></div>
      </div>

      <div className="hero__content">
        <div className="hero__badge">온누리교회 청년부</div>
        <h1 className="hero__title">SNS <span className="hero__title-highlight">REJOICE</span></h1>
        <div className="hero__theme">
          <p className="hero__theme-title">Worship like a child</p>
          <p className="hero__theme-verse">
            "다윗이 여호와 앞에서 힘을 다하여 춤추니라"
          </p>
          <p className="hero__theme-reference">사무엘하 6:14</p>
          <p className="hero__theme-vision">
            어린아이처럼 힘을 다해 예배하는 리조이스
          </p>
        </div>
        <p className="hero__description">
          순장 가이드 페이지에 오신 것을 환영합니다.<br />
          순모임을 섬기는 데 필요한 모든 정보를 확인하세요.
        </p>

        <div className="hero__cta">
          <Link to="/about" className="hero__cta-link hero__cta-link--primary">
            REJOICE 소개
          </Link>
          <Link to="/guide" className="hero__cta-link hero__cta-link--outline">
            순모임 가이드 보기
          </Link>
          <Link to="/weekly" className="hero__cta-link hero__cta-link--outline">
            Weekly TO DO
          </Link>
          <Link to="/places" className="hero__cta-link hero__cta-link--outline">
            순모임 장소
          </Link>
          <Link to="/events" className="hero__cta-link hero__cta-link--outline">
            REJOICE Events
          </Link>
          <Link to="/recreation" className="hero__cta-link hero__cta-link--outline">
            레크레이션
          </Link>
        </div>
      </div>

      <div className="hero__scroll-indicator">
        <span>아래로 스크롤</span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 10L12 15L17 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  )
}

export default Hero
