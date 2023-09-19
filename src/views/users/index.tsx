import { ColumnsType } from 'antd/es/table';
import { useMemo, useState, useEffect } from 'react';
import HeaderView from '../../components/headerView';
import Table, { PropsTable } from '../../components/table';
<<<<<<< Updated upstream
import { QueryConstraint, limit, orderBy, where } from 'firebase/firestore';
=======
import { limit, orderBy, where } from 'firebase/firestore';
>>>>>>> Stashed changes
import { User } from "../../interfaces";
import { Company } from './../../interfaces';
import { getCollectionGeneric } from './../../services/firebase';
import { useAuth } from "../../context/authContext";

const Users = () => {
<<<<<<< Updated upstream
  const { user, userFirestore } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

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

  const searchVal = useMemo<Record<string, string>>(() => {
    let searchVal: Record<string, string> = {
      name: "Nombre",
      email: "Correo",
      role: "Rol"
    };

    if (user?.displayName === "SuperAdministrador") {
      searchVal = { ...searchVal, companyUid: "Empresa" };
    }

    return searchVal;
  }, [user])
=======
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
>>>>>>> Stashed changes

  const columns: ColumnsType<User> = useMemo(() => [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Empresa', dataIndex: 'companyName', key: 'companyName' },
    { title: 'Correo', dataIndex: 'email', key: 'email' },
    { title: 'Teléfono', dataIndex: 'phone', key: 'phone' },
    { title: 'Rol', dataIndex: 'role', key: 'role' }
  ], [])

<<<<<<< Updated upstream
  const query = useMemo<QueryConstraint[]>(() => {
    const query = [orderBy("createAt", "desc"), where("disabled", "==", false), limit(20)];

    if (userFirestore?.role === "Administrador") {
      query.push(where("companyUid", "==", userFirestore?.companyUid || ""));
    }

    return query;
  }, [userFirestore]);

  const propsTable = useMemo<PropsTable<User>>(() => ({
    wait: loading,
    columns,
    placeholderSearch: "Buscar por nombre ó correo...",
    pathEdit: "/usuarios/editar",
    collection: "Users",
    query,
    searchValues: searchVal,
    optiosSearchValues: [
      {
        propSearch: "role",
        options: [
          {
            key: "",
            label: "Sin Rol"
          },
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
        options: [
          { key: "", label: "Sin Rol" },
          ...companies.map(c => ({ key: c.id!, label: c.name }))
        ]
      }
    ]
  }), [columns, query, companies, loading, searchVal])
=======
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
>>>>>>> Stashed changes

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