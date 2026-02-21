import { ReactNode, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import HttpClientContext from "./HttpClientContext";
import HttpClient from "./HttpClient";

export default function ClientProvider({ children }: { children: ReactNode }) {
	const navigate = useNavigate();
	const client = useMemo(() => new HttpClient(navigate), [navigate]);
	return (
		<HttpClientContext.Provider value={client}>
			{children}
		</HttpClientContext.Provider>
	);
}
