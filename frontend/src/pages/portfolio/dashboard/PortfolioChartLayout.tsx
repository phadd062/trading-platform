import { Bar, Doughnut } from "react-chartjs-2";
import Row from "react-bootstrap/Row";
import { useMainContext } from "store/mainContext/MainContext";

const PortfolioChartLayout = ({
	data,
	barData,
	doughnutData,
}: {
	data: any;
	barData: {
		positions: { [key: string]: number };
		average_cost: { [key: string]: number };
		net_pnl: number;
	};
	doughnutData: { realized_pnl: number; unrealized_pnl: number };
}) => {
	const { color } = useMainContext();

	const symbols = Object.keys(barData.positions);
	const positionValues = symbols.map((symbol) => barData.positions[symbol]);
	const avgCostValues = symbols.map((symbol) => barData.average_cost[symbol]);

	const strategies = Object.keys(data);
	const doughnutDataset = strategies.map((strategy) => {
		return {
			data: [
				data[strategy].realized_pnl,
				data[strategy].unrealized_pnl,
				data[strategy].net_pnl,
			],
			backgroundColor: [color.one.rgb, color.five.rgb, color.three.rgb],
		};
	});

	return (
		<Row style={{ height: "50vh" }}>
			<div className="d-none d-lg-block col-lg-4 col-xl-4 mt-md-1 mt-lg-2 mt-xl-4">
				<Doughnut
					data={{
						labels: ["Realized PNL", "Unrealized PNL", "Net PNL"],
						datasets: doughnutDataset,
					}}
					options={{
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							tooltip: {
								callbacks: {
									label: (ctx: any) => {
										const strat = strategies[ctx.datasetIndex];
										const value = ctx.parsed;
										return `${strat}: ${value}`;
									},
								},
							},
						},
					}}
				/>
			</div>
			<div className="d-none d-sm-block col-lg-8 col-xl-4 mt-md-1 mt-lg-2 mt-xl-4">
				<Bar
					data={{
						labels: symbols,
						datasets: [
							{
								label: "Positions",
								data: positionValues,
								backgroundColor: color.one.rgb,
							},
						],
					}}
					options={{
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							title: {
								display: true,
								text: "Positions by Symbol",
							},
							legend: {
								display: false,
							},
						},
					}}
				/>
			</div>
			<div className="d-none d-sm-block col-lg-8 col-xl-4 mt-md-1 mt-lg-2 mt-xl-4">
				<Bar
					data={{
						labels: symbols,
						datasets: [
							{
								label: "Average Cost",
								data: avgCostValues,
								backgroundColor: color.five.rgb,
							},
						],
					}}
					options={{
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							title: {
								display: true,
								text: "Average Cost by Symbol",
							},
							legend: {
								display: false,
							},
						},
					}}
				/>
			</div>
		</Row>
	);
};

export default PortfolioChartLayout;
