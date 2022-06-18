/* Um desenvolvedor tentou criar um projeto que consome a base de dados de filme do TMDB para criar um 
organizador de filmes, mas desistiu pois considerou o seu código inviável. 
 Você consegue usar typescript para organizar esse código e a partir daí aprimorar o que foi feito?
 A ideia dessa atividade é criar um aplicativo que: 
    - Busca filmes
    - Apresenta uma lista com os resultados pesquisados
    - Permite a criação de listas de filmes e a posterior adição de filmes nela
 Todas as requisições necessárias para as atividades acima já estão prontas, mas a implementação delas ficou pela metade
(não vou dar tudo de graça).
 Atenção para o listener do botão login-button que devolve o sessionID do usuário
 É necessário fazer um cadastro no https://www.themoviedb.org/ e seguir a documentação do site para entender 
 como gera uma API key https://developers.themoviedb.org/3/getting-started/introduction
*/




let apiKey;
let requestToken;
let username;
let password;
let sessionId;
let listId = '7101979';

let loginButton = document.getElementById('login-button');
let searchButton = document.getElementById('search-button');
let searchContainer = document.getElementById('search-container');

/*  ~~~~~~~~~~~~~~~~~~~~~     EventListener nao funcionou ~~~~~~~~~~~~~~~~
loginButton.addEventListener('click', async () => {
    console.log('aqui')
  await criarRequestToken();
  await logar();
  await criarSessao();
});

if(loginButton){
    loginButton.addEventListener('click', function (){
        console.log('aqui');
    }) 
}*/

async function botaoLogin(){
    await criarRequestToken();
    await logar();
    await criarSessao();
}


async function botaoPesquisar() {
   
    let lista = document.getElementById("lista");
    if (lista) {
      lista.outerHTML = "";
    }

    let query = document.getElementById('search').value;
    let listaDeFilmes = await procurarFilme(query); 

    let ul = document.createElement('ul');
    ul.id = "lista"
    for (const item of listaDeFilmes.results) {
      let li = document.createElement('li');      
    
      li.appendChild(document.createTextNode(item.original_title))
      ul.appendChild(li)

      document.body.appendChild(ul);
    }
    console.log(listaDeFilmes);
   
   

    searchContainer?.appendChild(ul);
    
}
/* ~~~~~~~~~~~~~~~~~~~~~     EventListener nao funcionou ~~~~~~~~~~~~~~~~~~~~~~~~~~~
searchButton?.addEventListener('click', async () => {
    console.log('aqui')
  let lista = document.getElementById("lista");
  if (lista) {
    lista.outerHTML = "";
  }
  let query = document.getElementById('search').value;
  let listaDeFilmes = await procurarFilme(query);
  let ul = document.createElement('ul');
  ul.id = "lista"
  for (const item of listaDeFilmes.results) {
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(item.original_title))
    ul.appendChild(li)
  }
  console.log(listaDeFilmes);
  searchContainer.appendChild(ul);
})*/

function preencherLogin() {
    username =  (document.getElementById('login')as HTMLInputElement).value;
    validateLoginButton();
  }

function preencherSenha() {
  password = (document.getElementById('senha')as HTMLInputElement).value;
  validateLoginButton();
}

function preencherApi() {
  apiKey = (document.getElementById('api-key')as HTMLInputElement).value;
  validateLoginButton();
}

function validateLoginButton() {
  if (password && username && apiKey) {
    (document.getElementById("login-button")as HTMLInputElement).disabled = false;  
  } else {
    (document.getElementById("login-button")as HTMLInputElement).disabled = true;
  }
}

class HttpClient {
  static async get({url, method, body = null}) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open(method, url, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject({
            status: request.status,
            statusText: request.statusText
          })
        }
      }
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }

      if (body) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        body = JSON.stringify(body);
      }
      request.send(body);
    })
  }
}

async function procurarFilme(query) {
  query = encodeURI(query)
  console.log(query)
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
    method: "GET"
  })
  return result
}

async function adicionarFilme(filmeId) {
    console.log('adiciona filme')
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
    method: "GET"
  })
  console.log(result);
}

async function criarRequestToken () {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
    method: "GET"
  })
  requestToken = result.request_token
}

async function logar() {
  await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
    method: "POST",
    body: {
      username: `${username}`,
      password: `${password}`,
      request_token: `${requestToken}`
    }
  })
}

async function criarSessao() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
    method: "GET"
  })
  sessionId = result.session_id;
}

async function criarLista(nomeDaLista, descricao) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      name: nomeDaLista,
      description: descricao,
      language: "pt-br"
    }
  })
  console.log(result);
}

async function adicionarFilmeNaLista(filmeId, listaId) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      media_id: filmeId
    }
  })
  console.log(result);
}

async function pegarLista() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
    method: "GET"
  })
  console.log(result);
}