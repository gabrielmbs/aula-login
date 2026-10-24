export default function Loading() {
  return (
    <div className="page-loading" role="status" aria-label="Carregando dados">
      <span className="sr-only">Carregando dados...</span>
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-description" />
      <div className="skeleton skeleton-panel" />
    </div>
  );
}
