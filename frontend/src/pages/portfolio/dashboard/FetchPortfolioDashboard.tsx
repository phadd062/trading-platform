import Loading from "components/loading/Loading";
import PortfolioDashboard from "./PortfolioDashboard";
import { useHttpClient } from "store/httpClientContext/HttpClientContext";
import { useQuery } from "@tanstack/react-query";

const FetchPortfolioDashboard = () => {
	const client = useHttpClient();

	const { data, isLoading } = useQuery({
		queryKey: ["portfolioDashboard"],
		queryFn: async () => client.queryFetch("/api/portfolio/all-strategies"),
	});

	return (
		<>
			{isLoading && <Loading />}
			{!isLoading && (
				<PortfolioDashboard portfolioData={data.momentum} data={data} />
			)}
		</>
	);
};

export default FetchPortfolioDashboard;
