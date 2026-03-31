import AppNavBar from './AppNavBar'

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <AppNavBar />
      <main className="app-main">
        {children}
      </main>
    </div>
  )
}

export default AppLayout
