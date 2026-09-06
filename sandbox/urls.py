from django.urls import path
from . import views

urlpatterns = [
    # Business demo URLs
    path('business/', views.business_demo, name='business_demo'),
    # path('business/about/', views.business_about, name='business_about_demo'),
    path('business/services/', views.business_services, name='business_services_demo'),
    path('business/contact/', views.business_contact, name='business_contact_demo'),
    path('business/admin/', views.business_admin, name='business_admin_demo'),
    path('business/reset/', views.reset_business_demo, name='reset_business_demo'),

    # Membership demo URLs
    path('membership/', views.membership_demo, name='membership_demo'),
    path('membership/login/', views.membership_login, name='membership_login_demo'),
    path('membership/register/', views.membership_register, name='membership_register_demo'),
    path('membership/dashboard/', views.membership_dashboard, name='membership_dashboard_demo'),
    path('membership/premium-content/', views.membership_premium_content, name='membership_premium_content_demo'),
    path('membership/admin/', views.membership_admin, name='membership_admin_demo'),
    path('membership/logout/', views.membership_logout, name='membership_logout_demo'),
    path('membership/reset/', views.reset_membership_demo, name='reset_membership_demo'),

    # E-commerce demo URLs
    path('ecommerce/', views.ecommerce_demo, name='ecommerce_demo'),
    path('ecommerce/products/', views.ecommerce_products, name='ecommerce_products_demo'),
    path('ecommerce/product/<int:product_id>/', views.ecommerce_product_detail, name='ecommerce_product_detail_demo'),
    path('ecommerce/cart/', views.ecommerce_cart, name='ecommerce_cart_demo'),
    path('ecommerce/cart/remove/<int:item_id>/', views.remove_from_cart, name='remove_from_cart_demo'),
    path('ecommerce/checkout/', views.ecommerce_checkout, name='ecommerce_checkout_demo'),
    path('ecommerce/order-confirmation/<int:order_id>/', views.ecommerce_order_confirmation,
         name='ecommerce_order_confirmation_demo'),
    path('ecommerce/admin/', views.ecommerce_admin, name='ecommerce_admin_demo'),
    path('ecommerce/login/', views.ecommerce_login, name='ecommerce_login_demo'),
    path('ecommerce/logout/', views.ecommerce_logout, name='ecommerce_logout_demo'),
    path('ecommerce/reset/', views.reset_ecommerce_demo, name='reset_ecommerce_demo'),
]