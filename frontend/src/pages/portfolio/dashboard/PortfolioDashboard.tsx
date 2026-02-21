import TopRightAdminButtons from "./TopRightAdminButtons";
import DashboardCards from "components/card/DashboardCards";
import AdminChartLayout from "./PortfolioChartLayout";
import PageTitle from "components/pageTitle/PageTitle";

const PortfolioDashboard = ({
	portfolioData,
	data,
}: {
	portfolioData: {
		asset_aggregate: { [key: string]: any };
		[key: string]: any;
	};
	data: any;
}) => {
	const items = [
		{
			key: 1,
			title: "Realized PNL",
			body: portfolioData.realized_pnl,
		},
		{
			key: 2,
			title: "Unrealized PNL",
			body: portfolioData.unrealized_pnl,
		},
		{
			key: 3,
			title: "Net PNL",
			body: portfolioData.net_pnl,
		},
	];

	return (
		<>
			<PageTitle>
				<h2>Portfolio Dashboard</h2>
				<TopRightAdminButtons />
			</PageTitle>
			<DashboardCards sm={6} xl={4} xxl={4} className="mb-4" items={items} />

			<AdminChartLayout
				data={data}
				barData={{
					positions: portfolioData.positions,
					average_cost: portfolioData.average_cost,
					net_pnl: portfolioData.net_pnl,
				}}
				doughnutData={{
					realized_pnl: portfolioData.realized_pnl,
					unrealized_pnl: portfolioData.unrealized_pnl,
				}}
			/>
		</>
	);
};

export default PortfolioDashboard;
