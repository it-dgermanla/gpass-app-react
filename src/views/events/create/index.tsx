import { useEffect, useState } from 'react'
import DynamicForm from '../../../components/dynamicForm'
import { Card, Form, FormRule, Grid, message, UploadFile } from 'antd'
import { add } from '../../../services/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { initEvent, titleForm, urlImageDefaultEvent } from '../../../constants';
import { Event } from '../../../interfaces';
import { TypeRute } from '../../../types';
import HeaderView from "../../../components/headerView";
const { useBreakpoint } = Grid;

const CreateEvent = () => {
  const screens = useBreakpoint();
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const [type, setType] = useState<TypeRute>("create");
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<Event>(initEvent)

  useEffect(() => {
    let _event = { ...state } as Event | null;
    setType(_event?.id ? "update" : "create");
    if (!_event?.id) return;
    form.setFieldsValue(_event);
    setEvent(_event);
  }, [state, form])

  const onFinish = async () => {
    if (saving) return;
    const _event = { ...event, ...{ image: urlImageDefaultEvent } };
    setSaving(true);
    try {
      if (type === "update") {
        console.log("update")
      } else {
        await add<Event>("Events", _event)
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
        path="/empresas"
        goBack
      />
      <Card>
        <DynamicForm
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
              rules: [{ required: true, message: 'Favor de escribir el nombre del vendedor.' }],
              value: event.name,
              onChange: (value: string) => setEvent({ ...event, name: value }),
              md: 8
            },
            {
              typeControl: 'date',
              typeInput: 'text',
              label: 'Fecha Inicial',
              name: 'initialDate',
              rules: [{ required: true, message: 'Favor de seleccionar la fecha inicial.' }],
              value: event.initialDate,
              onChange: (value: string) => {
                const _initialDate = new Date(value);
                _initialDate.setHours(0, 0, 0, 0);
                setEvent({ ...event, initialDate: _initialDate })
              },
              md: 8
            },
            {
              typeControl: 'date',
              typeInput: 'text',
              label: 'Fecha Final',
              name: 'finalDate',
              rules: [{ required: true, message: 'Favor de seleccionar la fecha final.' }],
              value: event.finalDate,
              onChange: (value: string) => {
                const _finalDate = new Date(value);
                _finalDate.setHours(23, 59, 59, 0);
                setEvent({ ...event, finalDate: _finalDate })
              },
              md: 8
            },
            // {
            //   typeControl: "file",
            //   label:  screens.xs ? "" : "Evento",
            //   name: "image",
            //   value: event.image,
            //   maxCount: 1,
            //   accept: "image/png, image/jpeg",
            //   onChange: (value: UploadFile<any>[]) => setEvent({ ...event, image: value }),
            //   md: 8,
            //   styleFI: { display: "flex", justifyContent: "center" },
            //   multiple: false,
            // }
          ]}
        />
      </Card>
    </div>
  )
}

export default CreateEvent;