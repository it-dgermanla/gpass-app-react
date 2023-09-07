import { ColumnsType } from 'antd/es/table';
import { useCallback, useMemo, useState } from 'react';
import HeaderView from '../../../components/headerView';
import { useLocation } from 'react-router-dom';
import Table, { PropsTable } from '../../../components/table';
import { limit, orderBy, where } from 'firebase/firestore';
import { User, Event } from '../../../interfaces';
import { initEvent } from '../../../constants';
import { update } from '../../../services/firebase';
import { Switch } from 'antd';

const Users = () => {
  const location = useLocation();
  const { state } = location;
  const [userScannerIds, setUserScannerIds] = useState<string[]>([])

  const event = useMemo(() => {
    if (state) {
      const _event = state as Event;
      setUserScannerIds(_event.userScannerIds)

      return _event;
    }

    window.location.href = "/eventos";

    return initEvent;
  }, [state]);

  const onChange = useCallback(async (checked: boolean, _user: User) => {
    let _userScannerIds = [...userScannerIds]
    try {
      if (checked) {
        _userScannerIds.push(_user?.id!)
      } else {
        _userScannerIds = _userScannerIds.filter((u) => u !== _user?.id!);
      }

      // await update('Events', event.id!, { userScannerIds: _userScannerIds })

      setUserScannerIds(_userScannerIds)
    } catch (error) {
      console.log(error)
    }
  }, [event.id]);

  const columns: ColumnsType<User> = useMemo(() => [
    {
      title: "Lector",
      dataIndex: "lector",
      key: "lector",
      render: (_, _user) => <Switch checked={userScannerIds.includes(_user?.id!)} onChange={(checked) => onChange(checked, _user)} />
    },
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Correo', dataIndex: 'email', key: 'email' }
  ], [onChange, userScannerIds])

  const propsTable = useMemo<PropsTable<User>>(() => {
 //cambiar query company uid
    return {
      columns,
      placeholderSearch: "Buscar por nombre ó correo...",
      pathEdit: "/usuarios/editar",
      collection: "Users",
      query: [
        where("disabled", "==", false), orderBy("createAt", "desc"), limit(10),
        where("companyUid", "==", event?.companyUid),
        where("role", "==", "Lector")
      ],
      searchValues: { name: "Nombre", email: "Correo" },
      removeTableActions: true
    }
  }, [event, columns])

  return (
    <div style={{ margin: 20 }}>
      <HeaderView
        title={`Lectores - ${event?.name}`}
      />
      <Table
        {...propsTable}
      />
    </div>
  )
}

export default Users;