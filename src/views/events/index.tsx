import { useMemo } from 'react';
import { ColumnsType } from 'antd/es/table';
import { limit, orderBy, where } from 'firebase/firestore';
import HeaderView from "../../components/headerView";
import Table from '../../components/table';
import { Event } from '../../interfaces';
import CachedImage from "../../components/cachedImage";
import { Button } from "antd";
import { MdConfirmationNumber } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { SecurityScanOutlined, UserAddOutlined } from '@ant-design/icons';


const Events = () => {
  const navigate = useNavigate();

  const columns: ColumnsType<Event> = useMemo(() => [
    {
      title: "Lector",
      dataIndex: "lector",
      key: "lector",
      render: (_, event) => (
        <Button onClick={() => navigate("/lector", { state: event })} type="primary" shape="round" icon={<SecurityScanOutlined />} size={"large"} />
      )
    },
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: '#Boletos', dataIndex: 'total', key: 'total' },
    { title: 'Fecha Inicio', dataIndex: 'initialDateFormated', key: 'initialDateFormated' },
    { title: 'Fecha Final', dataIndex: 'finalDateFormated', key: 'finalDateFormated' },
    {
      title: "Ver boletos",
      dataIndex: "tickets",
      key: "tickets",
      render: (_, event) => (
        <Button
          onClick={() => navigate("/eventos/boletos", { state: event })}
          shape="circle"
          icon={<MdConfirmationNumber />}
        />
      )
    },
    {
      title: "Asignar Lectores",
      dataIndex: "lector",
      key: "lector",
      render: (_, event) => (
        <Button
          onClick={() => navigate("/eventos/lectores", { state: event })}
          shape="circle"
          icon={<UserAddOutlined />}
        />
      )
    },
    {
      title: "Imagen",
      dataIndex: "image",
      key: "image",
      render: (_, event) => (
        <CachedImage
          style={{ width: 70, height: 70, objectFit: "cover" }}
          imageUrl={event.image as string}
        />
      )
    }
  ], [navigate]);

  return (
    <div style={{ margin: 20 }}>
      <HeaderView
        title="Eventos"
        path="/eventos/registrar"
      />
      <Table
        columns={columns}
        placeholderSearch="Buscar por nombre..."
        pathEdit="/eventos/editar"
        collection="Events"
        query={[where("disabled", "==", false), orderBy("createAt", "desc"), limit(10)]}
        formatDate="DD/MM/YYYY hh:mm a"
        searchValues={{
          name: "Nombre"
        }}
      />
    </div>
  )
}

export default Events;