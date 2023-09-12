import { useMemo } from 'react';
import { ColumnsType } from 'antd/es/table';
import { QueryConstraint, limit, orderBy, where } from 'firebase/firestore';
import HeaderView from "../../components/headerView";
import Table from '../../components/table';
import { Event } from '../../interfaces';
import CachedImage from "../../components/cachedImage";
import { Button } from "antd";
import { MdConfirmationNumber } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { SecurityScanOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAuth } from "../../context/authContext";

const Events = () => {
  const navigate = useNavigate();
  const { user, userFirestore } = useAuth();

  const columns = useMemo<ColumnsType<Event>>(() => {
    const columns: ColumnsType<Event> = [
      {
        title: "Lector",
        dataIndex: "lector",
        key: "lector",
        render: (_, event) => (
          <Button
            onClick={() => navigate("/lector", { state: event })}
            type="primary"
            shape="circle"
            icon={<SecurityScanOutlined />}
          />
        )
      },
      { title: 'Nombre', dataIndex: 'name', key: 'name' },
      { title: '#Boletos', dataIndex: 'total', key: 'total' },
      { title: 'Empresa', dataIndex: 'companyName', key: 'companyName' },
      { title: 'Fecha Inicio', dataIndex: 'initialDateFormated', key: 'initialDateFormated' },
      { title: 'Fecha Final', dataIndex: 'finalDateFormated', key: 'finalDateFormated' },
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
    ]

    if (["SuperAdministrador", "Administrador", "Embajador"].includes(user?.displayName!)) {
      columns.push({
        title: "Boletos",
        dataIndex: "tickets",
        key: "tickets",
        render: (_, event) => (
          <Button
            type="primary"
            onClick={() => navigate("/eventos/boletos", { state: event })}
            shape="circle"
            icon={<MdConfirmationNumber style={{ marginBottom: -2 }} />}
          />
        )
      })
    }

    if (["SuperAdministrador", "Administrador"].includes(user?.displayName!)) {
      columns.push({
        title: "Asignar boletos embajadores",
        dataIndex: "assignTickets",
        key: "assignTickets",
        render: (_, event) => (
          <Button
            type="primary"
            onClick={() => navigate("/eventos/asignar-boletos", { state: event })}
            shape="circle"
            icon={<MdConfirmationNumber style={{ marginBottom: -2 }} />}
          />
        )
      })
    }

    if (["SuperAdministrador", "Administrador"].includes(user?.displayName!)) {
      columns.push({
        title: "Asignar Lectores",
        dataIndex: "lector",
        key: "lector",
        render: (_, event) => (
          <Button
            type="primary"
            onClick={() => navigate("/eventos/lectores", { state: event })}
            shape="circle"
            icon={<UserAddOutlined style={{ marginBottom: -2 }} />}
          />
        )
      })
    }

    return columns;
  }, [navigate, user?.displayName]);

  const query = useMemo<QueryConstraint[]>(() => {
    const query = [where("disabled", "==", false), orderBy("createAt", "desc"), limit(10)];

    if (user?.displayName === "Lector") {
      query.push(where("userScannerIds", "array-contains", user.uid || ""));
    }

    if (user?.displayName === "Embajador") {
      query.push(where("userAmbassadorIds", "array-contains", user.uid || ""));
    }

    if (user?.displayName === "Administrador") {
      query.push(where("companyUid", "==", userFirestore?.companyUid || ""));
    }

    return query;
  }, [user, userFirestore])

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
        query={query}
        formatDate="DD/MM/YYYY hh:mm a"
        searchValues={{
          name: "Nombre"
        }}
      />
    </div>
  )
}

export default Events;