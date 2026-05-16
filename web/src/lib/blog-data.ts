export interface BlogPost {
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  slug: string;
  category: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    title: "As 5 Cláusulas Mais Perigosas em Contratos de TI",
    excerpt: "Descubra como identificar termos que podem comprometer sua propriedade intelectual e gerar multas inesperadas.",
    date: "15 Mai, 2026",
    readTime: "5 min",
    slug: "01-clausulas-perigosas",
    category: "Jurídico",
    content: `
      <p class="text-xl leading-relaxed mb-6">Contratos de Tecnologia da Informação (TI) costumam ser densos e repletos de termos técnicos. No entanto, o perigo real geralmente está escondido nas cláusulas de responsabilidade e propriedade intelectual.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">1. Responsabilidade Ilimitada</h2>
      <p class="mb-6">Aceitar uma cláusula onde sua empresa responde por danos indiretos ou lucros cessantes sem um teto financeiro é um risco existencial. Sempre busque limitar a responsabilidade ao valor total do contrato.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">2. Propriedade Intelectual (PI) Ambigua</h2>
      <p class="mb-6">Muitos contratos de software sob encomenda tentam transferir a propriedade de códigos-base ou frameworks pré-existentes do desenvolvedor para o cliente. Certifique-se de que você está licenciando o uso, mas mantendo a propriedade do seu "know-how".</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">3. Rescisão sem Justa Causa e Sem Aviso Prévio</h2>
      <p class="mb-6">Cláusulas que permitem ao cliente cancelar o projeto de um dia para o outro podem quebrar seu fluxo de caixa. Exija um aviso prévio de pelo menos 30 a 60 dias.</p>
    `
  },
  {
    title: "O Custo de um Contrato Ruim: Por que a análise prévia é vital",
    excerpt: "Empresas perdem milhões anualmente por cláusulas mal interpretadas. Saiba como evitar esse prejuízo.",
    date: "16 Mai, 2026",
    readTime: "6 min",
    slug: "custo-contrato-ruim",
    category: "Negócios",
    content: `
      <p class="text-xl leading-relaxed mb-6">Assinar um contrato sem uma revisão minuciosa é como pular de um avião esperando que o paraquedas tenha sido dobrado corretamente. No mundo dos negócios, o "paraquedas" são as cláusulas de saída e penalidades.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Multas Ocultas</h2>
      <p class="mb-6">Muitos contratos de prestação de serviços incluem multas rescisórias que podem chegar a 50% do valor restante do contrato. Para uma startup, isso pode significar o fim da operação.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Exclusividade Mal Definida</h2>
      <p class="mb-6">Cuidado com termos que impedem você de trabalhar com concorrentes do seu cliente sem uma compensação financeira adequada. A exclusividade deve ser paga e ter um escopo geográfico e temporal muito bem definido.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Como a IA pode ajudar</h2>
      <p class="mb-6">Ferramentas como o Contract Lens usam modelos de linguagem avançados para ler milhares de páginas em segundos, destacando exatamente onde estão esses riscos financeiros ocultos.</p>
    `
  },
  {
    title: "IA vs. Revisão Manual: O Benchmark de Produtividade",
    excerpt: "Comparamos o tempo e a precisão de um advogado júnior versus a Inteligência Artificial do Contract Lens.",
    date: "16 Mai, 2026",
    readTime: "4 min",
    slug: "ia-vs-revisao-manual",
    category: "Tecnologia",
    content: `
      <p class="text-xl leading-relaxed mb-6">A pergunta não é se a IA vai substituir o advogado, mas sim como o advogado que usa IA vai superar o que não usa. Fizemos um teste prático de produtividade.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Velocidade de Processamento</h2>
      <p class="mb-6">Enquanto um profissional leva em média 45 a 60 minutos para ler e resumir um contrato de 20 páginas, o Contract Lens entrega um relatório completo em menos de 15 segundos.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Consistência de Análise</h2>
      <p class="mb-6">Humanos cansam. Após o décimo contrato no dia, a atenção aos detalhes diminui. A IA mantém o mesmo nível de rigor analítico do primeiro ao milésimo documento.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">O Fator Humano</h2>
      <p class="mb-6">A IA não toma a decisão final, ela prepara o terreno. Ela serve como um filtro de primeira linha, permitindo que o tomador de decisão foque apenas no que é crítico.</p>
    `
  },
  {
    title: "Privacidade e Segurança: Seus Contratos estão Seguros?",
    excerpt: "Entenda como protegemos seus dados e por que o uso da Gemini AI no Contract Lens é seguro para empresas.",
    date: "16 Mai, 2026",
    readTime: "7 min",
    slug: "privacidade-seguranca-ia",
    category: "Segurança",
    content: `
      <p class="text-xl leading-relaxed mb-6">Uma das maiores preocupações ao usar IA é: 'Meus dados serão usados para treinar o modelo?'. No Contract Lens, a resposta é um não categórico.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Google Gemini Enterprise</h2>
      <p class="mb-6">Utilizamos a infraestrutura Enterprise da Google. Isso significa que seus documentos são processados de forma isolada e seus dados NÃO são incorporados aos modelos globais da Google.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Criptografia de Ponta a Ponta</h2>
      <p class="mb-6">Seus PDFs são criptografados com AES-256 tanto em repouso quanto em trânsito. Somente você tem acesso aos resultados da sua análise.</p>

      <h2 class="text-2xl font-bold mt-8 mb-4">Conformidade GDPR e LGPD</h2>
      <p class="mb-6">Nossa plataforma foi construída com os princípios de 'Privacy by Design', garantindo que todos os direitos dos titulares de dados sejam respeitados desde a primeira linha de código.</p>
    `
  }
];
