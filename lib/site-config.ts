export function formatWhatsAppNumber(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

export const siteConfig = {
  name: 'SURYANEST', caption: 'INTEGRATED POWER UNIT',
  whatsapp: formatWhatsAppNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919884330789'), // Configure NEXT_PUBLIC_WHATSAPP_NUMBER (with country code, e.g. 919884330789).
  demoVideo: '', // Add the approved demonstration video URL.
  documents: [] as { title: string; description: string; url: string }[],
  manufacturer: 'Solaryaan', referenceCapacity: '3 kW', referencePhase: 'Single-phase',
  territories: 'Applications are evaluated by location and partner capability. Territory availability is confirmed during discussion.',
  companyRelationship: 'Developed from experience in solar mounting structures and BOS supply. The supplying entity and commercial terms will be confirmed in your quotation.',
};
