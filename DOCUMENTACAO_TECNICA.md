# Documentação Técnica — Newbyte E-commerce Frontend

## Visão Geral

O **Newbyte E-commerce Frontend** é a aplicação web responsável pela experiência de compra da plataforma Newbyte.  
Sua função principal é disponibilizar catálogo, busca, detalhes de produto, carrinho, fluxo de pedido e pagamento, além de funcionalidades de autenticação e área de pedidos.

## Stack Tecnológica

### Linguagens
- TypeScript
- JavaScript
- CSS

### Frameworks e bibliotecas principais
- **Front-end**
  - Next.js 14 (App Router)
  - React 18
  - Tailwind CSS
  - Radix UI
  - Swiper / Embla Carousel
- **Dados e comunicação**
  - GraphQL
  - `graphql-request`
  - Apollo Client (dependência disponível no projeto)
- **Formulários e validação**
  - React Hook Form
  - Zod
- **Autenticação**
  - Clerk (`@clerk/nextjs`)
- **Outros**
  - Sonner (notificações)
  - `qrcode-pix` (geração de payload/código PIX)

### Banco(s) de dados
- O frontend **não acessa banco de dados diretamente**.
- A persistência de dados é feita por serviços externos acessados via GraphQL (camada backend/headless).
- Há dependências de Prisma no projeto, mas a aplicação frontend utiliza prioritariamente a integração GraphQL para operações de domínio.

### Build, versionamento e infraestrutura
- **Build/Runtime:** Next.js (`next build`, `next start`)
- **Lint:** ESLint (`next lint`)
- **Gerenciamento de pacotes:** npm (`package-lock.json`)
- **Versionamento:** Git (repositório GitHub)
- **CI/CD e infraestrutura de deploy:** não descritos explicitamente no código-fonte analisado.

## Integrações Externas

- **Hygraph / GraphQL Endpoint**
  - Uso: fonte de dados para catálogo, banners, pedidos, endereço e demais entidades de negócio.
  - Evidência: cliente GraphQL em `src/lib/graphql.ts` com variáveis `NEXT_PUBLIC_HYGRAPH_KEY` e `NEXT_PUBLIC_HYGRAPH_TOKEN`.

- **Clerk**
  - Uso: autenticação, sessão de usuário e proteção de rotas.
  - Evidência: `ClerkProvider` no layout global e `authMiddleware` em `src/middleware.ts`.

- **ViaCEP**
  - Uso: consulta de CEP para preenchimento e validação de endereço no checkout.
  - Evidência: requisição para `https://viacep.com.br/ws/.../json` em `src/app/cart/components/FormAddress.tsx`.

- **WhatsApp (wa.me)**
  - Uso: contato comercial e envio de informações de pedido/reseller via link direto.
  - Evidência: utilitário `src/utils/send-message-to-whatsapp.ts` e componente `src/components/Whatsapp.tsx`.

- **PIX (qrcode-pix)**
  - Uso: geração de payload/código para pagamento PIX no fluxo de pagamento.
  - Evidência: página `src/app/payment/[orderId]/page.tsx`.

## Arquitetura do Sistema

### Padrão arquitetural adotado
- Aplicação **monolítica de frontend** com **Next.js App Router**.
- Organização por domínios e funcionalidades, combinando:
  - componentes de UI reutilizáveis (`src/components`)
  - contexto de estado de aplicação (`src/context`)
  - camadas de acesso a dados GraphQL (`src/graphql/queries` e `src/graphql/mutations`)
  - páginas e fluxos por rota (`src/app`)

### Fluxo textual de dados entre componentes principais
1. Usuário interage com páginas em `src/app`.
2. Componentes e contextos (`UserProvider`, `CartProvider`) orquestram estado de sessão e carrinho.
3. Camada GraphQL executa queries/mutations no endpoint externo para ler/gravar dados de negócio.
4. Clerk gerencia autenticação e autorização de acesso a rotas protegidas.
5. No checkout, o endereço pode ser enriquecido via ViaCEP e o pagamento pode seguir com geração de dados PIX.
6. Após ações de compra/atendimento, fluxos específicos podem acionar links de comunicação por WhatsApp.

### Justificativa arquitetural
- A centralização do frontend em Next.js com App Router simplifica roteamento, composição de páginas e organização por domínio.
- O uso de GraphQL reduz acoplamento do frontend com persistência, concentrando integrações de dados em uma camada dedicada.
- Context API para usuário/carrinho atende ao compartilhamento de estado global sem aumentar complexidade desnecessária.
- Clerk reduz esforço de implementação de autenticação e reforça segurança de acesso.

## Contato do Desenvolvedor

- **Nome:** DamasoMagno
- **E-mail:** limamdamaso@gmail.com
