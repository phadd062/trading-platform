import { Link } from "react-router-dom";
import { useMainContext } from "store/mainContext/MainContext";

const TopRightSearchButtons = () => {
	return (
		<div className="btn-toolbar mb-2 mb-md-0">
			<div className="btn-group me-2">
				<Link to="../create/" className="btn btn-outline-primary">
					Add Building
				</Link>
			</div>
		</div>
	);
};

export default TopRightSearchButtons;
