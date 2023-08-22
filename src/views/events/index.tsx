import { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';
import HeaderView from "../../components/headerView";
import Table from '../../components/table';
import { where } from 'firebase/firestore';
import { Event } from '../../interfaces';
import CachedImage from "../../components/cachedImage";
import dayjs from "dayjs";

const Events = () => {
  const columns: ColumnsType<Event> = useMemo(() => [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    {
      title: "Fecha Inicio",
      dataIndex: "initialDate",
      key: "initialDate",
      render: (_, company: Event) => (
        <>
          {dayjs(company.initialDate).format('DD/MM/YYYY  hh:mm a')}
        </>
      )
    },
    {
      title: "Fecha Final",
      dataIndex: "finalDate",
      key: "finalDate",
      render: (_, company: Event) => (
        <>
          {dayjs(company.finalDate).format('DD/MM/YYYY  hh:mm a')}
        </>
      )
    },
    {
      title: "Imagen",
      dataIndex: "image",
      key: "image",
      render: (_, company: Event) => (
        <CachedImage
          style={{ width: 70, height: 70, objectFit: "cover" }}
          imageUrl={company.image as string}
        />
      )
    }
  ], [])

  return (
    <div style={{ margin: 20 }}>
      <HeaderView
        title="Eventos"
        path="/eventos/registrar"
      />

      <Table
        url="Events"
        columns={columns}
        placeholderSearch="Buscar por evento..."
        pathEdit="/eventos/editar"
        urlDisabled="eventos/disable"
        collection="Events"
        query={[where("disable", "==", false)]}
      />
    </div>
  )
}

export default Events;