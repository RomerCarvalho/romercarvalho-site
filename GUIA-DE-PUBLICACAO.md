# Guia de publicação — Romer Carvalho Advocacia

Este guia coloca o site no ar em **romercarvalho.adv.br** com uma área de administração em
**romercarvalho.adv.br/admin**, onde você escreve e publica artigos com login e senha.

Como funciona, em uma frase: o site fica guardado no **GitHub**, a **Netlify** publica o site
automaticamente a cada alteração, e o painel **/admin** grava os seus artigos no GitHub.

Tudo é gratuito. A configuração é feita uma vez só (cerca de 30 minutos).

---

## Passo 1 — Criar a conta no GitHub

1. Acesse **github.com/signup** e crie uma conta (e-mail, senha e um nome de usuário).
2. Guarde o **nome de usuário**: ele será usado no passo 5.
3. Recomendado: ative a verificação em duas etapas (Settings → Password and authentication).
   Essa conta é a chave do seu painel.

## Passo 2 — Enviar o site para o GitHub

1. No GitHub, clique em **+ → New repository**.
2. Nome: `romercarvalho-site`. Pode marcar **Private** (privado). Clique em **Create repository**.
3. Na página do repositório, clique em **uploading an existing file**.
4. Descompacte o arquivo .zip no seu computador e **arraste todo o conteúdo da pasta**
   (as pastas `admin`, `content`, `src` e os arquivos `build.js`, `package.json`, `netlify.toml` etc.).
5. Clique em **Commit changes**.

## Passo 3 — Publicar pela Netlify

1. Acesse **app.netlify.com**, entre com a opção **GitHub**.
2. Clique em **Add new project → Import an existing project → GitHub** e escolha `romercarvalho-site`.
3. As configurações já vêm prontas no arquivo `netlify.toml`. Clique em **Deploy**.
4. Em cerca de um minuto o site estará no ar em um endereço provisório (algo como `nome.netlify.app`).
5. Em **Domain management**, adicione **romercarvalho.adv.br** e siga as instruções para apontar
   o domínio no **Registro.br** (área de DNS). O https é criado automaticamente.

## Passo 4 — Liberar o login do painel

O painel usa o login do GitHub. Para isso, é preciso criar uma “chave” no GitHub e entregá-la à Netlify.

**No GitHub:**
1. Acesse **github.com/settings/developers → OAuth Apps → New OAuth App**.
2. Preencha:
   - Application name: `Painel Romer Carvalho`
   - Homepage URL: `https://romercarvalho.adv.br`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
3. Clique em **Register application**. Copie o **Client ID**.
4. Clique em **Generate a new client secret** e copie o **Client secret** (ele aparece uma vez só).

**Na Netlify:**
1. No seu projeto, vá em **Project configuration → Security (ou Access & security) → OAuth**.
2. Clique em **Install provider**, escolha **GitHub** e cole o Client ID e o Client secret.

*Os nomes dos menus podem variar um pouco conforme as atualizações da Netlify e do GitHub.*

## Passo 5 — Usuário do painel

Já configurado: o painel aponta para `romercarvalho/romercarvalho-site`.
Se você der outro nome ao repositório, ajuste a linha `repo:` em `admin/config.yml`.

## Passo 6 — Usar o painel

1. Acesse **romercarvalho.adv.br/admin** e clique em **Entrar com GitHub**.
2. Em **Artigos → Novo Artigo**, preencha título, etapa da jornada, resumo, data, fundamentos legais e texto.
   A prévia ao lado mostra como o artigo vai ficar.
3. Clique em **Publicar**. Em cerca de um minuto o artigo aparece no site, nas cores da etapa escolhida,
   com página própria e na lista de Artigos.
4. Para guardar sem publicar, marque **Rascunho**.
5. Em **Entrevistas → Vídeos do YouTube**, adicione título, programa e link de cada vídeo.
   A seção Entrevistas só aparece no site quando houver pelo menos um vídeo.

---

## Antes de ir ao ar

- **Foto:** envie sua foto para a pasta `src/images/` com o nome `romer-carvalho.jpg`
  (vertical, cerca de 1200 × 1500 pixels). Sem a foto, a seção “Sobre” mostra só o texto.
- **Revisão:** leia os artigos e as referências legais. Os textos foram escritos para a sua revisão.
- **Google Analytics / Ads:** quando tiver os códigos, preencha `src/analytics.js`.

## Estrutura do projeto

| Pasta / arquivo | O que é |
|---|---|
| `content/artigos/` | Um arquivo por artigo. É aqui que o painel grava. |
| `content/entrevistas.json` | Lista de vídeos do YouTube. |
| `src/` | Páginas, estilos, imagens e scripts do site. |
| `admin/` | O painel de administração. |
| `build.js` | Gera as páginas dos artigos e a lista a partir de `content/`. |
| `netlify.toml` | Diz à Netlify como publicar. |

## Links diretos para cada etapa (anúncios, Instagram, WhatsApp)

- romercarvalho.adv.br/#gestacao
- romercarvalho.adv.br/#filiacao
- romercarvalho.adv.br/#uniao
- romercarvalho.adv.br/#divorcio
- romercarvalho.adv.br/#maturidade
- romercarvalho.adv.br/#planejamento
- romercarvalho.adv.br/#sucessao
