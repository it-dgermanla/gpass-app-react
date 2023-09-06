import { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

  //este valor deberias tomarlo del evento y no debes usar variables que no sean estados para dibujar cosas en el jsx
  let userScannerIds: any[] = []

  useEffect(() => {
    if (!user) return

    const init = async () => {
      try {
        const responceUser = await getGenericDocById<User>('Users', user.uid)
        const responceEvent = await getGenericDocById<Event>('Events', event.id!)

        if (responceEvent.userScannerIds) userScannerIds = responceEvent.userScannerIds
        setUserData(responceUser)
      } catch (error) {
        console.log(error);
      }
    }

    init();
  }, [user]);

  const onChange = useCallback(async (checked: boolean, _user: User) => {
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
  }, [event.id]);

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
  ], [onChange])

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