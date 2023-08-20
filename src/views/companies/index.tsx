import { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';
import HeaderView from '../../components/headerView';
import Table from '../../components/table';

const Companies = () => {
  const columns: ColumnsType<any> = useMemo(() => [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Correo', dataIndex: 'email', key: 'email' },
    { title: 'Celular', dataIndex: 'phone', key: 'phone' },
    { title: 'Imagen', dataIndex: 'image', key: 'image' },
    { title: 'Dirección', dataIndex: 'address', key: 'address' },
  ], [])

  return (
    <div style={{ margin: 20 }}>
      <HeaderView
        title="Empresas"
      />
      <Table
        url="branchOffice/paginatedListByUserAdmin"
        columns={columns}
        placeholderSearch="Buscar por nombre ó correo..."
        pathEdit="/sucursales/editar"
        urlDisabled="branchOffice/disable"
        collection="Company" 
        query={[]}    
        />
    </div>
  )
}

export default Companies;