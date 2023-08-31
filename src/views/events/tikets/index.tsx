import { limit, orderBy, where } from "firebase/firestore"
import HeaderView from "../../../components/headerView"
import Table from "../../../components/table"
import { useMemo } from "react"
import { ColumnsType } from "antd/es/table"
import { Event, Ticket } from "../../../interfaces"
import { useLocation } from "react-router-dom"
import { initEvent } from "../../../constants"
import dayjs from "dayjs"
import { QRCodeCanvas } from "qrcode.react"

interface TicketTable extends Ticket {
  ticketUrl?: string;
}

const Tickets = () => {
  const location = useLocation();
  const { state } = location;

  const event = useMemo(() => {
    if (state) {
      return state as Event;
    }

    return initEvent;
  }, [state]);

  const columns = useMemo<ColumnsType<TicketTable>>(() => [
    { title: 'Numero', dataIndex: 'number', key: 'number' },
    { title: 'Escaneado', dataIndex: 'isScanned', key: 'isScanned' },
    { title: 'Usuario escaner', dataIndex: 'userScannerName', key: 'userScannerName' },
    {
      title: "Fecha escaneado",
      dataIndex: "dateScanned",
      key: "dateScanned",
      render: (_, ticket) => (ticket.dateScanned ? dayjs(ticket.dateScanned).format("DD/MM/YYYY hh:mm a") : "")
    },
    {
      title: "",
      dataIndex: "qr",
      key: "qr",
      render: (_, ticket) => (
        <QRCodeCanvas value={`${event.id}-${ticket.number}`} id={ticket.number.toString()} style={{ display: "none" }} />
      )
    }
  ], [event]);

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
        downloadPdf
        imageEventUrl={event.image as string}
      />
    </div>
  )
}

export default Tickets;