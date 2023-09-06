import { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import HeaderView from '../../../components/headerView';
import { useLocation } from 'react-router-dom';
import Table from '../../../components/table';
import { limit, orderBy, where } from 'firebase/firestore';
import { useAuth } from "../../../context/authContext";
import { User, Event } from '../../../interfaces';
import { initEvent, initUser } from '../../../constants';
import { getGenericDocById, update } from '../../../services/firebase';
import { Switch } from 'antd';

const Users = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { state } = location;
  const [userData, setUserData] = useState<User>(initUser)
  const event = useMemo(() => {
    if (state) {
      return state as Event;
    }
    window.location.href = "/eventos";

    return initEvent;
  }, [state]);

  let userScannerIds: any[] = []

  const onUser = async (uid: string) => {
    const responceUser = await getGenericDocById<User>('Users', uid)
    const responceEvent = await getGenericDocById<Event>('Events', event.id!)

    if (responceEvent.userScannerIds) userScannerIds = responceEvent.userScannerIds
    setUserData(responceUser)
  }

  useEffect(() => {
    if (!user) return

    onUser(user?.uid!)

  }, [user]);


  const onChange = async (checked: boolean, _user: User) => {
    try {
      if (checked) {
        if (userScannerIds.indexOf(_user.id) === -1) {
          userScannerIds.push(_user.id);
        }

      } else {
        userScannerIds.splice(userScannerIds.indexOf(_user.id), 1);
      }

      await update('Events', event.id!, { userScannerIds })
    } catch (error) {
      console.log(error)
    }
  };

  const columns: ColumnsType<any> = useMemo(() => [
    {
      title: "Lector",
      dataIndex: "lector",
      key: "lector",
      render: (_, _user) => (
        <>
          {
            userScannerIds.indexOf(_user.id) === -1 || userScannerIds.length === 0 ?
              <Switch onChange={(checked) => onChange(checked, _user)} /> :
              <Switch defaultChecked onChange={(checked) => onChange(checked, _user)} />
          }
        </>
      )
    },
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Correo', dataIndex: 'email', key: 'email' },
    { title: 'Empresa', dataIndex: 'companyName', key: 'companyName' },
    { title: 'Rol', dataIndex: 'role', key: 'role' }
  ], [])

  if (userData?.companyName === "") return

  return (
    <div style={{ margin: 20 }}>
      <HeaderView
        title={`Lectores - ${event?.name}`}
      />
      <Table
        columns={columns}
        placeholderSearch="Buscar por nombre ó correo..."
        pathEdit="/usuarios/editar"
        collection="Users"
        query={[
          where("disabled", "==", false), orderBy("createAt", "desc"), limit(10),
          where("companyName", "==", event.companyName),
          where("role", "==", "Lector")
        ]}
        searchValues={{
          name: "Nombre",
          email: "Correo"
        }}
        removeTableActions={true}
      />
    </div>
  )
}

export default Users;