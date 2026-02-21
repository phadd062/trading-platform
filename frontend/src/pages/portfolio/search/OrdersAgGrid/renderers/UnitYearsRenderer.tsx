import Badge from "react-bootstrap/Badge";

const UnitYearsRenderer = ({ value }: { value: number }) => {
	if (!value) return <></>;
	return (
		<>
			<span>{value}</span> <Badge bg="secondary">Years</Badge>
		</>
	);
};

export default UnitYearsRenderer;
