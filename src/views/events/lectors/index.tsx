import { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import HeaderView from '../../../components/headerView';
import { useLocation } from 'react-router-dom';
import Table, { PropsTable } from '../../../components/table';
import { limit, orderBy, where } from 'firebase/firestore';
import { User, Event } from '../../../interfaces';
import { initEvent } from '../../../constants';
import { getDocByIdGeneric, update } from '../../../services/firebase';
import { Switch, message } from 'antd';

const Users = () => {
  const location = useLocation();
  const { state } = location;
  const [userScannerIds, setUserScannerIds] = useState<string[]>([]);
  const [event, setEvent] = useState<Event>(initEvent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state) {
      window.location.href = "/eventos";
      return;
    }

    const init = async () => {
      try {
        const _event = state as Event;

        const eventRefresh = await getDocByIdGeneric<Event>("Events", _event.id!);

        setEvent(eventRefresh);
        setUserScannerIds(eventRefresh.userScannerIds);
      } catch (error) {
        console.log(error);
        message.error("Error al cargar los datos del evento.");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [state])

  const onChange = useCallback(async (checked: boolean, _user: User) => {
    let _userScannerIds = [...userScannerIds];

    try {
      if (checked) {
        _userScannerIds.push(_user?.id!)
      } else {
        _userScannerIds = _userScannerIds.filter((u) => u !== _user?.id!);
      }

      await update('Events', event.id!, { userScannerIds: _userScannerIds })

      setUserScannerIds(_userScannerIds)
    } catch (error) {
      console.log(error)
    }
  }, [event.id, userScannerIds]);

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

  const query = useMemo(() => {
    return [
      where("disabled", "==", false), orderBy("createAt", "desc"), limit(20),
<<<<<<< Updated upstream
      where("companyUid", "==", event?.companyUid),
=======
      where("companyName", "==", event?.companyName),
>>>>>>> Stashed changes
      where("role", "==", "Lector")
    ]
  }, [event])

  const propsTable = useMemo<PropsTable<User>>(() => {
<<<<<<< Updated upstream
=======
    //cambiar query company uid
>>>>>>> Stashed changes
    return {
      columns,
      placeholderSearch: "Buscar por nombre ó correo...",
      pathEdit: "/usuarios/editar",
      collection: "Users",
      query,
      searchValues: { name: "Nombre", email: "Correo" },
      removeTableActions: true,
      wait: loading
    }
<<<<<<< Updated upstream
  }, [columns, query, loading])
=======
  }, [event, columns, query, loading])
>>>>>>> Stashed changes

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