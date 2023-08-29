import HeaderView from '../../components/headerView';
import React, { useState } from 'react';
import QrReader from '../../components/qr'

import './index.css'; // Archivo de estilos CSS para aplicar la superposición

const Qr = () => {
  
  return (
    <div style={{ margin: 20 }}>
      <HeaderView
        title="Lector Qr"
      />
      {/* <QrCode /> */}
      <div className="qr-container">
        <QrReader
          onResult={(result: any, error: any) => {
            if (!!result) {
              console.log(result)
            }

          }}
        />
      </div>

    </div>
  )
}

export default Qr;