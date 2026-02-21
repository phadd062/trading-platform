import { Routes, Route, Navigate } from "react-router-dom";
import MustBeAuthenticated from "./components/helper/MustBeAuthenticated";
import LoadingProvider from "./store/loadingContext/LoadingProvider";
import MainProvider from "./store/mainContext/MainProvider";
import Login from "./pages/login/Login";
import RoutesComponent from "./components/routes/root/RoutesComponent";

const App = () => {
	return (
		<Routes>
			<Route
				path="/"
				element={
					<MustBeAuthenticated>
						<Navigate to="instructions/glossary" />
					</MustBeAuthenticated>
				}
			/>
			<Route path="login" element={<Login />} />
			<Route
				path="*"
				element={
					<MustBeAuthenticated>
						<LoadingProvider>
							<MainProvider>
								<RoutesComponent />
							</MainProvider>
						</LoadingProvider>
					</MustBeAuthenticated>
				}
			/>
		</Routes>
	);
};

export default App;
