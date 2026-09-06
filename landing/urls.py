from django.urls import path
from . import views


urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('services/', views.services_view, name='services'),
    path('portfolio/', views.PortfolioView.as_view(), name='portfolio'),
    path('about/', views.AboutView.as_view(), name='about'),
    path('contact/', views.contact_view, name='contact'),
    path('demos/', views.DemosView.as_view(), name='demos'),
]

urlpatterns += [
    path("school-portal/", views.school_portal, name="portfolio_school_portal"),
    path("business-site/", views.business_site, name="portfolio_business_site"),
    path("ecommerce/", views.ecommerce, name="portfolio_ecommerce"),
]