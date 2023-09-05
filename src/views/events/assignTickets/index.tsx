import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderView from "../../../components/headerView";
import { Event, User, Range, AmbassadorRanges } from "../../../interfaces";
import { Button, Form, Input, Row, Table, TableColumnsType } from "antd";
import { ColumnsType } from "antd/es/table";
import useCollection, { PropsUseCollection } from "../../../hooks/useCollection";
import { limit, orderBy, where } from "firebase/firestore";
import FormItem from "antd/es/form/FormItem";
import { DeleteOutlined } from "@ant-design/icons";

const AssignTickets = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const propsUseCollection = useMemo<PropsUseCollection>(() => ({
    collection: "Users",
    query: [where("role", "==", "Embajador"), limit(20), orderBy("name")],
  }), [])
  const { loading, data: users } = useCollection<User>(propsUseCollection);
  const [event, setEvent] = useState<Event>();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!state) {
      window.location.href = "/eventos";
    }

    setEvent(state as Event);
  }, [state, navigate]);

  const expandedRowRender = (userAssign: User, ranges: Range[]) => {
    const columns: TableColumnsType<Range> = [
      {
        width: "40%",
        title: 'Inicio',
        key: 'startRange',
        render: (_, __, index) => <FormItem
          name={`startRange-${index}-${userAssign.id}`}
          label="Inicio"
          rules={[
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
            }
          ]}
        >
          <Input />
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
            }
          ]}
        >
          <Input />
        </FormItem>
      },
      {
        width: "20%",
        title: 'Borrar rango',
        key: 'deleteRange',
        render: (_, __, index) => <Button
          icon={<DeleteOutlined />}
          style={{ backgroundColor: "#d34745", color: '#fff' }}
          shape="circle"
          onClick={() =>
            setEvent(e => ({
              ...e!,
              ambassadorsRanges: e!.ambassadorsRanges.map(
                ar => ar.userAmbassadorId === userAssign.id
                  ? ({ ...ar, ranges: ar.ranges.filter((_, i) => i !== index) })
                  : ar
              )
            }))
          }
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
      <Table rowKey="index" columns={columns} showHeader={false} dataSource={ranges} pagination={false} />
    </div>
  }

  const columns: ColumnsType<User> = useMemo(() => [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Correo', dataIndex: 'email', key: 'email' },
  ], [])

  return (
    <>
      <HeaderView
        title={`Asignador boletos ${event?.name}`}
        goBack
        path="/eventos"
      />
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          console.log(values)

          /*   const isValidRanges =  arr.every((rango1, index) =>
              arr.slice(index + 1).every((rango2) =>
                rango1.rangoInicio > rango2.rangoFin || rango1.rangoFin < rango2.rangoInicio
              )
            ); */
        }}
      >
        <Button type="primary" htmlType="submit">Asignar embajadores</Button>
        <br />
        <br />
        <Table
          loading={loading}
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={false}
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
        />
      </Form>
    </>
  )
}

export default AssignTickets;