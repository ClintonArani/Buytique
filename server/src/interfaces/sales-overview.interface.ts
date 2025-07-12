// src/interfaces/sales-overview.interface.ts

export interface SalesSummary {
    total_revenue: number;
    total_orders: number;
    avg_order_value: number;
}

export interface SalesTrend {
    date: string;
    order_count: number;
    daily_revenue: number;
}

export interface TopProduct {
    product_name: string;
    units_sold: number;
    revenue: number;
}

export interface StatusDistribution {
    order_status: string;
    count: number;
}

export interface SalesOverviewResponse {
    success: boolean;
    overview: {
        summary: SalesSummary;
        trend: SalesTrend[];
        topProducts: TopProduct[];
        statusDistribution: StatusDistribution[];
    };
}