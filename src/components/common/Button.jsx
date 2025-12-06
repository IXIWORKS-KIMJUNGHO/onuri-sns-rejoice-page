import './Button.css'

function Button({
  children,
  variant = 'primary',
  size = 'medium',
  href,
  onClick,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  const classNames = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    fullWidth ? 'button--full-width' : '',
    className,
  ].filter(Boolean).join(' ')

  if (href) {
    return (
      <a
        href={href}
        className={classNames}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
