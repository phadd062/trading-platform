import { ReactNode } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const CommonLabel = ({ children }: { children: ReactNode }) => {
	return (
		<Row>
			<Col>
				<p className="fs-5">{children}</p>
			</Col>
		</Row>
	);
};

export default CommonLabel;
