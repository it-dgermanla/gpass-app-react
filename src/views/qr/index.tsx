import HeaderView from '../../components/headerView';
import React, { useState } from 'react';
import QrReader from '../../components/qr'

import './index.css'; // Archivo de estilos CSS para aplicar la superposición

const Qr = () => {
  const [cameraError, setCameraError] = useState(null);
  const [qrScanResult, setQrScanResult] = useState('');

  const handleCameraError = (error: React.SetStateAction<null>) => {
    console.error('Error accessing camera:', error);
    setCameraError(error);
  };

  const handleScanResult = (result: React.SetStateAction<string>) => {
    if (result) {
      setQrScanResult(result);
    }
  };
  
  return (
    <div style={{ margin: 20 }}>
      <HeaderView
        title="Lector Qr"
      />
      {/* <QrCode /> */}
      <div className="qr-container">
        <QrReader
         onResult={handleScanResult}
         onError={handleCameraError}
        />
         <p>Resultado del escaneo: {qrScanResult}</p>
      </div>

    </div>
  )
}

export default Qr;