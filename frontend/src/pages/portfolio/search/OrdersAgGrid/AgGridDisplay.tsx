import React from "react";
import { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import LoadingRenderer from "components/loading/LoadingRenderer";
import ButtonGrid from "./renderers/ButtonGrid";
import UnitYearsRenderer from "./renderers/UnitYearsRenderer";
import { GridReadyEvent } from "ag-grid-community";

const AgGridDisplay = ({
	setGrid,
}: {
	setGrid: (params: GridReadyEvent) => void;
}) => {
	const ENGLISHACTIONS = 200;
	const defaultColDef = useMemo(() => {
		return {
			resizable: true,
			sortable: false,
		};
	}, []);

	const onGridReady = (params: GridReadyEvent) => setGrid(params);

	const OrdersColumns = useMemo(() => {
		return [
			{
				headerName: "",
				maxWidth: 70,
				valueGetter: "node.id",
				cellRenderer: LoadingRenderer,
				pinned: "left",
			},
			{
				headerName: "Symbol",
				field: "symbol",
				width: 100,
			},
			{
				headerName: "Strategy",
				field: "strategy_id",
				width: 200,
			},
			{
				headerName: "Quantity",
				field: "quantity",
				width: 100,
			},
			{
				headerName: "Side",
				field: "side",
				width: 100,
			},
			{
				headerName: "Order Type",
				field: "order_type",
				width: 150,
			},
			{
				headerName: "Order ID",
				field: "order_id",
				width: 350,
			},
			{
				headerName: "Intent ID",
				field: "intent_id",
				width: 350,
			},
			{
				headerName: "actions",
				field: "id",
				cellRenderer: ButtonGrid,
				width: ENGLISHACTIONS,
			},
		];
	}, [ENGLISHACTIONS]);

	const [columnDefs, setColumnDefs] =
		useState<{ [key: string]: any }[]>(OrdersColumns);

	useEffect(() => {
		const objIndex = OrdersColumns.findIndex((item) => item.field === "id");
		OrdersColumns[objIndex].width = ENGLISHACTIONS;
		setColumnDefs(OrdersColumns);
	}, [OrdersColumns]);

	return (
		<AgGridReact
			defaultColDef={defaultColDef}
			columnDefs={columnDefs}
			rowSelection="multiple"
			rowModelType="infinite"
			pagination={true}
			paginationPageSize={100}
			cacheBlockSize={500}
			cacheOverflowSize={2}
			maxConcurrentDatasourceRequests={2}
			infiniteInitialRowCount={1000}
			maxBlocksInCache={20}
			onGridReady={onGridReady}
			enableCellTextSelection={true}
			paginationPageSizeSelector={[20, 50, 100, 200, 500]}
		/>
	);
};

export default AgGridDisplay;
