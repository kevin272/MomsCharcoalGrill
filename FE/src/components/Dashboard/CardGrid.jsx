export default function CardGrid({ items, renderItem }) {
  return (
    <div className="row">
      {items.map((item) => (
        <div key={item._id} className="col-md-3 mb-3">
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
