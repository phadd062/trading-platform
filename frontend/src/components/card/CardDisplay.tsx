import Card from "react-bootstrap/Card";

const CardDisplay = ({
	title,
	body,
	icon,
}: {
	title: string;
	body: string;
	icon?: any;
}) => {
	return (
		<Card>
			<Card.Body>
				<div className="row no-gutters align-items-center">
					<div className="col mr-2">
						<div className="text-xs font-weight-bold text-uppercase mb-1">
							{title}
						</div>
						<div className="h5 mb-0 font-weight-bold text-gray-800">{body}</div>
					</div>
					{icon && <div className="col-auto">{icon}</div>}
				</div>
			</Card.Body>
		</Card>
	);
};

export default CardDisplay;
