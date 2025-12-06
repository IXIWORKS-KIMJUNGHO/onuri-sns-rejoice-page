import { useState } from 'react'
import './Accordion.css'

function Accordion({ children, allowMultiple = false, className = '' }) {
  const [openItems, setOpenItems] = useState([])

  const toggleItem = (index) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      )
    } else {
      setOpenItems((prev) =>
        prev.includes(index) ? [] : [index]
      )
    }
  }

  return (
    <div className={`accordion ${className}`}>
      {Array.isArray(children) ? children.map((child, index) => {
        if (child && child.type === AccordionItem) {
          return (
            <AccordionItem
              key={index}
              {...child.props}
              isOpen={openItems.includes(index)}
              onToggle={() => toggleItem(index)}
            />
          )
        }
        return child
      }) : children}
    </div>
  )
}

function AccordionItem({ title, children, isOpen, onToggle, className = '' }) {
  return (
    <div className={`accordion__item ${isOpen ? 'accordion__item--open' : ''} ${className}`}>
      <button
        className="accordion__header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="accordion__title">{title}</span>
        <span className="accordion__icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <div className="accordion__content">
        <div className="accordion__body">
          {children}
        </div>
      </div>
    </div>
  )
}

Accordion.Item = AccordionItem

export default Accordion
