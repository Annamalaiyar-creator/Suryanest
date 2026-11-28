import { formatWhatsAppNumber, siteConfig } from '@/lib/site-config';

const requiredCommon = ['name', 'email', 'phone', 'state', 'district'];

function buildEnquiryWhatsApp(
  kind: string,
  fields: Record<string, string>,
  reference: string,
): { url: string; message: string } {
  const rawNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    process.env.SURYANEST_WHATSAPP_NUMBER ||
    process.env.WHATSAPP_NUMBER ||
    siteConfig.whatsapp ||
    '';
  const phone = formatWhatsAppNumber(rawNumber);
  const location = [fields.district, fields.state].filter(Boolean).join(', ');
  const heading =
    kind === 'distributor'
      ? 'NEW DISTRIBUTOR APPLICATION'
      : kind === 'demo'
        ? 'NEW PRODUCT DEMO REQUEST'
        : kind === 'support'
          ? 'NEW PRODUCT SUPPORT REQUEST'
          : 'NEW QUOTE ENQUIRY';
  const specificLines =
    kind === 'distributor'
      ? [
          `SERVICE AREA - ${fields.area}`,
          `BUSINESS - ${fields.business}`,
          `EXPERIENCE - ${fields.experience}`,
          `INSTALLER NETWORK - ${fields.network}`,
          `OFFICE - ${fields.office}`,
          `WAREHOUSE - ${fields.warehouse}`,
          `INVESTMENT - ${fields.investment}`,
          `EPC PROJECTS - ${fields.epc}`,
          `MESSAGE - ${fields.message || 'N/A'}`,
        ]
      : kind === 'support'
        ? [
            `MODEL - ${fields.model}`,
            `SERIAL NO - ${fields.serial}`,
            `SITE LOCATION - ${fields.site}`,
            `FAULT CODE - ${fields.fault || 'None'}`,
            `PHOTOS - Please attach any photographs directly in WhatsApp`,
            `ISSUE - ${fields.message}`,
          ]
        : [
            `CAPACITY - ${fields.capacity}`,
            `QUANTITY - ${fields.quantity}`,
            `TIMELINE - ${fields.timeline}`,
            `MESSAGE - ${fields.message || 'N/A'}`,
          ];
  const rawLines = [
    heading,
    `NAME - ${fields.name}`,
    ...(fields.company ? [`COMPANY - ${fields.company}`] : []),
    `PHONE - ${fields.phone}`,
    `EMAIL - ${fields.email}`,
    ...(fields.role ? [`ROLE - ${fields.role}`] : []),
    `LOCATION - ${location}`,
    ...specificLines,
    `REFERENCE - ${reference}`,
  ];
  const whatsappLines = rawLines.map((line) => {
    const nonBreaking = line.replace(/ /g, '\u00A0').replace(/-/g, '\u2011');
    return nonBreaking.padEnd(46, '\u00A0');
  });
  const message = rawLines.join('\n');
  const whatsappText = whatsappLines.join('\n');
  return { url: `https://wa.me/${phone}?text=${encodeURIComponent(whatsappText)}`, message };
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host && new URL(origin).host !== host) {
    return Response.json({ error: 'Please submit the form from this website.' }, { status: 403 });
  }
  if (Number(request.headers.get('content-length') || 0) > 1 * 1024 * 1024) {
    return Response.json({ error: 'Please keep the request under 1 MB.' }, { status: 413 });
  }
  try {
    const form = await request.formData();
    const kind = String(form.get('kind') || '');
    if (!['quote', 'demo', 'distributor', 'support'].includes(kind)) {
      return Response.json({ error: 'Select a valid enquiry type.' }, { status: 400 });
    }
    const started = Number(form.get('started'));
    if (
      form.get('website') ||
      !Number.isFinite(started) ||
      started <= 0 ||
      Date.now() - started < 1500 ||
      Date.now() - started > 86400000
    ) {
      return Response.json({ error: 'Please review your details and try again.' }, { status: 400 });
    }
    const fields: Record<string, string> = {};
    const allowed = [
      'name', 'email', 'phone', 'company', 'state', 'district', 'role', 'area', 'business',
      'experience', 'network', 'office', 'warehouse', 'investment', 'epc', 'model', 'serial',
      'site', 'fault', 'capacity', 'quantity', 'timeline', 'message', 'source',
    ];
    for (const k of allowed) {
      const v = String(form.get(k) || '').trim();
      if (v.length > (k === 'message' ? 2500 : k === 'source' ? 1000 : 200)) {
        return Response.json({ error: 'One of the fields is too long.' }, { status: 400 });
      }
      fields[k] = v;
    }
    const required = [
      ...requiredCommon,
      ...(kind === 'distributor'
        ? ['company', 'role', 'area', 'business', 'experience', 'network', 'office', 'warehouse', 'investment', 'epc']
        : kind === 'support'
          ? ['model', 'serial', 'site', 'message']
          : ['role', 'capacity', 'quantity', 'timeline']),
    ];
    if (required.some((k) => !fields[k]) || form.get('consent') !== 'on') {
      return Response.json({ error: 'Please complete all required fields and consent.' }, { status: 400 });
    }
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) ||
      !/^\+?[\d() -]{8,20}$/.test(fields.phone) ||
      fields.phone.replace(/\D/g, '').length < 8
    ) {
      return Response.json({ error: 'Please enter a valid email and mobile number.' }, { status: 400 });
    }
    if (
      (kind === 'quote' || kind === 'demo') &&
      (!Number.isInteger(Number(fields.quantity)) || Number(fields.quantity) < 1 || Number(fields.quantity) > 100000)
    ) {
      return Response.json({ error: 'Enter a valid quantity.' }, { status: 400 });
    }
    const reference = 'SN-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    const whatsapp = buildEnquiryWhatsApp(kind, fields, reference);
    return Response.json(
      { reference, whatsappUrl: whatsapp.url, whatsappMessage: whatsapp.message },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return Response.json({ error: 'Your enquiry could not be prepared. Please try again.' }, { status: 500 });
  }
}