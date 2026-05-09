# B&D Freight Partner — Public Compliance Website

Public-facing static website supporting Twilio A2P verification, SMS compliance requirements, driver intake workflows, and business verification pages for B&D Freight Partner.

---

## Production Purpose

This repository hosts the production compliance website used for:

- Twilio A2P registration and verification
- SMS disclosure and consent requirements
- Public privacy policy and terms pages
- Driver application and prequalification workflows
- Lightweight public business presence

---

## Technology Stack

- Cloudflare Pages
- Cloudflare DNS
- Static HTML/CSS/JavaScript
- Netlify Functions
- Twilio A2P compliance integration

---

## Production Site

```text
https://bdfreightpartner.com
```

---

## Repository Structure

```text
/netlify/functions   -> lightweight backend handlers
/*.html              -> public-facing compliance and application pages
/styles.css          -> site styling
/_headers            -> response and caching headers
/_redirects          -> route handling and redirects
```

---

## Twilio Compliance URLs

### Privacy Policy

```text
https://bdfreightpartner.com/privacy-policy.html
```

### Terms & Conditions

```text
https://bdfreightpartner.com/terms.html
```

---

## Deployment

Production deployment is handled through:

- Cloudflare Pages
- GitHub integration
- Automated deployment workflows

---

## Notes

This repository is intentionally lightweight and compliance-oriented.

No sensitive credentials, internal operational systems, or private infrastructure components are stored in this repository.
