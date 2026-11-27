import type {Metadata} from 'next';
import {Suspense} from 'react';
import ContactContent from '@/components/contact-content';
export const metadata:Metadata={title:'Contact & Enquiries',description:'Request a SURYANEST quotation, arrange a product demonstration or send a support enquiry.'};
export default function Contact(){return <Suspense><ContactContent/></Suspense>}
