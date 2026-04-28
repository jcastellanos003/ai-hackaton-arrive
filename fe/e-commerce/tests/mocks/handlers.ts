import { http, HttpResponse } from 'msw'

export const mockProducts = [
  {
    id: '1',
    name: 'Premium Sneakers',
    description: 'Comfortable everyday sneakers',
    price: 129.99,
    category: 'Footwear',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff'],
    inventory: 20,
    rating: 4.5,
    tags: ['shoes', 'casual'],
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Minimal Watch',
    description: 'Clean and elegant timepiece',
    price: 249.99,
    category: 'Accessories',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30'],
    inventory: 3,
    rating: 4.8,
    isFeatured: false,
  },
  {
    id: '3',
    name: 'Leather Wallet',
    description: 'Slim full-grain leather wallet',
    price: 79.99,
    category: 'Accessories',
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93'],
    inventory: 0,
    isFeatured: false,
  },
  {
    id: '4',
    name: 'Canvas Tote',
    description: 'Everyday carry bag',
    price: 59.99,
    category: 'Bags',
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363'],
    inventory: 15,
    rating: 4.2,
    isFeatured: false,
  },
]

const mockCartWithItems = {
  id: 'cart-1',
  items: [
    {
      productId: '1',
      product: mockProducts[0],
      quantity: 2,
    },
  ],
  subtotal: 259.98,
  taxes: 20.80,
  shipping: 0,
  total: 280.78,
}

const mockEmptyCart = {
  id: 'cart-1',
  items: [],
  subtotal: 0,
  taxes: 0,
  shipping: 0,
  total: 0,
}

export { mockEmptyCart, mockCartWithItems }

export const handlers = [
  // Products — paginated response
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const search = url.searchParams.get('search')

    let results = [...mockProducts]
    if (category) results = results.filter((p) => p.category === category)
    if (search) results = results.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

    return HttpResponse.json({
      data: results,
      meta: { page: 1, limit: 20, total: results.length, totalPages: 1 },
    })
  }),

  http.get('/api/products/categories', () =>
    HttpResponse.json({
      data: [
        { name: 'Footwear', count: 1 },
        { name: 'Accessories', count: 2 },
        { name: 'Bags', count: 1 },
      ],
    })
  ),

  http.get('/api/products/:productId/related', ({ params }) => {
    const product = mockProducts.find((p) => p.id === params.productId)
    if (!product) return new HttpResponse(null, { status: 404 })
    const related = mockProducts.filter((p) => p.category === product.category && p.id !== product.id)
    return HttpResponse.json({ data: related })
  }),

  http.get('/api/products/:productId', ({ params }) => {
    const product = mockProducts.find((p) => p.id === params.productId)
    if (!product)
      return HttpResponse.json({ error: 'Product not found', code: 'PRODUCT_NOT_FOUND' }, { status: 404 })
    return HttpResponse.json(product)
  }),

  // Cart — session-based, all mutations return updated cart
  http.get('/api/cart', () => HttpResponse.json(mockEmptyCart)),

  http.post('/api/cart/items', async ({ request }) => {
    const body = (await request.json()) as { productId: string; quantity: number }
    const product = mockProducts.find((p) => p.id === body.productId)
    if (!product)
      return HttpResponse.json({ error: 'Product not found', code: 'PRODUCT_NOT_FOUND' }, { status: 404 })
    if (body.quantity > product.inventory)
      return HttpResponse.json(
        { error: `Only ${product.inventory} items left in stock`, code: 'INSUFFICIENT_INVENTORY' },
        { status: 400 }
      )
    return HttpResponse.json({
      ...mockEmptyCart,
      items: [{ productId: body.productId, product, quantity: body.quantity }],
    })
  }),

  http.patch('/api/cart/items/:productId', async ({ params, request }) => {
    const body = (await request.json()) as { quantity: number }
    const product = mockProducts.find((p) => p.id === params.productId)
    if (!product)
      return HttpResponse.json({ error: 'Item not in cart', code: 'CART_ITEM_NOT_FOUND' }, { status: 404 })
    return HttpResponse.json({
      ...mockEmptyCart,
      items: [{ productId: params.productId, product, quantity: body.quantity }],
    })
  }),

  http.delete('/api/cart/items/:productId', () => HttpResponse.json(mockEmptyCart)),

  http.delete('/api/cart', () => HttpResponse.json({ message: 'Cart cleared' })),

  // Orders
  http.post('/api/orders', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const shipping = body.shipping as Record<string, string>
    return HttpResponse.json(
      {
        id: 'order-test-001',
        orderNumber: 'BM-2026-00001',
        status: 'processing',
        items: mockCartWithItems.items.map((i) => ({
          productId: i.productId,
          productName: i.product.name,
          productImage: i.product.images[0],
          price: i.product.price,
          quantity: i.quantity,
        })),
        subtotal: mockCartWithItems.subtotal,
        taxes: mockCartWithItems.taxes,
        shipping: mockCartWithItems.shipping,
        total: mockCartWithItems.total,
        customerName: `${shipping?.firstName ?? 'Test'} ${shipping?.lastName ?? 'User'}`,
        email: shipping?.email ?? 'test@example.com',
        estimatedDelivery: '2026-05-05',
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    )
  }),

  http.get('/api/orders/:orderId', ({ params }) => {
    if (params.orderId !== 'order-test-001')
      return HttpResponse.json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' }, { status: 404 })
    return HttpResponse.json({
      id: 'order-test-001',
      orderNumber: 'BM-2026-00001',
      status: 'processing',
      estimatedDelivery: '2026-05-05',
      createdAt: new Date().toISOString(),
    })
  }),
]
