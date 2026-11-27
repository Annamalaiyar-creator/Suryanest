import Link from 'next/link';
import type { Metadata } from 'next';
import { Shell, PageIntro, Eyebrow, FAQ, Button, DemoSection } from '@/components/site';
import { siteConfig } from '@/lib/site-config';
export const metadata: Metadata = { title: 'Resources & Support', description: 'Understand SURYANEST supply scope, installation responsibilities, warranty records and support enquiries.' };
export default function Resources() {
    return <Shell><PageIntro eyebrow="KNOWLEDGE FOR THE INSTALLATION" title={<>Clear information.<br /><span>At the right moment.</span></>} description="Understand the assembly, prepare for site work and keep the right records for operation and support." />
        <section className="container section resource-rows">
            <div className="demo-section resource-row">
                <div className="resource-block"><Eyebrow>PRODUCT DOCUMENTATION</Eyebrow><h2>The right guide<br />for your unit.</h2><p>Request the approved installation guide, exact inverter manual and datasheets for your confirmed configuration.</p>{siteConfig.documents.map(d => <a className="document-link" href={d.url} key={d.url} download>{d.title}</a>)}<Button href="/contact?type=quote" secondary>Request product documents</Button></div>
                <Link href="/contact?type=quote" className="demo-image resource-side-image"><img loading="lazy" src="/assets/product-manuals.jpg?v=10" alt="SURYANEST technical installation guide manual and specification datasheet" /></Link>
            </div>
            <div className="demo-section resource-row">
                <Link href="/contact?type=support" className="demo-image resource-side-image"><img loading="lazy" src="/assets/service-records.jpg?v=3" alt="Invoice, warranty certificates and service records on desk" /></Link>
                <div className="resource-block"><Eyebrow>WARRANTY & SERVICE</Eyebrow><h2>Start with<br />the right records.</h2><p>Warranty coverage follows the invoice, manufacturer certificates and written supply terms. Installation workmanship follows the installer’s agreement.</p><p>For support, share the model, unit or inverter serial, fault code, site location and commissioning details.</p><Button href="/contact?type=support" secondary>Contact product support</Button></div>
            </div>
        </section>
        <DemoSection /><section className="tinted"><div className="container section faq-section"><div><Eyebrow>FREQUENTLY ASKED QUESTIONS</Eyebrow><h2>Understand<br />before you install.</h2><p>Use the exact equipment manuals and approved project drawings for technical installation decisions.</p></div><FAQ all /></div></section></Shell>
}
