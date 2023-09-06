import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Empty, Table as TableAnt } from 'antd';
import { ColumnsType } from 'antd/es/table';
import SearchTable from '../searchTable';
import TableActionsButtons from "./tableActionsButtons";
import { PropsUseCollection } from "../../hooks/useCollection";
import useCollection from "../../hooks/useCollection"
import { getDocById, update } from "../../services/firebase";
import { DocumentData, DocumentSnapshot, QueryConstraint, endAt, orderBy, startAfter, startAt, where } from "firebase/firestore";
import { PDFDownloadLink, Document, Page, Image, StyleSheet } from '@react-pdf/renderer';
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { Ticket } from "../../interfaces";
import { post } from './../../services/index';
import useAbortController from "./../../hooks/useAbortController";
import { useLocation } from 'react-router-dom';
import dayjs, { Dayjs } from "dayjs";
import { ExpandableConfig } from "antd/lib/table/interface";
import { useAuth } from "./../../context/authContext";

export interface Option {
	key: string;
	label: string;
}

export interface OptiosSearchValues {
	propSearch: string;
	options: Option[];
}

export interface PropsTable<T> extends PropsUseCollection {
	header?: ReactNode;
	columns: ColumnsType<T>;
	wait?: boolean;
	placeholderSearch?: string;
	pathEdit?: string;
	formatDate?: string;
	searchValues: Record<string, string>;
	removeTableActions?: boolean;
	downloadPdf?: boolean;
	imageEventUrl?: string;
	onLoadData?: (data: T[]) => void;
	optiosSearchValues?: OptiosSearchValues[];
	expandable?: ExpandableConfig<any>;
	scrollY?: string;
}

interface TableData {
	search: string | Dayjs[];
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

const Table = <T extends {}>({
	columns: columnsProp,
	wait, placeholderSearch,
	pathEdit,
	collection,
	query: queryProp,
	formatDate,
	mergeResponse = true,
	searchValues,
	removeTableActions,
	downloadPdf,
	imageEventUrl,
	onLoadData,
	optiosSearchValues,
	expandable,
	scrollY
}: PropsTable<T>) => {
	const location = useLocation();
	const path = location;
	const abortController = useAbortController();
	const [tableData, setTableData] = useState<TableData>({ search: "", searchKey: "", collection });
	const query = useMemo<QueryConstraint[]>(() => {
		const { search, searchKey, lastDoc } = tableData;
		const _query = [...queryProp];

		if (search && typeof search === "string") {
			const indexOrderBy = _query.findIndex(q => q.type === "orderBy");

			if (indexOrderBy >= 0) {
				_query.splice(indexOrderBy, 1);
			}

			_query.push(...[orderBy(searchKey), startAt(search), endAt(search + '\uf8ff')]);
		}

		if (search && Array.isArray(search)) {
			const indexOrderBy = _query.findIndex(q => q.type === "orderBy");

			if (indexOrderBy >= 0) {
				_query.splice(indexOrderBy, 1);
			}

			const _search = search as Dayjs[];

			_query.push(...[orderBy(searchKey, "desc"), where(searchKey, ">=", _search[0].toDate()), where(searchKey, "<=", _search[1].toDate())])
		}

		if (lastDoc) {
			_query.push(startAfter(lastDoc));
		}

		return _query;
	}, [tableData, queryProp]);
	const { loading, data, setData } = useCollection<T & { id: string }>({ wait, query, collection: tableData.collection, formatDate, mergeResponse });
	const { user } = useAuth();

	const deleteUser = useCallback((r: T & { id: string; }) => post(`/users/del`, r, abortController.current!), [abortController]);

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

	useEffect(() => {
		onLoadData && onLoadData(data);
	}, [data, onLoadData])

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
									}, 1000);
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

		if (removeTableActions || ["Administrador", "Embajador", "Lector"].includes(user?.displayName!)) return columnsProp.map(c => ({ ...c, width: c.width || 150 }));

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
							fun={() => path.pathname === "/usuarios" ? deleteUser(r) : update(collection, r.id, { disabled: true })}
							pathEdit={pathEdit}
						/>
					)
				},
			}
		];
	}, [columnsProp, pathEdit, collection, removeTableActions, downloadPdf, imageEventUrl, setData, path, deleteUser, user?.displayName]);

	return (
		<div>
			<SearchTable
				onSearch={(search, searchKey) => {

					setTableData(prev => ({ ...prev, lastDoc: undefined, collection: "" }));

					if (searchKey === "dateScanned") {
						let _search: any = search;
						_search[0] = dayjs(search[0]).hour(0).minute(0).second(0);
						_search[1] = dayjs(search[1]).hour(23).minute(59).second(0);
						setTimeout(() => {
							setTableData(prev => ({ ...prev, _search, searchKey, collection }));
						}, 200)
					} else {
						setTimeout(() => {
							setTableData(prev => ({ ...prev, search, searchKey, collection }));
						}, 200)
					}
				}}
				placeholder={placeholderSearch}
				searchValues={searchValues}
				optiosSearchValues={optiosSearchValues}
			/>
			<br />
			<TableAnt
				sticky
				scroll={{ x: 400, y: scrollY || "75vh", scrollToFirstRowOnChange: false }}
				columns={columns}
				dataSource={data}
				loading={loading}
				locale={{ emptyText: <Empty image={PRESENTED_IMAGE_SIMPLE} description='Sin registros.' /> }}
				rowKey="id"
				pagination={false}
				expandable={expandable}
			/>
		</div>
	)
}

export default Table;