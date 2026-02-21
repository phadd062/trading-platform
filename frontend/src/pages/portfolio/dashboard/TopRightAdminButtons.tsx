import { Link } from "react-router-dom";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartArea } from "@fortawesome/free-solid-svg-icons";

const TopRightAdminButtons = () => {
	const buttonClass = "btn btn-sm btn-outline-secondary";
	return (
		<div className="btn-toolbar mb-2 mb-md-0">
			<ButtonGroup className="mb-1 d-none d-lg-inline-flex">
				<Link to="../analytics/" className={buttonClass}>
					<FontAwesomeIcon icon={faChartArea} /> Momentum
				</Link>
				<Link to="../analytics/" className={buttonClass}>
					<FontAwesomeIcon icon={faChartArea} /> RSI
				</Link>
			</ButtonGroup>
		</div>
	);
};

export default TopRightAdminButtons;
