import { NextRequest, NextResponse } from 'next/server'
import { getBackofficeAccess } from '@/lib/backoffice/access'
import * as backend from '@/lib/backend/service'
import { z } from 'zod'
import { loadProducts, saveProduct } from '@/app/backoffice/produtos/actions'

export const dynamic = 'force-dynamic'
type Context = { params: { resource: string } }

function checkAccess() {
  const access = getBackofficeAccess()
  return access.allowed ? null : NextResponse.json({ error: 'Acesso restrito.' }, { status: access.authenticated ? 403 : 401 })
}

export async function GET(request: NextRequest, { params }: Context) {
  const denied = checkAccess()
  if (denied) return denied
  try {
    const query = request.nextUrl.searchParams
    let data: unknown
    switch (params.resource) {
      case 'products': backend.requireMockBackend(); data = await loadProducts(query.get('search') ?? '', query.get('cursor')); break
      case 'categories': data = backend.getCategories(); break
      case 'company': data = backend.getCompany(); break
      case 'assets': data = backend.getAssets(); break
      case 'orders': data = backend.getOrders({ search: query.get('search') ?? '', status: query.get('status') || undefined, page: Number(query.get('page') ?? 1) }); break
      case 'dashboard': data = backend.getDashboard(Number(query.get('days') ?? 30)); break
      default: return NextResponse.json({ error: 'Recurso não encontrado.' }, { status: 404 })
    }
    return NextResponse.json({ data })
  } catch { return NextResponse.json({ error: 'Não foi possível carregar os dados. Verifique os filtros e o modo de teste.' }, { status: 400 }) }
}

export async function POST(request: NextRequest, { params }: Context) {
  const denied = checkAccess()
  if (denied) return denied
  try {
    let data: unknown
    if (params.resource === 'assets') data = await backend.uploadImage(await request.formData())
    else {
      const body = await request.json()
      switch (params.resource) {
        case 'products': {
          backend.requireMockBackend()
          const input = z.object({ id: z.string().optional(), data: z.unknown() }).parse(body)
          const result = await saveProduct(input.data, input.id)
          if (!result.success) return NextResponse.json({ error: result.message }, { status: 400 })
          data = result.product; break
        }
        case 'categories': { const input = z.object({ id: z.string().optional(), data: z.unknown() }).parse(body); data = backend.saveCategory(input.data, input.id); break }
        case 'company': data = backend.saveCompany(body); break
        case 'orders': data = backend.updateOrderStatus(body); break
        default: return NextResponse.json({ error: 'Recurso não encontrado.' }, { status: 404 })
      }
    }
    return NextResponse.json({ data })
  } catch { return NextResponse.json({ error: 'Não foi possível salvar. Confira os dados e recarregue a lista.' }, { status: 400 }) }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const denied = checkAccess()
  if (denied) return denied
  if (params.resource !== 'categories') return NextResponse.json({ error: 'Recurso não encontrado.' }, { status: 404 })
  try {
    backend.deleteCategory(z.object({ id: z.string() }).parse(await request.json()).id)
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Categoria não encontrada ou vinculada a produtos.' }, { status: 400 }) }
}
