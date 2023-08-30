import React, { useRef, useState } from 'react';
import { QrReader } from 'react-qr-reader';
import '../../index.css';
import SaveButton from "../saveButton";
import { SecurityScanOutlined } from "@ant-design/icons";

const QRScan = ({ ...rest }) => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loading, setLoading] = useState(false);

  const videoStyle = {
    width: '100%',
    height: '70%', // Asegura que el video ocupe el 70% del espacio del contenedor
    marginTop: '5px', // Agrega un margen superior de 5px
    objectFit: 'cover', // Ajusta la relación de aspecto y cubre el contenedor
  };

  const toggleCamera = async () => {
    try {
      setLoading(true)
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(!isCameraOn);
    } catch (error) {
      console.error('Error accessing camera:', error);
    } finally {
      setLoading(false)
    }
  };

  return (
    <div >
      {
        rest?.type === "Data" && <SaveButton
          icon={<SecurityScanOutlined />}
          onClick={toggleCamera}
          loading={loading}
          style={{}}
        >
          {isCameraOn ? 'Apagar cámara' : 'Encender cámara'}
        </SaveButton>
      }

      {isCameraOn && (
        <div className="container">
          <img src={rest?.img} style={{ width: "100%", height: "70vh", objectFit: "contain" }} />
          <div className="content">
            <video ref={videoRef} autoPlay playsInline />
            <QrReader
              constraints={{ facingMode: 'environment' }}
              videoStyle={videoStyle}
              {...rest}
            />
          </div>
        </div>
      )}
      
    </div>
  );
};

export default QRScan;