import random

from django.shortcuts import render, redirect
from django.contrib import messages
import json
import uuid
import copy

# Demo data for the business template
BUSINESS_DEMO_DATA = {
    'company_name': 'Strategic Growth Consulting',
    'tagline': 'Driving Business Transformation Through Digital Innovation',
    'about': {
        'mission': 'We help businesses scale through strategic digital solutions and data-driven insights.',
        'team': [
            {'name': 'Sarah Chen', 'role': 'Lead Consultant', 'bio': '10+ years in digital transformation'},
            {'name': 'Marcus Johnson', 'role': 'UX Strategist', 'bio': 'Specialized in user-centered design'},
            {'name': 'Elena Rodriguez', 'role': 'Data Analyst', 'bio': 'Turning data into actionable insights'},
        ]
    },
    'services': [
        {
            'name': 'Digital Strategy',
            'description': 'Comprehensive digital roadmap for business growth',
            'price': 'R8,000',
            'features': ['Market Analysis', 'Competitor Research', 'Strategy Development', 'Implementation Plan']
        },
        {
            'name': 'Web Design & Development',
            'description': 'Custom websites that convert visitors into customers',
            'price': 'R12,000 - R25,000',
            'features': ['Responsive Design', 'SEO Optimization', 'Content Management', 'Ongoing Support']
        },
        {
            'name': 'E-commerce Solutions',
            'description': 'Complete online store setup and optimization',
            'price': 'R18,000 - R35,000',
            'features': ['Product Management', 'Payment Integration', 'Inventory System', 'Sales Analytics']
        }
    ],
    'testimonials': [
        {'name': 'TechStart Inc.', 'text': 'Increased our online conversions by 150% in 3 months.', 'role': 'CEO'},
        {'name': 'Global Retail Co.', 'text': 'Their e-commerce solution streamlined our operations dramatically.',
         'role': 'Operations Director'},
        {'name': 'Innovate Labs', 'text': 'The digital strategy provided clear direction and measurable results.',
         'role': 'Founder'},
    ],
    'contact_requests': []
}


def business_demo(request):
    demo_data = request.session.get('business_demo_data', BUSINESS_DEMO_DATA.copy())
    return render(request, 'sandbox/business/index.html', {
        'demo_data': demo_data,
        'demo_mode': True
    })


def business_about(request):
    demo_data = request.session.get('business_demo_data', BUSINESS_DEMO_DATA.copy())
    return render(request, 'sandbox/business/about.html', {
        'demo_data': demo_data,
        'demo_mode': True
    })


def business_services(request):
    demo_data = request.session.get('business_demo_data', BUSINESS_DEMO_DATA.copy())
    return render(request, 'sandbox/business/services.html', {
        'demo_data': demo_data,
        'demo_mode': True
    })


def business_contact(request):
    demo_data = request.session.get('business_demo_data', BUSINESS_DEMO_DATA.copy())

    if request.method == 'POST':
        # Simulate form submission
        contact_request = {
            'id': str(uuid.uuid4())[:8],
            'name': request.POST.get('name', ''),
            'email': request.POST.get('email', ''),
            'service': request.POST.get('service', ''),
            'message': request.POST.get('message', ''),
            'status': 'New'
        }

        if 'contact_requests' not in demo_data:
            demo_data['contact_requests'] = []
        demo_data['contact_requests'].append(contact_request)
        request.session['business_demo_data'] = demo_data
        request.session.modified = True

        messages.success(request, 'Thank you! Your demo inquiry has been received.')
        return redirect('business_contact_demo')

    return render(request, 'sandbox/business/contact.html', {
        'demo_data': demo_data,
        'demo_mode': True
    })


def business_admin(request):
    demo_data = request.session.get('business_demo_data', BUSINESS_DEMO_DATA.copy())
    return render(request, 'sandbox/business/admin_dashboard.html', {
        'demo_data': demo_data,
        'demo_mode': True
    })


def reset_business_demo(request):
    request.session['business_demo_data'] = BUSINESS_DEMO_DATA.copy()
    messages.info(request, 'Demo has been reset to original state.')
    return redirect('business_demo')


# Add to existing views.py

