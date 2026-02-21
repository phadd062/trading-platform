import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Accordion from "react-bootstrap/Accordion";
import SimpleSearch from "./SimpleSearch";

const EVENTKEYONE = "0";

const AccordionSearch = ({
	searchState,
	searchDispatch,
}: {
	searchState: any;
	searchDispatch: (action: any) => any;
}) => {
	return (
		<Row>
			<Col>
				<Accordion defaultActiveKey={EVENTKEYONE}>
					<Accordion.Item eventKey={EVENTKEYONE}>
						<Accordion.Header>Search Building</Accordion.Header>
						<Accordion.Body>
							<SimpleSearch
								searchState={searchState}
								searchDispatch={searchDispatch}
							/>
						</Accordion.Body>
					</Accordion.Item>
				</Accordion>
			</Col>
		</Row>
	);
};

export default AccordionSearch;
