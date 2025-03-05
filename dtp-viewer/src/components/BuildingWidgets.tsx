import * as React from 'react';
import './BuildingWidgets.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBell, 
    faChartLine, 
    faTriangleExclamation,
    faBolt 
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface BuildingData {
    alarms: {
        total: number;
        new: number;
        inProgress: number;
        closed: number;
    };
    prediction: {
        today: number;
        thisWeek: number;
        thisMonth: number;
        later: number;
    };
    faults: {
        critical: number;
        medium: number;
    };
    energyUse: {
        current: number;
        prediction: number;
    };
    buildingId: string;
}

interface BuildingWidgetsProps {
    selectedBuilding: string | null;
}

const BuildingWidgets: React.FC<BuildingWidgetsProps> = ({ selectedBuilding }) => {
    const [buildingData, setBuildingData] = React.useState<BuildingData>({
        alarms: {
            total: 20,
            new: 2,
            inProgress: 8,
            closed: 10
        },
        prediction: {
            today: 4,
            thisWeek: 8,
            thisMonth: 2,
            later: 4
        },
        faults: {
            critical: 6,
            medium: 8
        },
        energyUse: {
            current: 1200,
            prediction: 1800
        },
        buildingId: "CABE-8010-L2-001"
    });

    // Generate random data when building selection changes
    React.useEffect(() => {
        if (selectedBuilding) {
            setBuildingData({
                alarms: {
                    total: Math.floor(Math.random() * 30),
                    new: Math.floor(Math.random() * 5),
                    inProgress: Math.floor(Math.random() * 10),
                    closed: Math.floor(Math.random() * 15)
                },
                prediction: {
                    today: Math.floor(Math.random() * 10),
                    thisWeek: Math.floor(Math.random() * 15),
                    thisMonth: Math.floor(Math.random() * 5),
                    later: Math.floor(Math.random() * 8)
                },
                faults: {
                    critical: Math.floor(Math.random() * 10),
                    medium: Math.floor(Math.random() * 15)
                },
                energyUse: {
                    current: Math.floor(Math.random() * 2000),
                    prediction: Math.floor(Math.random() * 2500)
                },
                buildingId: selectedBuilding
            });
        }
    }, [selectedBuilding]);

    const calculateProgress = (current: number, max: number) => {
        return `${(current / max * 100).toFixed(0)}%`;
    };

    const calculatePercentage = (value: number, total: number) => {
        return `${((value / total) * 100).toFixed(0)}%`;
    };

    return (
        <>
            {/* Energy Use Widget - Positioned at top center */}
            <div className={`energy-widget-container ${selectedBuilding ? 'visible' : ''}`}>
                <div className="widget energy-widget">
                    <div className="header">

                        <div className="title"><FontAwesomeIcon icon={faBolt} className="icon" style={{ marginRight: '8px' }} />
                        Energy Use Intensity - Site</div>

                    </div>
                    <div className="energy-circles">
                        <div 
                            className="circle current" 
                            style={{ 
                                '--progress': calculateProgress(buildingData.energyUse.current, 2000) 
                            } as React.CSSProperties}
                        >
                            <div className="progress-ring"></div>
                            <div className="value current">{buildingData.energyUse.current}</div>
                            <div className="unit">kWh/m²/yr</div>
                            <div className="label">Current</div>
                        </div>
                        <div 
                            className="circle prediction"
                            style={{ 
                                '--progress': calculateProgress(buildingData.energyUse.prediction, 2000) 
                            } as React.CSSProperties}
                        >
                            <div className="progress-ring"></div>
                            <div className="value prediction">{buildingData.energyUse.prediction}</div>
                            <div className="unit">kWh/m²/yr</div>
                            <div className="label">Prediction</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Other Widgets - Positioned on the left */}
            <div className={`building-widgets ${selectedBuilding ? 'visible' : ''}`}>
                {/* Alarms Widget */}
                <div className="widget alarms-widget">
                    <div className="header">
                        <FontAwesomeIcon icon={faBell} className="icon" />
                        <div className="title">Alarms</div>
                    </div>
                    <div className="total">Total {buildingData.alarms.total}</div>
                    <div className="numbers-grid">
                        <div className="number-item">
                            <div className="number">{buildingData.alarms.new}</div>
                            <div className="progress-bar new" style={{ '--progress': calculatePercentage(buildingData.alarms.new, buildingData.alarms.total) } as React.CSSProperties}>
                                <div className="fill"></div>
                            </div>
                            <div className="label">New</div>
                        </div>
                        <div className="number-item">
                            <div className="number">{buildingData.alarms.inProgress}</div>
                            <div className="progress-bar in-progress" style={{ '--progress': calculatePercentage(buildingData.alarms.inProgress, buildingData.alarms.total) } as React.CSSProperties}>
                                <div className="fill"></div>
                            </div>
                            <div className="label">In Progress</div>
                        </div>
                        <div className="number-item">
                            <div className="number">{buildingData.alarms.closed}</div>
                            <div className="progress-bar closed" style={{ '--progress': calculatePercentage(buildingData.alarms.closed, buildingData.alarms.total) } as React.CSSProperties}>
                                <div className="fill"></div>
                            </div>
                            <div className="label">Closed</div>
                        </div>
                    </div>
                </div>

                {/* Prediction Widget */}
                <div className="widget prediction-widget">
                    <div className="header">
                        <FontAwesomeIcon icon={faChartLine} className="icon" />
                        <div className="title">Forecast</div>
                    </div>
                    <div className="total">Total {buildingData.prediction.today + buildingData.prediction.thisWeek + buildingData.prediction.thisMonth + buildingData.prediction.later}</div>
                    <div className="prediction-grid">
                        <div className="prediction-item">
                            <div className="value">{buildingData.prediction.today}</div>
                            <div className="progress-bar" style={{ '--progress': calculatePercentage(buildingData.prediction.today, 10) } as React.CSSProperties}>
                                <div className="fill"></div>
                            </div>
                            <div className="percentage">{calculatePercentage(buildingData.prediction.today, 10)}</div>
                            <div className="label">Today</div>
                        </div>
                        <div className="prediction-item">
                            <div className="value">{buildingData.prediction.thisWeek}</div>
                            <div className="progress-bar" style={{ '--progress': calculatePercentage(buildingData.prediction.thisWeek, 15) } as React.CSSProperties}>
                                <div className="fill"></div>
                            </div>
                            <div className="percentage">{calculatePercentage(buildingData.prediction.thisWeek, 15)}</div>
                            <div className="label">This Week</div>
                        </div>
                        <div className="prediction-item">
                            <div className="value">{buildingData.prediction.thisMonth}</div>
                            <div className="progress-bar" style={{ '--progress': calculatePercentage(buildingData.prediction.thisMonth, 5) } as React.CSSProperties}>
                                <div className="fill"></div>
                            </div>
                            <div className="percentage">{calculatePercentage(buildingData.prediction.thisMonth, 5)}</div>
                            <div className="label">This Month</div>
                        </div>
                        <div className="prediction-item">
                            <div className="value">{buildingData.prediction.later}</div>
                            <div className="progress-bar" style={{ '--progress': calculatePercentage(buildingData.prediction.later, 8) } as React.CSSProperties}>
                                <div className="fill"></div>
                            </div>
                            <div className="percentage">{calculatePercentage(buildingData.prediction.later, 8)}</div>
                            <div className="label">Later</div>
                        </div>
                    </div>
                </div>

                {/* Faults Widget */}
                <div className="widget faults-widget">
                    <div className="header">
                        <FontAwesomeIcon icon={faTriangleExclamation} className="icon" />
                        <div className="title">Faults</div>
                    </div>
                    <div className="total">Total {buildingData.faults.critical + buildingData.faults.medium}</div>
                    <div className="faults-grid">
                        <div className="fault-item critical">
                            <div className="value">{buildingData.faults.critical}</div>
                            <div className="progress-bar critical" style={{ '--progress': calculatePercentage(buildingData.faults.critical, buildingData.faults.critical + buildingData.faults.medium) } as React.CSSProperties}>
                                <div className="fill"></div>
                            </div>
                            <div className="percentage">{calculatePercentage(buildingData.faults.critical, buildingData.faults.critical + buildingData.faults.medium)}</div>
                            <div className="label">Critical</div>
                        </div>
                        <div className="fault-item medium">
                            <div className="value">{buildingData.faults.medium}</div>
                            <div className="progress-bar medium" style={{ '--progress': calculatePercentage(buildingData.faults.medium, buildingData.faults.critical + buildingData.faults.medium) } as React.CSSProperties}>
                                <div className="fill"></div>
                            </div>
                            <div className="percentage">{calculatePercentage(buildingData.faults.medium, buildingData.faults.critical + buildingData.faults.medium)}</div>
                            <div className="label">Medium</div>
                        </div>
                    </div>
                </div>

                {/* Building ID Display */}
                <div className="building-id">
                    Building: {buildingData.buildingId}
                </div>
            </div>
        </>
    );
};

export default BuildingWidgets; 