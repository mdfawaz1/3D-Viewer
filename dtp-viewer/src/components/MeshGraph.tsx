import React, { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MeshGraphProps {
    title: string;
    value: number;
    subtitle: string;
    onClose: () => void;
}

const MeshGraph: React.FC<MeshGraphProps> = ({ title, value, subtitle, onClose }) => {
    const [data, setData] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [containerHeight, setContainerHeight] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const generateData = () => {
            const newData = [];
            for (let i = 0; i < 1000; i += 100) {
                newData.push({
                    label: i,
                    value1: Math.random() * 300 + 200,
                    value2: Math.random() * 250 + 150,
                    value3: Math.random() * 200 + 100,
                    value4: Math.random() * 150 + 50,
                    value5: Math.random() * 100 + 25,
                });
            }
            setData(newData);
        };

        generateData();
    }, []);

    useEffect(() => {
        const updateHeight = () => {
            if (containerRef.current) {
                const height = Math.floor(window.innerHeight * 0.6);
                setContainerHeight(height);
            }
        };

        // Initial height
        updateHeight();

        // Debounced resize handler
        let resizeTimer: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updateHeight, 100);
        };

        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimer);
        };
    }, []);

    const tabs = ['Today', 'This Week', 'This Month', 'This Year'];
    const colors = {
        value1: '#695cfb',  // Primary purple
        value2: '#05C7F2',  // Bright blue
        value3: '#0fca7a',  // Green
        value4: '#f7823b',  // Orange
        value5: '#f75d5f',  // Red
    };

    return (
        <div className="graph-widget" ref={containerRef} style={{ height: containerHeight || 'auto' }}>
            <div className="graph-meta-info">
                <div className="graph-info">
                    <h2 className="graph-title">{title}</h2>
                    <div className="graph-value">{value.toLocaleString()}</div>
                    <div className="graph-subtitle">{subtitle}</div>
                </div>
                <button onClick={onClose} className="graph-close-btn">×</button>
            </div>

            <div className="graph-tabs-container">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className={`graph-tab ${activeTab === index ? 'active' : ''}`}
                        onClick={() => setActiveTab(index)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="graph-legend">
                {Object.entries(colors).map(([key, color], index) => (
                    <div key={index} className="graph-legend-item">
                        <div 
                            className="graph-legend-dot"
                            style={{ backgroundColor: color }}
                        />
                        <span className="graph-legend-label">Metric {index + 1}</span>
                    </div>
                ))}
            </div>

            <div className="graph-chart-container">
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                    >
                        <defs>
                            {Object.entries(colors).map(([key, color]) => (
                                <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={color} stopOpacity={0.05}/>
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="rgba(148, 163, 184, 0.1)" 
                            vertical={false}
                        />
                        <XAxis 
                            dataKey="label" 
                            stroke="#94A3B8"
                            tick={{ className: 'graph-axis-tick' }}
                            axisLine={{ stroke: 'rgba(148, 163, 184, 0.1)' }}
                        />
                        <YAxis 
                            stroke="#94A3B8"
                            tick={{ className: 'graph-axis-tick' }}
                            axisLine={{ stroke: 'rgba(148, 163, 184, 0.1)' }}
                        />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: '#2D2D2D',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                                padding: '8px 12px',
                                color: '#ffffff'
                            }}
                            cursor={{ stroke: 'rgba(148, 163, 184, 0.2)', strokeWidth: 1 }}
                            labelStyle={{ color: '#ffffff', marginBottom: '4px' }}
                            itemStyle={{ color: '#94A3B8', fontSize: '12px' }}
                        />
                        {Object.entries(colors).map(([key, color]) => (
                            <Area
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stackId="1"
                                stroke={color}
                                fill={`url(#gradient-${key})`}
                                strokeWidth={2}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MeshGraph; 