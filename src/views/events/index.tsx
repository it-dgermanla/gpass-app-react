import { useMemo } from 'react';
import { ColumnsType } from 'antd/es/table';
import { orderBy, where } from 'firebase/firestore';
import HeaderView from "../../components/headerView";
import Table from '../../components/table';
import { Event } from '../../interfaces';
import CachedImage from "../../components/cachedImage";

const Events = () => {
  const columns: ColumnsType<Event> = useMemo(() => [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
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
  ], []);

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
        query={[where("disabled", "==", false), orderBy("createAt", "desc")]}
        formatDate="DD/MM/YYYY hh:mm a"
        searchValues={{
          name: "Nombre",
        }}
      />
    </div>
  )
}

export default Events;