import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faDownload,
	faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useHttpClient } from "store/httpClientContext/HttpClientContext";

const FunctionalButtons = ({
	clearFiltersHandler,
	searchDisable,
}: {
	clearFiltersHandler: any;
	searchDisable: boolean;
}) => {
	const client = useHttpClient();
	const [buildingColumns, setBuildingColumns] = useState<string[]>([]);

	const [showModal, setShowModal] = useState(false);

	const handleShowModal = () => setShowModal(true);
	const handleCloseModal = () => setShowModal(false);

	return (
		<>
			<Row className="mb-3 mt-3">
				<Col xs={8} sm={9} lg={10} xxl={11}>
					<ButtonGroup>
						<Button
							onClick={clearFiltersHandler}
							size="sm"
							variant="outline-danger"
							disabled={searchDisable}
						>
							<FontAwesomeIcon icon={faClockRotateLeft} /> Clear Filters
						</Button>
					</ButtonGroup>
				</Col>
			</Row>
		</>
	);
};

export default FunctionalButtons;
