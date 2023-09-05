import HeaderView from '../../../components/headerView';
import { useState, useEffect } from 'react';
import { Alert, Button, message, Modal, Space } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom';
import { EventForm, Ticket, Event, User } from '../../../interfaces';
import { initEventForm } from '../../../constants';
import { OnResultFunction } from 'react-qr-reader';
import { update, getCollectionGeneric, getGenericDocById } from '../../../services/firebase';
import { Timestamp, where } from 'firebase/firestore';
import { useAuth } from "../../../context/authContext";
import QRScan from "../../../components/QRScan";
import { Spin } from 'antd';

interface AlertProps {
  message: string;
  description: string;
  type?: "success" | "info" | "error" | "warning" | undefined;
}

const Qr = () => {
  const { user } = useAuth();
  const navigate = useNavigate()
  const location = useLocation();
  const { state } = location;
  const [event, setEvent] = useState<EventForm>(initEventForm)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setIsModalData] = useState<AlertProps>({
    message: "",
    description: "",
    type: undefined
  });
  const [scanActive, setScanActive] = useState(true);

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
    setScanActive(false)
    try {
      const [eventId, numberTicket] = result.getText().split("-");
      
      const responseUser = await getGenericDocById<User>('Users', user?.uid!)
      const responseEvent = await getGenericDocById<Event>('Events', eventId)
      const tickets = await getCollectionGeneric<Ticket>('Tickets', [where('eventId', '==', eventId), where('number', '==', + numberTicket)])
      const finalDate = responseEvent.finalDate as any as Timestamp;

      if (responseEvent.disabled) {
        setIsModalData({
          message: `Este evento no se encuentra disponible.`,
          description: "",
          type: "error"
        })

        return
      }

      if (finalDate.toDate() < new Date()) {
        setIsModalData({
          message: `Este evento se encuentra vencido.`,
          description: "favor de intentar con otro ticket válido",
          type: "error"
        })

        return
      }
     
      if (tickets[0].isScanned === "Si") {
        setIsModalData({
          message: `Este QR ya esta escaneado.`,
          description: "favor de intentar con otro ticket válido",
          type: "error"
        })

        return
      }

      await update('Tickets', tickets[0].id!, { userScannerId: user?.uid, userScannerName: responseUser?.name, isScanned: "Si", dateScanned: new Date() })
      setIsModalData({
        message: `Listo ya puedes otorgar la Pizza del QR numero ${numberTicket} del evento.`,
        description: "Gracias por su apoyo.",
        type: "success"
      })
    } catch (error) {
      message.error('Error al procesar QR.', 4);
    } finally {
      setIsModalOpen(true)
      setScanActive(true)
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <HeaderView
        title="Lector Qr"
      />
      {/* <QrCode /> */}
      {scanActive ? (
        <QRScan
          offCamera={!isModalOpen}
          img={event?.image as string}
          scanDelay={8000}
          onResult={handleScanResult}
          constraints={{ facingMode: 'environment' }}
        />
      ) : (
        <Spin />
      )}

      <Modal title="QR válido" open={isModalOpen} footer={null}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message={modalData.message}
            description={modalData.description}
            type={modalData.type}
            showIcon
          />
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button type="primary" onClick={() => setIsModalOpen(false)}>Listo</Button>
          </div>
        </Space>
      </Modal>
    </div>
  )
}

export default Qr;