import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "chart.js/auto";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import HttpClientProvider from "./store/httpClientContext/HttpClientProvider";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<BrowserRouter>
			<HttpClientProvider>
				<QueryClientProvider client={queryClient}>
					<App />
					<ReactQueryDevtools />
				</QueryClientProvider>
			</HttpClientProvider>
		</BrowserRouter>
	</StrictMode>,
);
