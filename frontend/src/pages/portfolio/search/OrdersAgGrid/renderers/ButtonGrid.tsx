import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";

const ButtonGrid = ({ data }: { data: any }) => {
	const navigate = useNavigate();
	const [disabledButtons, setDisabledButtons] = useState(true);
	const viewOrderHandler = () => navigate("../dashboard");

	useEffect(() => {
		if (data) setDisabledButtons(false);
	}, [data]);

	return (
		<>
			{!disabledButtons && (
				<>
					<Button
						variant="outline-secondary"
						size="sm"
						onClick={viewOrderHandler}
						className="shadow-none"
					>
						View Order
					</Button>
				</>
			)}
			{disabledButtons && ""}
		</>
	);
};

export default ButtonGrid;
