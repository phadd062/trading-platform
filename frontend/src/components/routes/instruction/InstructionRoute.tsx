import { Routes, Route } from "react-router-dom";
import Add from "pages/instruction/Add";

const InstructionRoute = () => {
	return (
		<Routes>
			<Route path="add/" element={<Add />} />
		</Routes>
	);
};

export default InstructionRoute;
