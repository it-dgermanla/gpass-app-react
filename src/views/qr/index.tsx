import HeaderView from '../../components/headerView';
import React, { useState } from 'react';
import QrReader from '../../components/qr'
import { message } from 'antd'

// Archivo de estilos CSS para aplicar la superposición

const Qr = () => {
  const [qrResult, setQrResult] = useState('');

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
          onResult={handleScanResult}
          onError={handleCameraError}
        />
    </div>
  )
}

export default Qr;