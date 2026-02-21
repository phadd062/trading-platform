import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import CardDisplay from "./CardDisplay";

const DashboardCards = ({
	sm,
	xl,
	xxl,
	className,
	items,
}: {
	sm: number;
	xl: number;
	xxl: number;
	className: string;
	items: { key: number; title: string; body: string }[];
}) => {
	return (
		<Row>
			{items.map((item) => {
				return (
					<Col sm={sm} xl={xl} xxl={xxl} className={className} key={item.key}>
						<CardDisplay title={item.title} body={item.body} />
					</Col>
				);
			})}
		</Row>
	);
};

export default DashboardCards;
