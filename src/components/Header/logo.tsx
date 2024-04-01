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

    const logoImage = enterpriseInfos[0].logo.url
    return logoImage
  }

  const logo = await getLogo()

  return (
    <Link href="/">
      <Image src={logo} alt="" width={100} height={0} className="h-auto" />
    </Link>
  )
}
