import React from 'react';
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ComposedChart,
} from 'recharts';

interface BuildingGraphsProps {
    buildingId: string | null;
}

// Add color constants
const COLORS = {
    primary: '#05C7F2',    // Bright Blue
    success: '#0fca7a',    // Green
    lightGreen: '#d2ffe6',
    darkGreen: '#005e36',
    warning: '#f7823b',    // Orange
    danger: '#f75d5f',     // Red
    accent: '#fbc62f',     // Yellow
    purple: '#695cfb',     // Primary purple
    darkBlue: '#102a43',
    white: '#ffffff',
    black: '#000000',
    darkGrey: '#2d2d2d',
    lightGrey: '#72777b'
};

const generateBuildingData = (buildingId: string) => {
    if (!buildingId) return [];
    
    // Get building number, default to 1 if not found
    const buildingNum = parseInt(buildingId.match(/\d+/)?.[0] || '1');
    
    // Base values that scale with building number
    const baseValue = buildingNum * 1000;
    const hours = 24;

    return Array.from({ length: hours }, (_, i) => {
        const hour = i;
        const isWorkHours = hour >= 9 && hour <= 17;
        const isLunchHour = hour >= 12 && hour <= 13;
        
        // Calculate multipliers
        const timeMultiplier = isWorkHours ? 1.5 : 0.6;
        const lunchMultiplier = isLunchHour ? 1.3 : 1;
        const buildingMultiplier = Math.max(0.5, (buildingNum * 0.5));

        // Calculate base metrics
        const baseOccupancy = baseValue * 0.01 * buildingMultiplier;
        const basePower = baseValue * buildingMultiplier;

        // Calculate actual values with some randomization
        const occupancyMultiplier = (0.8 + Math.random() * 0.7);  // Reduced multiplier for more reasonable numbers
        const occupancy = Math.floor(
            basePower * 0.08 * // Use basePower instead of baseOccupancy to tie it to power usage
            timeMultiplier * 
            lunchMultiplier * 
            occupancyMultiplier
        );

        // Keep power usage calculation based on normalized occupancy to avoid extreme spikes
        const normalizedOccupancyRatio = occupancy / (basePower * 0.08 * timeMultiplier * lunchMultiplier * 1.8);
        const powerUsage = Math.floor(
            basePower * 
            timeMultiplier * 
            (0.6 + normalizedOccupancyRatio * 0.4)
        );

        // Calculate system-specific loads
        const hvac = Math.floor(powerUsage * 0.4);
        const lighting = Math.floor(powerUsage * 0.2);
        const equipment = Math.floor(powerUsage * 0.15);
        const security = Math.floor(powerUsage * 0.1);
        const network = Math.floor(powerUsage * 0.15);

        // Temperature varies with occupancy and time, but with more reasonable limits
        const temperature = Math.floor(
            21 + // Base temperature
            (isWorkHours ? 1 : -1) + // Work hours adjustment
            Math.min(4, (occupancy / (basePower * 0.08)) * 0.8) // Cap the occupancy effect
        );

        return {
            time: `${hour}:00`,
            powerUsage,
            occupancy,
            temperature,
            hvac,
            lighting,
            equipment,
            security,
            network
        };
    });
};

const BuildingGraphs: React.FC<BuildingGraphsProps> = ({ buildingId }) => {
    const [data, setData] = React.useState<any[]>([]);

    React.useEffect(() => {
        console.log('BuildingId changed:', buildingId); // Debug log
        if (buildingId) {
            const newData = generateBuildingData(buildingId);
            console.log('New data generated: with buidling id ',buildingId); // Debug log
            setData(newData);
        }
    }, [buildingId]);

    // Early return if no buildingId or no data
    if (!buildingId || !data || data.length === 0) {
        console.log('No building selected or no data available'); // Debug log
        return null;
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-time">{`Time: ${label}`}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value}${
                                entry.name === 'Temperature' ? '°C' :
                                entry.name === 'Power Usage' ? ' kW' :
                                entry.name === 'Occupancy' ? ' people' : ' W'
                            }`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="building-graphs">
            <div className="graph-card bar-chart">
                <h3>Energy Distribution by System</h3>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="time" stroke={COLORS.white} />
                        <YAxis stroke={COLORS.white} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                            dataKey="hvac" 
                            name="HVAC" 
                            fill={COLORS.primary} 
                            stackId="a" 
                        />
                        <Bar 
                            dataKey="lighting" 
                            name="Lighting" 
                            fill={COLORS.success} 
                            stackId="a" 
                        />
                        <Bar 
                            dataKey="equipment" 
                            name="Equipment" 
                            fill={COLORS.warning} 
                            stackId="a" 
                        />
                        <Bar 
                            dataKey="security" 
                            name="Security" 
                            fill={COLORS.danger} 
                            stackId="a" 
                        />
                        <Bar 
                            dataKey="network" 
                            name="Network" 
                            fill={COLORS.purple} 
                            stackId="a" 
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="graph-card area-chart">
                <h3>Building Activity Overview</h3>
                <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="time" stroke={COLORS.white} />
                        <YAxis stroke={COLORS.white} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="powerUsage"
                            name="Power Usage"
                            stroke={COLORS.primary}
                            fill="url(#colorPower)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="occupancy"
                            name="Occupancy"
                            stroke={COLORS.success}
                            fill="url(#colorOccupancy)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="temperature"
                            name="Temperature"
                            stroke={COLORS.warning}
                            fill="url(#colorTemp)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="graph-card line-chart">
                <h3>Real-Time Metrics</h3>
                <div className="stats-container">
                    <div className="stat-item">
                        <span className="stat-value" style={{ color: COLORS.primary }}>
                            {Math.round(data[0]?.powerUsage / 100)}k
                        </span>
                        <span className="stat-label">Power (kW)</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value" style={{ color: COLORS.success }}>
                            {data[0]?.occupancy}
                        </span>
                        <span className="stat-label">Occupants</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value" style={{ color: COLORS.warning }}>
                            {data[0]?.temperature}°
                        </span>
                        <span className="stat-label">Temperature</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={data}>
                        <Line
                            type="monotone"
                            dataKey="powerUsage"
                            stroke={COLORS.primary}
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BuildingGraphs; 