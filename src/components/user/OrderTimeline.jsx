import React from 'react';
import { Clock, Package, Truck, CheckCircle2 } from 'lucide-react';
import './OrderTimeline.css';

const STEPS = [
    { label: 'Order Placed', icon: Clock },
    { label: 'Packed & Ready', icon: Package },
    { label: 'Out for Delivery', icon: Truck },
    { label: 'Delivered', icon: CheckCircle2 }
];

export default function OrderTimeline({ currentStatus = 'Order Placed' }) {
    // Determine active index based on status string
    const getActiveIndex = () => {
        const statusMap = {
            'Order Placed': 0,
            'Packed & Ready': 1,
            'Out for Delivery': 2,
            'Delivered': 3
        };
        return statusMap[currentStatus] ?? 0;
    };

    const activeIndex = getActiveIndex();
    const progressWidth = `${(activeIndex / (STEPS.length - 1)) * 100}%`;

    return (
        <div className="timeline-stepper-container">
            <div className="timeline-stepper">
                {/* Background Line with dynamic active progress fill */}
                <div className="stepper-line">
                    <div className="stepper-line-progress" style={{ width: progressWidth }} />
                </div>

                {STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index < activeIndex;
                    const isActive = index === activeIndex;

                    return (
                        <div
                            key={step.label}
                            className={`stepper-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                        >
                            <div className="step-icon-box">
                                <Icon size={22} />
                            </div>
                            <span className="step-label">{step.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}