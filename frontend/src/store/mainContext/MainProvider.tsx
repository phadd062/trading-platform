import { ReactNode, useEffect, useReducer } from "react";
import { useHttpClient } from "store/httpClientContext/HttpClientContext";
import { useLoadingContext } from "store/loadingContext/LoadingContext";
import MainContext from "./MainContext";
import { ACTIONS, reducer, reducerInitial } from "./reducer";

const MainProvider = ({ children }: { children: ReactNode }) => {
	const client = useHttpClient();
	const { setIsLoadingGlobalSpecific } = useLoadingContext();
	const [mainState, dispatchMainState] = useReducer(reducer, reducerInitial);

	useEffect(() => {
		if (mainState.user && mainState.user.user_group) {
			dispatchMainState({
				type: ACTIONS.GROUP,
				payload: { group: mainState.user.user_group },
			});
		}
	}, [mainState.user]);

	useEffect(() => {
		const runFunc = async () => {
			if (mainState.tm) return;
			const { data, clientError } = await client.get("/api/context");
			if (clientError) client.navigateToLogin();
			else dispatchMainState({ type: ACTIONS.MAIN, payload: { data: data } });
		};
		runFunc();
	}, [mainState.tm, client]);

	useEffect(() => {
		if (mainState.tm) setIsLoadingGlobalSpecific(false);
	}, [mainState.tm, setIsLoadingGlobalSpecific]);

	const ContextObject = {
		tm: mainState.tm,
		USER: mainState.user,
		USERGROUP: mainState.group,
		color: mainState.color,
		LESSTHAN992: window.innerWidth < 992,
	};

	return (
		<MainContext.Provider value={ContextObject}>
			{children}
		</MainContext.Provider>
	);
};

export default MainProvider;
