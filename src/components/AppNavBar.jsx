import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Map, BarChart2, ChevronDown, LogOut } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Roadmap', to: '/roadmap', icon: Map },
  { label: 'Analytics', to: '/analytics', icon: BarChart2 },
]

function AppNavBar() {
  const MotionDiv = motion.div
  const user = {
    id: 'demo-user',
    firstName: 'John',
    fullName: 'John Doe',
    imageUrl: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
    primaryEmailAddress: { emailAddress: 'john.doe@example.com' },
  }
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    setDropdownOpen(false)
    navigate('/login')
  }

  return (
    <header className="app-header">
      <div className="nav-container">
        <NavLink to="/dashboard" className="nav-brand">
          <div className="nav-brand-icon">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="var(--color-accent)" />
              <path d="M8 22L16 10L24 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 18H21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="nav-brand-name">VectorStudy</span>
        </NavLink>

        <nav className="nav-links">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link--active' : ''}`
              }
            >
              <item.icon size={16} strokeWidth={1.75} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions" ref={dropdownRef}>
          <button
            id="profile-dropdown-trigger"
            className="profile-trigger"
            onClick={() => setDropdownOpen(prev => !prev)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <img
              src={user?.imageUrl}
              alt={user?.fullName}
              className="profile-avatar"
            />
            <span className="profile-name">{user?.firstName}</span>
            <ChevronDown
              size={14}
              className={`profile-chevron ${dropdownOpen ? 'profile-chevron--open' : ''}`}
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <MotionDiv
                className="profile-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <div className="dropdown-user-info">
                  <img
                    src={user?.imageUrl}
                    alt={user?.fullName}
                    className="dropdown-avatar"
                  />
                  <div className="dropdown-user-text">
                    <span className="dropdown-user-name">{user?.fullName}</span>
                    <span className="dropdown-user-email">
                      {user?.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>
                </div>

                <hr className="dropdown-divider" />

                <button className="dropdown-item dropdown-item--danger" onClick={handleSignOut}>
                  <LogOut size={15} strokeWidth={1.75} />
                  Sign out
                </button>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

export default AppNavBar
