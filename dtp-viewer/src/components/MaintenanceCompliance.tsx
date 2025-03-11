import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
	Info,
	Clock,
	CircleChevronRight,
	ClipboardList,
	ClipboardCheck,
	Wrench,
} from "lucide-react";
import { DropDownButton } from "uxp/components";
import { IContextProvider } from "../uxp";
import { IWDDesignModeProps } from "widget-designer/components";
// import "./MaintenanceCompliance.scss";

interface MaintenanceComplianceProps {
	date: string;
	floor: string;
	filter: string; // External filter passed (today, this week, this month, this quarter, this half year, this year)
	uxpContext?: IContextProvider;
	instanceId?: string;
	designer?: IWDDesignModeProps;
	uiProps?: any;
}

const COLORS = ["#76c893", "#d3d3d3"];

const getTaskCompletionColor = (rate: number, threshold: number) => {
	if (rate < threshold) return "#e3b7e1"; // Pink for underutilized
	// if (rate > threshold) return "#FF6347"; // Red for overutilized
	return "#76c893"; // Green for normal
};

const generateMockData = (filter: string) => {
	switch (filter) {
		case "Today":
			return {
				totalTasks: 10,
				completedTasks: 7,
				taskData: [
					{ timePeriod: "00:00", tasksCompleted: 1 },
					{ timePeriod: "06:00", tasksCompleted: 2 },
					{ timePeriod: "12:00", tasksCompleted: 2 },
					{ timePeriod: "18:00", tasksCompleted: 1 },
					{ timePeriod: "24:00", tasksCompleted: 1 },
				],
			};
		case "This Week":
			return {
				totalTasks: 70,
				completedTasks: 50,
				taskData: [
					{ timePeriod: "Mon", tasksCompleted: 10 },
					{ timePeriod: "Tue", tasksCompleted: 8 },
					{ timePeriod: "Wed", tasksCompleted: 10 },
					{ timePeriod: "Thu", tasksCompleted: 7 },
					{ timePeriod: "Fri", tasksCompleted: 8 },
					{ timePeriod: "Sat", tasksCompleted: 4 },
					{ timePeriod: "Sun", tasksCompleted: 3 },
				],
			};
		case "This Month":
			return {
				totalTasks: 300,
				completedTasks: 200,
				taskData: [
					{ timePeriod: "Week 1", tasksCompleted: 50 },
					{ timePeriod: "Week 2", tasksCompleted: 60 },
					{ timePeriod: "Week 3", tasksCompleted: 40 },
					{ timePeriod: "Week 4", tasksCompleted: 50 },
				],
			};
		case "This Quarter":
			return {
				totalTasks: 900,
				completedTasks: 600,
				taskData: [
					{ timePeriod: "Jan 1–Mar 31", tasksCompleted: 200 },
					{ timePeriod: "Apr 1–Jun 30", tasksCompleted: 250 },
					{ timePeriod: "Jul 1–Sep 30", tasksCompleted: 150 },
					{ timePeriod: "Oct 1–Dec 31", tasksCompleted: 200 },
				],
			};
		case "This Half Year":
			return {
				totalTasks: 1800,
				completedTasks: 1200,
				taskData: [
					{ timePeriod: "Jan 1–Jun 30", tasksCompleted: 600 },
					{ timePeriod: "Jul 1–Dec 31", tasksCompleted: 600 },
				],
			};
		case "This Year":
			return {
				totalTasks: 3600,
				completedTasks: 2400,
				taskData: [
					{ timePeriod: "Jan", tasksCompleted: 200 },
					{ timePeriod: "Feb", tasksCompleted: 180 },
					{ timePeriod: "Mar", tasksCompleted: 220 },
					{ timePeriod: "Apr", tasksCompleted: 240 },
					{ timePeriod: "May", tasksCompleted: 260 },
					{ timePeriod: "Jun", tasksCompleted: 280 },
					{ timePeriod: "Jul", tasksCompleted: 300 },
					{ timePeriod: "Aug", tasksCompleted: 320 },
					{ timePeriod: "Sep", tasksCompleted: 340 },
					{ timePeriod: "Oct", tasksCompleted: 360 },
					{ timePeriod: "Nov", tasksCompleted: 380 },
					{ timePeriod: "Dec", tasksCompleted: 400 },
				],
			};
		default:
			return {
				totalTasks: 0,
				completedTasks: 0,
				taskData: [],
			};
	}
};

const MaintenanceCompliance: React.FC<MaintenanceComplianceProps> = (props) => {
	// const { date, floor, filter } = props;
	let filter = "This Week"; // Default filter
	const taskThreshold = 60; // Static % for task completion threshold

	const [data, setData] = useState({
		totalTasks: 0,
		completedTasks: 0,
		taskData: [],
	});

	useEffect(() => {
		const mockData = generateMockData(filter);
		setData(mockData);
	}, [filter]);

	const taskCompletionRate = (
		(data.completedTasks / data.totalTasks) *
		100
	).toFixed(1);
	const taskCompletionRateNumber = parseFloat(taskCompletionRate); // Convert to number

	const pieData = [
		{ name: "Completed", value: taskCompletionRateNumber },
		{ name: "Pending", value: 100 - taskCompletionRateNumber },
	];

	console.log("Maintenance Compliance Widget Data", pieData);

	return (
		<div className="maintenance-compliance-widget">
			<div className="header">
				<Wrench size={18} />
				<span>Maintenance Compliance</span>
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
							<p className="task-title">Total Tasks</p>
							<div className="task-number">
								<ClipboardList size={18} />
								<p>{data.totalTasks}</p>
							</div>
						</div>
						<span className="divider"></span>
						<div className="task-container">
							<p className="task-title">Completed Tasks</p>
							<div className="task-number">
								<ClipboardCheck size={18} />
								<p>{data.completedTasks}</p>
							</div>
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
											fill={
												index === 0
													? getTaskCompletionColor(
															taskCompletionRateNumber,
															taskThreshold
													  )
													: COLORS[1]
											}
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
									{`${taskCompletionRate}%`}
								</text>
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>
				<p className="widget-insight">
					Task completion {filter} was{" "}
					<span className="insight-numbers">+5%</span> than previous
				</p>
				<DropDownButton
					content={() => (
						<div className="weekly-tasks">
							{data.taskData.map((item, index) => {
								const previousItem = data.taskData[index - 1];
								const percentageChange = previousItem
									? ((item.tasksCompleted - previousItem.tasksCompleted) /
											previousItem.tasksCompleted) *
									  100
									: 0;
								const isHigh = percentageChange >= 0;
								return (
									<div key={item.timePeriod} className="day">
										<span>{item.timePeriod}</span>
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

export default MaintenanceCompliance;
