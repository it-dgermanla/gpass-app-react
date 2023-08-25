import { useEffect, useMemo, useState } from 'react';
import { Empty, Table as TableAnt } from 'antd';
import { ColumnsType } from 'antd/es/table';
import SearchTable from '../searchTable';
import TableActionsButtons from "./tableActionsButtons";
import { PropsUseCollection } from "../../hooks/useCollection";
import useCollection from "../../hooks/useCollection"
import { getDocById, update } from "../../services/firebase";
import { DocumentData, DocumentSnapshot, QueryConstraint, limit, startAfter } from "firebase/firestore";

interface Props<T> extends PropsUseCollection {
	columns: ColumnsType<T>;
	wait?: boolean;
	placeholderSearch?: string;
	pathEdit: string;
	formatDate?: string;
}

interface TableData {
	search: string;
	lastDoc?: DocumentSnapshot<DocumentData, DocumentData>;
	collection: string;
}

const { PRESENTED_IMAGE_SIMPLE } = Empty;

const Table = <T extends {}>({ columns: columnsProp, wait, placeholderSearch, pathEdit, collection, query: queryProp, formatDate, mergeResponse = true }: Props<T>) => {
	const [tableActions, setTableActions] = useState<TableData>({ search: "", collection });

	const query = useMemo<QueryConstraint[]>(() => {
		const _query = [...queryProp];

		if (tableActions.lastDoc) {
			_query.push(startAfter(tableActions.lastDoc))
		}

		_query.push(limit(10))

		return _query;
	}, [tableActions, queryProp]);

	const { loading, data } = useCollection<T & { id: string }>({ wait, query, collection: tableActions.collection, formatDate, mergeResponse });
	//esto se tiene que hacer asi para no ciclar el efecto usando de dependencia el data.
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

			setTableActions(prev => ({ ...prev, lastDoc: doc }));
		});

		return () => {
			tableBody?.removeEventListener('scroll', () => { });
		};
	}, [collection, loading]);

	const columns = useMemo<ColumnsType<T>>(() => {
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
								setTableActions(prev => ({ ...prev, lastDoc: undefined, collection: "" }))

								setTimeout(() => {
									setTableActions(prev => ({ ...prev, collection: "Events" }))
								}, 200)
							}}
							fun={() => update(collection, r.id, { disabled: true })}
							pathEdit={pathEdit}
						/>
					)
				},
			}
		];
	}, [columnsProp, pathEdit, collection]);

	return (
		<div>
			<SearchTable
				onSearch={(value) => setTableActions(prev => ({ ...prev, search: value, lastDoc: undefined }))}
				placeholder={placeholderSearch}
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