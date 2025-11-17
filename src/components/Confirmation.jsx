import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function Confirmation(){
  const { reservationId } = useParams()
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [res, setRes] = useState(null)

  useEffect(()=>{
    const load = async () => {
      const r = await fetch(`${baseUrl}/api/reservation/${reservationId}`)
      if(!r.ok) return
      const data = await r.json(); setRes(data)
    }
    load()
  },[reservationId])

  const downloadPdf = () => {
    window.open(`${baseUrl}/api/ticket/${reservationId}/pdf`, '_blank')
  }
  const sendWhatsApp = () => {
    if(!res) return
    const text = encodeURIComponent(`Bonjour, voici mon billet:\nRéservation ${res.ticket_no}\nSièges: ${res.seats.join(', ')}\nMontant: ${res.montant_total} FCFA`)
    window.open(`https://wa.me/2376xxxxxxxx?text=${text}`,'_blank')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{background: 'linear-gradient(180deg,#0a3d2e,#0f5132)'}}>
      <header className="p-4">
        <h1 className="text-white font-bold">Cameroon Bus Booking</h1>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl p-6 shadow">
          <h2 className="font-semibold text-lg mb-2">Confirmation de réservation</h2>
          {!res ? (
            <p>Chargement...</p>
          ) : (
            <div className="space-y-2 text-sm text-gray-700">
              <p>Numéro de réservation: <b>{res.ticket_no}</b></p>
              <p>Trajet: <b>{res.trip_id}</b></p>
              <p>Sièges: <b>{res.seats.join(', ')}</b></p>
              <p>Total: <b>{res.montant_total.toLocaleString()} FCFA</b></p>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <img className="w-40 h-40 border" alt="QR" src={`${baseUrl}/api/ticket/${reservationId}/qrcode`} />
                <div className="flex-1">
                  <button onClick={downloadPdf} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold">Télécharger le billet en PDF</button>
                  <button onClick={sendWhatsApp} className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold">Envoyer par WhatsApp</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white/90 backdrop-blur p-4 text-center text-sm">
        <p>Contact: WhatsApp +237 6xx xxx xxx • Email contact@cbb.cm</p>
      </footer>
    </div>
  )
}
