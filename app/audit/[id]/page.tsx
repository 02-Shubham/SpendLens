export default function AuditPage({ params }: { params: { id: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Audit Results</h1>
      <p>Audit ID: {params.id}</p>
    </main>
  );
}
