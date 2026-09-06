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

from django.shortcuts import redirect
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from django.conf import settings
import requests
import urllib.parse
from django.utils.html import escape
from .models import ContactMessage

def send_whatsapp_notification(phone, api_key, message):
    if not phone or not api_key:
        return
    try:
        encoded_message = urllib.parse.quote(message)
        url = f"https://api.callmebot.com/whatsapp.php?phone={phone}&apikey={api_key}&text={encoded_message}"
        requests.get(url, timeout=10)
    except Exception as e:
        print("WhatsApp notification error:", e)

def contact_view(request):

    # Capture prefilled query parameters or defaults
    name = request.POST.get("name", "")
    email = request.POST.get("email", "")
    service = request.POST.get("service", request.GET.get("service", ""))
    message_text = request.POST.get("message", "")

    if request.method == "POST":

        # Sanitize inputs
        safe_name = escape(name)
        safe_email = escape(email)
        safe_service = escape(service)
        safe_message = escape(message_text)

        # Save to database
        ContactMessage.objects.create(
            name=name,
            email=email,
            service=service,
            message=message_text
        )

        # Prepare Brevo client
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key["api-key"] = settings.BREVO_API_KEY

        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
            sib_api_v3_sdk.ApiClient(configuration)
        )

        contact_email = settings.CONTACT_EMAIL

        email_data = sib_api_v3_sdk.SendSmtpEmail(
            sender={"name": "khume Website", "email": "info@khume.co.za"},
            to=[{"email": contact_email}],
            reply_to={"email": email},
            subject=f"New Contact Form Message ({safe_service})",
            html_content=f"""
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7; padding:40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); font-family:Arial, sans-serif;">
                    <tr>
                      <td style="background:linear-gradient(90deg, #6b21a8, #2563eb); padding:30px; text-align:center;">
                        <h1 style="color:white; margin:0; font-size:24px; font-weight:700; letter-spacing:0.5px;">New Contact Form Message</h1>
                        <p style="color:#e9d5ff; margin-top:8px; font-size:14px;">A new enquiry has been submitted via the Khume website.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:30px;">
                        <h2 style="font-size:20px; font-weight:600; color:#333; margin-top:0;">Lead Details</h2>
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px; color:#444; font-size:15px;">
                          <tr><td width="30%" style="font-weight:600; padding:8px 0;">Name:</td><td>{safe_name}</td></tr>
                          <tr><td width="30%" style="font-weight:600; padding:8px 0;">Email:</td><td>{safe_email}</td></tr>
                          <tr><td width="30%" style="font-weight:600; padding:8px 0;">Service:</td><td>{safe_service}</td></tr>
                        </table>
                        <div style="margin-top:25px; padding:18px; background:#fafafa; border-left:4px solid #6b21a8; border-radius:8px;">
                          <h3 style="margin-top:0; margin-bottom:10px; font-size:16px; color:#333;">Message</h3>
                          <p style="white-space:pre-line; margin:0; font-size:15px; line-height:1.6; color:#555;">{safe_message}</p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f9fafb; padding:20px; text-align:center; font-size:12px; color:#999;">
                        <p style="margin:4px 0;">Khume Web Design & Development</p>
                        <p style="margin:4px 0;">hello@khume.co.za</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            """
        )

        confirmation_email = sib_api_v3_sdk.SendSmtpEmail(
            to=[{"email": email}],
            sender={"email": "info@khume.co.za", "name": "khume Web Design"},
            subject="We've received your message – Thank you!",
            html_content=f"""
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7; padding:40px 0;">
              <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); font-family:Arial, sans-serif;">
                  <tr>
                    <td style="background:linear-gradient(90deg, #6b21a8, #2563eb); padding:30px; text-align:center;">
                      <h1 style="color:white; margin:0; font-size:24px; font-weight:700;">Thank You for Reaching Out</h1>
                      <p style="color:#e9d5ff; margin-top:8px; font-size:14px;">We've received your message and will get back to you soon.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:30px;">
                      <p style="font-size:16px; color:#333; margin-top:0;">Hi {safe_name},</p>
                      <p style="font-size:15px; color:#555; line-height:1.6;">Thank you for contacting <strong>Khume Web Design</strong>. Your enquiry has been received successfully and our team is now reviewing your project details.</p>
                      <h3 style="margin-top:25px; font-size:16px; color:#333;">Your Submission:</h3>
                      <div style="background:#fafafa; border-left:4px solid #6b21a8; padding:15px; border-radius:8px; font-size:14px; color:#555;">
                        <p style="margin:0;"><strong>Service:</strong> {safe_service}</p>
                        <p style="margin-top:8px; white-space:pre-line;"><strong>Message:</strong><br>{safe_message}</p>
                      </div>
                      <p style="font-size:15px; color:#555; margin-top:25px; line-height:1.6;">We usually respond within <strong>24–48 hours</strong>.</p>
                      <p style="margin-top:25px; font-size:15px; color:#333;">Warm regards,<br><strong>Khume Team</strong></p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f9fafb; padding:20px; text-align:center; font-size:12px; color:#999;">
                      <p style="margin:4px 0;">Khume Web Design & Development</p>
                      <p style="margin:4px 0;">hello@khume.co.za</p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
            """
        )

        send_whatsapp_notification(
            phone=settings.WHATSAPP_PHONE,
            api_key=settings.WHATSAPP_API_KEY,
            message=f"New enquiry from {name}. Service: {service}. Check your email."
        )

        try:
            api_instance.send_transac_email(email_data)
            api_instance.send_transac_email(confirmation_email)
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