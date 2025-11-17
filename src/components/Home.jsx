import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const VILLES_FALLBACK = [
  'Yaoundé','Douala','Bafoussam','Bamenda','Garoua','Maroua',
  'Ngaoundéré','Bertoua','Ebolowa','Buea','Kumba','Limbe','Kribi'
]

export default function Home() {
  const navigate = useNavigate()
  const [villes, setVilles] = useState(VILLES_FALLBACK)
  const [depart, setDepart] = useState('Yaoundé')
  const [arrivee, setArrivee] = useState('Douala')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10))
  const [loading, setLoading] = useState(false)
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/cities`)
        if (res.ok) {
          const data = await res.json()
          if (data.cities?.length) setVilles(data.cities)
        }
      } catch {}
    }
    load()
  }, [baseUrl])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!depart || !arrivee || !date) return
    setLoading(true)
    try {
      const res = await fetch(`${baseUrl}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depart, arrivee, date_voyage: date })
      })
      const data = await res.json()
      if (res.ok && data?.id) {
        navigate(`/sieges/${data.id}`)
      } else {
        alert(data?.detail || 'Erreur, veuillez réessayer.')
      }
    } catch (err) {
      alert("Impossible d'effectuer la recherche. Vérifiez votre connexion.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{background: 'linear-gradient(180deg,#0a3d2e,#0f5132)'}}>
      <header className="p-4 flex items-center justify-between">
        <h1 className="text-white font-extrabold text-xl">Cameroon Bus Booking</h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 sm:p-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-emerald-900">Bienvenue sur Cameroon Bus Booking</h2>
            <p className="text-gray-600 mt-2">Réservez votre place de bus en quelques clics pour tous les trajets interurbains au Cameroun</p>
          </div>

          <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville de départ</label>
              <select value={depart} onChange={e=>setDepart(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                {villes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville d'arrivée</label>
              <select value={arrivee} onChange={e=>setArrivee(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                {villes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date du voyage</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
            </div>

            <div className="sm:col-span-2 mt-2">
              <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60">
                {loading ? 'Recherche en cours...' : 'Rechercher les trajets'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="bg-white/90 backdrop-blur p-4 text-center text-sm">
        <p>Contact: WhatsApp +237 6xx xxx xxx • Email contact@cbb.cm</p>
      </footer>
    </div>
  )
}
