"use client"
// pages/index.js
import { useState } from 'react';
import { Camera } from './components/Camera';

export default function Home() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCapture = async (imageData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: imageData })
      });
      
      const data = await response.json();
      console.log(data,'xxxx')
    //   setResults(data.objects);
    } catch (error) {
      console.error('识别失败:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">物品识别</h1>
      <Camera onCapture={handleCapture} />
      
      {isLoading && <p className="mt-4">识别中...</p>}
      
      {results.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl mb-2">识别结果：</h2>
          <ul className="space-y-2">
            {results.map((item, index) => (
              <li key={index} className="bg-gray-100 p-2 rounded">
                {item.name} (置信度: {(item.confidence * 100).toFixed(1)}%)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}