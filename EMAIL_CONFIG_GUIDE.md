# Email Configuration Guide

## Environment Variables

Add these variables to your `.env` file:

```bash
SMTP_HOST=your-smtp-server
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-password-or-app-password
EMAIL_USE_SSL=true
```

## Common Provider Configurations

### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Not your regular password!
EMAIL_USE_SSL=true
```

**Gmail Setup Steps:**
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account Settings > Security > App Passwords
3. Generate an App Password for "Mail"
4. Use the generated 16-character password as `SMTP_PASSWORD`

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
EMAIL_USE_SSL=true
```

### Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASSWORD=your-app-password
EMAIL_USE_SSL=true
```

### Custom SMTP Server
```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587  # or 465 for SSL
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-password
EMAIL_USE_SSL=true
```

## Port Information

- **Port 587**: STARTTLS (recommended) - set `EMAIL_USE_SSL=true`
- **Port 465**: SSL/TLS - set `EMAIL_USE_SSL=true`
- **Port 25**: No encryption (not recommended) - set `EMAIL_USE_SSL=false`

## Testing Configuration

After setting up your SMTP configuration:

1. Generate a document in your CRM
2. Try sending it via email
3. Check the console logs for any SMTP errors
4. Verify the email was received

## Troubleshooting

### Common Errors:

| Error | Cause | Solution |
|-------|--------|----------|
| "Authentication failed" | Wrong username/password | Check credentials, use app passwords for Gmail |
| "Connection timeout" | Wrong host/port | Verify SMTP server settings |
| "SSL/TLS error" | SSL misconfiguration | Check EMAIL_USE_SSL setting and port |
| "Self signed certificate" | Certificate issues | Contact your email provider |

### Debug Tips:

1. Enable SMTP debugging in development
2. Check firewall settings for SMTP ports
3. Verify email provider allows SMTP access
4. Use app passwords instead of regular passwords when available
