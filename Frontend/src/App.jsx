import './App.css'
import Navbar from './components/Navbar/Navbar.jsx'
import Footer from './components/Footer/Footer.jsx'
import AppRoutes from './routes/AppRoutes.jsx'

function App() {
  return (
    <div className="app-shell">
      {/* Main shell for shared layout across all pages. */}
      <Navbar />
      <AppRoutes />
      <Footer />
    </div>
  )
}

export default App
