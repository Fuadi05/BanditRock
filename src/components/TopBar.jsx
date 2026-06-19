import { useState } from 'react'

export default function TopBar() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div className="topbar">
      Selamat datang di Batu Merapi! Dapatkan kerajinan batu alam berkualitas terbaik untuk hunian Anda.
      <button className="topbar-close" onClick={() => setVisible(false)} aria-label="Tutup">✕</button>
    </div>
  )
}
