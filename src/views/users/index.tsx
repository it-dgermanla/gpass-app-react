import { ColumnsType } from 'antd/es/table';
import { useMemo, useState, useEffect } from 'react';
import HeaderView from '../../components/headerView';
import Table from '../../components/table';
import { limit, orderBy, where } from 'firebase/firestore';
import { User } from "../../interfaces";
import { Option, Company } from './../../interfaces';
import { getCollectionGeneric } from './../../services/firebase';

const Users = () => {
  const [companies, setCompanies] = useState<any>();

  const columns: ColumnsType<User> = useMemo(() => [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Empresa', dataIndex: 'companyName', key: 'companyName' },
    { title: 'Correo', dataIndex: 'email', key: 'email' },
    { title: 'Teléfono', dataIndex: 'phone', key: 'phone' },
    { title: 'Rol', dataIndex: 'role', key: 'role' }
  ], [])

  useEffect(() => {
    const init1 = async () => {
      const response = await getCollectionGeneric<Company>('Companies', [where("disabled", "==", false)])
      const selectComapanies = response.map((company) => {
        return {
          key: company.id,
          label: company.name
        }
      })
      setCompanies(selectComapanies as any);
    }

    init1();
  }, [])

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
          role: "Rol",
          companyUid: "Empresa"
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
            },
            {
              propSearch: "companyUid",
              options: companies
            } 
          ]
        }
      />
    </div>
  )
}

export default Users;