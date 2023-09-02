import { useRef, useState, FC, useEffect } from 'react';
import { QrReader, QrReaderProps } from 'react-qr-reader';
import '../../index.css';
import SaveButton from "../saveButton";
import { SecurityScanOutlined } from "@ant-design/icons";
import { Grid } from 'antd';

interface Props extends QrReaderProps {
  img: string,
  offCamera: boolean,
}

const QRScan: FC<Props> = ({ img, offCamera, ...rest }) => {
  const { useBreakpoint } = Grid;
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [loading, setLoading] = useState(false);
  const screens = useBreakpoint();
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
      if (isCameraOn) {
        if (videoRef.current) {
          const stream = videoRef.current.srcObject as MediaStream;
          const tracks = stream?.getTracks();
          tracks?.forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }

      setIsCameraOn(!isCameraOn);
    } catch (error) {
      console.error('Error al accesar a la camara.', error);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() =>{
    setIsCameraOn(offCamera)
  },[offCamera])

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
          <img src={img} style={{ width: "100%", height: "70vh", objectFit: "contain" }} alt="qrimg" />
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