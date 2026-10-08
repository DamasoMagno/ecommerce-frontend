# Backoffice e backend de demonstração

A implementação atual usa apenas dados fictícios no servidor. Não há conexão com PostgreSQL, Supabase ou Neon. As áreas novas dependem do modo de teste e não são habilitadas em produção.

## Executar

Execute `npm ci` e `npm run dev:mock`. Abra `http://127.0.0.1:3000/backoffice` para o painel ou `/` para a loja. Não são necessárias credenciais de Clerk ou Hygraph nesse modo. Para testar a jornada do cliente, abra `/sign` e clique em “Entrar como cliente de teste”.

O comando ativa `BACKOFFICE_MOCK_DATA`, `BACKOFFICE_MOCK_AUTH` e `NEXT_PUBLIC_LOCAL_DEMO`, vincula o servidor a `127.0.0.1` e usa a porta 3000. A dispensa de login exige `NODE_ENV=development`; o endpoint de demonstração é desativado em produção. Não exponha esse servidor publicamente.

Para usar autenticação real com os dados mockados, configure as chaves Clerk em `.env.local`, inclua o ID da conta administrativa em `BACKOFFICE_ADMIN_USER_IDS` e execute `npm run dev:mock:auth`. O cadastro está em `/sign-up` e o login em `/sign`. O catálogo permanece público; endereço, carrinho e pedidos exigem sessão e pertencem ao usuário autenticado. Esse modo usa o Clerk para autenticação e mantém os dados comerciais em memória.

## Áreas implementadas

- `/backoffice`: receita recebida, quantidade de pedidos, ticket médio, pendências, gráfico diário de receita ou volume de pedidos e distribuição por status. Períodos de 7, 30 e 90 dias, com atualização manual.
- `/backoffice/produtos`: listagem paginada, busca, cadastro e edição de nome, slug, descrição, preço, disponibilidade, categoria e imagem. Imagens podem ser selecionadas ou enviadas.
- `/backoffice/categorias`: cadastro, edição, imagem e contagem de produtos. Exclusão permitida apenas para categorias vazias; a regra também é validada no servidor.
- `/backoffice/empresa`: configuração do nome e logo, com prévia e envio de imagem. A logo salva é usada no cabeçalho da loja.
- `/backoffice/pedidos`: busca por identificador, cliente e e-mail, filtro de status, paginação, itens, endereço, pagamento e mudança de status.

A loja continua oferecendo catálogo, categorias, busca, detalhes de produto, login fictício, carrinho e pedidos. Alterações no catálogo e na empresa são refletidas na loja de demonstração. Produtos novos sem categoria aparecem em Acessórios enquanto essa categoria existir.

## Backend local

A aplicação segue um monólito modular. `src/modules/catalog` reúne produtos, categorias e imagens; `src/modules/company` reúne configuração da empresa; `src/modules/orders` reúne gestão de pedidos e indicadores. Cada domínio mantém seus componentes, schemas, Server Actions e serviços. `src/modules/shared` reúne as regras comuns de acesso e mutação. As páginas e rotas de `src/app` são adaptadores; `src/lib/backend/service.ts` e `schema.ts` são fachadas de compatibilidade. Os componentes reutilizam `Input` e `Button`, e os formulários usam React Hook Form com Zod, como os fluxos existentes. As mesmas regras são expostas por `/api/backoffice/[resource]`:

- `GET /api/backoffice/products?search=&cursor=`: lista de produtos. `POST` recebe `{ data: { name, slug, description, price, available, imageId, categoryId }, id? }`.
- `GET /api/backoffice/categories`: categorias e quantidades. `POST` recebe `{ data: { name, slug, imageId }, id? }`. `DELETE` recebe `{ id }` e bloqueia categorias vinculadas a produtos.
- `GET /api/backoffice/company`: nome e logo. `POST` recebe `{ name, logoId }`.
- `GET /api/backoffice/assets`: biblioteca de imagens. `POST` recebe multipart com campo `file`.
- `GET /api/backoffice/orders?search=&status=&page=1`: pedidos. `POST` recebe `{ id, status, expectedStatus }`.
- `GET /api/backoffice/dashboard?days=30`: indicadores calculados no backend. Períodos aceitos: 7, 30 e 90.

