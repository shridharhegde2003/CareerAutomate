import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def send_otp_email(to_email: str, otp: str):
    sender_email = os.getenv("MAIL_USERNAME")
    sender_password = os.getenv("MAIL_PASSWORD")
    
    if not sender_email or not sender_password:
        print("Mail credentials not found")
        return False

    subject = "Your Verification Code - CareerAutomate"
    body = f"""
    <html>
        <body>
            <h2>Welcome to CareerAutomate!</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #4F46E5; letter-spacing: 5px;">{otp}</h1>
            <p>This code will expire in 10 minutes.</p>
        </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
