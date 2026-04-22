# B & D Freight Partners — Recruitment Funnel

## Overview

A production-ready recruitment funnel designed to onboard freight partners through a structured pre-qualification and application workflow.

The system captures, filters, and routes candidate data while supporting scalable partner acquisition through automated communication and serverless processing.

---

## Live Demo

👉 https://bdfreightpartners.com

## Tech Stack

* **Netlify** — Hosting and serverless backend (Functions)
* **Cloudflare** — DNS, security, and performance optimization
* **Twilio** — SMS messaging and campaign workflows
* **Resend** — Transactional email delivery

---

## Key Features

* End-to-end freight partner recruitment funnel
* Pre-qualification logic to filter candidates before full application
* Multi-step application flow with structured data capture
* Automated success and redirect handling
* Disqualification routing for non-qualified applicants
* Turnstile bot protection (Cloudflare)
* Serverless backend for secure form processing
* SMS and email communication integration

---

## Compliance & Messaging

* Privacy Policy and Terms of Service implemented
* Designed to align with Twilio messaging compliance standards
* User consent collection integrated into application flow

---

## System Architecture

* Static frontend served via Netlify
* Serverless functions handle form submissions and validation
* External services (Twilio, Resend) manage communication workflows
* Cloudflare provides security, DNS, and performance layer

---

## Current Status

* Live production deployment
* Fully functional pre-qualification → application → confirmation flow
* Bot protection and validation implemented
* Twilio campaign submitted for approval
* Ongoing refinement for scalability and maintainability

---

## Roadmap

* Enhanced UI/UX and validation improvements
* Lead tracking and workflow state management
* Integration with internal Lanetool system
* Expanded compliance and messaging safeguards

---

## File Structure

* `index.html` — Landing page
* `prequal.html` — Pre-qualification flow
* `apply.html` — Application form
* `thank-you.html` — Submission confirmation
* `not-a-fit.html` — Disqualification page
* `privacy-policy.html` — Compliance documentation
* `terms.html` — Messaging terms
* `netlify/functions/` — Serverless backend logic

---

## Author

Christopher Wallace
