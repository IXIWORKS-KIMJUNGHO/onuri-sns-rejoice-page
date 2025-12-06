import './Card.css'

function Card({
  children,
  variant = 'default',
  padding = 'medium',
  hover = false,
  className = '',
  onClick,
  ...props
}) {
  const classNames = [
    'card',
    `card--${variant}`,
    `card--padding-${padding}`,
    hover ? 'card--hover' : '',
    onClick ? 'card--clickable' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classNames} onClick={onClick} {...props}>
      {children}
    </div>
  )
}

function CardHeader({ children, className = '' }) {
  return (
    <div className={`card__header ${className}`}>
      {children}
    </div>
  )
}

function CardBody({ children, className = '' }) {
  return (
    <div className={`card__body ${className}`}>
      {children}
    </div>
  )
}

function CardFooter({ children, className = '' }) {
  return (
    <div className={`card__footer ${className}`}>
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card
