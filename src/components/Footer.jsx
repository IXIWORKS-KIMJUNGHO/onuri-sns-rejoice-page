import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          <div className="footer__section">
            <h3 className="footer__title">온누리교회</h3>
            <p className="footer__text">
              서울시 용산구 이촌로 347-11
            </p>
            <a
              href="https://www.onnuri.org"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__link"
            >
              www.onnuri.org
            </a>
          </div>

          <div className="footer__section">
            <h3 className="footer__title">SNS Rejoice</h3>
            <p className="footer__text">
              순장 가이드 페이지
            </p>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {currentYear} SNS Rejoice. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
