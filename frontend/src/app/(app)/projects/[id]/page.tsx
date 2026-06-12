export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <h1 className="text-ink text-2xl font-semibold">Projet {id}</h1>;
}
