"use client"; // Next.js 13+ 客户端组件标记

import { useEffect, useRef, useState } from 'react';
import { BarcodeFormat, BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import Webcam from 'react-webcam';

interface BarcodeScannerProps {
    onScanSuccess: (result: string) => void;
    onScanError?: (error: Error) => void;
}

const BarcodeScanner = ({ onScanSuccess, onScanError }: BarcodeScannerProps) => {
    const webcamRef = useRef<Webcam>(null);
    const controlsRef = useRef<IScannerControls | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 初始化扫描器
    useEffect(() => {
        const initScanner = async () => {
            try {
                const codeReader = new BrowserQRCodeReader();
                const videoInput = webcamRef.current?.video;

                if (!videoInput) {
                    throw new Error('无法访问摄像头设备');
                }

                // 开始扫描
                controlsRef.current = await codeReader.decodeFromVideoElement(
                    videoInput,
                    (result, error) => {
                        if (result) {
                            onScanSuccess(result.getText());
                            stopScanning();
                        }
                        console.log(error, 'error111')
                        if (error) {
                            onScanError?.(error);
                        }
                    }
                );

                setIsScanning(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : '无法初始化扫描器');
            }
        };

        initScanner();

        return () => {
            controlsRef.current?.stop();
        };
    }, []);

    const stopScanning = () => {
        controlsRef.current?.stop();
        setIsScanning(false);
    };

    return (
        <div className="scanner-container">
            {error ? (
                <div className="error-message">{error}</div>
            ) : (
                <>
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                            width: { ideal: 640 },  // 降低分辨率
                            height: { ideal: 480 },
                            //   facingMode: 'environment', // 优先使用后置摄像头
                        }}
                        style={{ width: '100%', maxWidth: '640px' }}
                    />
                    {isScanning && (
                        <button onClick={stopScanning} className="stop-button">
                            停止扫描
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default BarcodeScanner;