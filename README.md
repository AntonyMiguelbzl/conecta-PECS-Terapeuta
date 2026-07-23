# Conecta PECS

Sistema web para terapeutas e terapeutas utilizarem como painel de gestão de pacientes, acompanhamento em tempo real e montagem de prancha de comunicação com pictogramas.

## Visão geral

O Conecta PECS é uma aplicação React + TypeScript + Firebase para apoiar o processo de terapia com comunicação por pictogramas (PECS/ARASAAC). O terapeuta pode:

- criar sua conta profissional;
- aguardar aprovação do acesso;
- cadastrar pacientes e seus responsáveis;
- listar e buscar pacientes;
- acessar um painel individual por paciente;
- visualizar o perfil e histórico do paciente;
- acompanhar em tempo real a frase montada pelo paciente no app;
- montar e salvar prancha de cartões personalizados com pictogramas da API ARASAAC;
- remover cartões ativos e registrar histórico de exclusões.

## Funcionalidades principais

### 1. Autenticação do terapeuta

A aplicação usa Firebase Authentication para autenticar terapeutas.

Fluxo:

- tela de login;
- cadastro de nova conta profissional;
- criação da documentação do terapeuta no Firestore;
- conta com status `pendente`, `aprovado` ou `reprovado`.

Regras implementadas:

- se o terapeuta não estiver aprovado, é exibido um estado de análise;
- se o terapeuta for reprovado, os dados são excluídos e o acesso é encerrado;
- após aprovação, o terapeuta entra no painel principal.

### 2. Cadastro e listagem de pacientes

No painel do terapeuta, é possível:

- cadastrar um novo paciente;
- informar dados pessoais e de idade;
- registrar dados de pai e mãe/ responsáveis;
- definir e-mail e senha de acesso do paciente no app;
- pesquisar pacientes por nome ou e-mail.

Todos os pacientes são vinculados ao `terapeuta_id` do profissional autenticado.

### 3. Perfil do paciente

Na aba de perfil, o terapeuta pode:

- visualizar dados básicos do paciente;
- editar nome, idade, e-mail, senha e dados dos responsáveis;
- visualizar a prancha ativa atualmente;
- consultar histórico de adições e exclusões de cartões;
- filtrar o histórico por período com `data início` e `data fim`;
- excluir permanentemente o paciente e os cartões vinculados.

### 4. Monitoramento em tempo real

Na aba de monitoramento, o sistema observa a coleção do paciente no Firestore e renderiza a frase atual em tempo real.

Isso permite ao terapeuta acompanhar a sequência de pictogramas usados pelo paciente no app em tempo real.

### 5. Montagem de prancha com pictogramas

A aba “Montar Prancha” permite:

- buscar pictogramas pela API ARASAAC;
- navegar por categorias predefinidas;
- selecionar até 10 itens por prancha;
- visualizar a prancha em construção;
- salvar a prancha no Firebase;
- remover cartões ativos após salvar.

### 6. Histórico de alterações

Cada exclusão de cartão gera um registro em `historico`, preservando:

- `paciente_id`;
- `tipo`;
- `label`;
- `arasaacId`;
- `categoria`;
- `descricao`;
- `autor`;
- `timestamp`.

Esses dados são exibidos no perfil do paciente para auditoria.

## Stack tecnológica

- React 19
- TypeScript
- Vite
- Firebase Authentication
- Firebase Firestore
- Tailwind CSS
- React Router DOM
- React Hot Toast
- Lucide React
- Framer Motion
- API ARASAAC

## Estrutura do projeto

```text
src/
├── App.tsx                     # fluxo principal do painel do terapeuta
├── CadastroTerapeuta.tsx       # cadastro do terapeuta
├── CadastroPaciente.tsx        # cadastro do paciente e acesso do app
├── ListaPacientes.tsx          # lista e busca de pacientes
├── PainelPaciente.tsx          # navegação entre perfil, monitoramento e prancha
├── PerfilPaciente.tsx          # edição, histórico e exclusão de paciente
├── Monitoramento.tsx           # acompanhamento em tempo real do paciente
├── CardExibicao.tsx            # componente visual de pictograma/cartão
├── firebase.ts                 # inicialização do Firebase
├── loginTerapeuta.tsx          # login do terapeuta
└── service/
    ├── arasaac.ts              # serviço de consulta à API ARASAAC
    └── GerenciadorCards.tsx    # busca, seleção e salvamento de prancha
```

## Coleções e dados principais no Firestore

### `terapeutas`

Armazena os dados dos terapeutas, com campos como:

- `nome`
- `email`
- `conselho`
- `registro`
- `especialidade`
- `status`
- `dataCadastro`

### `pacientes`

Armazena os dados do paciente e dos responsáveis:

- `nome`
- `idade`
- `email`
- `senha` / `senhaApp`
- `nomePai`, `zapPai`, `emailPai`
- `nomeMae`, `zapMae`, `emailMae`
- `terapeuta_id`
- `dataCadastro`
- `currentSentence` (monitoramento em tempo real)

### `cartoes_customizados`

Armazena os cartões ativos da prancha por paciente:

- `label`
- `categoria`
- `arasaacId`
- `paciente_id`
- `criadoEm`

### `historico`

Armazena registros de ações importantes, principalmente exclusões:

