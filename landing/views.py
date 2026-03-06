import os

from django.shortcuts import render
from django.views.generic import TemplateView


class HomeView(TemplateView):
    template_name = 'landing/index.html'

def services_view(request):
    # Track page view
    request.session['ga_event'] = 'view_services'
    ga_event = request.session.get('ga_event')

    # Clear it safely
    request.session.pop('ga_event', None)
    return render(request, 'landing/services.html', {'ga_event': ga_event})



class PortfolioView(TemplateView):
    template_name = 'landing/portfolio.html'

class AboutView(TemplateView):
    template_name = 'landing/about.html'

def school_portal(request):
    return render(request, "portfolios/portfolio_school_portal.html")

def business_site(request):
    return render(request, "portfolios/portfolio_business_site.html")

def ecommerce(request):
    return render(request, "portfolios/portfolio_ecommerce.html")


# landing/views.py
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from django.conf import settings
from django.shortcuts import render
from django.http import HttpResponseRedirect

import requests
import urllib.parse
from requests.exceptions import RequestException

def send_whatsapp_notification(phone, api_key, message):
    try:
        encoded_message = urllib.parse.quote(message)
        url = f"https://api.callmebot.com/whatsapp.php?phone={phone}&apikey={api_key}&text={encoded_message}"
        requests.get(url, timeout=10)
    except RequestException as e:
        print("WhatsApp notification error:", e)

def contact_view(request):

    # Capture prefilled query parameters or defaults
    name = request.POST.get("name", "")
    email = request.POST.get("email", "")
    service = request.POST.get("service", request.GET.get("service", ""))
    message_text = request.POST.get("message", "")

    if request.method == "POST":

        # Prepare Brevo client
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key["api-key"] = settings.BREVO_API_KEY

        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
            sib_api_v3_sdk.ApiClient(configuration)
        )

        from django.template.loader import render_to_string
        context = {'name': name, 'email': email, 'service': service, 'text_message': message_text}
        admin_html = render_to_string('emails/admin_notification.html', context)
        user_html = render_to_string('emails/user_confirmation.html', context)

        email_data = sib_api_v3_sdk.SendSmtpEmail(
            sender={"name": "khume Website", "email": "info@khume.co.za"},
            to=[{"email": "mknowledge3@gmail.com"}],
            reply_to={"email": email},
            subject=f"New Contact Form Message ({service})",
            html_content=admin_html
        )
        # Send confirmation email to client
        confirmation_email = sib_api_v3_sdk.SendSmtpEmail(
            to=[{"email": email}],
            sender={"email": "info@khume.co.za", "name": "khume Web Design"},
            subject="We've received your message – Thank you!",
            html_content=user_html
        )
        send_whatsapp_notification(
            phone=getattr(settings, 'WHATSAPP_PHONE', ''),
            api_key=getattr(settings, 'CALLMEBOT_API_KEY', ''),
            message=f"New enquiry from {name}. Service: {service}. Check your email."
        )

        api_instance.send_transac_email(confirmation_email)

        try:
            api_instance.send_transac_email(email_data)
        except ApiException as e:
            print("Brevo Error:", e)

        return redirect("/contact?success=1")

    return render(request, "landing/contact.html", {
        "name": name,
        "email": email,
        "service": service,
        "message": message_text,
    })

class DemosView(TemplateView):
    template_name = 'landing/demos.html'