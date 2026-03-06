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
