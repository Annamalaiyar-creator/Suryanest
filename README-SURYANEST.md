# SURYANEST website

Seven primary pages plus privacy information. Brand assets are supplied originals. The assembly photograph is a reference image, not a photograph of the confirmed Solaryaan configuration.

## Configuration

Edit `lib/site-config.ts` for contact details, approved demo video, published document links and company wording. Empty WhatsApp/video/document entries are intentionally not shown. The supplied manual remains a technical review copy and is not published as approved installation guidance.

## Enquiries

`POST /api/enquiries` validates and saves quote, demonstration, distributor and support submissions to the `enquiries` D1 table. It returns a reference only after storage succeeds. Support photos are stored privately in R2. No public endpoint lists enquiries or serves uploaded photographs. Account owners can review records through the Site database tools. Email, WhatsApp alerts and CRM delivery are not configured; no notifications are promised by the UI. Configure notifications and staff response ownership before a public marketing campaign.

Fields include enquiry kind, contact details, payload, campaign query string, consent, submission time and a hashed network identifier for throttling. Server-side honeypot, minimum completion time, same-origin check, bounded input lengths, attachment checks and hourly throttling are enabled.

## Content limits

Only the 3 kW single-phase Solaryaan reference is shown. No prices, warranty durations, invented performance statistics or district appointments are published. Other configurations require team confirmation.

## Local verification

Generate and apply D1 migrations before testing submissions. Build with the Sites build helper. The website starts private. Confirm legal entity, warranty acceptance, approved manuals, contact number and enquiry handling before opening public access.
