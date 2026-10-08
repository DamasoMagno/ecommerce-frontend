const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')

function load(file, mocks = {}, cache = new Map()) {
  const filename = path.resolve(__dirname, '..', file)
  if (cache.has(filename)) return cache.get(filename).exports
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const module = new Module(filename)
  cache.set(filename, module)
  module.filename = filename
  module.paths = Module._nodeModulePaths(path.dirname(filename))
  const originalRequire = module.require.bind(module)
  module.require = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name]
    const localPath = name.startsWith('@/') ? path.resolve(__dirname, '../src', name.slice(2)) : name.startsWith('.') ? path.resolve(path.dirname(filename), name) : null
    if (localPath) {
      for (const suffix of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
        if (fs.existsSync(localPath + suffix)) return load(path.relative(path.resolve(__dirname, '..'), localPath + suffix), mocks, cache)
      }
    }
    return originalRequire(name)
  }
  module._compile(compiled, filename)
  return module.exports
}

const schema = load('src/lib/backoffice/product-schema.ts')
const backendSchema = load('src/lib/backend/schema.ts')
const fixtures = load('src/mocks/catalog.ts')
const mockStore = load('src/lib/backoffice/mock-store.ts', {
  '@/mocks/catalog': fixtures,
  './product-schema': schema,
  '@/lib/backend/schema': backendSchema,
})
const customers = load('src/mocks/customer.ts', { './catalog': fixtures })
const commerce = load('src/mocks/commerce.ts', {
  '@/lib/backoffice/mock-store': mockStore,
  './catalog': fixtures,
  './customer': customers,
  '@/lib/backend/schema': backendSchema,
})
const valid = { name: 'Teclado', slug: 'teclado', description: 'Teclado sem fio', price: 99.9, available: true, imageId: 'image_1' }

test('normaliza acentos no slug e rejeita valores inválidos de preço e campos', () => {
  assert.equal(schema.productSlug('  Café & Açúcar! '), 'cafe-acucar')
  assert.equal(schema.productSchema.safeParse(valid).success, true)
  for (const price of [0, -1, NaN, Infinity, 1.999]) assert.equal(schema.productSchema.safeParse({ ...valid, price }).success, false)
  for (const patch of [{ name: ' ' }, { slug: 'Produto /' }, { description: '' }, { imageId: '' }]) {
    assert.equal(schema.productSchema.safeParse({ ...valid, ...patch }).success, false)
  }
})

test('nega acesso sem sessão ou sem inclusão explícita na lista de administradores', () => {
  const previous = process.env.BACKOFFICE_ADMIN_USER_IDS
  let userId = null
  const access = load('src/lib/backoffice/access.ts', { '@clerk/nextjs': { auth: () => ({ userId }) }, './mock-mode': { isLocalMockAuthenticationEnabled: () => false } })
  try {
    process.env.BACKOFFICE_ADMIN_USER_IDS = 'user_admin'
    assert.throws(() => access.requireBackofficeAccess())
    userId = 'user_customer'
    assert.throws(() => access.requireBackofficeAccess())
    userId = 'user_admin'
    assert.doesNotThrow(() => access.requireBackofficeAccess())
    process.env.BACKOFFICE_ADMIN_USER_IDS = ''
    assert.throws(() => access.requireBackofficeAccess())
  } finally {
    if (previous === undefined) delete process.env.BACKOFFICE_ADMIN_USER_IDS
    else process.env.BACKOFFICE_ADMIN_USER_IDS = previous
  }
})

