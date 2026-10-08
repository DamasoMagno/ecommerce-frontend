import Link from 'next/link'
import Image from 'next/image'

import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

export async function Logo() {
  const getLogo = async () => {
    const { enterpriseInfos } = await client.request<{
      enterpriseInfos: any[]
    }>(gql`
      query Logo {
        enterpriseInfos(first: 1) {
          logo {
            url
          }
        }
      }
    `)

    return { url: enterpriseInfos[0].logo.url, name: enterpriseInfos[0].name ?? 'Newbyte' }
  }

  const logo = await getLogo()

  return (
    <Link href="/" className="shrink-0 overflow-hidden rounded-full border border-border" aria-label="Voltar à página inicial">
      <Image src={logo.url} alt={logo.name} width={56} height={56} className="h-12 w-12 rounded-full object-cover" />
    </Link>
  )
}
