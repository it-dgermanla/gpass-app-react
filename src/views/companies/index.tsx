import { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';
import HeaderView from '../../components/headerView';
import Table from '../../components/table';
import CachedImage from "../../components/cachedImage";
import { Company } from '../../interfaces';
import { where, orderBy, limit } from 'firebase/firestore';

const Companies = () => {
  const columns: ColumnsType<Company> = useMemo(() => [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Correo', dataIndex: 'email', key: 'email' },
    { title: 'Celular', dataIndex: 'phone', key: 'phone' },
    {
      title: "Imagen",
      dataIndex: "image",
      key: "image",
      render: (_, company) => (
        <CachedImage
          style={{ width: 70, height: 70, objectFit: "cover" }}
          imageUrl={company.image as string}
        />
      )
    },
    { title: 'Dirección', dataIndex: 'address', key: 'address' }
  ], [])

  return (
    <div style={{ margin: 20 }}>
      <HeaderView
        title="Empresas"
        path="/empresas/registrar"
      />
      <Table
        columns={columns}
        placeholderSearch="Buscar por nombre ó correo..."
        pathEdit="/empresas/editar"
        collection="Companies"
        query={[where("disabled", "==", false), orderBy("createAt", "desc"), limit(10)]}
        searchValues={{
          name: "Nombre",
          email: "Correo"
        }}
      />
    </div>
  )
}

export default Companies;