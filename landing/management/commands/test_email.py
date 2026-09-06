import os
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings


class Command(BaseCommand):
    help = 'Test email configuration'

    def handle(self, *args, **options):
        self.stdout.write('Testing email configuration...')

        self.stdout.write(f'EMAIL_HOST: {settings.EMAIL_HOST}')
        self.stdout.write(f'EMAIL_PORT: {settings.EMAIL_PORT}')
        self.stdout.write(f'EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}')
        self.stdout.write(f'EMAIL_USE_SSL: {settings.EMAIL_USE_SSL}')
        self.stdout.write(f'EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}')

        try:
            send_mail(
                subject='Test Email from Django',
                message='This is a test email from your Django application.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=['mknowledge3@gmail.com'],  # Change this to your email
                fail_silently=False,
            )
            self.stdout.write(
                self.style.SUCCESS('✅ Email sent successfully!')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Failed to send email: {str(e)}')
            )