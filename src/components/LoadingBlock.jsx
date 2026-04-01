function LoadingBlock({ className = '' }) {
  const classes = ['loading-block', className].filter(Boolean).join(' ')
  return <span className={classes} aria-hidden="true" />
}

export default LoadingBlock
