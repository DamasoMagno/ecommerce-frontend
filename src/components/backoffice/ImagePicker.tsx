'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { uploadImage } from '@/modules/catalog/actions/catalog'
import { BackendAsset } from '@/lib/backend/types'

export function ImagePicker({ label, value, onChange, assets: initialAssets, disabled = false, onUploaded }: {
  label: string; value: string | null; onChange: (id: string | null) => void; assets: BackendAsset[]; disabled?: boolean; onUploaded?: (asset: BackendAsset) => void
}) {
  const [assets, setAssets] = useState(initialAssets)
  const [uploading, setUploading] = useState(false)
  const selected = assets.find((asset) => asset.id === value)

  return <div className="space-y-3">
    <label className="block text-sm">{label}<select value={value ?? ''} disabled={disabled || uploading} onChange={(event) => onChange(event.target.value || null)} className="mt-2 w-full rounded-lg border border-border bg-shell px-3 py-3 text-sm">
      <option value="">Selecione uma imagem</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.fileName ?? asset.id}</option>)}
    </select></label>
    {selected && <img src={selected.url} alt={`Prévia: ${label}`} className="h-24 w-24 rounded-lg border border-border bg-shell object-contain" />}
    <label className="block text-xs text-slate-500">{uploading ? 'Enviando imagem…' : 'Enviar imagem (PNG, JPEG ou WebP, até 2 MB)'}<input aria-label={`Enviar ${label.toLowerCase()}`} type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled || uploading} className="mt-2 block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-2 file:text-slate-800" onChange={async (event) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return
      setUploading(true)
      try {
        const form = new FormData(); form.set('file', file)
        const result = await uploadImage(form)
        if (!result.success) { toast.error(result.message); return }
        setAssets((current) => [...current, result.value])
        onUploaded?.(result.value)
        onChange(result.value.id)
        toast.success('Imagem de teste enviada.')
      } catch { toast.error('Não foi possível enviar a imagem. Use um arquivo de até 2 MB.') }
      finally { setUploading(false) }
    }} /></label>
  </div>
}
