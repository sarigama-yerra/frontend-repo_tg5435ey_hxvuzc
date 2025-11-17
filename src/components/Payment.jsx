import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

export default function Payment(){
  const { tripId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [trip, setTrip] = useState(null)
  const [reservation, setReservation] = useState(null)
  const [nom, setNom] = useState('')
  const [tel, setTel] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const seats = useMemo(()=>{
    const s = params.get('seats') || ''
    return s.split(',').map(x=>parseInt(x)).filter(Boolean)
  },[params])

  useEffect(()=>{
    const load = async () => {
      const res = await fetch(`${baseUrl}/api/trip/${tripId}`)
      if(!res.ok){ navigate('/'); return }
      const data = await res.json(); setTrip(data)
    }
    load()
  },[tripId])

  const reserver = async (e) => {
    e.preventDefault()
    setError('')
    if (!nom || !tel || seats.length===0){ setError('Veuillez remplir tous les champs et sélectionner au moins un siège.'); return }
    const res = await fetch(`${baseUrl}/api/trip/${tripId}/reserve`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ seats, nom_complet: nom, telephone: tel, email })
    })
    const data = await res.json()
    if(!res.ok){ setError(data?.detail || 'Erreur lors de la réservation'); return }
    setReservation({ id: data.reservation_id, total: data.montant_total })
  }

  useEffect(()=>{
    if(!reservation) return
    // Render PayPal Buttons
    if (!window.paypal){
      setError('PayPal non chargé.'); return
    }
    const container = document.getElementById('paypal-buttons')
    container.innerHTML = ''

    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: { value: (reservation.total/600).toFixed(2), currency_code: 'USD' },
            description: `Billet(s) de bus - ${seats.length} siège(s)`
          }]
        })
      },
      onApprove: async (data, actions) => {
        const details = await actions.order.capture()
        const orderId = details.id
        const resp = await fetch(`${baseUrl}/api/payment/paypal/capture/${reservation.id}`,{
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ order_id: orderId })
        })
        const final = await resp.json()
        if(resp.ok){
          navigate(`/confirmation/${reservation.id}`)
        } else {
          setError(final?.detail || 'Paiement non confirmé')
        }
      },
      onError: (err) => {
        setError('Erreur PayPal: '+ err?.message)
      }
    }).render('#paypal-buttons')
  },[reservation])

  const total = (trip?.prix||8000) * seats.length

  return (
    <div className="min-h-screen flex flex-col" style={{background: 'linear-gradient(180deg,#0a3d2e,#0f5132)'}}>
      <header className="p-4">
        <h1 className="text-white font-bold">Cameroon Bus Booking</h1>
      </header>

      <main className="flex-1 p-4 grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="font-semibold text-lg mb-2">Paiement</h2>
          {trip && (
            <div className="text-sm text-gray-700 mb-3">
              <p>Trajet: <b>{trip.depart} → {trip.arrivee}</b></p>
              <p>Date: <b>{trip.date_voyage}</b></p>
              <p>Sièges: <b>{seats.join(', ')}</b></p>
              <p>Total: <b>{total.toLocaleString()} FCFA</b></p>
            </div>
          )}
          <form onSubmit={reserver} className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium">Nom complet</label>
              <input value={nom} onChange={e=>setNom(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Numéro de téléphone (WhatsApp)</label>
              <input value={tel} onChange={e=>setTel(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold">Continuer vers le paiement</button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        </div>

        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="font-semibold mb-2">PayPal</h3>
          <p className="text-sm text-gray-600 mb-2">Vous paierez en USD via PayPal. Le montant en FCFA est approximativement converti.</p>
          <div id="paypal-buttons"></div>
        </div>
      </main>

      <footer className="bg-white/90 backdrop-blur p-4 text-center text-sm">
        <p>Contact: WhatsApp +237 6xx xxx xxx • Email contact@cbb.cm</p>
      </footer>

      {/* PayPal SDK script - replace with your live client-id */}
      <script src="https://www.paypal.com/sdk/js?client-id=sb&currency=USD"></script>
    </div>
  )
}
