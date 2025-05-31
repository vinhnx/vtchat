import { PricingTable } from '@clerk/nextjs'

export default function Page() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance" style={{ marginTop: '8rem' }}>
            VT has plans that grow with you
        </h1>
        <p className="text-muted-foreground text-xl" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Explore how AI can help you with everyday tasks. Level up productivity and creativity with expanded access.
        </p>
        <PricingTable />
    </div>
  )
}