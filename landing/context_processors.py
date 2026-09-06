import os

def ga_measurement_id(request):
    """
    Context processor to add the Google Analytics Measurement ID to all templates.
    """
    return {
        'GA_MEASUREMENT_ID': os.environ.get('GA_MEASUREMENT_ID', '')
    }
