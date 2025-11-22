from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME="balintka2016@gmail.com",
    MAIL_PASSWORD="kdtmeddvnjsrluei",
    MAIL_FROM="balintka2016@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,

    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,

    SUPPRESS_SEND=False,
    MAIL_FROM_NAME="Mailer"
)
