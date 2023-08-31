import { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';
import HeaderView from '../../components/headerView';
import Table from '../../components/table';
import { limit, orderBy, where } from 'firebase/firestore';
import { Tag } from 'antd';

const Users = () => {
  const columns: ColumnsType<any> = useMemo(() => [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    {
      title: "Empresa",
      dataIndex: "company",
      key: "company",
      render: (_, event) => (
        <Tag color="#108ee9">
          {event.company.split("-")[0]}
        </Tag>
      )
    },
    { title: 'Correo', dataIndex: 'email', key: 'email' },
    { title: 'Teléfono', dataIndex: 'phone', key: 'phone' },
    { title: 'Rol', dataIndex: 'role', key: 'phone' }
  ], [])

  return (
    <div style={{ margin: 20 }}>
      <HeaderView
        title="Usuarios"
        path="/usuarios/registrar"
      />
      <Table
        columns={columns}
        placeholderSearch="Buscar por nombre ó correo..."
        pathEdit="/usuarios/editar"
        collection="Users"
        query={[where("disabled", "==", false), orderBy("createAt", "desc"), limit(10)]}
        searchValues={{
          name: "Nombre",
          email: "Correo"
        }}
      />
    </div>
  )
}

export default Users;