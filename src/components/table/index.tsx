import { useEffect, useMemo, useState } from 'react';
import { Empty, Table as TableAnt } from 'antd';
import { ColumnsType } from 'antd/es/table';
import SearchTable from '../searchTable';
import TableActionsButtons from "./tableActionsButtons";
import { PropsUseCollection } from "../../hooks/useCollection";
import useCollection from "../../hooks/useCollection"
import { getDocById, update } from "../../services/firebase";
import { DocumentData, DocumentSnapshot, QueryConstraint, endAt, orderBy, startAfter, startAt } from "firebase/firestore";
import { PDFDownloadLink, Document, Page, Image, StyleSheet } from '@react-pdf/renderer';
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { Ticket } from "../../interfaces";
import { post } from './../../services/index';
import useAbortController from "./../../hooks/useAbortController";
import { useLocation } from 'react-router-dom';

interface Props<T> extends PropsUseCollection {
	columns: ColumnsType<T>;
	wait?: boolean;
	placeholderSearch?: string;
	pathEdit?: string;
	formatDate?: string;
	searchValues: Record<string, string>;
	removeTableActions?: boolean;
	downloadPdf?: boolean;
	imageEventUrl?: string;
}

interface TableData {
	search: string;
	searchKey: string;
	lastDoc?: DocumentSnapshot<DocumentData, DocumentData>;
	collection: string;
}

const { PRESENTED_IMAGE_SIMPLE } = Empty;

const stylesPDF = StyleSheet.create({
	page: {
		flexDirection: 'column',
		backgroundColor: '#FFFFFF',
		position: 'relative',
	},
	backgroundImage: {
		position: 'absolute',
		width: '100%',
		height: '100%',
	},
	qrImage: {
		position: 'absolute',
		top: '45%',
		left: '48%',
		transform: 'translate(-50%, -50%)',
		width: 120, // Ajusta el tamaño del código QR según tus necesidades
		height: 120,
	},
});



const Table = <T extends {}>({ columns: columnsProp, wait, placeholderSearch, pathEdit, collection, query: queryProp, formatDate, mergeResponse = true, searchValues, removeTableActions, downloadPdf, imageEventUrl }: Props<T>) => {
	const location = useLocation();
	const path = location;
	const abortController = useAbortController();
	const [tableData, setTableData] = useState<TableData>({ search: "", searchKey: "", collection });

	const onDelete = async (r: any) => {
		await post(`/users/del`, r, abortController.current!);
	}

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

	const { loading, data, setData } = useCollection<T & { id: string }>({ wait, query, collection: tableData.collection, formatDate, mergeResponse });

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
		if (downloadPdf) {
			columnsProp.push({
				title: "Descargar QR",
				dataIndex: "downlaodQr",
				key: "downlaodQr",
				render: (_, ticket) => {
					const t = ticket as any as Ticket & { ticketUrl: string };

					return (
						<>
							<Button
								icon={<DownloadOutlined style={{ color: t.isDownloaded ? '#ffffff' : "" }} />}
								style={{ backgroundColor: t.isDownloaded ? '#34d960' : "" }}
								onClick={async () => {
									const elementPDFDownloadLink = document.getElementsByClassName(`ticket-${t.number}`)[0] as HTMLAnchorElement;
									const canvas = document.getElementById(t.number.toString()) as HTMLCanvasElement;
									const newWidth = 400;
									const newHeight = 400;
									const resizedCanvas = document.createElement("canvas");

									resizedCanvas.width = newWidth;
									resizedCanvas.height = newHeight;

									const ctx = resizedCanvas.getContext("2d");

									ctx?.drawImage(canvas, 0, 0, newWidth, newHeight);

									const ticketUrl = resizedCanvas.toDataURL("image/octet-stream");

									setData(prev => prev.map(_ticket => _ticket.id === t.id ? ({ ..._ticket, ticketUrl }) as any as Ticket & { ticketUrl: string } : _ticket) as (T & { id: string; })[]);
									
									if (!t.isDownloaded) {
										await update("Tickets", t.id as string, { ...t, isDownloaded: true })
										setData(prev => prev.map(_ticket => _ticket.id === t.id ? ({ ..._ticket, isDownloaded: true }) as any as Ticket & { ticketUrl: string } : _ticket) as (T & { id: string; })[]);
									
									}

									setTimeout(() => {
										elementPDFDownloadLink.click();
									}, 200);
								}}
							/>
							<PDFDownloadLink
								style={{ display: "none" }}
								className={`ticket-${t.number}`}
								fileName={`Ticket-${t.number}`}
								document={<Document>
									<Page size={{ width: 440, height: 800 }} style={stylesPDF.page}>
										<Image src={imageEventUrl} style={stylesPDF.backgroundImage} />
										{
											t.ticketUrl && t.ticketUrl !== "" &&
											<Image
												src={t.ticketUrl}
												style={stylesPDF.qrImage}
											/>
										}
									</Page>
								</Document>
								}
							/>
						</>
					)
				}
			})
		}

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
							fun={() => path.pathname === "/usuarios" ? onDelete(r) : update(collection, r.id, { disabled: true })}
							pathEdit={pathEdit}
						/>
					)
				},
			}
		];
	}, [columnsProp, pathEdit, collection, removeTableActions, downloadPdf, imageEventUrl, setData, path]);

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