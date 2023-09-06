import { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';
import HeaderView from '../../components/headerView';
import Table from '../../components/table';
import { limit, orderBy, where } from 'firebase/firestore';
import { User } from "../../interfaces";

const Users = () => {
  const columns: ColumnsType<User> = useMemo(() => [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Empresa', dataIndex: 'companyName', key: 'companyName' },
    { title: 'Correo', dataIndex: 'email', key: 'email' },
    { title: 'Teléfono', dataIndex: 'phone', key: 'phone' },
    { title: 'Rol', dataIndex: 'role', key: 'role' }
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
        query={[where("disabled", "==", false), limit(20), orderBy("createAt", "desc")]}
        searchValues={{
          name: "Nombre",
          email: "Correo",
          role: "Rol"
        }}
        optiosSearchValues={
          [
            {
              propSearch: "role",
              options: [
                {
                  key: "Administrador",
                  label: "Administrador"
                },
                {
                  key: "Embajador",
                  label: "Embajador"
                },
                {
                  key: "Lector",
                  label: "Lector"
                }
              ]
            }
          ]
        }
      />
    </div>
  )
}

export default Users;