MEMBERSHIP_DEMO_DATA = {
    'site_name': 'Elite Learning Portal',
    'tagline': 'Unlock Your Potential With Premium Content',
    'pricing_tiers': [
        {
            'name': 'Free',
            'price': 'R0',
            'period': 'forever',
            'features': [
                'Access to basic courses',
                'Community forum',
                'Weekly newsletter',
                'Limited downloads'
            ],
            'button_text': 'Get Started Free',
            'highlighted': False
        },
        {
            'name': 'Pro',
            'price': 'R299',
            'period': 'per month',
            'features': [
                'All Free features',
                'Premium video courses',
                'Downloadable resources',
                'Priority support',
                'Certificate of completion'
            ],
            'button_text': 'Start Pro Trial',
            'highlighted': True
        },
        {
            'name': 'Enterprise',
            'price': 'R899',
            'period': 'per month',
            'features': [
                'All Pro features',
                'Team management',
                'Custom content',
                'API access',
                'Dedicated account manager'
            ],
            'button_text': 'Contact Sales',
            'highlighted': False
        }
    ],
    'courses': {
        'free': [
            {'title': 'Getting Started Guide', 'description': 'Basic introduction to our platform',
             'duration': '15 min'},
            {'title': 'Community Forum', 'description': 'Connect with other learners', 'duration': 'Ongoing'},
        ],
        'premium': [
            {'title': 'Advanced Masterclass', 'description': 'Deep dive into advanced techniques',
             'duration': '2 hours'},
            {'title': 'Expert Workshops', 'description': 'Live sessions with industry experts', 'duration': '4 hours'},
            {'title': 'Resource Library', 'description': 'Downloadable templates and tools', 'duration': 'Unlimited'},
        ]
    },
    'demo_users': {
        'free': {'email': 'free@demo.com', 'password': 'demo123', 'tier': 'free'},
        'pro': {'email': 'pro@demo.com', 'password': 'demo123', 'tier': 'pro'},
        'admin': {'email': 'admin@demo.com', 'password': 'demo123', 'tier': 'admin'}
    },
    'members': [],
    'content_access_log': []
}


def membership_demo(request):
    demo_data = request.session.get('membership_demo_data', MEMBERSHIP_DEMO_DATA.copy())
    return render(request, 'sandbox/membership/index.html', {
        'demo_data': demo_data,
        'demo_mode': True
    })


def membership_login(request):
    demo_data = request.session.get('membership_demo_data', MEMBERSHIP_DEMO_DATA.copy())

    if request.method == 'POST':
        email = request.POST.get('email', '')
        password = request.POST.get('password', '')

        # Check demo accounts
        for user_type, user_data in demo_data['demo_users'].items():
            if email == user_data['email'] and password == user_data['password']:
                request.session['membership_user'] = {
                    'email': email,
                    'tier': user_data['tier'],
                    'type': user_type
                }
                messages.success(request, f'Successfully logged in as {user_type} user!')
                return redirect('membership_dashboard_demo')

        messages.error(request, 'Invalid login credentials. Use demo accounts provided.')

    return render(request, 'sandbox/membership/login.html', {
        'demo_data': demo_data,
        'demo_mode': True
    })


def membership_register(request):
    demo_data = request.session.get('membership_demo_data', MEMBERSHIP_DEMO_DATA.copy())

    if request.method == 'POST':
        name = request.POST.get('name', '')
        email = request.POST.get('email', '')
        tier = request.POST.get('tier', 'free')

        # Add to demo members
        new_member = {
            'id': str(uuid.uuid4())[:8],
            'name': name,
            'email': email,
            'tier': tier,
            'join_date': '2024-01-15',
            'status': 'active'
        }

        if 'members' not in demo_data:
            demo_data['members'] = []
        demo_data['members'].append(new_member)
        request.session['membership_demo_data'] = demo_data
        request.session.modified = True

        # Auto-login as new user
        request.session['membership_user'] = {
            'email': email,
            'tier': tier,
            'type': 'new_member'
        }

        messages.success(request, f'Welcome {name}! Your {tier} account has been created.')
        return redirect('membership_dashboard_demo')

    return render(request, 'sandbox/membership/register.html', {
        'demo_data': demo_data,
        'demo_mode': True
    })


def membership_dashboard(request):
    demo_data = request.session.get('membership_demo_data', MEMBERSHIP_DEMO_DATA.copy())
    user = request.session.get('membership_user')

    if not user:
        messages.warning(request, 'Please log in to access the member dashboard.')
        return redirect('membership_login_demo')

    return render(request, 'sandbox/membership/dashboard.html', {
        'demo_data': demo_data,
        'user': user,
        'demo_mode': True
    })


