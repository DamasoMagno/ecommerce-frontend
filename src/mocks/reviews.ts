export interface ProductReview { id: string; author: string; rating: number; title: string; body: string; date: string }

export function mockProductReviews(productId: string): ProductReview[] {
  return [
    { id: `${productId}_review_1`, author: 'Mariana S.', rating: 5, title: 'Uma boa escolha para o dia a dia', body: 'Gostei da experiência de uso e achei a descrição clara. Atendeu ao que eu precisava.', date: '2026-09-28' },
    { id: `${productId}_review_2`, author: 'Carlos M.', rating: 4, title: 'Bom custo-benefício', body: 'O produto funciona bem para minha rotina. A compra e a retirada foram simples.', date: '2026-09-20' },
    { id: `${productId}_review_3`, author: 'Ana P.', rating: 5, title: 'Atendeu às expectativas', body: 'Fácil de usar e prático. Voltaria a escolher este produto.', date: '2026-09-12' },
    { id: `${productId}_review_4`, author: 'Pedro R.', rating: 4, title: 'Experiência positiva', body: 'Estou satisfeito com a compra. Um produto útil para o uso cotidiano.', date: '2026-09-05' },
  ]
}
