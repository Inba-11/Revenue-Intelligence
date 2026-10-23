export default function PageHeader({ title, subtitle, actions, crumb }) {
  return (
    <div className="page-head">
      <div>{crumb}<h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
      {actions && <div className="row">{actions}</div>}
    </div>
  );
}
