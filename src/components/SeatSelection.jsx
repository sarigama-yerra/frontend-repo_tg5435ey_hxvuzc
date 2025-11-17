import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const SEAT_COUNT = 68

export default function SeatSelection(){
  const { tripId } = useParams()
  const navigate = useNavigate()
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [trip, setTrip] = useState(null)
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)

  const rows = useMemo(()=>Math.ceil(SEAT_COUNT/4),[])

  const fetchTrip = async () => {
    const res = await fetch(`${baseUrl}/api/trip/${tripId}`)
    if(!res.ok){
      alert("Trajet introuvable");
      navigate('/')
      return
    }
    const data = await res.json()
    setTrip(data)
  }

  useEffect(()=>{ fetchTrip() },[]) // eslint-disable-line

  const toggleSeat = async (seat) => {
    if (!trip) return
    const booked = new Set(trip.booked_seats)
    const lockedSeats = new Set((trip.locked_seats||[]).map(l=>l.seat))
    if (booked.has(seat) || lockedSeats.has(seat)) return

    let newSelected
    if (selected.includes(seat)) newSelected = selected.filter(s=>s!==seat)
    else newSelected = [...selected, seat]

    setSelected(newSelected)

    try{
      const res = await fetch(`${baseUrl}/api/trip/${tripId}/lock`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ seats: newSelected })
      })
      if(res.ok){
        const data = await res.json()
        setTrip(data)
      }
    }catch{}
  }

  const total = (trip?.prix||8000) * selected.length

  const goPay = () => {
    if (selected.length===0) return
    navigate(`/paiement/${tripId}?seats=${selected.join(',')}`)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{background: 'linear-gradient(180deg,#0a3d2e,#0f5132)'}}>
      <header className="p-4">
        <h1 className="text-white font-bold">Cameroon Bus Booking</h1>
      </header>
      <main className="flex-1 p-4 grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-xl p-4 shadow">
          <h2 className="font-semibold text-lg mb-2">Sélection des sièges</h2>
          {trip && (
            <p className="text-sm text-gray-600 mb-4">{trip.depart} → {trip.arrivee} • {trip.date_voyage} • Prix: {trip.prix.toLocaleString()} FCFA</p>
          )}

          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {[...Array(rows)].map((_,r)=>{
              return (
                <div key={r} className="contents">
                  {/* Colonne gauche 2 sièges */}
                  {[0,1].map(i=>{
                    const seat = r*4 + i + 1
                    if (seat>SEAT_COUNT) return <div key={i}></div>
                    const booked = trip?.booked_seats?.includes(seat)
                    const locked = (trip?.locked_seats||[]).some(l=>l.seat===seat)
                    const isSel = selected.includes(seat)
                    const color = booked? 'bg-red-400 text-white' : isSel? 'bg-orange-400 text-white' : locked? 'bg-gray-300' : 'bg-green-200'
                    return (
                      <button key={i} onClick={()=>toggleSeat(seat)} className={`h-10 sm:h-12 rounded ${color} text-xs sm:text-sm`}>{seat}</button>
                    )
                  })}

                  {/* Allée */}
                  <div className="h-10 sm:h-12"></div>

                  {/* Colonne droite 2 sièges */}
                  {[2,3].map(i=>{
                    const seat = r*4 + i + 1
                    if (seat>SEAT_COUNT) return <div key={i}></div>
                    const booked = trip?.booked_seats?.includes(seat)
                    const locked = (trip?.locked_seats||[]).some(l=>l.seat===seat)
                    const isSel = selected.includes(seat)
                    const color = booked? 'bg-red-400 text-white' : isSel? 'bg-orange-400 text-white' : locked? 'bg-gray-300' : 'bg-green-200'
                    return (
                      <button key={i} onClick={()=>toggleSeat(seat)} className={`h-10 sm:h-12 rounded ${color} text-xs sm:text-sm`}>{seat}</button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2">
          <h3 className="font-semibold">Récapitulatif</h3>
          <p>Nombre de places sélectionnées: <b>{selected.length}</b></p>
          <p>Prix par place: <b>{(trip?.prix||8000).toLocaleString()} FCFA</b></p>
          <p>Total: <b>{total.toLocaleString()} FCFA</b></p>
          <button onClick={goPay} disabled={selected.length===0} className="mt-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold disabled:opacity-60">Réserver maintenant</button>
        </div>
      </main>
      <footer className="bg-white/90 backdrop-blur p-4 text-center text-sm">
        <p>Contact: WhatsApp +237 6xx xxx xxx • Email contact@cbb.cm</p>
      </footer>
    </div>
  )
}
