import { useEffect, useMemo, useState } from 'react';
import { Empty, Table as TableAnt } from 'antd';
import { ColumnsType } from 'antd/es/table';
import SearchTable from '../searchTable';
import TableActionsButtons from "./tableActionsButtons";
import { PropsUseCollection } from "../../hooks/useCollection";
import useCollection from "../../hooks/useCollection"
import { getDocById, update } from "../../services/firebase";
import { DocumentData, DocumentSnapshot, QueryConstraint, endAt, orderBy, startAfter, startAt } from "firebase/firestore";

interface Props<T> extends PropsUseCollection {
	columns: ColumnsType<T>;
	wait?: boolean;
	placeholderSearch?: string;
	pathEdit?: string;
	formatDate?: string;
	searchValues: Record<string, string>;
	removeTableActions?: boolean;
}

interface TableData {
	search: string;
	searchKey: string;
	lastDoc?: DocumentSnapshot<DocumentData, DocumentData>;
	collection: string;
}

const { PRESENTED_IMAGE_SIMPLE } = Empty;

const Table = <T extends {}>({ columns: columnsProp, wait, placeholderSearch, pathEdit, collection, query: queryProp, formatDate, mergeResponse = true, searchValues, removeTableActions }: Props<T>) => {
	const [tableData, setTableData] = useState<TableData>({ search: "", searchKey: "", collection });

	const query = useMemo<QueryConstraint[]>(() => {
		const { search, searchKey, lastDoc } = tableData;
		const _query = [...queryProp];

		if (lastDoc) {
			_query.push(startAfter(lastDoc));
		}

		if (search) {
			const indexOrderBy = _query.findIndex(q => q.type === "orderBy");

			if (indexOrderBy >= 0) {
				_query.splice(indexOrderBy, 1);
			}

			_query.push(...[orderBy(searchKey), startAt(search), endAt(search + '\uf8ff')]);
		}

		return _query;
	}, [tableData, queryProp]);

	const { loading, data } = useCollection<T & { id: string }>({ wait, query, collection: tableData.collection, formatDate, mergeResponse });

	useEffect(() => {
		if (loading) return;

		const tableBody = document.querySelector('.ant-table-body');

		tableBody?.addEventListener('scroll', async () => {
			const isBottom = tableBody.scrollTop + tableBody.clientHeight >= tableBody.scrollHeight;

			if (!isBottom) return;

			const elementsWithAttribute = tableBody.querySelectorAll('[data-row-key]');
			const lastElement = elementsWithAttribute[elementsWithAttribute.length - 1] as Element | undefined;

			if (!lastElement) return;

			const lastId = lastElement.getAttribute('data-row-key');

			const doc = await getDocById(collection, lastId!);

			setTableData(prev => ({ ...prev, lastDoc: doc }));
		});

		return () => {
			tableBody?.removeEventListener('scroll', () => { });
		};
	}, [collection, loading]);

	const columns = useMemo<ColumnsType<T>>(() => {
		if (removeTableActions) return columnsProp.map(c => ({ ...c, width: c.width || 150 }));

		return [
			...columnsProp.map(c => ({ ...c, width: c.width || 150 })),
			{
				title: 'Acciones',
				key: 'actions',
				fixed: 'right',
				width: 100,
				render: (_, record: T) => {
					const r = record as T & { id: string };
					return (
						<TableActionsButtons
							record={record}
							onDeleted={() => {
								setTableData(prev => ({ ...prev, lastDoc: undefined, collection: "" }))
								setTimeout(() => {
									setTableData(prev => ({ ...prev, collection }))
								}, 200)
							}}
							fun={() => update(collection, r.id, { disabled: true })}
							pathEdit={pathEdit}
						/>
					)
				},
			}
		];
	}, [columnsProp, pathEdit, collection, removeTableActions]);

	return (
		<div>
			<SearchTable
				onSearch={(search, searchKey) => {
					setTableData(prev => ({ ...prev, lastDoc: undefined, collection: "" }));
					setTimeout(() => {
						setTableData(prev => ({ ...prev, search, searchKey, collection }));
					}, 200)
				}}
				placeholder={placeholderSearch}
				searchValues={searchValues}
			/>
			<br />
			<TableAnt
				sticky
				scroll={{ x: 400, y: "75vh", scrollToFirstRowOnChange: false }}
				columns={columns}
				dataSource={data}
				loading={loading}
				locale={{ emptyText: <Empty image={PRESENTED_IMAGE_SIMPLE} description='Sin registros.' /> }}
				rowKey="id"
				pagination={false}
			/>
		</div>
	)
}

export default Table;