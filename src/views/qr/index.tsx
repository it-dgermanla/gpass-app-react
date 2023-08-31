import HeaderView from '../../components/headerView';
import { useState, useEffect } from 'react';
import QrReader from '../../components/qr'
import { message } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom';
import { EventForm, Ticket } from './../../interfaces';
import { initEventForm } from './../../constants';
import { OnResultFunction } from 'react-qr-reader';
import { update, getCollectionGeneric } from './../../services/firebase';
import { where } from 'firebase/firestore';
import { useAuth } from '../../context/authContext';


const Qr = () => {
  const navigate = useNavigate()
  const { user } = useAuth();
  const location = useLocation();
  const { state } = location;
  const [event, setEvent] = useState<EventForm>(initEventForm)

  useEffect(() => {
    let _event = { ...state } as EventForm | null;

    if (!_event) {
      navigate("/eventos")
      return
    }

    setEvent(_event)
  }, [state, navigate])

  const handleScanResult: OnResultFunction = async (result) => {
    if (!result) return

    try {
      const [eventId, numberTicket] = result.getText().split("-");
      const tickets = await getCollectionGeneric<Ticket>('Tickets', [where('eventId', '==', eventId), where('number', '==', +numberTicket)])

      if (tickets[0].isScanned === "Si") {
        message.error('Este QR ya esta escaneado.', 4)
        return
      }

      //falta guardar el nombre usuario
      await update('Tickets', tickets[0].id!, { userScannerId: user?.uid, isScanned: "Si", scannedDate: new Date() })
      message.success('QR escaneado con èxito.', 7);
    } catch (error) {
      message.error('Error al procesar QR.', 4);
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <HeaderView
        title="Lector Qr"
      />
      {/* <QrCode /> */}
      <QrReader
        img={event?.image as string}
        scanDelay={7000}
        onResult={handleScanResult}
        constraints={{ facingMode: 'environment' }}
      />
    </div>
  )
}

export default Qr;