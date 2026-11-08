export default function SkeletonRows({ rows = 6 }) {
  return (
    <div className="skeleton-rows" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="skeleton-rows__row" key={index}>
          <span className="skeleton-rows__thumb" />
          <span className="skeleton-rows__line skeleton-rows__line--wide" />
          <span className="skeleton-rows__line" />
          <span className="skeleton-rows__line skeleton-rows__line--short" />
        </div>
      ))}
    </div>
  );
}
