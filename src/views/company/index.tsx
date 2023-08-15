import { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';
import HeaderView from '../../components/headerView';
import Table from '../../components/table';
import { BranchOffice } from "../../interfaces/user";

const Companys = () => {
  const columns: ColumnsType<BranchOffice> = useMemo(() => [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Correo', dataIndex: 'email', key: 'email' },
    { title: 'Celular', dataIndex: 'phone', key: 'phone' },
    { title: 'Imagen', dataIndex: 'image', key: 'image' },
    { title: 'Dirección', dataIndex: 'address', key: 'address' },
  ], [])

  return (
    <div style={{marginLeft: "1.5%", marginRight: "1.5%", marginTop: "3%"}}>
      <HeaderView  
        title="Empresas"
        path="/sucursales/registrar"
      />      
      <Table 
        url="branchOffice/paginatedListByUserAdmin"
        columns={columns}
        placeholderSearch="Buscar por nombre ó correo..."
        pathEdit="/sucursales/editar"
        urlDisabled="branchOffice/disable"
      />
    </div>
  )
}

export default Companys;