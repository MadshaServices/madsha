export default function OurPromisePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-16">

        <h1 className="text-4xl font-extrabold mb-12 text-center">
          Our Promise
        </h1>

        {/* Customers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">
            To Our Customers
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li>• Lightning-fast delivery in just 20–30 minutes</li>
            <li>• Authentic products from trusted local stores</li>
            <li>• Seamless and convenient shopping experience</li>
            <li>• Supporting local businesses and communities</li>
          </ul>
        </div>

        {/* Shop Owners */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-green-600">
            To Local Shop Owners
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li>• Complete control over your shop dashboard</li>
            <li>• Manage products, inventory & sales reports</li>
            <li>• No middlemen – grow your business directly</li>
            <li>• Reach more online and local customers</li>
          </ul>
        </div>

        {/* Delivery Partners */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-yellow-600">
            To Our Delivery Partners
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li>• Flexible working hours</li>
            <li>• Local deliveries in your own area</li>
            <li>• Equal earning opportunities</li>
            <li>• On-time and fair payments</li>
          </ul>
        </div>

      </div>
    </div>
  )
}