from django import template

register = template.Library()

@register.filter
def multiply(value, arg):
    try:
        return float(value) * float(arg)
    except (TypeError, ValueError):
        return ''

@register.filter
def category_name(categories, category_id):
    """
    categories: a dict like {'mens': {...}, 'womens': {...}}
    category_id: the current category key like 'mens'
    returns: the category['name'] value
    """
    try:
        return categories[category_id]["name"]
    except Exception:
        return ""