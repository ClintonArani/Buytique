import { Routes } from '@angular/router';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { HomeComponent } from './components/home/home.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ContactComponent } from './components/contact/contact.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { AdminComponent } from './admin/admin.component';
import { AuthGuard } from './auth.guard';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CategoriesComponent } from './admin/categories/categories.component';
import { ProductsComponent } from './admin/products/products.component';
import { UsersComponent } from './admin/users/users.component';
import { InfoComponent } from './components/info/info.component';
import { OverviewComponent } from './components/info/overview/overview.component';
import { PurchaseHistoryComponent } from './components/info/purchase-history/purchase-history.component';
import { ChangepasswordComponent } from './components/changepassword/changepassword.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    { path: 'product-details/:id',component: ProductDetailsComponent},
    { path: 'cart', component: CartComponent },
    {path: 'contact', component: ContactComponent},
    { path: 'checkout', component: CheckoutComponent },
    { path: 'profile', component: UserProfileComponent },
    {path: 'login', component: LoginComponent},
    {path: 'signup', component: SignupComponent},
    {path: 'contact',component: ContactComponent},
    {path: 'reset-password', component: ForgotPasswordComponent},
    {path: 'change-password', component: ChangepasswordComponent},
    {path: 'chatbot', component: ChatbotComponent},
    {path: 'info', component: InfoComponent,
        children: [
            {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
            {path: 'dashboard', component: OverviewComponent},
            {path: 'history', component: PurchaseHistoryComponent}
        ]
    },


    // Protected routes for admin users
    { 
        path: 'admin', 
        component: AdminComponent,
        canActivate: [AuthGuard], // Apply AuthGuard to the parent route
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Redirects /admin to /admin/dashboard
            { path: 'dashboard', component: DashboardComponent },
            { path: 'manage-product-categories', component: CategoriesComponent},
            { path: 'manage-product', component: ProductsComponent},
            { path: 'manage-users', component: UsersComponent},
        ]
    },
    { path: '**', redirectTo: '/login' } , 

    

];
