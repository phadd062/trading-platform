import { useReducer } from "react";
import { Routes, Route } from "react-router-dom";
import { useHttpClient } from "store/httpClientContext/HttpClientContext";
import FetchPortfolioSearch from "pages/portfolio/search/FetchPortfolioSearch";
import { reducer, reducerInitial } from "pages/portfolio/search/reducer";
import FetchPortfolioDashboard from "pages/portfolio/dashboard/FetchPortfolioDashboard";

export type FormValues = {
	symbol: string;
	strategy: string;
	quantity: number;
	side: string;
	order_type: string;
	order_id: string;
	intent_id: string;
};

const PortfolioRoute = () => {
	const [searchState, searchDispatch] = useReducer(reducer, reducerInitial);
	const client = useHttpClient();

	return (
		<Routes>
			<Route path="dashboard/" element={<FetchPortfolioDashboard />} />
			<Route
				path="search/"
				element={
					<FetchPortfolioSearch
						searchState={searchState}
						searchDispatch={searchDispatch}
					/>
				}
			/>
		</Routes>
	);
};

export default PortfolioRoute;
