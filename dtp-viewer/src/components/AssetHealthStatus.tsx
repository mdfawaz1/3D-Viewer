import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
	Info,
	CircleChevronRight,
	ClipboardList,
	ClipboardCheck,
	Wrench,
	HeartPulse,
	Cctv,
} from "lucide-react";
import { DropDownButton } from "uxp/components";
// import "./AssetHealthStatus.scss";

interface AssetHealthStatusProps {
	date: string;
	floor: string;
	filter: string; // External filter passed (today, this week, this month, this quarter, this half year, this year)
}

const COLORS = ["#76c893", "#FFD700", "#FF6347", "#d3d3d3"];

const generateMockData = (filter: string) => {
	switch (filter) {
		case "Today":
			return {
				totalAssets: 100,
				healthyAssets: 70,
				maintenanceRequired: 20,
				faultyAssets: 10,
				assetData: [
					{ type: "Healthy Assets", count: 70 },
					{ type: "Maintenance Required", count: 20 },
					{ type: "Faulty Assets", count: 10 },
				],
			};
		case "This Week":
			return {
				totalAssets: 700,
				healthyAssets: 500,
				maintenanceRequired: 150,
				faultyAssets: 50,
				assetData: [
					{ type: "Healthy Assets", count: 500 },
					{ type: "Maintenance Required", count: 150 },
					{ type: "Faulty Assets", count: 50 },
				],
			};
		case "This Month":
			return {
				totalAssets: 3000,
				healthyAssets: 2000,
				maintenanceRequired: 700,
				faultyAssets: 300,
				assetData: [
					{ type: "Healthy Assets", count: 2000 },
					{ type: "Maintenance Required", count: 700 },
					{ type: "Faulty Assets", count: 300 },
				],
			};
		case "This Quarter":
			return {
				totalAssets: 9000,
				healthyAssets: 6000,
				maintenanceRequired: 2000,
				faultyAssets: 1000,
				assetData: [
					{ type: "Healthy Assets", count: 6000 },
					{ type: "Maintenance Required", count: 2000 },
					{ type: "Faulty Assets", count: 1000 },
				],
			};
		case "This Half Year":
			return {
				totalAssets: 18000,
				healthyAssets: 12000,
				maintenanceRequired: 4000,
				faultyAssets: 2000,
				assetData: [
					{ type: "Healthy Assets", count: 12000 },
					{ type: "Maintenance Required", count: 4000 },
					{ type: "Faulty Assets", count: 2000 },
				],
			};
		case "This Year":
			return {
				totalAssets: 36000,
				healthyAssets: 24000,
				maintenanceRequired: 8000,
				faultyAssets: 4000,
				assetData: [
					{ type: "Healthy Assets", count: 24000 },
					{ type: "Maintenance Required", count: 8000 },
					{ type: "Faulty Assets", count: 4000 },
				],
			};
		default:
			return {
				totalAssets: 0,
				healthyAssets: 0,
				maintenanceRequired: 0,
				faultyAssets: 0,
				assetData: [],
			};
	}
};

const AssetHealthStatus: React.FC<AssetHealthStatusProps> = (
	{
		// date,
		// floor,
		// filter,
	}
) => {
	let filter = "This Week"; // Default filter
	const [data, setData] = useState({
		totalAssets: 0,
		healthyAssets: 0,
		maintenanceRequired: 0,
		faultyAssets: 0,
		assetData: [],
	});

	useEffect(() => {
		const mockData = generateMockData(filter);
		setData(mockData);
	}, [filter]);

	const healthyAssetRate = data.totalAssets
		? ((data.healthyAssets / data.totalAssets) * 100).toFixed(1)
		: "0";
	const healthyAssetRateNumber = parseFloat(healthyAssetRate); // Convert to number

	const pieData = data.assetData.map((item) => ({
		name: item.type,
		value: item.count,
	}));

	return (
		<div className="asset-health-status-widget">
			<div className="header">
				<Wrench size={18} />
				<span>Asset Health Status</span>
				<Info size={18} />
			</div>
			<div className="content">
				<div className="location-info">
					<p>Building 1</p>
					<p>Floor 1</p>
				</div>
				<div className="insight-block">
					<div className="insight-section">
						<div className="task-container">
							<div className="task-number">
								<div className="icon-container">
									<Cctv size={18} />
								</div>
								<p>{data.totalAssets}</p>
							</div>
							<p className="task-title">Total Assets</p>
						</div>
						{/* <span className="divider"></span> */}
						<div className="task-container">
							<div className="task-number">
								<div className="icon-container">
									<HeartPulse size={18} />
								</div>
								<p>{data.healthyAssets}</p>
							</div>
							<p className="task-title">Healthy Assets</p>
						</div>
					</div>
					<div className="chart-container">
						<ResponsiveContainer width={100} height={100}>
							<PieChart>
								<Pie
									data={pieData}
									cx="50%"
									cy="50%"
									innerRadius={30}
									outerRadius={40}
									fill="#8884d8"
									paddingAngle={5}
									dataKey="value"
								>
									{pieData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Pie>
								<Tooltip />
								<text
									x="50%"
									y="50%"
									dy={8}
									textAnchor="middle"
									fill="#333"
									fontSize={16}
									fontWeight="bold"
								>
									{`${healthyAssetRate}%`}
								</text>
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>
				{/* <p className="widget-insight">
					Asset health {filter} was <span className="insight-numbers">+5%</span>{" "}
					than previous
				</p> */}
				<DropDownButton
					content={() => (
						<div className="weekly-tasks">
							{data.assetData.map((item, index) => {
								const previousItem = data.assetData[index - 1];
								const percentageChange = previousItem
									? ((item.count - previousItem.count) / previousItem.count) *
									  100
									: 0;
								const isHigh = percentageChange >= 0;
								return (
									<div key={item.type} className="day">
										<span>{item.type}</span>
										<span className={`rate ${isHigh ? "high" : "low"}`}>
											{percentageChange.toFixed(1)}%
											<span
												className={`icon-indicator ${isHigh ? "green" : "red"}`}
											/>
										</span>
									</div>
								);
							})}
						</div>
					)}
					position="right center"
				>
					<CircleChevronRight />
				</DropDownButton>
			</div>
		</div>
	);
};

export default AssetHealthStatus;
