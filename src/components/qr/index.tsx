import { useState, FC } from 'react';
import { QrReader, QrReaderProps } from 'react-qr-reader';
import '../../index.css';
import SaveButton from "../saveButton";
import { SecurityScanOutlined } from "@ant-design/icons";
import { Grid } from 'antd';

interface Props extends QrReaderProps {
  img: string
}

const QRScan: FC<Props> = ({ img, ...rest }) => {
  const { useBreakpoint } = Grid;
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const screens = useBreakpoint();

  const videoStyle = {
    width: '100%',
    height: '65%', // Asegura que el video ocupe el 70% del espacio del contenedor
    objectFit: 'cover'
  };

  const mobileVideoStyle = {
    ...videoStyle,
    paddingLeft: '7%',
    paddingRight: '7%',
    height: '55%',
    controls: false
  };

  const toggleCamera = async () => {
    try {
      setLoading(true)
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setIsCameraOn(!isCameraOn);
    } catch (error) {
      console.error('Error accessing camera:', error);
    } finally {
      setLoading(false)
    }
  };

  return (
    <div >
      <SaveButton
        icon={<SecurityScanOutlined />}
        onClick={toggleCamera}
        loading={loading}
        style={{}}
      >
        {isCameraOn ? 'Apagar cámara' : 'Encender cámara'}
      </SaveButton>

      {isCameraOn && (
        <div className="container">
          <img src={img} style={{ width: "100%", height: "70vh", objectFit: "contain" }} />
          <div className={!screens.xs ? "content" : "movil-content"}>
            <QrReader
              {...rest}
              videoStyle={!screens.xs ? videoStyle : mobileVideoStyle}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default QRScan;