def membership_premium_content(request):
    demo_data = request.session.get('membership_demo_data', MEMBERSHIP_DEMO_DATA.copy())
    user = request.session.get('membership_user')

    if not user:
        messages.warning(request, 'Please log in to access premium content.')
        return redirect('membership_login_demo')

    # Log access attempt
    access_log = {
        'user': user['email'],
        'tier': user['tier'],
        'content': 'premium_courses',
        'timestamp': '2024-01-15 10:30:00',
        'access_granted': user['tier'] in ['pro', 'enterprise', 'admin']
    }

    if 'content_access_log' not in demo_data:
        demo_data['content_access_log'] = []
    demo_data['content_access_log'].append(access_log)
    request.session['membership_demo_data'] = demo_data
    request.session.modified = True

    return render(request, 'sandbox/membership/premium_content.html', {
        'demo_data': demo_data,
        'user': user,
        'demo_mode': True
    })


def membership_admin(request):
    demo_data = request.session.get('membership_demo_data', MEMBERSHIP_DEMO_DATA.copy())
    user = request.session.get('membership_user')

    if not user or user['type'] != 'admin':
        messages.error(request, 'Admin access required. Use admin@demo.com / demo123')
        return redirect('membership_login_demo')

    return render(request, 'sandbox/membership/admin_dashboard.html', {
        'demo_data': demo_data,
        'user': user,
        'demo_mode': True
    })


def membership_logout(request):
    if 'membership_user' in request.session:
        del request.session['membership_user']
    messages.info(request, 'You have been logged out.')
    return redirect('membership_demo')


def reset_membership_demo(request):
    request.session['membership_demo_data'] = MEMBERSHIP_DEMO_DATA.copy()
    if 'membership_user' in request.session:
        del request.session['membership_user']
    messages.info(request, 'Membership demo has been reset to original state.')
    return redirect('membership_demo')


# Add to existing views.py

ECOMMERCE_DEMO_DATA = {
    'store_name': 'UrbanStyle Fashion',
    'tagline': 'Premium Streetwear & Urban Fashion',
    'brand_colors': {
        'primary': '#1a1a1a',  # Dark charcoal
        'secondary': '#e53e3e',  # Vibrant red
        'accent': '#f7fafc',  # Light background
    },
    'categories': [
        {'id': 'mens', 'name': "Men's Collection", 'count': 24},
        {'id': 'womens', 'name': "Women's Collection", 'count': 32},
        {'id': 'accessories', 'name': 'Accessories', 'count': 15},
        {'id': 'new', 'name': 'New Arrivals', 'count': 12},
    ],
    'products': [
        {
            'id': 1,
            'name': 'Premium Hoodie Collection',
            'price': 899,
            'original_price': 1199,
            'category': 'mens',
            'images': ['hoodie-black.jpg', 'hoodie-gray.jpg'],
            'sizes': ['S', 'M', 'L', 'XL'],
            'colors': ['Black', 'Charcoal', 'Navy'],
            'description': 'Ultra-soft premium cotton hoodie with modern fit',
            'features': ['Premium Cotton', 'Modern Fit', 'Machine Wash'],
            'in_stock': True,
            'rating': 4.8,
            'review_count': 142
        },
        {
            'id': 2,
            'name': 'Designer Denim Jacket',
            'price': 1299,
            'original_price': 1599,
            'category': 'womens',
            'images': ['denim-jacket.jpg'],
            'sizes': ['XS', 'S', 'M', 'L'],
            'colors': ['Light Wash', 'Dark Wash'],
            'description': 'Vintage-inspired denim jacket with custom hardware',
            'features': ['100% Cotton', 'Vintage Wash', 'Custom Hardware'],
            'in_stock': True,
            'rating': 4.9,
            'review_count': 89
        },
        {
            'id': 3,
            'name': 'Minimalist Backpack',
            'price': 599,
            'original_price': 799,
            'category': 'accessories',
            'images': ['backpack-black.jpg', 'backpack-navy.jpg'],
            'sizes': ['One Size'],
            'colors': ['Black', 'Navy', 'Olive'],
            'description': 'Sleek minimalist backpack with laptop compartment',
            'features': ['Water Resistant', 'Laptop Sleeve', 'Multiple Pockets'],
            'in_stock': True,
            'rating': 4.7,
            'review_count': 203
        },
        {
            'id': 4,
            'name': 'Limited Edition Sneakers',
            'price': 1899,
            'original_price': 2299,
            'category': 'new',
            'images': ['sneakers-white.jpg', 'sneakers-black.jpg'],
            'sizes': ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
            'colors': ['White/Black', 'Black/White'],
            'description': 'Exclusive limited edition collaboration sneakers',
            'features': ['Limited Edition', 'Premium Materials', 'Collector Item'],
            'in_stock': False,
            'rating': 5.0,
            'review_count': 47
        },
        {
            'id': 5,
            'name': 'Organic Cotton Tee',
            'price': 399,
            'original_price': 499,
            'category': 'mens',
            'images': ['tee-white.jpg', 'tee-black.jpg'],
            'sizes': ['S', 'M', 'L', 'XL', 'XXL'],
            'colors': ['White', 'Black', 'Heather Gray'],
            'description': 'Soft organic cotton t-shirt with relaxed fit',
            'features': ['Organic Cotton', 'Relaxed Fit', 'Eco-Friendly'],
            'in_stock': True,
            'rating': 4.6,
            'review_count': 318
        },
        {
            'id': 6,
            'name': 'Signature Crossbody Bag',
            'price': 799,
            'original_price': 999,
            'category': 'accessories',
            'images': ['crossbody-black.jpg', 'crossbody-brown.jpg'],
            'sizes': ['One Size'],
            'colors': ['Black', 'Brown', 'Tan'],
            'description': 'Versatile crossbody bag with adjustable strap',
            'features': ['Genuine Leather', 'Adjustable Strap', 'Multiple Compartments'],
            'in_stock': True,
            'rating': 4.8,
            'review_count': 167
        }
    ],
    'cart': [],
    'orders': [],
    'demo_users': {
        'customer': {'email': 'customer@urbanstyle.com', 'password': 'demo123', 'role': 'customer'},
        'admin': {'email': 'admin@urbanstyle.com', 'password': 'demo123', 'role': 'admin'}
    }
}


