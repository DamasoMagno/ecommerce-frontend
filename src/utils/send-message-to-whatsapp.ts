import { client } from '@/lib/graphql'
import { gql } from 'graphql-request'
import { toast } from 'sonner'

export async function sendMessageToWhatsapp(text: string) {
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_LOCAL_DEMO === 'true') {
    toast('Demonstração: nenhuma mensagem será enviada pelo WhatsApp.')
    return
  }
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
