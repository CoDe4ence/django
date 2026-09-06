from django import template

register = template.Library()

ICON_MAP = {
    "mens": "user",
    "womens": "user-female",
    "jewelry": "gem",
    "featured": "star",
}

@register.filter
def icon_for_category(category_id):
    """
    Returns the correct FontAwesome icon name for a category.
    If category isn't in ICON_MAP, return a default icon.
    """
    return ICON_MAP.get(category_id, "question-circle")
