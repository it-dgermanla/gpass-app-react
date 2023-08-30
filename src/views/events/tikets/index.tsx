import { limit, orderBy, where } from "firebase/firestore"
import HeaderView from "../../../components/headerView"
import Table from "../../../components/table"
import { useCallback, useMemo } from "react"
import { ColumnsType } from "antd/es/table"
import { Event, Ticket } from "../../../interfaces"
import { useLocation } from "react-router-dom"
import { initEvent } from "../../../constants"
import dayjs from "dayjs"
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from "antd"
import { DownloadOutlined } from "@ant-design/icons"

const Tickets = () => {
  const location = useLocation();
  const { state } = location;

  const event = useMemo(() => {
    if (state) {
      return state as Event;
    }

    return initEvent;
  }, [state]);

  const downloadQr = useCallback((id: string, qr: string) => {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    const newWidth = 600;
    const newHeight = 600;
    const resizedCanvas = document.createElement("canvas");

    resizedCanvas.width = newWidth;
    resizedCanvas.height = newHeight;

    const ctx = resizedCanvas.getContext("2d");

    ctx?.drawImage(canvas, 0, 0, newWidth, newHeight);

    const resizedDataURL = resizedCanvas.toDataURL("image/octet-stream");
    const a = document.createElement("a");

    a.href = resizedDataURL;
    a.download = `${qr}_resized.png`;
    a.click();
    a.remove();
  }, [])

  const columns = useMemo<ColumnsType<Ticket>>(() => [
    { title: 'Numero', dataIndex: 'number', key: 'number' },
    { title: 'Usuario escaner', dataIndex: 'userScannerName', key: 'userScannerName' },
    { title: 'Escaneado', dataIndex: 'isScanned', key: 'isScanned' },
    {
      title: "Fecha escaneado",
      dataIndex: "dateScanned",
      key: "dateScanned",
      render: (_, ticket) => (ticket.dateScanned ? dayjs(ticket.dateScanned).format("DD/MM/YYYY hh:mm a") : "")
    },
    {
      title: "QR",
      dataIndex: "qr",
      key: "qr",
      render: (_, ticket) => (
        <QRCodeCanvas value={`${event.id}-${ticket.number}`} id={ticket.number.toString()} />
      )
    },
    {
      title: "Descargar QR",
      dataIndex: "downlaodQr",
      key: "downlaodQr",
      render: (_, ticket) => (
        <Button icon={<DownloadOutlined />} onClick={() => downloadQr(ticket.number.toString(), `${event.name}-${ticket.number}`)} />
      )
    }
  ], [event, downloadQr]);

  return (
    <div style={{ margin: 20 }}>
      <HeaderView
        title={`Tickets ${event?.name}`}
        goBack
      />
      <Table
        columns={columns}
        placeholderSearch="Buscar por numero..."
        collection="Tickets"
        query={[where("eventId", "==", event?.id || ""), orderBy("number"), limit(20)]}
        formatDate="DD/MM/YYYY hh:mm a"
        searchValues={{
          number: "Número"
        }}
        removeTableActions
      />
    </div>
  )
}

export default Tickets;