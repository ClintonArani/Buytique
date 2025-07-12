import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, TooltipItem, registerables } from 'chart.js';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';

interface User {
  id: string;
  name?: string;
  email: string;
}

interface OrderItem {
  product_name: string;
  unit_price: number;
  quantity: number;
  item_total: number;
  image_path?: string;
}

interface Order {
  id: string;
  order_date: string;
  order_items: OrderItem[];
  total_price: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | string;
}

interface MonthlySpending {
  year: number;
  month: number;
  total_spending: number;
  order_count: number;
}

interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, AfterViewInit {
  @ViewChild('orderStatusChart') orderStatusChartRef!: ElementRef;
  @ViewChild('monthlySpendingChart') monthlySpendingChartRef!: ElementRef;

  userName: string = 'Guest';
  userId: string = '';
  totalOrders: number = 0;
  pendingOrders: number = 0;
  deliveredOrders: number = 0;
  totalSpent: number = 0;
  recentOrders: Order[] = [];
  recommendedProducts: RecommendedProduct[] = [];
  monthlySpendingData: MonthlySpending[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  successMessage: string = '';
  private messageTimeout: any;

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.initializeUserData();
  }

  ngAfterViewInit(): void {
    // Charts will be created after data is loaded
  }

  private initializeUserData(): void {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('No user logged in');
      }
    
      this.userId = user.id;
      this.fetchDashboardData();
    } catch (error) {
      console.error('Error initializing user data:', error);
      this.isLoading = false;
      this.errorMessage = 'Failed to load user data. Please try again.';
    }
  }

  private fetchDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    if (!this.userId) {
      this.isLoading = false;
      this.errorMessage = 'User ID not available';
      return;
    }

    forkJoin({
      orders: this.orderService.getUserOrders(this.userId).pipe(
        catchError(error => {
          console.error('Error fetching user orders:', error);
          this.errorMessage = 'Failed to load order history';
          return of([]);
        })
      ),
      recentOrders: this.orderService.getUserRecentOrders(this.userId, 5).pipe(
        catchError(error => {
          console.error('Error fetching recent orders:', error);
          return of([]);
        })
      ),
      monthlySpending: this.orderService.getUserMonthlySpending(this.userId, 6).pipe(
        catchError(error => {
          console.error('Error fetching monthly spending:', error);
          return of({ success: false, monthlySpending: [] });
        })
      ),
      recommendedProducts: this.orderService.getRecommendedProducts(this.userId, 4).pipe(
        catchError(error => {
          console.error('Error fetching recommended products:', error);
          return of([]);
        })
      )
    }).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (responses) => {
        this.processDashboardData(responses);
        setTimeout(() => this.createCharts(), 50);
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.errorMessage = 'Failed to load dashboard data. Please refresh the page.';
      }
    });
  }

  private processDashboardData(responses: any): void {
    try {
      const allOrders = this.getResponseData(responses.orders);
      this.processUserOrders(allOrders);

      this.recentOrders = this.getResponseData(responses.recentOrders).map((order: any) => ({
        id: order.id,
        order_date: order.order_date || order.date || order.createdAt || new Date().toISOString(),
        order_items: order.order_items || [], 
        total_price: order.total_price,
        status: (order.order_status || order.status || 'pending').toLowerCase()
      }));

      const monthlySpendingResponse = responses.monthlySpending;
      if (monthlySpendingResponse && monthlySpendingResponse.success) {
        this.monthlySpendingData = monthlySpendingResponse.monthlySpending.map((item: any) => ({
          year: item.year,
          month: item.month,
          total_spending: item.total_spending,
          order_count: item.order_count
        }));
      } else {
        this.monthlySpendingData = [];
      }

      this.recommendedProducts = this.getResponseData(responses.recommendedProducts).map((product: any) => ({
        id: product.id || product._id || '',
        name: product.name || product.title || 'Unknown Product',
        price: product.price || product.amount || 0,
        image: product.image || product.imageUrl || 'assets/images/placeholder-product.png'
      }));

    } catch (error) {
      console.error('Error processing dashboard data:', error);
      this.errorMessage = 'Error processing data. Please contact support.';
    }
  }

  private getResponseData(response: any): any[] {
    if (!response) return [];
    
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.orders && Array.isArray(response.orders)) return response.orders;
    if (response.success && response.data) return response.data;
    
    return [];
  }

  private processUserOrders(orders: any[]): void {
    if (!Array.isArray(orders)) {
      console.error('Invalid orders data:', orders);
      orders = [];
    }
  
    this.totalOrders = orders.length;
    this.pendingOrders = orders.filter(o => 
      o.status?.toLowerCase() === 'pending' || 
      o.order_status?.toLowerCase() === 'pending'
    ).length;
    this.deliveredOrders = orders.filter(o => 
      o.status?.toLowerCase() === 'delivered' || 
      o.order_status?.toLowerCase() === 'delivered'
    ).length;
    this.totalSpent = orders.reduce((sum: number, order: any) => 
      sum + (order.total_price || 0), 0);
  }

  private createCharts(): void {
    try {
      this.createOrderStatusChart();
      this.createMonthlySpendingChart();
    } catch (error) {
      console.error('Error creating charts:', error);
    }
  }

  private createOrderStatusChart(): void {
    const ctx = this.orderStatusChartRef?.nativeElement?.getContext('2d');
    if (!ctx || this.recentOrders.length === 0) return;

    const statusCounts = this.recentOrders.reduce((acc, order) => {
      const status = order.status?.toLowerCase() || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusCounts).map(s => this.formatStatus(s)),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      },
      options: this.getChartOptions('Your order status distribution')
    });
  }

  private createMonthlySpendingChart(): void {
    const ctx = this.monthlySpendingChartRef?.nativeElement?.getContext('2d');
    if (!ctx || this.monthlySpendingData.length === 0) {
      console.warn('Monthly spending chart not created - no data or canvas not available');
      return;
    }

    const sortedData = [...this.monthlySpendingData].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    const labels = sortedData.map(item => 
      new Date(item.year, item.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })
    );

    const data = sortedData.map(item => item.total_spending);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Monthly Spending (Ksh)',
          data: data,
          backgroundColor: '#4e73df',
          borderColor: '#4e73df',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (context: TooltipItem<'bar'>) => {
                const value = context.raw as number;
                return `Ksh ${value.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `Ksh ${value}`
            }
          }
        }
      }
    });
  }

  private getChartOptions(title: string, showYAxis: boolean = false): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        title: {
          display: true,
          text: title,
          padding: { top: 10, bottom: 20 }
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<any>) => {
              const label = context.dataset.label || '';
              const value = context.raw as number;
              return `${label}: ${value.toLocaleString()} Ksh`;
            }
          }
        }
      },
      scales: showYAxis ? {
        y: {
          beginAtZero: true,
          ticks: { 
            callback: (value: unknown) => `Ksh ${value}` 
          }
        }
      } : undefined
    };
  }

  private formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  viewOrderDetails(orderId: string): void {
    console.log('Viewing order:', orderId);
    // Implement navigation to order details
  }

  addToCart(productId: string): void {
    this.showSuccessMessage('Product added to cart!');
    // Implement add to cart functionality
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
}