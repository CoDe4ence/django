from django.contrib.sitemaps import Sitemap
from django.urls import reverse

class StaticViewSitemap(Sitemap):
    changefreq = 'weekly'

    def items(self):
        return ['home', 'services', 'portfolio', 'demos', 'contact']

    def priority(self, item):
        priorities = {
            'home': 1.0,
            'services': 0.8,
            'portfolio': 0.8,
            'demos': 0.8,
            'contact': 0.6
        }
        return priorities.get(item, 0.5)

    def location(self, item):
        return reverse(item)