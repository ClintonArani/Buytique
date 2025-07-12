import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, TooltipItem, registerables } from 'chart.js';
import { catchError, finalize, forkJoin } from 'rxjs';
import { UserService } from '../../services/user.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  // Chart references
  @ViewChild('orderStatusChart') orderStatusChartRef!: ElementRef;
  @ViewChild('monthlySalesChart') monthlySalesChartRef!: ElementRef;
  @ViewChild('userActivityChart') userActivityChartRef!: ElementRef;
  @ViewChild('topProductsChart') topProductsChartRef!: ElementRef;

  // Data properties
  totalUsers!: number;
  totalProducts!: number;
  activeUsers!: number;
  totalOrders!: number;
  isLoading: boolean = true;
  orders: any[] = [];
  successMessage: string = '';
  recentOrders: any[] = [];
  topProducts: any[] = [];
  activeInactiveUsers = { active: 0, inactive: 0 };
  messageTimeout: any;

  constructor(
    private userService: UserService,
    private productService: ProductService,
    private orderService: OrderService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.fetchDashboardData();
    this.loadOrders();
  }

  ngAfterViewInit(): void {
    // Charts will be created after data is loaded
  }

  loadOrders(): void {
    this.orderService.getRecentOrders().subscribe(
      (response) => {
        this.orders = response.orders;
      },
      (error) => {
        console.error('Error fetching orders', error);
      }
    );
  }

  fetchDashboardData(): void {
    this.isLoading = true;
    
    forkJoin({
      users: this.userService.getAllUsers().pipe(catchError(() => [])),
      products: this.productService.getAllProducts().pipe(catchError(() => [])),
      allOrders: this.orderService.getAllOrders().pipe(catchError(() => [])),
      recentOrders: this.orderService.getRecentOrders(5).pipe(catchError(() => [])),
      topProducts: this.orderService.getTopProducts(5).pipe(catchError(() => []))
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (responses) => {
        const users = this.extractDataFromResponse(responses.users, 'users');
        const products = this.extractDataFromResponse(responses.products, 'products');
        const allOrders = this.extractDataFromResponse(responses.allOrders, 'orders');
        const recentOrders = this.extractDataFromResponse(responses.recentOrders, 'orders');
        const topProducts = this.extractDataFromResponse(responses.topProducts, 'products');

        // Process data
        this.totalUsers = users.length;
        this.activeUsers = users.filter((user: any) => user.isActive || user.active).length;
        this.activeInactiveUsers = {
          active: this.activeUsers,
          inactive: this.totalUsers - this.activeUsers
        };
        // Calculate total products by summing quantities
        this.totalProducts = products.reduce((sum, product) => sum + (product.stock_quantity || 0), 0);
        this.totalOrders = allOrders.length;
        this.recentOrders = this.processRecentOrders(recentOrders);
        this.topProducts = this.processTopProducts(topProducts);

        // Create charts after slight delay to ensure DOM is ready
        setTimeout(() => {
          this.createOrderStatusChart(allOrders);
          this.createMonthlySalesChart(allOrders);
          this.createUserActivityChart(this.activeInactiveUsers.active, this.activeInactiveUsers.inactive);
          this.createTopProductsChart(this.topProducts);
        }, 100);
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
      }
    });
  }

  // Chart creation methods
  private createOrderStatusChart(orders: any[]): void {
    if (!orders.length) return;
    if (!this.orderStatusChartRef?.nativeElement) return;

    const statusCounts = orders.reduce((acc, order) => {
      acc[order.order_status] = (acc[order.order_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ctx = this.orderStatusChartRef.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (context: TooltipItem<'doughnut'>) => {
                const label = context.label || '';
                const value = Number(context.raw) || 0;
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  private createMonthlySalesChart(orders: any[]): void {
    if (!orders.length) return;
    if (!this.monthlySalesChartRef?.nativeElement) return;

    const monthlySales = orders.reduce((acc, order) => {
      const date = new Date(order.order_date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      acc[monthYear] = (acc[monthYear] || 0) + order.total_price;
      return acc;
    }, {} as Record<string, number>);

    const sortedMonths = Object.keys(monthlySales).sort();
    const monthNames = sortedMonths.map(monthStr => {
      const [year, month] = monthStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, 1)
        .toLocaleString('default', { month: 'short' });
    });

    const ctx = this.monthlySalesChartRef.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: monthNames,
        datasets: [{
          label: 'Sales Amount (Ksh)',
          data: sortedMonths.map(monthKey => monthlySales[monthKey]),
          fill: false,
          backgroundColor: '#4e73df',
          borderColor: '#4e73df',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: (value: unknown) => `Ksh${value}` }
          }
        }
      }
    });
  }

  private createUserActivityChart(active: number, inactive: number): void {
    if (!this.userActivityChartRef?.nativeElement) return;

    const ctx = this.userActivityChartRef.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Active Users', 'Inactive Users'],
        datasets: [{
          data: [active, inactive],
          backgroundColor: ['#1cc88a', '#e74a3b'],
          hoverBackgroundColor: ['#17a673', '#be2617']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (context: TooltipItem<'pie'>) => {
                const label = context.label || '';
                const value = Number(context.raw) || 0;
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  private createTopProductsChart(products: any[]): void {
    if (!products.length) return;
    if (!this.topProductsChartRef?.nativeElement) return;

    const ctx = this.topProductsChartRef.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: products.map(p => p.name),
        datasets: [{
          label: 'Revenue (Ksh)',
          data: products.map(p => p.revenue),
          backgroundColor: '#36b9cc',
          borderColor: '#36b9cc',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: (value: unknown) => `Ksh${value}` }
          }
        }
      }
    });
  }

  // Helper methods
  private extractDataFromResponse(response: any, endpoint: string): any[] {
    if (Array.isArray(response)) return response;
    if (response?.data?.result) return response.data.result;
    if (response?.data?.[endpoint]) return response.data[endpoint];
    if (response?.[endpoint]) return response[endpoint];
    console.warn(`Unexpected response structure for ${endpoint}:`, response);
    return [];
  }

  private processRecentOrders(orders: any[]): any[] {
    if (!orders?.length) return [];
    return orders
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
      .slice(0, 5)
      .map(order => ({
        id: order.order_id,
        order_id: order.order_id,
        customer: order.customer_name,
        date: new Date(order.order_date).toLocaleDateString(),
        amount: order.total_price,
        status: order.order_status
      }));
  }

  private processTopProducts(products: any[]): any[] {
    if (!products?.length) return [];
    return products
      .map(product => ({
        name: product.product_name,
        sales: product.total_quantity_sold,
        revenue: product.total_revenue || product.price * product.total_quantity_sold
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }

  updateStatus(orderId: string, newStatus: string): void {
    if (this.messageTimeout) clearTimeout(this.messageTimeout);

    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Order status updated successfully';
        const updatedOrder = this.recentOrders.find(order => order.id === orderId);
        if (updatedOrder) updatedOrder.status = newStatus;
        
        this.messageTimeout = setTimeout(() => {
          this.successMessage = '';
        }, 2000);
        
        this.loadOrders();
        this.fetchDashboardData();
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.successMessage = 'Failed to update order status';
        this.messageTimeout = setTimeout(() => {
          this.successMessage = '';
        }, 2000);
      }
    });
  }
}