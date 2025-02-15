// app/page.tsx
'use client';

import { useState } from 'react';
import BarcodeScanner from './components/BarcodeScanner';

export default function Home() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [drugInfo, setDrugInfo] = useState<any>(null);

  // 处理扫描结果
  const handleScanSuccess = async (barcode: string) => {
    setScanResult(barcode);
    
    // 调用药品信息API（示例使用假API）
    // try {
    //   const response = await fetch(`/api/drug-info?code=${barcode}`);
    //   const data = await response.json();
    //   setDrugInfo(data);
    // } catch (error) {
    //   console.error('获取药品信息失败:', error);
    // }
    console.log(barcode,'barcode')
  };

  return (
    <div className="container1">
      <h1>药品条码扫描</h1>
      
      {!scanResult ? (
        <BarcodeScanner
          onScanSuccess={handleScanSuccess}
          onScanError={(error) => console.error('扫描错误:', error)}
        />
      ) : (
        <div className="result-container">
          <h2>扫描结果：{scanResult}</h2>
          {drugInfo && (
            <div className="drug-info">
              <p>药品名称：{drugInfo.name}</p>
              <p>生产厂商：{drugInfo.manufacturer}</p>
              <p>批号：{drugInfo.batch_number}</p>
            </div>
          )}
          <button onClick={() => setScanResult(null)}>重新扫描</button>
        </div>
      )}
    </div>
  );
}