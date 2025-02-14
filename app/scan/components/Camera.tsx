"use client"

// components/Camera.js
import { useState, useRef } from 'react';
import Webcam from 'react-webcam';

export const Camera = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    onCapture(imageSrc);
  };

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full"
      />
      <button 
        onClick={capture}
        className="bg-blue-500 text-white p-2 mt-4 rounded"
      >
        拍摄照片
      </button>
      {imgSrc && <img src={imgSrc} alt="Captured" className="mt-4" />}
    </div>
  );
};