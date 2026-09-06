from django.contrib import admin
from .models import ContactMessage

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'service', 'submitted_at')
    search_fields = ('name', 'email', 'service')
    readonly_fields = ('submitted_at',)
