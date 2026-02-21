import { useEffect, useState, useCallback } from "react";
import { useHttpClient } from "store/httpClientContext/HttpClientContext";
import PageTitle from "components/pageTitle/PageTitle";
import TopRightSearchButtons from "./TopRightSearchButtons";
import AccordionSearch from "./accordionSearch/AccordionSearch";
import OrdersAgGrid from "./OrdersAgGrid/OrdersAgGrid";
import FunctionalButtons from "./functionalButtons/FunctionalButtons";
import { ACTIONS } from "./reducer";
import { GridReadyEvent, IGetRowsParams } from "ag-grid-community";
import { rowOption } from "utils/helpers";
import { useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";

const FetchPortfolioSearch = ({
	searchState,
	searchDispatch,
}: {
	searchState: any;
	searchDispatch: any;
}) => {
	const client = useHttpClient();
	const [searchDisable, setSearchDisable] = useState(true);
	const [grid, setGrid] = useState<GridReadyEvent | null>(null);

	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();
	const [portfolio, setPortfolio] = useState<any>(null);

	const dataSource = () => {
		return {
			rowCount: undefined,
			getRows: async (params: IGetRowsParams) => {
				const { data } = await client.get(
					`${searchState.fetchUrl}${location.search}${rowOption(
						location.search,
					)}start=${params.startRow}&end=${params.endRow}`,
				);
				if (data) params.successCallback(data, data.length);
			},
		};
	};

	const resetGridHandler = useCallback(() => {
		if (grid) grid.api.setGridOption("datasource", dataSource());
	}, [grid, client, location]);

	useEffect(() => {
		if (grid) {
			grid.api.setRowCount(0, false);
			resetGridHandler();
		}
	}, [grid, resetGridHandler, searchState.fetchUrl]);

	useEffect(() => {
		const fetchPortfolio = async () => {
			const { data } = await client.get("/api/portfolio/momentum");
			setPortfolio(data);
		};
		fetchPortfolio();
	}, [client, setPortfolio]);

	const clearFiltersHandler = useCallback(() => {
		setSearchParams({});
		searchDispatch({ type: ACTIONS.RESETINITIAL });
	}, [searchDispatch]);

	return (
		<>
			<PageTitle>
				<h2>Portfolio Orders</h2>
			</PageTitle>

			<AccordionSearch
				searchState={searchState}
				searchDispatch={searchDispatch}
			/>

			<FunctionalButtons
				clearFiltersHandler={clearFiltersHandler}
				searchDisable={searchDisable}
			/>

			<OrdersAgGrid setGrid={setGrid} />
		</>
	);
};

export default FetchPortfolioSearch;