def ecommerce_demo(request):
    demo_data = request.session.get('ecommerce_demo_data', ECOMMERCE_DEMO_DATA.copy())
    return render(request, 'sandbox/ecommerce/index.html', {
        'demo_data': demo_data,
        'demo_mode': True
    })


def ecommerce_products(request):
    demo_data = request.session.get('ecommerce_demo_data', ECOMMERCE_DEMO_DATA.copy())
    category = request.GET.get('category', 'all')

    filtered_products = demo_data['products']
    if category != 'all':
        filtered_products = [p for p in demo_data['products'] if p['category'] == category]

    return render(request, 'sandbox/ecommerce/products.html', {
        'demo_data': demo_data,
        'products': filtered_products,
        'current_category': category,
        'demo_mode': True
    })


def ecommerce_product_detail(request, product_id):
    demo_data = request.session.get('ecommerce_demo_data', ECOMMERCE_DEMO_DATA.copy())
    product = next((p for p in demo_data['products'] if p['id'] == product_id), None)

    if not product:
        messages.error(request, 'Product not found.')
        return redirect('ecommerce_demo')

    return render(request, 'sandbox/ecommerce/product_detail.html', {
        'demo_data': demo_data,
        'product': product,
        'demo_mode': True
    })


def ecommerce_cart(request):
    demo_data = request.session.get('ecommerce_demo_data', ECOMMERCE_DEMO_DATA.copy())

    if request.method == 'POST':
        # Add to cart functionality
        product_id = int(request.POST.get('product_id'))
        quantity = int(request.POST.get('quantity', 1))
        size = request.POST.get('size')
        color = request.POST.get('color')

        product = next((p for p in demo_data['products'] if p['id'] == product_id), None)
        if product:
            cart_item = {
                'id': len(demo_data['cart']) + 1,
                'product_id': product_id,
                'name': product['name'],
                'price': product['price'],
                'quantity': quantity,
                'size': size,
                'color': color,
                'image': product['images'][0]
            }
            demo_data['cart'].append(cart_item)
            request.session['ecommerce_demo_data'] = demo_data
            request.session.modified = True
            messages.success(request, f'Added {product["name"]} to cart!')

    # Calculate cart total
    cart_total = sum(item['price'] * item['quantity'] for item in demo_data['cart'])

    return render(request, 'sandbox/ecommerce/cart.html', {
        'demo_data': demo_data,
        'cart_total': cart_total,
        'demo_mode': True
    })


