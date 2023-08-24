import { useEffect, useState } from 'react'
import DynamicForm from '../../../components/dynamicForm'
import { Card, Form, UploadFile, message } from 'antd'
import { add, update } from '../../../services/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { initEventForm, titleForm } from '../../../constants';
import { EventForm } from '../../../interfaces';
import { TypeRute } from '../../../types';
import HeaderView from "../../../components/headerView";
import dayjs, { Dayjs } from 'dayjs';
import { setImagesToState } from "../../../utils/functions";

const CreateEvent = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const [type, setType] = useState<TypeRute>("create");
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<EventForm>(initEventForm)

  useEffect(() => {
    let _event = { ...state } as EventForm | null;

    setType(_event?.id ? "update" : "create");

    if (!_event?.id) return;

    _event = setImagesToState(_event);

    setEvent({ ..._event, initialDate: dayjs(_event.initialDate), finalDate: dayjs(_event.finalDate) });
  }, [state, form])

  const onFinish = async () => {
    if (saving) return;

    setSaving(true);

    const initialDate = event.initialDate.set('hour', 0).set('minute', 0).set('second', 0).toDate();
    const finalDate = event.finalDate.set('hour', 23).set('minute', 59).set('second', 59).toDate();
    const _event = { ...event, initialDate, finalDate };

    try {
      if (type === "update") {
        const id = _event.id!;

        delete _event.id;
        await update("Events", id, _event)
      } else {
        await add("Events", _event)
      }

      message.success('Evento guardado con éxito.', 4);
      navigate('/eventos')
    } finally {
      setSaving(false)
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
          inputs={[
            {
              typeControl: 'input',
              typeInput: 'text',
              label: 'Nombre',
              name: 'name',
              rules: [{ required: true, message: 'Favor de escribir el nombre del evento.' }],
              value: event.name,
              onChange: (value: string) => setEvent({ ...event, name: value }),
              md: 8
            },
            {
              typeControl: 'date',
              label: 'Fecha Inicial',
              name: 'initialDate',
              rules: [{ required: true, message: 'Favor de seleccionar la fecha inicial.' }],
              value: event.initialDate,
              onChange: (value: Dayjs) => setEvent({ ...event, initialDate: value }),
              md: 8
            },
            {
              typeControl: 'date',
              label: 'Fecha Final',
              name: 'finalDate',
              rules: [{ required: true, message: 'Favor de seleccionar la fecha final.' }],
              value: event.finalDate,
              onChange: (value: Dayjs) => setEvent({ ...event, finalDate: value }),
              md: 8
            },
            {
              typeControl: "file",
              name: "image",
              value: event.image,
              maxCount: 1,
              accept: "image/png, image/jpeg",
              onChange: (value: UploadFile<any>[]) => setEvent({ ...event, image: value }),
              md: 8,
              styleFI: { display: "flex", justifyContent: "center" },
              multiple: false,
            }
          ]}
        />
      </Card>
    </div>
  )
}

export default CreateEvent;