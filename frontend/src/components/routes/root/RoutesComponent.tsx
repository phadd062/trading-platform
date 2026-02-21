import { Routes, Route } from "react-router-dom";
import { useLoadingContext } from "store/loadingContext/LoadingContext";
import PortfolioRoute from "../portfolio/PortfolioRoute";
import LoadingGlobal from "components/loading/LoadingGlobal";
import InstructionRoute from "../instruction/InstructionRoute";
import {
	AllCommunityModule,
	ModuleRegistry,
	provideGlobalGridOptions,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import Sidebar from "./Sidebar";

const RoutesComponent = () => {
	const { isLoadingGlobal, isHeaderSidebarHidden } = useLoadingContext();
	ModuleRegistry.registerModules([AllCommunityModule]);
	provideGlobalGridOptions({ theme: "legacy" });

	return (
		<>
			{isLoadingGlobal && <LoadingGlobal size={200} />}
			{!isLoadingGlobal && (
				<div className="wrapper">
					{!isHeaderSidebarHidden && <Sidebar />}
					<div className="main ps-3 pe-3">
						{!isLoadingGlobal && (
							<main className={""}>
								<Routes>
									<Route path="portfolio/*" element={<PortfolioRoute />} />
									<Route path="instructions/*" element={<InstructionRoute />} />
								</Routes>
							</main>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default RoutesComponent;
