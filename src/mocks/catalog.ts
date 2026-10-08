import { ICategory, IProduct } from '@/interface'

export const mockAssets = [
  { id: 'mock_image_tech', fileName: 'tecnologia.svg', url: '/images/mock/tecnologia.svg' },
  { id: 'mock_image_audio', fileName: 'audio.svg', url: '/images/mock/audio.svg' },
  { id: 'mock_image_accessories', fileName: 'acessorios.svg', url: '/images/mock/acessorios.svg' },
]

export const mockCategories: ICategory[] = [
  { id: 'mock_category_tech', name: 'Informática', slug: 'informatica', photo: { url: mockAssets[0].url } },
  { id: 'mock_category_audio', name: 'Áudio', slug: 'audio', photo: { url: mockAssets[1].url } },
  { id: 'mock_category_accessories', name: 'Acessórios', slug: 'acessorios', photo: { url: mockAssets[2].url } },
]

// Preços fictícios em reais; IDs estáveis para testes.
const examples: [string, string, number, number][] = [
  ['Teclado sem fio', 'teclado-sem-fio', 129.90, 0],
  ['Mouse ergonômico', 'mouse-ergonomico', 89.90, 0],
  ['Monitor 24 polegadas', 'monitor-24-polegadas', 899.90, 0],
  ['Notebook de estudo', 'notebook-de-estudo', 2499.90, 0],
  ['Webcam Full HD', 'webcam-full-hd', 179.90, 0],
  ['Hub USB-C', 'hub-usb-c', 149.90, 0],
  ['SSD 500 GB', 'ssd-500-gb', 249.90, 0],
  ['Memória RAM 16 GB', 'memoria-ram-16-gb', 219.90, 0],
  ['Fone Bluetooth', 'fone-bluetooth', 159.90, 1],
  ['Caixa de som portátil', 'caixa-de-som-portatil', 199.90, 1],
  ['Headset para jogos', 'headset-para-jogos', 229.90, 1],
  ['Microfone USB', 'microfone-usb', 299.90, 1],
  ['Fone intra-auricular', 'fone-intra-auricular', 39.90, 1],
  ['Soundbar compacta', 'soundbar-compacta', 499.90, 1],
  ['Adaptador de áudio', 'adaptador-de-audio', 29.90, 1],
  ['Cabo de áudio P2', 'cabo-de-audio-p2', 14.90, 1],
  ['Carregador USB-C', 'carregador-usb-c', 79.90, 2],
  ['Cabo USB-C', 'cabo-usb-c', 19.90, 2],
  ['Suporte para notebook', 'suporte-para-notebook', 99.90, 2],
  ['Mousepad grande', 'mousepad-grande', 49.90, 2],
  ['Mochila para notebook', 'mochila-para-notebook', 139.90, 2],
  ['Suporte para celular', 'suporte-para-celular', 34.90, 2],
  ['Película de proteção', 'pelicula-de-protecao', 9.90, 2],
  ['Adaptador HDMI', 'adaptador-hdmi', 59.90, 2],
]

export interface MockProduct extends IProduct { categoryId: string }

export const mockProducts: MockProduct[] = examples.map(([name, slug, price, category], index) => ({
  id: `mock_product_${String(index + 1).padStart(2, '0')}`,
  name, slug, price,
  description: `${name} para uso no dia a dia. Produto fictício para testes de cadastro, busca e edição.`,
  available: index % 5 !== 0,
  categoryId: mockCategories[category].id,
  image: { id: mockAssets[category].id, url: mockAssets[category].url },
  ...(index % 4 === 0 ? { coupon: { discount: 10 } } : {}),
}))
