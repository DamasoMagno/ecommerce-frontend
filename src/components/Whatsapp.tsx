import Image from 'next/image'
import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

export async function Whatsapp() {
  const { enterpriseInfos } = await client.request<{ enterpriseInfos: any }>(
    gql`
      query WhatsappContact {
        enterpriseInfos(first: 1) {
          contact
        }
      }
    `,
  )

  return (
    <a
      href={`https://wa.me/${enterpriseInfos[0].contact}`}
      className="fixed right-5 bottom-5 rounded-full z-50"
      target="_blank"
      rel="noreferrer"
    >
      <Image
        src={'/images/whatsapp.png'}
        alt="Whatsapp Logo"
        width={50}
        height={10}
      />
    </a>
  )
}
