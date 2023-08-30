import HeaderView from '../../components/headerView';
import React, { useState, useEffect } from 'react';
import QrReader from '../../components/qr'
import { message } from 'antd'
import { useLocation } from 'react-router-dom';
import { EventForm } from './../../interfaces';
import { initEventForm } from './../../constants';

// Archivo de estilos CSS para aplicar la superposición

const Qr = () => {
  const [qrResult, setQrResult] = useState('');
  const location = useLocation();
  const { state } = location;
  const [type, setType] = useState("No Data");
  const [event, setEvent] = useState<EventForm>(initEventForm)

  useEffect(() => {
    let _event = { ...state } as EventForm | null;
    setType(_event?.id ? "Data" : "No Data");

    if (!_event?.id) return;
    setEvent(_event)
    console.log(_event)
  }, [state])

  const handleCameraError = (error: React.SetStateAction<null>) => {
    console.error('Error accessing camera:', error);
  };

  const handleScanResult = (result: any) => {
    if (result) {
      setQrResult(result.text)
      message.success('Codigo leido con : ' + result.text, 4);
    }
  };

  return (
    <div style={{ margin: 20 }}>
      <HeaderView
        title="Lector Qr"
      />
      {/* <QrCode /> */}
      <QrReader
        img={event?.image}
        type={type}
        delay={1000}
        onResult={handleScanResult}
        onError={handleCameraError}
      />
    </div>
  )
}

export default Qr;