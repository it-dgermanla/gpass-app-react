import { limit, orderBy, where } from "firebase/firestore"
import HeaderView from "../../../components/headerView"
import Table, { PropsTable } from "../../../components/table"
import { useMemo, useState } from "react"
import { ColumnsType } from "antd/es/table"
import { Event, Ticket, User } from "../../../interfaces"
import { useLocation } from "react-router-dom"
import { initEvent } from "../../../constants"
import dayjs from "dayjs"
import { QRCodeCanvas } from "qrcode.react"
import useCollection, { PropsUseCollection } from "../../../hooks/useCollection"
import { Button, Form, Row, Select } from "antd"
import FormItem from "antd/es/form/FormItem"

interface TicketTable extends Ticket {
  ticketUrl?: string;
}

const Tickets = () => {
  const location = useLocation();
  const { state } = location;
  const propsUseCollection = useMemo<PropsUseCollection>(() => ({
    collection: "Users",
    query: [where("role", "in", ["Embajador", "Lector"])]
  }), []);
  const { loading, data: users } = useCollection<User>(propsUseCollection);
  const [tickets, setTickets] = useState<TicketTable[]>([]);

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
      title: "Embajador",
      dataIndex: "userAmbassadorId",
      key: "userAmbassadorId",
      render: (_, ticket, index) => (
        <FormItem style={{ marginBottom: 0 }} name={`userAmbassadorId-${index}`} initialValue={ticket.userScannerId}>
          <Select>
            <Select.Option key="" value="">Sin embajador</Select.Option>
            {
              users.filter(u => u.role === "Embajador").map(u => (
                <Select.Option key={u.id} value={u.id}>{u.name}</Select.Option>
              ))
            }
          </Select>
        </FormItem>
      )
    },
    {
      title: "Lector",
      dataIndex: "userScannerId",
      key: "userScannerId",
      render: (_, ticket, index) => (
        <FormItem style={{ marginBottom: 0 }} name={`userScannerId-${index}`} initialValue={ticket.userScannerId}>
          <Select>
            <Select.Option key="" value="">Sin lector</Select.Option>
            {
              users.filter(u => u.role === "Lector").map(u => (
                <Select.Option key={u.id} value={u.id}>{u.name}</Select.Option>
              ))
            }
          </Select>
        </FormItem>
      )
    },
    {
      title: "",
      dataIndex: "qr",
      key: "qr",
      render: (_, ticket) => (
        <QRCodeCanvas value={`${event.id}-${ticket.number}`} id={ticket.number.toString()} style={{ display: "none" }} />
      )
    }
  ], [event, users]);

  const propsTable = useMemo<PropsTable<TicketTable>>(() => ({
    wait: loading,
    columns: columns,
    placeholderSearch: "Buscar por numero...",
    collection: "Tickets",
    query: [where("eventId", "==", event?.id || ""), orderBy("number"), limit(20)],
    formatDate: "DD/MM/YYYY hh:mm a",
    searchValues: {
      number: "Número"
    },
    removeTableActions: true,
    downloadPdf: true,
    imageEventUrl: event.image as string,
    onLoadData: setTickets
  }), [event, columns, loading]);

  console.log(tickets)

  return (
    <div style={{ margin: 20 }}>
      <HeaderView
        title={`Tickets ${event?.name}`}
        goBack
      />
      <Form onFinish={(values) => console.log(values)}>
        <Row justify="end">
          <Button type="primary" htmlType="submit">Asignar usuarios</Button>
        </Row>
        <br />
        <Table
          {...propsTable}
        />
      </Form>
    </div>
  )
}

export default Tickets;