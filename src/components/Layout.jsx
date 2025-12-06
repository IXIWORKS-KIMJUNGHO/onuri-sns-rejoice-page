import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import PageTransition from './PageTransition'

function Layout() {
  const location = useLocation()
  const isHomePage = location.pathname === '/' || location.pathname === '/onuri-sns-rejoice-page/' || location.pathname === '/onuri-sns-rejoice-page'

  return (
    <>
      <Header />
      <main className="main-content">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      {isHomePage && <Footer />}
    </>
  )
}

export default Layout
