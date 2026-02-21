import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import AgGridDisplay from "./AgGridDisplay";
import { GridReadyEvent } from "ag-grid-community";

const OrdersAgGrid = ({
	setGrid,
}: {
	setGrid: (params: GridReadyEvent) => void;
}) => {
	return (
		<Row>
			<Col className="mb-4">
				<div id="myGrid" style={{ height: "65vh" }} className="ag-theme-alpine">
					<AgGridDisplay setGrid={setGrid} />
				</div>
			</Col>
		</Row>
	);
};

export default OrdersAgGrid;
