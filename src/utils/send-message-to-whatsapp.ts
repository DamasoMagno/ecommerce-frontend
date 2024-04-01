import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'

export async function sendMessageToWhatsapp(text: string) {
  const { enterpriseInfos } = await client.request<{ enterpriseInfos: any }>(
    gql`
      query WhatsappContact {
        enterpriseInfos(first: 1) {
          contact
        }
      }
    `,
  )

  const contact = enterpriseInfos[0].contact

  const message = encodeURIComponent(text)
  const url = `https://wa.me/${contact}/?text=${message}`

  window.location.href = url
}
