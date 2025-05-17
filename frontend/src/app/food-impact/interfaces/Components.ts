export interface SupplyChainStage {
    icon: any;
    name: string;
}

export interface MetricCardProps {
    icon: any;
    title: string;
    value: number;
    unit: string;
    changePercent: number;
    isIncrease: boolean;
    fillPercent: number;
    color: string;
}

export interface ProgressNavItemProps {
    icon: any;
    section: string;
    isActive: boolean;
    onClick: () => void;
}

export interface EnvironmentalCardProps {
    icon: any;
    backgroundColor: string;
    borderColor: string;
    children: React.ReactNode;
} 