- `paciente_id`
- `tipo`
- `label`
- `arasaacId`
- `categoria`
- `descricao`
- `autor`
- `timestamp`

## Fluxo de uso

1. O terapeuta faz login ou cadastra uma conta.
2. O sistema identifica o status da conta (`pendente`, `aprovado` ou `reprovado`).
3. Se aprovado, o terapeuta acessa o painel principal.
4. No painel, é possível cadastrar pacientes e visualizar a lista.
5. Ao selecionar um paciente, abre-se o painel individual com 3 abas:
   - Perfil e Histórico
   - Monitoramento
   - Montar Prancha
6. O terapeuta pode editar dados do paciente, salvar uma prancha e acompanhar a interação em tempo real.

## Requisitos de ambiente

Antes de rodar o projeto, você precisa ter instalado na máquina:

- Git
- Node.js 18 ou superior
- npm 9 ou superior
- um editor de código, como VS Code
- uma conta no Firebase com projeto já criado, caso queira usar seu próprio backend

> O projeto já inclui as dependências principais no arquivo `package.json`. A instalação é feita automaticamente com o comando `npm install`.

## Tutorial completo de instalação

### 1. Baixar o repositório

Abra o terminal e clone o projeto:

```bash
git clone https://github.com/seu-usuario/conecta-terapeuta.git
cd conecta-terapeuta
```

Se você estiver em um repositório local já existente, basta entrar na pasta do projeto:

```bash
cd conecta-terapeuta
```

### 2. Verificar se o Node.js está instalado

No terminal, execute:

```bash
node -v
npm -v
```

Se os comandos retornarem versões, a instalação está correta. Caso contrário, instale o Node.js a partir do site oficial:

- https://nodejs.org/

### 3. Instalar as dependências do projeto

Dentro da pasta do projeto, execute:

```bash
npm install
```

Esse comando vai instalar todas as bibliotecas necessárias, como:

- react
- react-dom
- react-router-dom
- firebase
- lucide-react
- motion
- react-hot-toast
- vite
- typescript
- tailwindcss
- eslint

Se preferir, também pode usar:

```bash
npm ci
```

Mas, em geral, `npm install` é o comando mais simples para quem está começando.

### 4. Ajustar a configuração do Firebase

O arquivo [src/firebase.ts](src/firebase.ts) já contém a configuração de conexão com o Firebase. Se você estiver usando o projeto original, isso costuma funcionar diretamente.

Se quiser rodar em outro projeto Firebase, abra o arquivo [src/firebase.ts](src/firebase.ts) e substitua os valores de configuração pelo projeto da sua conta.

### 5. Rodar o projeto em modo de desenvolvimento

Com as dependências instaladas, execute:

```bash
npm run dev
```

O Vite vai iniciar o servidor e mostrar uma URL parecida com:

```text
http://localhost:5173
```

Abra essa URL no navegador para visualizar a aplicação.

### 6. Build para produção

Quando quiser gerar a versão otimizada para deploy, rode:

```bash
npm run build
```

Esse comando cria a pasta `dist` pronta para publicação.

### 7. Visualizar a build gerada

Depois do build, você pode testar o resultado com:

```bash
npm run preview
```

## Estrutura básica do ambiente local

Depois do clone, a estrutura da pasta deve ficar assim:

```text
conecta-terapeuta/
├── node_modules/
├── package.json
├── package-lock.json
├── src/
├── public/
├── vite.config.ts
└── index.html
```

## Comandos úteis

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

## Solução de problemas comuns

### Erro: `npm` não é reconhecido

Isso significa que o Node.js ainda não está instalado corretamente no sistema.

Solução:

1. reinstale o Node.js;
2. reinicie o terminal;
3. teste novamente com `node -v` e `npm -v`.

### Erro: `vite` ou `react` não encontrados

Isso geralmente acontece porque as dependências não foram instaladas.

Solução:

```bash
npm install
```

### Erro ao abrir o navegador: porta já em uso

O Vite pode tentar usar uma porta diferente automaticamente. Verifique a mensagem do terminal e tente a nova URL mostrada.

### Erro de conexão com Firebase

Verifique se:

- a chave do Firebase está correta;
- o projeto Firebase existe;
- o Firestore e Authentication estão habilitados.

## Resumo rápido para iniciantes

Se você estiver iniciando do zero, os passos mínimos são:

```bash
git clone https://github.com/seu-usuario/conecta-terapeuta.git
cd conecta-terapeuta
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Configuração do Firebase

As credenciais de conexão com o Firebase estão centralizadas em:

- `src/firebase.ts`

Se você for usar este projeto em outro ambiente, substitua as configurações do Firebase pelo projeto correspondente.

## Observações importantes

- O projeto é uma solução front-end com persistência em Firebase.
- A integração com ARASAAC depende da disponibilidade da API pública.
- O nome do projeto exibido na interface é `Conecta PECS`.
- A interface é totalmente voltada para o painel de gerenciamento do terapeuta.

## Melhorias futuras possíveis

- criação de área administrativa para aprovação manual de terapeutas;
- exportação de histórico em PDF/CSV;
- dashboard com métricas por paciente;
- autenticação de pacientes com fluxo separado;
- suporte a múltiplos tipos de comunicação e terapias.

## Licença

Este projeto está em desenvolvimento e pode ser adaptado conforme a necessidade da equipe ou da instituição responsável.
