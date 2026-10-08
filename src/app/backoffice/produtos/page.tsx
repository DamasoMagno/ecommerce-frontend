import { ProductManager } from '@/modules/catalog/components/product-manager'
import { loadAssets, loadProducts } from './actions'
import { isBackofficeMockEnabled } from '@/lib/backoffice/mock-mode'
import { loadCategories } from '../actions'

export default async function ProductsPage() {
  try {
    const [catalog, assets, categories] = await Promise.all([loadProducts(), loadAssets(), isBackofficeMockEnabled() ? loadCategories() : Promise.resolve([])])
    return <>
      {isBackofficeMockEnabled() && <p role="status" className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800">Modo de teste: dados fictícios. As alterações ficam em memória e são descartadas ao reiniciar o servidor. As imagens já estão disponíveis localmente.</p>}
      <ProductManager initialCatalog={catalog} assets={assets} categories={categories} mockMode={isBackofficeMockEnabled()} />
    </>
  } catch {
    return <section className="rounded-2xl border border-border bg-surface p-8"><h1 className="text-2xl font-bold">Catálogo indisponível</h1><p className="mt-3 text-slate-500">Não foi possível carregar os produtos. Verifique as variáveis HYGRAPH_ENDPOINT e HYGRAPH_ADMIN_TOKEN, as permissões de leitura de rascunhos e a conexão com o Hygraph.</p></section>
  }
}
