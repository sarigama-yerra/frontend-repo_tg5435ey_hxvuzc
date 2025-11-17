import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './components/Home'
import SeatSelection from './components/SeatSelection'
import Payment from './components/Payment'
import Confirmation from './components/Confirmation'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sieges/:tripId" element={<SeatSelection />} />
      <Route path="/paiement/:tripId" element={<Payment />} />
      <Route path="/confirmation/:reservationId" element={<Confirmation />} />
    </Routes>
  )
}

export default App