test('valida entradas no servidor e grava criação/edição somente como rascunho', async () => {
  const saved = { HYGRAPH_ENDPOINT: process.env.HYGRAPH_ENDPOINT, HYGRAPH_ADMIN_TOKEN: process.env.HYGRAPH_ADMIN_TOKEN }
  const requests = []
  let allowed = true
  let fail = false
  class GraphQLClient {
    async request(query, variables) {
      if (fail) throw new Error('secret-provider-details')
      requests.push({ query, variables })
      return query.includes('BackofficeUpdateProduct') ? { updateProduct: { ...valid, id: variables.id } } : { createProduct: { ...valid, id: 'new_id' } }
    }
  }
  const actions = load('src/app/backoffice/produtos/actions.ts', {
    'graphql-request': { GraphQLClient, gql: (strings) => strings.join('') },
    'next/cache': { revalidatePath: () => {} },
    '@/lib/backoffice/access': { requireBackofficeAccess: () => { if (!allowed) throw new Error('denied') } },
    '@/lib/backoffice/product-schema': schema,
    '@/lib/backoffice/mock-mode': { isBackofficeMockEnabled: () => false },
    '@/lib/backoffice/mock-store': mockStore,
  })
  try {
    process.env.HYGRAPH_ENDPOINT = 'https://example.test/graphql'
    process.env.HYGRAPH_ADMIN_TOKEN = 'test-only'
    assert.equal((await actions.saveProduct({ ...valid, price: -1 })).success, false)
    assert.equal(requests.length, 0)
    assert.equal((await actions.saveProduct(valid)).success, true)
    assert.deepEqual(requests[0].variables.data.image, { connect: { id: valid.imageId } })
    assert.equal('imageId' in requests[0].variables.data, false)
    assert.equal((await actions.saveProduct(valid, 'existing_id')).success, true)
    assert.equal(requests[1].variables.id, 'existing_id')
    assert.equal(requests.some(({ query }) => query.includes('publishProduct')), false)
    allowed = false
    await assert.rejects(actions.saveProduct(valid), /denied/)
    await assert.rejects(actions.loadProducts(), /denied/)
    await assert.rejects(actions.loadAssets(), /denied/)
    assert.equal(requests.length, 2)
    allowed = true
    fail = true
    const result = await actions.saveProduct(valid)
    assert.equal(result.success, false)
    assert.equal(result.message.includes('secret-provider-details'), false)
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})

test('fixtures têm IDs e slugs únicos, categorias válidas, preços e imagens', () => {
  assert.equal(fixtures.mockProducts.length, 24)
  assert.equal(fixtures.mockCategories.length, 3)
  assert.equal(new Set(fixtures.mockProducts.map((product) => product.id)).size, 24)
  assert.equal(new Set(fixtures.mockProducts.map((product) => product.slug)).size, 24)
  for (const product of fixtures.mockProducts) {
    assert.equal(schema.productSchema.safeParse({ ...product, imageId: product.image.id }).success, true)
    assert.ok(fixtures.mockCategories.some((category) => category.id === product.categoryId))
    assert.ok(fs.existsSync(path.resolve(__dirname, '../public', product.image.url.slice(1))))
  }
  assert.ok(fixtures.mockProducts.some((product) => !product.available))
  assert.ok(fixtures.mockProducts.some((product) => product.coupon))
})

test('mock pagina sem duplicar produtos e permite busca sem acentos', () => {
  const store = mockStore.createMockCatalog()
  const first = store.list()
  const second = store.list('', first.cursor)
  assert.equal(first.products.length, 20)
  assert.equal(first.hasNextPage, true)
  assert.equal(second.products.length, 4)
  assert.equal(second.hasNextPage, false)
  assert.equal(new Set([...first.products, ...second.products].map((product) => product.id)).size, 24)
  assert.equal(store.list('MEMORIA').products[0].slug, 'memoria-ram-16-gb')
  assert.equal(store.list('não existe').products.length, 0)
  assert.throws(() => store.list('', 'invalid-cursor'))
})

test('mock salva e edita, rejeita slug duplicado e não contamina as fixtures', () => {
  const store = mockStore.createMockCatalog()
  const input = { ...valid, slug: 'novo-produto', imageId: fixtures.mockAssets[0].id }
  const created = store.save(input)
  assert.ok(created.id.startsWith('mock_'))
  assert.equal(store.list().products[0].id, created.id)
  assert.equal(store.save({ ...input, price: 119.9 }, created.id).price, 119.9)
  assert.throws(() => store.save(input), /Já existe/)
  assert.throws(() => store.save({ ...input, slug: 'outra-imagem', imageId: 'missing' }), /imagem válida/)
  assert.throws(() => store.save({ ...input, slug: 'outro-produto' }, 'missing'), /não encontrado/)
  const page = store.list()
  page.products[0].name = 'Mutado externamente'
  assert.notEqual(store.list().products[0].name, 'Mutado externamente')
  assert.equal(mockStore.createMockCatalog().list('novo-produto').products.length, 0)
  assert.equal(fixtures.mockProducts.length, 24)
})

test('mock é ignorado em produção', () => {
  const saved = { NODE_ENV: process.env.NODE_ENV, BACKOFFICE_MOCK_DATA: process.env.BACKOFFICE_MOCK_DATA }
  const mode = load('src/lib/backoffice/mock-mode.ts')
  try {
    process.env.BACKOFFICE_MOCK_DATA = 'true'
    process.env.NODE_ENV = 'development'
    assert.equal(mode.isBackofficeMockEnabled(), true)
    process.env.NODE_ENV = 'production'
    assert.equal(mode.isBackofficeMockEnabled(), false)
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})

test('ações usam o mock sem Hygraph e continuam exigindo acesso administrativo', async () => {
  let allowed = true
  const store = mockStore.createMockCatalog()
  const actions = load('src/app/backoffice/produtos/actions.ts', {
    'graphql-request': { GraphQLClient: class { constructor() { throw new Error('Hygraph não deveria ser chamado') } }, gql: (strings) => strings.join('') },
    'next/cache': { revalidatePath: () => {} },
    '@/lib/backoffice/access': { requireBackofficeAccess: () => { if (!allowed) throw new Error('denied') } },
    '@/lib/backoffice/product-schema': schema,
    '@/lib/backoffice/mock-mode': { isBackofficeMockEnabled: () => true },
    '@/lib/backoffice/mock-store': { getMockCatalog: () => store },
  })
  assert.equal((await actions.loadProducts()).products.length, 20)
  assert.equal((await actions.loadAssets()).length, 4)
  const input = { ...valid, slug: 'produto-teste', imageId: fixtures.mockAssets[0].id }
  assert.equal((await actions.saveProduct(input)).success, true)
  assert.equal((await actions.saveProduct(input)).success, false)
  allowed = false
  await assert.rejects(actions.loadProducts(), /denied/)
  await assert.rejects(actions.loadAssets(), /denied/)
  await assert.rejects(actions.saveProduct(input), /denied/)
})

test('login fictício exige os dois flags e desenvolvimento; produção sempre verifica Clerk', () => {
  const saved = { NODE_ENV: process.env.NODE_ENV, BACKOFFICE_MOCK_DATA: process.env.BACKOFFICE_MOCK_DATA, BACKOFFICE_MOCK_AUTH: process.env.BACKOFFICE_MOCK_AUTH }
  const mode = load('src/lib/backoffice/mock-mode.ts')
  let clerkCalls = 0
  const access = load('src/lib/backoffice/access.ts', {
    './mock-mode': mode,
    '@clerk/nextjs': { auth: () => { clerkCalls += 1; return { userId: null } } },
  })
  try {
    process.env.NODE_ENV = 'development'
    process.env.BACKOFFICE_MOCK_DATA = 'true'
    process.env.BACKOFFICE_MOCK_AUTH = 'true'
    assert.equal(mode.isLocalMockAuthenticationEnabled(), true)
    assert.doesNotThrow(() => access.requireBackofficeAccess())
    assert.equal(clerkCalls, 0)
    process.env.NODE_ENV = 'production'
    assert.equal(mode.isLocalMockAuthenticationEnabled(), false)
    assert.throws(() => access.requireBackofficeAccess())
    assert.equal(clerkCalls, 1)
    process.env.NODE_ENV = 'development'
    process.env.BACKOFFICE_MOCK_DATA = 'false'
    assert.equal(mode.isLocalMockAuthenticationEnabled(), false)
    assert.throws(() => access.requireBackofficeAccess())
    process.env.BACKOFFICE_MOCK_DATA = 'true'
    process.env.BACKOFFICE_MOCK_AUTH = 'false'
    assert.equal(mode.isLocalMockAuthenticationEnabled(), false)
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})

test('loja fictícia consulta catálogo, categoria, busca, cliente e pedidos', () => {
  const store = commerce.createMockCommerce()
  const request = (name, variables = {}) => store.request(`query ${name} { placeholder }`, variables)
  assert.equal(request('Categories').categories.length, 3)
  assert.equal(request('MainCategories').categories[0].products.length, 8)
  assert.equal(request('ProductsByCategory', { category: 'audio' }).category.products.length, 8)
  assert.equal(request('ProductsByName', { name: 'memoria' }).products[0].slug, 'memoria-ram-16-gb')
  assert.equal(request('Product', { slug: 'mouse-ergonomico' }).product.name, 'Mouse ergonômico')
  assert.equal(request('Resume').banners.length, 2)
  const email = customers.mockCustomer.primaryEmailAddress.emailAddress
  assert.equal(request('userAddress', { email }).address.id, customers.mockAddress.id)
  assert.equal(request('OrdersWithItems', { email }).orders.length, 2)
  assert.equal(request('OrdersWithItems', { email: 'outro@example.test' }).orders.length, 0)
  assert.throws(() => request('UnknownOperation'), /não disponível/)
})

test('checkout fictício mantém pedidos separados e retira os itens do carrinho', () => {
  const store = commerce.createMockCommerce()
  const request = (name, variables = {}) => store.request(`mutation ${name} { placeholder }`, variables)
  const email = customers.mockCustomer.primaryEmailAddress.emailAddress
  const item = request('CreateOrderItem', { email, slug: 'mouse-ergonomico', total: 89.9 }).createOrderItem
  assert.equal(request('OrderItems', { email }).orderItems.length, 1)
  const order = request('CreateOrder', {
    email, userId: customers.mockCustomer.id, addressId: customers.mockAddress.id,
    total: 94.9, payment: 'Pix', delivery: 'Entrega', orderItemId: [{ id: item.id }],
  }).createOrder
  assert.equal(order.orderItems[0].product.slug, 'mouse-ergonomico')
  assert.equal(request('OrderItems', { email }).orderItems.length, 0)
  assert.equal(request('OrdersWithItems', { email }).orders.length, 3)
  assert.equal(request('orderDetails', { id: order.id, userId: 'outro' }).orders.length, 0)
  assert.equal(request('orderDetails', { id: order.id, userId: customers.mockCustomer.id }).orders[0].id, order.id)
  assert.throws(() => request('CreateOrderItem', { email, slug: 'teclado-sem-fio', total: 129.9 }), /indisponível/)
})

test('categorias e logo são gerenciadas no backend, com proteção das relações', () => {
  const store = mockStore.createMockCatalog()
  assert.throws(() => store.deleteCategory(fixtures.mockCategories[0].id), /Mova os produtos/)
  const category = store.saveCategory({ name: 'Novidades', slug: 'novidades', imageId: fixtures.mockAssets[0].id })
  assert.throws(() => store.saveCategory({ name: 'Outro nome', slug: 'novidades' }), /Já existe/)
  const product = store.save({ ...valid, slug: 'produto-da-categoria', imageId: fixtures.mockAssets[0].id, categoryId: category.id })
  assert.equal(store.categories().find((item) => item.id === category.id).productCount, 1)
  assert.throws(() => store.deleteCategory(category.id), /Mova os produtos/)
  store.save({ ...valid, slug: product.slug, imageId: product.image.id, categoryId: null }, product.id)
  store.deleteCategory(category.id)
  assert.equal(store.categories().some((item) => item.id === category.id), false)
  assert.throws(() => store.save({ ...valid, imageId: product.image.id, categoryId: 'missing' }), /Categoria não encontrada/)
  store.saveCompany({ name: 'Loja de teste', logoId: fixtures.mockAssets[1].id })
  assert.equal(store.company().logoUrl, fixtures.mockAssets[1].url)
  assert.throws(() => store.saveCompany({ name: 'Empresa', logoId: 'missing' }), /Logo não encontrada/)
})

test('status do pedido impede retrocessos e atualizações concorrentes', () => {
  const store = commerce.createMockCommerce()
  const pending = store.orders().find((order) => order.status === 'PENDING')
  const paid = store.updateOrderStatus(pending.id, 'PAID', 'PENDING')
  assert.ok(paid.paidAt)
  assert.throws(() => store.updateOrderStatus(pending.id, 'CANCELLED', 'PENDING'), /recarregue/i)
  assert.throws(() => store.updateOrderStatus(pending.id, 'PENDING', 'PAID'), /não é permitida/)
  const cancelled = store.updateOrderStatus(pending.id, 'CANCELLED', 'PAID')
  assert.equal(cancelled.status, 'CANCELLED')
})

test('indicadores distinguem criação e pagamento, excluem cancelados e respeitam Fortaleza', () => {
  const analytics = load('src/lib/backend/analytics.ts', { './schema': backendSchema })
  const now = new Date('2026-10-08T15:00:00Z')
  const records = [
    { id: 'old_paid_now', status: 'PAID', total: 50, createdAt: '2026-09-01T15:00:00Z', paidAt: '2026-10-08T10:00:00Z' },
    { id: 'pending', status: 'PENDING', total: 100, createdAt: '2026-10-08T10:00:00Z', paidAt: null },
    { id: 'cancelled', status: 'CANCELLED', total: 100, createdAt: '2026-10-08T10:00:00Z', paidAt: '2026-10-08T10:00:00Z' },
    { id: 'before_boundary', status: 'PAID', total: 70, createdAt: '2026-10-02T02:59:00Z', paidAt: '2026-10-02T02:59:00Z' },
    { id: 'boundary', status: 'PAID', total: 10, createdAt: '2026-10-02T03:00:00Z', paidAt: '2026-10-02T03:00:00Z' },
    { id: 'future', status: 'PAID', total: 999, createdAt: '2026-10-08T16:00:00Z', paidAt: '2026-10-08T16:00:00Z' },
  ]
  const metrics = analytics.summarizeOrders(records, 7, now)
  assert.equal(metrics.revenue, 60)
  assert.equal(metrics.totalOrders, 3)
  assert.equal(metrics.paidOrders, 2)
  assert.equal(metrics.averageTicket, 30)
  assert.equal(metrics.pendingOrders, 1)
  assert.equal(metrics.cancelledOrders, 1)
  assert.equal(metrics.series.length, 7)
  assert.equal(metrics.series[0].date, '2026-10-02')
  assert.equal(metrics.series[0].revenue, 10)
  assert.equal(metrics.series[6].revenue, 50)
  assert.equal(analytics.summarizeOrders([], 7, now).averageTicket, 0)
  assert.throws(() => analytics.summarizeOrders(records, 2, now), /Período inválido/)
})

test('novas operações do backend verificam autorização e validam uploads', async () => {
  const analytics = load('src/lib/backend/analytics.ts', { './schema': backendSchema })
  const store = mockStore.createMockCatalog()
  const orders = commerce.createMockCommerce()
  let allowed = false
  const backend = load('src/lib/backend/service.ts', {
    '@/lib/backoffice/access': { requireBackofficeAccess: () => { if (!allowed) throw new Error('denied') } },
    '@/lib/backoffice/mock-mode': { isBackofficeMockEnabled: () => true },
    '@/lib/backoffice/mock-store': { getMockCatalog: () => store },
    '@/mocks/commerce': { getMockCommerce: () => orders },
    './schema': backendSchema,
    './analytics': analytics,
  })
  for (const operation of [() => backend.getCategories(), () => backend.getCompany(), () => backend.getOrders(), () => backend.getDashboard(), () => backend.saveCategory({}), () => backend.saveCompany({}), () => backend.updateOrderStatus({})]) {
    assert.throws(operation, /denied/)
  }
  allowed = true
  assert.equal(backend.getOrders({ status: 'PENDING' }).orders.every((order) => order.status === 'PENDING'), true)
  assert.equal(backend.getOrders({ page: 1 }).orders.length, 20)
  assert.equal(backend.getOrders({ page: 2 }).orders.length, 18)
  const form = new FormData()
  form.set('file', new Blob(['<svg></svg>'], { type: 'image/png' }), 'fake.png')
  await assert.rejects(backend.uploadImage(form), /válidas/)
  const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jDosAAAAASUVORK5CYII=', 'base64')
  form.set('file', new Blob([image], { type: 'image/png' }), 'teste.png')
  const uploaded = await backend.uploadImage(form)
  assert.ok(uploaded.url.startsWith('data:image/png;base64,'))
  assert.ok(backend.getAssets().some((asset) => asset.id === uploaded.id))
})

test('mock com Clerk permite catálogo público e restringe dados ao proprietário', () => {
  const { authorizeMockRequest, MockAccessError } = load('src/modules/shared/services/mock-request-access.ts')
  const query = (name) => `query ${name} { placeholder }`
  const owner = (id) => id === 'own' ? 'cliente@example.com' : 'outro@example.com'
  const user = { id: 'user_cliente', email: 'cliente@example.com' }
  assert.doesNotThrow(() => authorizeMockRequest(query('ProductsByCategory'), {}, null, owner))
  assert.throws(() => authorizeMockRequest(query('OrderItems'), {}, null, owner), (error) => error instanceof MockAccessError && error.status === 401)
  assert.doesNotThrow(() => authorizeMockRequest(query('OrderItems'), { email: user.email }, user, owner))
  assert.throws(() => authorizeMockRequest(query('OrderItems'), { email: 'outro@example.com' }, user, owner), (error) => error.status === 403)
  assert.throws(() => authorizeMockRequest(query('orderDetails'), { userId: 'user_outro' }, user, owner), (error) => error.status === 403)
  assert.doesNotThrow(() => authorizeMockRequest(query('DeleteOrderItem'), { orderItemId: 'own' }, user, owner))
  assert.throws(() => authorizeMockRequest(query('UpdateOrderItem'), { orderItemId: 'other' }, user, owner), (error) => error.status === 403)
})
