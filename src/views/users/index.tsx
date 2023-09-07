import { ColumnsType } from 'antd/es/table';
import { useMemo, useState, useEffect } from 'react';
import HeaderView from '../../components/headerView';
import Table, { PropsTable } from '../../components/table';
import { limit, orderBy, where } from 'firebase/firestore';
import { User } from "../../interfaces";
import { Company } from './../../interfaces';
import { getCollectionGeneric } from './../../services/firebase';

const Users = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const columns: ColumnsType<User> = useMemo(() => [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Empresa', dataIndex: 'companyName', key: 'companyName' },
    { title: 'Correo', dataIndex: 'email', key: 'email' },
    { title: 'Teléfono', dataIndex: 'phone', key: 'phone' },
    { title: 'Rol', dataIndex: 'role', key: 'role' }
  ], [])

  useEffect(() => {
    const init = async () => {
      try {
        const response = await getCollectionGeneric<Company>('Companies', [where("disabled", "==", false)])
        setCompanies(response);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [])

  const query = [orderBy("createAt", "desc"), where("disabled", "==", false), limit(20)];

  const propsTable = useMemo<PropsTable<User>>(() => ({
    wait: loading,
    columns,
    placeholderSearch: "Buscar por nombre ó correo...",
    pathEdit: "/usuarios/editar",
    collection: "Users",
    query,
    searchValues: {
      name: "Nombre",
      email: "Correo",
      role: "Rol",
      companyUid: "Empresa"
    },
    optiosSearchValues: [
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
        options: companies.map(c => ({ key: c.id!, label: c.name }))
      }
    ]
  }), [columns, query, companies, loading])

  return (
    <div style={{ margin: 20 }}>
      <HeaderView
        title="Usuarios"
        path="/usuarios/registrar"
      />
      <Table
        {...propsTable}
      />
    </div>
  )
}

export default Users;