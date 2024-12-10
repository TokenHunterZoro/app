import os
import ssl
import certifi

def configure_ssl():
    # Set SSL context to use certifi
    os.environ['SSL_CERT_FILE'] = certifi.where()
    os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()
    
    # Create unverified context
    ssl._create_default_https_context = ssl._create_unverified_context

if __name__ == "__main__":
    configure_ssl()