Todas as operações verificam acesso administrativo, além do flag de dados mockados. Na demonstração local, a autenticação é dispensada apenas para operar os mocks. As APIs adicionais da aplicação continuam bloqueadas nesse modo.

A loja usa `/api/mock/graphql` para preservar seus componentes existentes. Esse adaptador responde apenas a operações conhecidas e não chama o Hygraph. Um pedido criado no checkout aparece no painel administrativo, inicialmente aguardando pagamento. Nenhum PIX real ou mensagem de WhatsApp é gerado; a consulta de CEP também é simulada.

## Pedidos e gráficos

São gerados 38 pedidos iniciais: dois do cliente de teste e 36 exemplos de outros clientes, distribuídos ao longo de 28 dias. Há pedidos aguardando pagamento, pagos, em preparação, enviados, concluídos e cancelados.

As transições são validadas no servidor: aguardando pagamento → pago/cancelado; pago → preparação/cancelado; preparação → enviado/concluído/cancelado; enviado → concluído. Pedidos concluídos ou cancelados não podem mudar novamente. `expectedStatus` impede sobrescrever uma alteração feita por outra tela sem recarregar os dados.

Os indicadores usam o horário de Fortaleza. Receita e ticket médio consideram pagamentos realizados no período e excluem pedidos cancelados. Quantidade de pedidos, pendências e distribuição por status consideram a data de criação. Datas futuras ficam fora do cálculo; valores são somados em centavos. O gráfico permite alternar receita e quantidade e oferece os valores diários em texto.

## Imagens e persistência

Há 24 produtos iniciais, 3 categorias, 3 ilustrações locais, uma logo e um banner de demonstração. Uploads aceitam PNG, JPEG e WebP de até 2 MB; tipo e assinatura do arquivo são verificados no backend. Imagens enviadas ficam como data URLs na memória do processo.

Produtos, categorias, logo, imagens, carrinho e pedidos ficam em memória. Reiniciar o servidor restaura todos os dados iniciais. A sessão fictícia do cliente permanece no navegador até sair. Nenhum dado é gravado em serviços externos.

## Integrações existentes

Fora da demonstração, a loja e o backoffice inicial de produtos preservam a integração existente com Hygraph e Clerk. Configure as variáveis de `.env.example`, incluindo a lista `BACKOFFICE_ADMIN_USER_IDS`, para usar esse fluxo. Os módulos novos de categorias, empresa, pedidos e gráficos ainda não possuem persistência real. O token administrativo do Hygraph deve permanecer exclusivo do servidor.

## Validação

`npm run test:backoffice` verifica validações, acesso, paginação, categorias, logo, uploads, checkout, transições de status e cálculos dos indicadores. `npx tsc --noEmit` verifica os tipos e `npm run build` gera a compilação de produção. Os testes usam dados fictícios e não verificam ambientes externos.

## Interface da loja

O light mode segue referências do CSS público de https://bridamo.com: DM Sans para texto, Syne para títulos e azul `#3a56e8` como destaque. Os tokens ficam em `src/app/globals.css`, com superfícies cinza suavizadas. A home e a tela de produto estão em `src/modules/storefront`; o checkout e os componentes compartilhados do carrinho ficam em `src/modules/checkout`. A rota `/dealer` e seus atalhos foram removidos.

Os pedidos do cliente mostram identificação persistente, data do pedido, filtros e detalhes. O sheet do carrinho oferece controle de quantidade, remoção, subtotal e navegação para checkout; o resumo do checkout inclui a taxa de entrega. Produtos relacionados usam o vínculo de categoria do catálogo atual. As avaliações em `src/mocks/reviews.ts` são explicitamente fictícias e aparecem apenas na demonstração local.
