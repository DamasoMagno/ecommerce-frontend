'use client'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { companySchema } from '../schemas/company'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { BackendAsset, BackendCompany } from '@/lib/backend/types'
import { saveCompany } from '../actions/company'
import { ImagePicker } from '@/components/backoffice/ImagePicker'

export function CompanyManager({ initialCompany, assets }: { initialCompany: BackendCompany; assets: BackendAsset[] }) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof companySchema>>({ resolver: zodResolver(companySchema), defaultValues: { name: initialCompany.name, logoId: initialCompany.logoId } })
  const router = useRouter()
  return <>
    <p className="mb-2 text-xs uppercase tracking-widest text-accent">Identidade da loja</p><h1 className="text-3xl font-bold">Empresa</h1><p className="mb-8 mt-2 text-sm text-slate-500">Configure o nome e a logo exibida no catálogo.</p>
    <form className="max-w-2xl rounded-xl border border-border bg-surface p-6" onSubmit={handleSubmit(async (input) => {
      try {
        const result = await saveCompany(input)
        if (!result.success) toast.error(result.message)
        else { reset({ name: result.value.name, logoId: result.value.logoId }); toast.success('Dados da empresa salvos.'); router.refresh() }
      } catch { toast.error('Não foi possível salvar os dados da empresa.') }
    })}><fieldset disabled={isSubmitting} className="space-y-6">
      <label className="block text-sm">Nome da empresa<Input {...register('name')} className="mt-2 w-full rounded-lg border border-border bg-shell px-3 py-3" />{errors.name && <span role="alert" className="mt-1 block text-xs text-red-400">Informe um nome entre 2 e 100 caracteres.</span>}</label>
      <ImagePicker label="Logo da empresa" assets={assets} value={watch('logoId')} onChange={(logoId) => setValue('logoId', logoId, { shouldValidate: true })} />
      <Button loading={isSubmitting} className="rounded-lg bg-accent px-5 py-3 text-sm">Salvar empresa</Button>
    </fieldset></form>
  </>
}
