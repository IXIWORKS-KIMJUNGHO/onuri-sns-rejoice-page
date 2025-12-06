import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './PageTransition.css'

function PageTransition({ children }) {
  const location = useLocation()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitionStage, setTransitionStage] = useState('fade-in')

  useEffect(() => {
    if (children !== displayChildren) {
      // 페이지가 변경되면 fade-out 시작
      setTransitionStage('fade-out')
    }
  }, [children, displayChildren])

  const handleTransitionEnd = () => {
    if (transitionStage === 'fade-out') {
      // fade-out 완료 후 새 페이지로 교체하고 fade-in
      setDisplayChildren(children)
      setTransitionStage('fade-in')
      // 스크롤을 맨 위로
      window.scrollTo(0, 0)
    }
  }

  return (
    <div
      className={`page-transition ${transitionStage}`}
      onAnimationEnd={handleTransitionEnd}
    >
      {displayChildren}
    </div>
  )
}

export default PageTransition
