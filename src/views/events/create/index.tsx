import { useEffect, useState } from 'react'
import DynamicForm from '../../../components/dynamicForm'
import { Card, Form, UploadFile, message } from 'antd'
import { add, update, getCollectionGeneric } from '../../../services/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { initEventForm, titleForm } from '../../../constants';
import { EventForm, Event, Ticket } from '../../../interfaces';
import { TypeRute } from '../../../types';
import HeaderView from "../../../components/headerView";
import dayjs, { Dayjs } from 'dayjs';
import { getArrayChunk, setImagesToState } from "../../../utils/functions";
import { collection, doc, where, writeBatch } from 'firebase/firestore';
import { db } from "../../../firebaseConfig";
import { Rule } from "antd/es/form";

const collectionName = "Events";
const ruleRequiredTickets: Rule = { required: true, message: 'Favor de escribir la cantidad de boletos.' }

const CreateEvent = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const [type, setType] = useState<TypeRute>("create");
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<EventForm>(initEventForm);
  const [totalTicketsSaved, setTotalTicketsSaved] = useState(0);
  const [initTotalTickets, setInitTotalTickets] = useState(0);

  useEffect(() => {
    let _event = { ...state } as EventForm | null;

    setType(_event?.id ? "update" : "create");

    if (!_event?.id) return;

    _event = setImagesToState(_event);

    setEvent({ ..._event, initialDate: dayjs(_event.initialDate), finalDate: dayjs(_event.finalDate) });
    setInitTotalTickets(_event.total!);
  }, [state, form])

  const onFinish = async () => {
    if (saving) return;

    try {
      setSaving(true);

      const duplicateData = await getCollectionGeneric<EventForm>(collectionName, [where("name", "==", event.name)])

      if (duplicateData.length && (!event.id || (event.id && event.id !== duplicateData[0].id))) {
        message.error('Este evento ya esta registrado.', 4);
        return;
      }

      const initialDate = event.initialDate.set('hour', 0).set('minute', 0).set('second', 0).toDate();
      const finalDate = event.finalDate.set('hour', 23).set('minute', 59).set('second', 59).toDate();
      const _event = { ...event, initialDate, finalDate };

      if (type === "update") {
        const id = _event.id!;

        delete _event.id;
        await update(collectionName, id, _event);

        if (_event.total! > initTotalTickets) {
          setTotalTicketsSaved(initTotalTickets);

          const totalNewTickets = _event.total! - initTotalTickets;
          const tickets = Array.from({ length: totalNewTickets }).map((_, index) => ({ number: index + 1 + initTotalTickets, eventId: id, userScannerId: "", isScanned: false })) as Ticket[];

          await saveTickets(tickets);
        }
      } else {
        const newEvent = await add<Event>(collectionName, _event);
        const tickets = Array.from({ length: newEvent.total! }).map((_, index) => ({ number: index + 1, eventId: newEvent.id, userScannerId: "", isScanned: false })) as Ticket[];

        await saveTickets(tickets);
      }

      message.success('Evento guardado con éxito.', 4);
      navigate('/eventos')
    } finally {
      setSaving(false)
    }
  }

  console.log(initTotalTickets)

  const saveTickets = async (tickets: Ticket[]) => {
    try {
      const ticketsChunk = getArrayChunk(tickets, 500);

      for (let i = 0; i < ticketsChunk.length; i++) {
        const batch = writeBatch(db);
        const _tickets = ticketsChunk[i];

        for (let j = 0; j < _tickets.length; j++) {
          const ticket = _tickets[j];

          batch.set(doc(collection(db, "Tickets")), ticket);
        }

        await batch.commit();

        setTotalTicketsSaved(prev => prev + _tickets.length);
      }
    } catch (error) {
      throw error;
    }
  }

  return (
    <div>
      <HeaderView
        title={titleForm[type]}
        path="/eventos"
        goBack
      />
      <Card>
        <DynamicForm
          initialValues={event}
          form={form}
          layout='vertical'
          loading={saving}
          onFinish={onFinish}
          justify="center"
          textSubmit={saving ? `Guardando boletos ${totalTicketsSaved} de ${event.total}` : undefined}
          inputs={[
            {
              typeControl: 'input',
              typeInput: 'text',
              label: 'Nombre',
              name: 'name',
              rules: [{ required: true, message: 'Favor de escribir el nombre del evento.' }],
              value: event.name,
              onChange: (value: string) => setEvent({ ...event, name: value }),
              md: 6
            },
            {
              typeControl: 'date',
              label: 'Fecha Inicial',
              name: 'initialDate',
              disabledDate: date => date > event.finalDate,
              rules: [{ required: true, message: 'Favor de seleccionar la fecha inicial.' }],
              value: event.initialDate,
              onChange: (value: Dayjs) => setEvent({ ...event, initialDate: value }),
              md: 6
            },
            {
              typeControl: 'date',
              label: 'Fecha Final',
              name: 'finalDate',
              disabledDate: date => date < event.initialDate,
              rules: [{ required: true, message: 'Favor de seleccionar la fecha final.' }],
              value: event.finalDate,
              onChange: (value: Dayjs) => setEvent({ ...event, finalDate: value }),
              md: 6
            },
            {
              typeControl: 'input',
              typeInput: 'number',
              label: 'Cantidad de boletos',
              name: 'total',
              disabled: type === "update",
              rules: event.id
                ? [{
                  message: `La cantidad de boletos no puede ser menor a ${initTotalTickets}`,
                  validator: (rule, value?: string) => !value || +value < initTotalTickets ? Promise.reject(rule.message) : Promise.resolve(),
                }]
                : [ruleRequiredTickets],
              value: event.total,
              onChange: (value: string) => setEvent({ ...event, total: value ? +value : undefined }),
              md: 6
            },
            {
              typeControl: "file",
              name: "image",
              value: event.image,
              maxCount: 1,
              accept: "image/png, image/jpeg",
              onChange: (value: UploadFile<any>[]) => setEvent({ ...event, image: value }),
              md: 12,
              styleFI: { display: "flex", justifyContent: "center" },
              multiple: false
            }
          ]}
        />
      </Card>
    </div>
  )
}

export default CreateEvent;