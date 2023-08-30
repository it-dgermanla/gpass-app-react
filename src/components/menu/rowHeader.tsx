import { FC } from 'react';
import { Row } from 'antd';
import { useAuth } from '../../context/authContext';
import { Grid } from 'antd';
import logo from '../../assets/logo.png';

interface Props {
  collapsed?: boolean;
}

const { useBreakpoint } = Grid;

const RowHeader: FC<Props> = ({ collapsed }) => {
  const { user } = useAuth();
  const screens = useBreakpoint();

  return (
    <Row
      justify="center"
      style={
        screens.xs ?
          { textAlign: "center" } :
          { textAlign: "center", backgroundColor: "#304878", margin: 10, paddingTop: 20, paddingBottom: 20, borderRadius: "8px" }
      }
    >
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1em' }}>
        <img src={logo} alt="Logo" style={{ width: '50%', height: 'auto' }} />
      </div>
      {
        !collapsed && <div style={screens.xs ? { color: "black" } : { color: "white" }}>
          <div style={{ margin: 10 }}>
            <b>{user?.email}</b>
          </div>
          <div>
            {user?.displayName}
          </div>
        </div>
      }
    </Row>
  )
}

export default RowHeader;