def ecommerce_checkout(request):
    demo_data = request.session.get('ecommerce_demo_data', ECOMMERCE_DEMO_DATA.copy())

    if not demo_data['cart']:
        messages.warning(request, 'Your cart is empty.')
        return redirect('ecommerce_cart_demo')

    cart_total = sum(item['price'] * item['quantity'] for item in demo_data['cart'])

    if request.method == 'POST':
        # Process order
        order = {
            'id': len(demo_data['orders']) + 1,
            'order_number': f"US{random.randint(1000, 9999)}",
            'items': demo_data['cart'].copy(),
            'total': cart_total,
            'status': 'processing',
            'date': '2024-01-15',
            'customer': {
                'name': request.POST.get('name', 'Demo Customer'),
                'email': request.POST.get('email', 'customer@example.com'),
                'address': request.POST.get('address', '123 Demo Street')
            }
        }
        demo_data['orders'].append(order)
        demo_data['cart'] = []  # Clear cart
        request.session['ecommerce_demo_data'] = demo_data
        request.session.modified = True

        messages.success(request, f'Order #{order["order_number"]} placed successfully!')
        return redirect('ecommerce_order_confirmation_demo', order_id=order['id'])

    cart_total = sum(item['price'] * item['quantity'] for item in demo_data['cart'])

    return render(request, 'sandbox/ecommerce/checkout.html', {
        'demo_data': demo_data,
        'cart_total': cart_total,
        'demo_mode': True
    })


def ecommerce_order_confirmation(request, order_id):
    demo_data = request.session.get('ecommerce_demo_data', ECOMMERCE_DEMO_DATA.copy())
    order = next((o for o in demo_data['orders'] if o['id'] == order_id), None)

    if not order:
        messages.error(request, 'Order not found.')
        return redirect('ecommerce_demo')

    return render(request, 'sandbox/ecommerce/order_confirmation.html', {
        'demo_data': demo_data,
        'order': order,
        'demo_mode': True
    })


def ecommerce_admin(request):
    demo_data = request.session.get('ecommerce_demo_data', ECOMMERCE_DEMO_DATA.copy())
    user = request.session.get('ecommerce_user')

    if not user or user['role'] != 'admin':
        messages.error(request, 'Admin access required. Use admin@urbanstyle.com / demo123')
        return redirect('ecommerce_demo')

    # Calculate admin stats
    total_orders = len(demo_data['orders'])
    total_revenue = sum(order['total'] for order in demo_data['orders'])
    low_stock_products = [p for p in demo_data['products'] if not p['in_stock']]

    return render(request, 'sandbox/ecommerce/admin_dashboard.html', {
        'demo_data': demo_data,
        'total_orders': total_orders,
        'total_revenue': total_revenue,
        'low_stock_products': low_stock_products,
        'demo_mode': True
    })


def ecommerce_login(request):
    demo_data = request.session.get('ecommerce_demo_data', ECOMMERCE_DEMO_DATA.copy())

    if request.method == 'POST':
        email = request.POST.get('email', '')
        password = request.POST.get('password', '')

        # Check demo accounts
        for user_type, user_data in demo_data['demo_users'].items():
            if email == user_data['email'] and password == user_data['password']:
                request.session['ecommerce_user'] = {
                    'email': email,
                    'role': user_data['role']
                }
                messages.success(request, f'Successfully logged in as {user_type}!')
                if user_data['role'] == 'admin':
                    return redirect('ecommerce_admin_demo')
                return redirect('ecommerce_demo')

        messages.error(request, 'Invalid login credentials.')

    return render(request, 'sandbox/ecommerce/login.html', {
        'demo_data': demo_data,
        'demo_mode': True
    })


def ecommerce_logout(request):
    if 'ecommerce_user' in request.session:
        del request.session['ecommerce_user']
    messages.info(request, 'You have been logged out.')
    return redirect('ecommerce_demo')


def remove_from_cart(request, item_id):
    demo_data = request.session.get('ecommerce_demo_data', ECOMMERCE_DEMO_DATA.copy())
    demo_data['cart'] = [item for item in demo_data['cart'] if item['id'] != item_id]
    request.session['ecommerce_demo_data'] = demo_data
    request.session.modified = True
    messages.info(request, 'Item removed from cart.')
    return redirect('ecommerce_cart_demo')


def reset_ecommerce_demo(request):
    request.session['ecommerce_demo_data'] = ECOMMERCE_DEMO_DATA.copy()
    if 'ecommerce_user' in request.session:
        del request.session['ecommerce_user']
    messages.info(request, 'E-commerce demo has been reset.')
    return redirect('ecommerce_demo')