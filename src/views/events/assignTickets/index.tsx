import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderView from "../../../components/headerView";
import { Event, User, Range, AmbassadorRanges } from "../../../interfaces";
import { Button, Form, Input, Row, Table as TableAnt, TableColumnsType, message } from "antd";
import { ColumnsType } from "antd/es/table";
import { QueryConstraint, limit, orderBy, where, writeBatch } from "firebase/firestore";
import FormItem from "antd/es/form/FormItem";
import { DeleteOutlined } from "@ant-design/icons";
import { Rule } from "antd/es/form";
import { getCollection, update } from "../../../services/firebase";
import Table from "../../../components/table";
import { db } from "../../../firebaseConfig";

type AmbassadorRangesAssing = AmbassadorRanges & { init?: boolean }
type EventAssign = Omit<Event, "ambassadorsRanges"> & {
  ambassadorsRanges: AmbassadorRangesAssing[];
}

const AssignTickets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const [form] = Form.useForm();
  const [event, setEvent] = useState<EventAssign>();
  const [saving, setSaving] = useState(false);
  const [maxNumber, setMaxNumber] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [rangesToDelete, setRangesToDelete] = useState<Range[]>([]);

  useEffect(() => {
    if (!state) {
      window.location.href = "/eventos";
    }

    const _event = state as EventAssign;
    let rangesValues: Record<string, string> = {};

    _event?.ambassadorsRanges.forEach((ambassadorRanges) => {
      ambassadorRanges.ranges.forEach((range) => {
        rangesValues = {
          ...rangesValues,
          [`startRange-${range.index}-${ambassadorRanges.userAmbassadorId}`]: range.startRange!.toString(),
          [`endRange-${range.index}-${ambassadorRanges.userAmbassadorId}`]: range.endRange!.toString(),
        };
      });
    });

    setMaxNumber(_event?.ambassadorsRanges.reduce((max, item) => {
      const ranges = item.ranges || [];
      const endRanges: any = ranges.map(range => range.endRange).filter(endRange => typeof endRange === 'number');
      const maxInItem = Math.max(...endRanges);
      return maxInItem > max ? maxInItem : max;
    }, -Infinity | 0))

    form.setFieldsValue(rangesValues);
    setEvent({ ..._event, ambassadorsRanges: _event.ambassadorsRanges.map(ar => ({ ...ar, init: true })) });
  }, [state, form]);

  const query = useMemo<QueryConstraint[]>(() => {
    const { companyUid } = state as EventAssign;
    return [
      where("role", "==", "Embajador"),
      where("companyUid", "==", companyUid),
      limit(20),
      orderBy("name")
    ]
  }, [state]);

  const ruleMaxRangeForEvent = useMemo<Rule>(() => ({
    message: "El rango no puede ser mayor a la cantidad de boletos del evento.",
    validator: (rule, value?: string) => value && +value > event?.total! ? Promise.reject(rule.message) : Promise.resolve()
  }), [event]);

  const expandedRowRender = (userAssign: User, ranges: Range[]) => {
    const columnsSubTable: TableColumnsType<Range> = [
      {
        width: "40%",
        title: 'Inicio',
        key: 'startRange',
        render: (_, __, index) => <FormItem
          name={`startRange-${index}-${userAssign.id}`}
          label="Inicio"
          rules={[
            //falta la regla de no max de lo tickets del evento.
            {
              required: true, message: "Debe ingresar un inicio de rango.",
            },
            {
              message: "El rango de inicio no puede ser mayor o igual al rango fin.",
              validator: (rule, value?: string) =>
                value && form.getFieldValue(`endRange-${index}-${userAssign.id}`) && +value >= Number(form.getFieldValue(`endRange-${index}-${userAssign.id}`) || 0) ? Promise.reject(rule.message) : Promise.resolve(),
            },
            {
              message: "El rango de inicio no puede ser menor o igual a 0.",
              validator: (rule, value?: string) => value && +value <= 0 ? Promise.reject(rule.message) : Promise.resolve(),
            },
            ruleMaxRangeForEvent
          ]}
        >
          <Input disabled={event!.ambassadorsRanges.some(ar => ar.init && ar.userAmbassadorId === userAssign.id && ar.ranges.some(r => r.index === index))} />
        </FormItem >,
      },
      {
        width: "40%",
        title: 'Fin',
        key: 'endRange',
        render: (_, __, index) => <FormItem
          name={`endRange-${index}-${userAssign.id}`}
          label="Fin"
          rules={[
            {
              required: true, message: "Debe ingresar un fin de rango."
            },
            {
              message: "El rango de fin no puede ser menor o igual al rango inicio.",
              validator: (rule, value?: string) => value && +value <= Number(form.getFieldValue(`startRange-${index}-${userAssign.id}`) || 0) ? Promise.reject(rule.message) : Promise.resolve(),
            },
            {
              message: "El rango de fin no puede ser menor o igual a 0.",
              validator: (rule, value?: string) => value && +value <= 0 ? Promise.reject(rule.message) : Promise.resolve(),
            },
            ruleMaxRangeForEvent
          ]}
        >
          <Input disabled={event!.ambassadorsRanges.some(ar => ar.init && ar.userAmbassadorId === userAssign.id && ar.ranges.some(r => r.index === index))} />
        </FormItem>
      },
      {
        width: "20%",
        title: 'Borrar rango',
        key: 'deleteRange',
        render: (_, { startRange, endRange }, index) => <Button
          icon={<DeleteOutlined />}
          style={{ backgroundColor: "#d34745", color: '#fff' }}
          shape="circle"
          onClick={() => {
            const inputDisabled = event!.ambassadorsRanges.some(ar => ar.init && ar.userAmbassadorId === userAssign.id && ar.ranges.some(r => r.index === index));

            if (inputDisabled) {
              setRangesToDelete(r => [...r, { index: 0, startRange, endRange }])
            }

            setEvent(e => ({
              ...e!,
              ambassadorsRanges: e!.ambassadorsRanges.map(
                ar => ar.userAmbassadorId === userAssign.id
                  ? ({ ...ar, ranges: ar.ranges.filter((_, i) => i !== index) })
                  : ar
              )
            }))
          }}
        />
      },
    ];

    return <div style={{ padding: 20 }}>
      <Row>
        <Button
          onClick={() =>
            setEvent(e => ({
              ...e!,
              ambassadorsRanges: e!.ambassadorsRanges.map(
                ar => ar.userAmbassadorId === userAssign.id
                  ? ({ ...ar, ranges: [...ar.ranges, { endRange: undefined, startRange: undefined, index: ar.ranges.length + 1 }] })
                  : ar
              )
            }))
          }
        >
          Agregar rango
        </Button>
      </Row>
      <br />
      <br />
      <TableAnt rowKey="index" columns={columnsSubTable} showHeader={false} dataSource={ranges} pagination={false} />
    </div>
  }

  const columns = useMemo<ColumnsType<User>>(() => [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Correo', dataIndex: 'email', key: 'email' },
  ], []);

  const onFinish = async (values: Record<string, string>) => {
    if (saving) return;

    const keysValues = Object.keys(values).filter(k => values[k]);
    const keysValuesStartRange = keysValues.filter(k => k.includes('startRange'));
    const keysValuesEndRange = keysValues.filter(k => k.includes('endRange'));
    const arrayToValidateRanges: Record<string, number>[] = [];
    let ambassadorsRanges: AmbassadorRangesAssing[] = [];

    keysValuesStartRange.forEach(key => {
      const [_, index, userId] = key.split('-');
      const endRangeKey = keysValuesEndRange.find(k => k.includes(`${index}-${userId}`))!;
      const startRange = values[key];
      const endRange = values[endRangeKey];

      arrayToValidateRanges.push({
        startRange: +startRange,
        endRange: +endRange,
      });

      if (!ambassadorsRanges.some(ar => ar.userAmbassadorId === userId)) {
        ambassadorsRanges.push({
          userAmbassadorId: userId,
          ranges: [{
            index: +index,
            startRange: +startRange,
            endRange: +endRange,
          }]
        });
      } else {
        ambassadorsRanges = ambassadorsRanges.map(ar =>
          ar.userAmbassadorId === userId
            ? { ...ar, ranges: [...ar.ranges, { index: +index, startRange: +startRange, endRange: +endRange }] }
            : ar
        ) as AmbassadorRanges[];
      }
    });

    const isValidRanges = arrayToValidateRanges.every((range1, index) =>
      arrayToValidateRanges.slice(index + 1).every((range2) =>
        range1.startRange > range2.endRange || range1.endRange < range2.startRange
      )
    );

    if (!isValidRanges) {
      message.error('Rangos no validos, verifique que los rangos sean correctos.');
      return;
    }

    const userAmbassadorIds: string[] = [];

    keysValues.forEach((key) => {
      const userId = key.split('-')[2];

      if (!userAmbassadorIds.includes(userId)) {
        userAmbassadorIds.push(userId);
      }
    });

    setSaving(true);

    try {
      await update("Events", event?.id!, { userAmbassadorIds, ambassadorsRanges });

      message.success('Boletos asignados con exito.', 4);

      const newAmbassadorsRanges: AmbassadorRangesAssing[] = [];

      ambassadorsRanges.forEach(ambassadorRanges => {
        if (!ambassadorRanges.init) {
          newAmbassadorsRanges.push(ambassadorRanges)
        }
      });

      for (let i = 0; i < newAmbassadorsRanges.length; i++) {
        const newAmbassadorRanges = newAmbassadorsRanges[i];

        for (let j = 0; j < newAmbassadorRanges.ranges.length; j++) {
          const range = newAmbassadorRanges.ranges[j];
          const start = range.startRange!;
          const end: number = range.endRange!;
          const ranges: { start: number; end: number }[] = [];

          let i = start;

          while (i <= end) {
            const _range = {
              start: i,
              end: Math.min(i + 500, end),
            };

            ranges.push(_range);

            i = _range.end + 1;
          }

          for (let k = 0; k < ranges.length; k++) {
            const _range = ranges[k];

            const { docs } = await getCollection("Tickets", [orderBy("number"), where("number", ">=", _range.start), where("number", "<=", _range.end), where("eventId", "==", event?.id)]);

            const batch = writeBatch(db);

            for (let l = 0; l < docs.length; l++) {
              const ref = docs[l].ref;
              const userAmbassadorId = newAmbassadorRanges.userAmbassadorId;

              batch.update(
                ref,
                {
                  userAmbassadorId,
                  userAmbassadorName: users.find(u => u.id === newAmbassadorRanges.userAmbassadorId)?.name || "",
                }
              );
            }

            await batch.commit();
          }
        }
      }

      for (let j = 0; j < rangesToDelete.length; j++) {
        const range = rangesToDelete[j];
        const start = range.startRange!;
        const end: number = range.endRange!;
        const ranges: { start: number; end: number }[] = [];

        let i = start;

        while (i <= end) {
          const _range = {
            start: i,
            end: Math.min(i + 500, end),
          };

          ranges.push(_range);

          i = _range.end + 1;
        }

        for (let k = 0; k < ranges.length; k++) {
          const _range = ranges[k];

          const { docs } = await getCollection("Tickets", [orderBy("number"), where("number", ">=", _range.start), where("number", "<=", _range.end), where("eventId", "==", event?.id)]);

          const batch = writeBatch(db);

          for (let l = 0; l < docs.length; l++) {
            const ref = docs[l].ref;

            batch.update(
              ref,
              {
                userAmbassadorId: "",
                userAmbassadorName: "",
              }
            );
          }

          await batch.commit();
        }
      }

      navigate("/eventos");
    } catch (error) {
      console.log(error);
      message.error('Error al asignar los boletos.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <HeaderView
        title={`Asignador boletos ${event?.name} - Cantidad boletos: ${event?.total} | Maximo Rango: ${maxNumber}`}
        goBack
        path="/eventos"
      />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Button type="primary" htmlType="submit">Asignar embajadores</Button>
        <br />
        <br />
        <Table
          scrollY="60vh"
          collection="Users"
          columns={columns}
          query={query}
          searchValues={{
            name: "Nombre",
            email: "Email",
          }}
          removeTableActions
          expandable={{
            expandedRowRender: (user) => expandedRowRender(user, event?.ambassadorsRanges.find(ar => ar.userAmbassadorId === user.id)?.ranges || []),
            defaultExpandedRowKeys: [],
            onExpand: (expanded, record) => {
              if (expanded && !event?.userAmbassadorIds.some(id => id === record.id)) {
                setEvent(e => ({
                  ...e!,
                  userAmbassadorIds: [...e!.userAmbassadorIds, record.id!],
                  ambassadorsRanges: [...e!.ambassadorsRanges, { userAmbassadorId: record.id!, ranges: [{ startRange: undefined, endRange: undefined, index: 1 }] }]
                }));

                return;
              }
            },
          }}
          onLoadData={setUsers}
        />
      </Form>
    </>
  )
}

export default AssignTickets;