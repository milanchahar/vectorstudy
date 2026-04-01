import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import AppNavBar from './AppNavBar'

function AppLayout({ children }) {
  const MotionDiv = motion.div
  const location = useLocation()

  return (
    <div className="app-layout">
      <AppNavBar />
      <main className="app-main">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={location.pathname}
            className="app-page-shell"
            initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </MotionDiv>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default AppLayout
