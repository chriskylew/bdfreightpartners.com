# BD Freight Partners Recruitment Funnel

## Overview
This project is a freight partner recruitment and lead intake funnel.

It enables potential drivers or freight partners to complete a pre-qualification step, submit an application, and enter a communication workflow supported by SMS and email systems.

## Tech Stack
- Netlify (hosting and serverless functions)
- Twilio (SMS campaign and messaging workflows)
- Resend (transactional email delivery)
- Cloudflare (DNS, security, and performance)

## Features
- Landing page for recruiting freight partners
- Pre-qualification flow
- Full application form
- Submission confirmation (thank-you page)
- Disqualification / redirect flow
- Privacy Policy and Terms pages for messaging compliance
- Serverless backend handling via Netlify Functions

## Compliance
- Privacy Policy and Terms pages are live and accessible
- Designed to support Twilio messaging compliance requirements
- SMS and contact consent flows integrated into application process

## Current Status
- Twilio campaign submitted for review
- Funnel is live and deployed
- Forms and redirects are functioning
- Repository is being cleaned and prepared for professional review

## Next Steps
- Expand compliance language as needed
- Improve UI/UX and validation
- Integrate prequal and application flows into the Lanetool system
- Add lead tracking and workflow state management

## File Overview
- `index.html` — main landing page
- `prequal.html` — prequalification step
- `apply.html` — full application form
- `thank-you.html` — confirmation page
- `not-a-fit.html` — fallback/disqualification page
- `privacy-policy.html` — compliance page
- `terms.html` — messaging terms
- `netlify/functions/` — backend/serverless logic

## Author
Christopher Wallace
