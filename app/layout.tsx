import type { Metadata } from 'next';
import { SiteChrome } from '@/components/site';
import './globals.css';
export const metadata: Metadata = {
 title: {default: 'SURYANEST | Preassembled Solar Integrated Power Unit', template: '%s | SURYANEST'},
 description: 'Explore SURYANEST integrated solar power units for installers and EPC companies. Request a configuration, arrange a demonstration or apply for district distributorship.',
 icons: {icon:'/assets/suryanest-logo.png'},
 openGraph: {title:'SURYANEST — Integrated Power Unit',description:'Preassembled power. Simpler solar installation.',images:['/assets/assembly.jpg']},
};
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"/></head><body><a className="skip" href="#main">Skip to content</a><SiteChrome>{children}</SiteChrome></body></html>;
}
