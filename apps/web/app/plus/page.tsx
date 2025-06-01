import { PricingTable } from '@clerk/nextjs'

export default function Page() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
        <h1 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0" style={{ textAlign: 'center', marginTop: '8rem' }}>
            VT has plans that grow with you
        </h1>
        <p className="text-muted-foreground text-m" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Explore how AI can help you with everyday tasks. Level up productivity and creativity with expanded access. Try VT+ today!
        </p>
        <PricingTable />
    </div>
  )
}