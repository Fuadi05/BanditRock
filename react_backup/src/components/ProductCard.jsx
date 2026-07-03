import { Link } from 'react-router-dom'

function Stars() {
  return null
}

export default function ProductCard({ product }) {
  const { id, name, image, price } = product
  return (
    <Link to={`/produk/${id}`} className="product-card">
      <div className="product-card-img">
        {image
          ? <img src={image} alt={name} />
          : <div className="product-img-ph">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>{name}</span>
            </div>
        }

      </div>
      <div className="product-card-body">
        <div className="product-card-name">{name}</div>
        <div className="price-row">
          <span className="product-price">{price}</span>
        </div>
      </div>
    </Link>
  )
}

export { Stars }
