import React, { useRef, useState } from 'react';
import { QrReader } from 'react-qr-reader';

const QRScan = ({ ...rest }) => {
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [qrResult, setQrResult] = useState('');
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const handleScan = (result: any) => {
        if (result) {
            setQrResult(result);
        }
    };

    const handleError = (error: any) => {
        console.error(error);
    };

    const toggleCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: isCameraOn ? 'environment' : 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOn(!isCameraOn);
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    };

    return (
        <div>
            <button onClick={toggleCamera}>
                {isCameraOn ? 'Apagar cámara' : 'Encender cámara'}
            </button>

            {isCameraOn && (
                <div>
                    <video ref={videoRef} autoPlay playsInline />
                    <QrReader
                        constraints={{ facingMode: 'user' }}
                        {...rest}
                    />
                </div>
            )}

        </div >
    );
};

export default QRScan;