import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'
import logoImg from '../assets/images/header-icon.webp'

const navItems = [
  { path: '/', label: '홈' },
  { path: '/about', label: 'About' },
  { path: '/guide', label: '순모임 가이드' },
  { path: '/weekly', label: 'Weekly TO DO' },
  { path: '/places', label: '순모임 장소' },
  { path: '/events', label: 'REJOICE Events' },
  { path: '/recreation', label: '레크레이션' },
]

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 페이지 이동 시 메뉴 닫기
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="header__container">
        <div className="header__logo">
          <Link to="/">
            <img src={logoImg} alt="SNS Rejoice" className="header__logo-img" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="header__nav header__nav--desktop">
          <ul className="header__nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="header__nav-item">
                <Link
                  to={item.path}
                  className={`header__nav-link ${location.pathname === item.path ? 'header__nav-link--active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={`header__menu-button ${isMenuOpen ? 'header__menu-button--open' : ''}`}
          onClick={toggleMenu}
          aria-label="메뉴 열기"
          aria-expanded={isMenuOpen}
        >
          <span className="header__menu-icon"></span>
        </button>

        {/* Mobile Navigation */}
        <nav className={`header__nav header__nav--mobile ${isMenuOpen ? 'header__nav--open' : ''}`}>
          <ul className="header__nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="header__nav-item">
                <Link
                  to={item.path}
                  className={`header__nav-link ${location.pathname === item.path ? 'header__nav-link--active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Overlay */}
        {isMenuOpen && (
          <div className="header__overlay" onClick={() => setIsMenuOpen(false)} />
        )}
      </div>
    </header>
  )
}

export default Header
