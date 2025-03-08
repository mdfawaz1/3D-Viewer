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
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Generate sample data for the area chart
        const generateData = () => {
            const newData = [];
            for (let i = 0; i < 1000; i += 100) {
                newData.push({
                    label: i,
                    purple: Math.random() * 300 + 200,
                    blue: Math.random() * 250 + 150,
                    green: Math.random() * 200 + 100,
                    orange: Math.random() * 150 + 50,
                    red: Math.random() * 100 + 25,
                });
            }
            setData(newData);
        };

        generateData();

        // Fix for ResizeObserver error
        const resizeHandler = () => {
            if (containerRef.current) {
                containerRef.current.style.height = `${window.innerHeight * 0.6}px`;
            }
        };
        window.addEventListener('resize', resizeHandler);
        resizeHandler();

        return () => window.removeEventListener('resize', resizeHandler);
    }, []);

    const tabs = ['Tab', 'Tab', 'Tab', 'Tab'];
    const colors = {
        purple: '#695cfb',  // Primary purple
        blue: '#05C7F2',    // Bright blue
        green: '#0fca7a',   // Green
        orange: '#f7823b',  // Orange
        red: '#f75d5f',     // Red
    };

    const axisStyle = {
        fontSize: '12px',
        fill: '#72777b'     // light grey
    };

    return (
        <div className="mesh-graph-widget" ref={containerRef} style={{ backgroundColor: '#ffffff' }}>
            <div className="meta-info">
                <div>
                    <h2 style={{ color: '#2d2d2d' }}>{title}</h2>
                    <div className="value" style={{ color: '#102a43' }}>{value.toLocaleString()} Value</div>
                    <div className="subtitle" style={{ color: '#72777b' }}>{subtitle}</div>
                </div>
                <button onClick={onClose} className="close-btn" style={{ color: '#72777b' }}>×</button>
            </div>

            <div className="tabs-container" style={{ backgroundColor: '#f8f9fa' }}>
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className={`tab ${activeTab === index ? 'active' : ''}`}
                        onClick={() => setActiveTab(index)}
                        style={{
                            color: activeTab === index ? '#102a43' : '#72777b',
                            backgroundColor: activeTab === index ? '#ffffff' : 'transparent'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="legend">
                {['Item', 'Item', 'Item', 'Item', 'Item'].map((item, index) => (
                    <div key={index} className="legend-item">
                        <div className="legend-dot" style={{
                            backgroundColor: Object.values(colors)[index]
                        }} />
                        <span style={{ color: '#72777b' }}>{item}</span>
                    </div>
                ))}
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                    >
                        <defs>
                            {Object.entries(colors).map(([key, color]) => (
                                <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={color} stopOpacity={0.9}/>
                                    <stop offset="40%" stopColor={color} stopOpacity={0.6}/>
                                    <stop offset="100%" stopColor={color} stopOpacity={0.1}/>
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d2ffe6" />
                        <XAxis 
                            dataKey="label" 
                            stroke="#72777b"
                            tick={{ style: axisStyle }}
                            axisLine={{ stroke: '#d2ffe6' }}
                        />
                        <YAxis 
                            stroke="#72777b"
                            tick={{ style: axisStyle }}
                            axisLine={{ stroke: '#d2ffe6' }}
                        />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                color: '#102a43'
                            }}
                            cursor={{ stroke: '#72777b', strokeWidth: 1 }}
                            labelStyle={{ color: '#102a43' }}
                            itemStyle={{ color: '#2d2d2d' }}
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