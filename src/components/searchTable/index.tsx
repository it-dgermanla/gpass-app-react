import { FC, useState } from 'react';
import { Col, Input, Row, Select } from 'antd';

interface Props {
  onSearch: (search: string, keySearch: string) => void;
  placeholder?: string;
  searchValues: Record<string, string>;
}

const { Search } = Input;

const SearchTable: FC<Props> = ({ onSearch, placeholder, searchValues }) => {
  const [keySearch, setKeySearch] = useState<string>(Object.keys(searchValues)[0]);

  return (
    <Row gutter={10}>
      <Col xs={24} md={4}>
        <Select
          style={{ width: '100%' }}
          value={keySearch}
          onChange={(value) => setKeySearch(value)}
        >
          {Object.keys(searchValues).map((key) => (
            <Select.Option key={key} value={key}>
              {searchValues[key]}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col md={20}>
        <Search
          enterButton
          onSearch={(value) => onSearch(value, keySearch)}
          placeholder={placeholder}
          style={{ width: '100%' }}
        />
      </Col>
    </Row>
  )
}

export default SearchTable