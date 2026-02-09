// app/data/blogPosts.ts
import type { BlogPost } from "@/types/blog/post.type";

const blogPosts: BlogPost[] = [
	{
		id: 1,
		title: "Como funciona o contrato de prestação de serviços?",
		excerpt:
			"Entenda os elementos essenciais, responsabilidades e proteções jurídicas presentes em contratos de prestação de serviços.",
		img: "/client/assets/images/mockBlog/thumb-post-1.jpg",
		slug: "contrato-prestacao-servicos",
		date: "2025-01-10",
		readingTime: "4 min de leitura",
		content: `
Um contrato de prestação de serviços é o instrumento jurídico que define as obrigações, direitos e responsabilidades entre o contratante e o prestador.

Entre os principais pontos de atenção, destacam-se: objeto do contrato, forma de execução do serviço, prazos, valores, formas de pagamento, responsabilidades, cláusulas de confidencialidade e hipóteses de rescisão.

A análise criteriosa dessas cláusulas é fundamental para reduzir riscos, evitar conflitos futuros e trazer maior segurança para ambas as partes.

Sempre que possível, é recomendável que contratos sejam revisados por um profissional especializado, especialmente em relações de maior impacto financeiro ou de longo prazo.
`.trim(),
	},
	{
		id: 2,
		title: "Direito Empresarial: quando buscar assessoria jurídica?",
		excerpt:
			"Confira situações em que o apoio jurídico especializado faz toda a diferença para empresas de todos os portes.",
		img: "/client/assets/images/mockBlog/thumb-post-2.jpg",
		slug: "quando-buscar-assessoria-juridica",
		date: "2025-01-05",
		readingTime: "5 min de leitura",
		content: `
A assessoria jurídica empresarial é indicada sempre que a empresa toma decisões estratégicas, celebra contratos relevantes ou precisa mitigar riscos regulatórios.

Entre os cenários mais comuns, destacam-se: abertura de empresa, alteração de contrato social, revisão de contratos com fornecedores e clientes, estruturação societária, proteção de marca e gestão de passivos trabalhistas.

O acompanhamento preventivo costuma ser mais eficiente e menos oneroso que a atuação apenas quando o litígio já existe.
`.trim(),
	},
	{
		id: 3,
		title: "Como evitar riscos em contratos e negociações?",
		excerpt:
			"Conheça estratégias que ajudam a prevenir conflitos e garantir segurança jurídica em negociações importantes.",
		img: "/client/assets/images/mockBlog/thumb-post-3.jpg",
		slug: "evitar-riscos-contratos",
		date: "2024-12-20",
		readingTime: "6 min de leitura",
		content: `
Boa parte dos conflitos contratuais poderia ser evitada com uma avaliação prévia adequada dos riscos envolvidos em cada negociação.

Alguns pontos relevantes incluem: clareza nas obrigações, definição objetiva de prazos, critérios de reajuste, penalidades proporcionais, garantias, e mecanismos de solução de conflitos.

Uma redação precisa, alinhada à realidade das partes, contribui para relações mais equilibradas e sustentáveis.
`.trim(),
	},
	{
		id: 4,
		title: "Qual a importância da assessoria jurídica preventiva?",
		excerpt:
			"Saiba como a atuação preventiva pode reduzir litígios e proteger o patrimônio de pessoas físicas e empresas.",
		img: "/client/assets/images/mockBlog/thumb-post-4.jpg",
		slug: "assessoria-juridica-preventiva",
		date: "2024-12-10",
		readingTime: "3 min de leitura",
		content: `
A assessoria jurídica preventiva busca identificar e tratar problemas antes que se transformem em processos judiciais.

Por meio de análises, pareceres e orientações estratégicas, é possível evitar demandas, negociações desequilibradas e prejuízos financeiros significativos.

É uma forma de atuar de maneira planejada, reduzindo incertezas e aumentando a segurança nas decisões.
`.trim(),
	},
	{
		id: 5,
		title: "Cláusulas que não podem faltar em contratos empresariais",
		excerpt:
			"Veja pontos de atenção na elaboração de contratos para garantir maior segurança nas relações comerciais.",
		img: "/client/assets/images/mockBlog/thumb-post-5.jpg",
		slug: "clausulas-essenciais-contratos-empresariais",
		date: "2024-11-30",
		readingTime: "5 min de leitura",
		content: `
Contratos empresariais bem estruturados são essenciais para relações comerciais saudáveis.

Entre as cláusulas relevantes, podemos citar: definição clara do objeto, prazos, formas de pagamento, índice de reajuste, garantias, confidencialidade, foro de eleição e mecanismos de solução de conflitos.

Cada contrato deve ser adaptado ao caso concreto, evitando modelos genéricos que não refletem a realidade das partes envolvidas.
`.trim(),
	},
	{
		id: 6,
		title: "Como organizar a documentação jurídica da sua empresa",
		excerpt:
			"Dicas práticas para manter contratos, atos societários e demais documentos em conformidade e de fácil acesso.",
		img: "/client/assets/images/mockBlog/thumb-post-6.jpg",
		slug: "organizacao-documentacao-juridica",
		date: "2024-11-15",
		readingTime: "4 min de leitura",
		content: `
A organização da documentação jurídica é fundamental para o bom funcionamento da empresa.

Contratos, atas, alterações contratuais, registros, procurações e demais documentos devem ser arquivados de forma segura e de fácil acesso, preferencialmente com apoio de sistemas digitais.

Uma boa gestão documental contribui para maior agilidade em auditorias, negociações e processos de tomada de decisão.
`.trim(),
	},
];

export default blogPosts;
