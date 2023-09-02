import { collection, doc, limit, orderBy, where, writeBatch } from "firebase/firestore"
import HeaderView from "../../../components/headerView"
import Table, { PropsTable } from "../../../components/table"
import { useEffect, useMemo, useState } from "react"
import { ColumnsType } from "antd/es/table"
import { Event, Ticket, User } from "../../../interfaces"
import { useLocation } from "react-router-dom"
import { initEvent } from "../../../constants"
import dayjs from "dayjs"
import { QRCodeCanvas } from "qrcode.react"
import useCollection, { PropsUseCollection } from "../../../hooks/useCollection"
import { Button, Form, Row, Select, message } from "antd"
import FormItem from "antd/es/form/FormItem"
import { getArrayChunk } from "../../../utils/functions"
import { db } from "../../../firebaseConfig"

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
  const [collectionName, setColletionName] = useState("Tickets");
  const [tickets, setTickets] = useState<TicketTable[]>([]);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!tickets.length) return;

    const values: Record<string, string | undefined> = {};

    tickets.forEach((ticket) => {
      values[`userAmbassadorId-${ticket.number}`] = ticket.userAmbassadorId;
    });

    form.setFieldsValue(values);
  }, [form, tickets])

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
      render: (_, ticket) => (
        <FormItem style={{ marginBottom: 0 }} name={`userAmbassadorId-${ticket.number}`}>
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
    collection: collectionName,
    query: [where("eventId", "==", event?.id || ""), orderBy("number"), limit(20)],
    formatDate: "DD/MM/YYYY hh:mm a",
    searchValues: {
      number: "Número",
      isScanned: "Escanedo"
    },
    optiosSearchValues: [
      {
        propSearch: "isScanned",
        options: [
          {
            key: "Si",
            label: "Si"
          },
          {
            key: "No",
            label: "No"
          }
        ]
      }
    ],
    removeTableActions: true,
    downloadPdf: true,
    imageEventUrl: event.image as string,
    onLoadData: setTickets
  }), [event, columns, loading, collectionName]);

  const onFinish = async (values: Record<string, string | undefined>) => {
    if (saving) return;

    try {
      setSaving(true);

      const userAmbassadors: { number: number; userAmbassadorId: string; idTicket: string; }[] = [];

      Object.keys(values).forEach((key) => {
        const number = +key.split("-")[1];

        const ticketAmbassador = tickets.find(t => t.number === number && t.userAmbassadorId !== values[key])

        if (values[key] !== undefined && key.includes("userAmbassadorId") && ticketAmbassador) {
          userAmbassadors.push({ number, userAmbassadorId: values[key]!, idTicket: ticketAmbassador.id! });
        }
      });

      const userAmbassadorsChunk = getArrayChunk(userAmbassadors, 500);

      for (let i = 0; i < userAmbassadorsChunk.length; i++) {
        const _userAmbassadors = userAmbassadorsChunk[i];
        const batch = writeBatch(db);

        for (let j = 0; j < _userAmbassadors.length; j++) {
          const userAmbassador = _userAmbassadors[j];

          batch.update(
            doc(db, "Tickets", userAmbassador.idTicket),
            {
              userAmbassadorId: userAmbassador.userAmbassadorId,
              userAmbassadorName: users.find(u => u.id === userAmbassador.userAmbassadorId)?.name || "",
            }
          );
        }

        await batch.commit();
      }

      message.success("Asignaciones guardadas con éxito!");
    } catch (error) {
      console.log(error);
      message.error("Error al asignar usuarios");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ margin: 20 }}>
      <HeaderView
        title={`Tickets ${event?.name}`}
        goBack
      />
      <Form onFinish={onFinish} form={form}>
        <Row justify="end">
          <Button loading={saving} type="primary" htmlType="submit">Asignar usuarios</Button>
        </Row>
        <br />
        <Table {...propsTable} />
      </Form>
    </div>
  )
}

export default Tickets;