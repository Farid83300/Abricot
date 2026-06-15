export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <h1 className="text-2xl font-semibold text-ink">Projet {id}</h1>;
}
