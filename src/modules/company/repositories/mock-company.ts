import { companySchema } from '../schemas/company'

export function createMockCompany(getAssets: () => { id: string; url: string }[]) {
  let company = { name: 'Newbyte', logoId: 'mock_logo' as string | null, logoUrl: '/images/logo.jpg' as string | null }
  return {
    read() { return { ...company } },
    save(input: unknown) {
      const fields = companySchema.parse(input)
      const logo = fields.logoId ? getAssets().find((asset) => asset.id === fields.logoId) : null
      if (fields.logoId && !logo) throw new Error('Logo não encontrada.')
      company = { ...fields, logoUrl: logo?.url ?? null }
      return { ...company }
    },
  }
}
