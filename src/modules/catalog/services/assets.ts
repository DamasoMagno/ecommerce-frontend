import { randomUUID } from 'node:crypto'
import { getMockCatalog } from '../repositories/mock-catalog'
import { requireMockBackend } from '@/modules/shared/services/mock-access'

export function getAssets() { requireMockBackend(); return getMockCatalog().assets() }

export async function uploadImage(form: FormData) {
  requireMockBackend()
  const file = form.get('file')
  if (!(file instanceof Blob) || !('name' in file) || typeof file.name !== 'string') throw new Error('Selecione uma imagem.')
  if (file.size === 0 || file.size > 2 * 1024 * 1024) throw new Error('A imagem deve ter até 2 MB.')
  const bytes = Buffer.from(await file.arrayBuffer())
  const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  const isJpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
  const isWebp = bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
  if (!((file.type === 'image/png' && isPng) || (file.type === 'image/jpeg' && isJpeg) || (file.type === 'image/webp' && isWebp))) throw new Error('Use imagens PNG, JPEG ou WebP válidas.')
  return getMockCatalog().addAsset({ id: `mock_asset_${randomUUID()}`, fileName: file.name.slice(0, 200), url: `data:${file.type};base64,${bytes.toString('base64')}` })
}
