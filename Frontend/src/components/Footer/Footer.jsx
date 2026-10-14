import './Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="app-footer">
      <p>Copyright {currentYear}. Made by Elmer PAAD team.</p>
    </footer>
  )
}
