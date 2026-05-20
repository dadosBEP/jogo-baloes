const DEFAULT_PRODUTOS = [
  "CRM Plus",
  "ERP Cloud",
  "Analytics Pro",
  "DataVault"
];

const DEFAULT_CLIENTES = [
  "Banco Alfa",
  "TechCorp",
  "EduFuture",
  "Energia Verde"
];

let produtos = [...DEFAULT_PRODUTOS];
let clientes = [...DEFAULT_CLIENTES];

let gameProdutos = [];
let gameClientes = [];

let pairs = [];

let currentRound = 0;
let totalRounds = 0;

let phase = "produto";

let pickedProduto = null;

const BALLOON_COLORS = [
  "#ff6b6b",
  "#ffd93d",
  "#6bcb77",
  "#4d96ff",
  "#c77dff"
];

function renderTags(type){

  const list = type === "produto"
    ? produtos
    : clientes;

  const container = document.getElementById(`${type}-tags`);

  container.innerHTML = "";

  list.forEach((item,i)=>{

    const tag = document.createElement("span");

    tag.className = "tag";

    tag.innerHTML = `
      ${item}
      <button class="remove"
      onclick="removeItem('${type}',${i})">
      ×
      </button>
    `;

    container.appendChild(tag);

  });

}

function addItem(type){

  const input = document.getElementById(`${type}-input`);

  const value = input.value.trim();

  if(!value) return;

  if(type === "produto"){
    produtos.push(value);
  }else{
    clientes.push(value);
  }

  input.value = "";

  renderTags(type);

}

function removeItem(type,index){

  if(type === "produto"){
    produtos.splice(index,1);
  }else{
    clientes.splice(index,1);
  }

  renderTags(type);

}

function resetToDefaults(){

  produtos = [...DEFAULT_PRODUTOS];
  clientes = [...DEFAULT_CLIENTES];

  renderTags("produto");
  renderTags("cliente");

}

function startGame(){

  gameProdutos = shuffle([...produtos]);
  gameClientes = shuffle([...clientes]);

  totalRounds = Math.min(
    gameProdutos.length,
    gameClientes.length
  );

  currentRound = 0;

  pairs = [];

  showScreen("game-screen");

  startRound();

}

function startRound(){

  currentRound++;

  phase = "produto";

  pickedProduto = null;

  document.getElementById("round-label").textContent =
    `Rodada ${currentRound}`;

  spawnBalloons("produto");

}

function spawnBalloons(type){

  const arena = document.getElementById("arena");

  arena.innerHTML = "";

  const list = type === "produto"
    ? gameProdutos
    : gameClientes;

  list.forEach((item,i)=>{

    const balloon = document.createElement("div");

    balloon.className = "balloon";

    balloon.style.left =
      `${Math.random()*600}px`;

    balloon.style.top =
      `${Math.random()*220}px`;

    const color =
      BALLOON_COLORS[i % BALLOON_COLORS.length];

    balloon.innerHTML = `
      <div class="balloon-body"
      style="background:${color}">
        ?
      </div>
      <div class="balloon-string"></div>
    `;

    balloon.onclick = ()=>{

      if(type === "produto"){

        pickedProduto = item;

        gameProdutos =
          gameProdutos.filter(p=>p!==item);

        revealItem(item,"produto");

      }else{

        gameClientes =
          gameClientes.filter(c=>c!==item);

        revealItem(item,"cliente");

      }

    };

    arena.appendChild(balloon);

  });

}

function revealItem(item,type){

  const overlay =
    document.getElementById("reveal-overlay");

  overlay.classList.add("active");

  document.getElementById("reveal-name")
    .textContent = item;

  overlay.onclick = ()=>{

    overlay.classList.remove("active");

    if(type === "produto"){

      phase = "cliente";

      spawnBalloons("cliente");

    }else{

      pairs.push({
        round:currentRound,
        produto:pickedProduto,
        cliente:item
      });

      if(currentRound >= totalRounds){

        showFinal();

      }else{

        startRound();

      }

    }

  };

}

function showFinal(){

  showScreen("final-screen");

  const grid =
    document.getElementById("pairs-grid");

  grid.innerHTML = "";

  pairs.forEach(pair=>{

    const card =
      document.createElement("div");

    card.className = "pair-card";

    card.innerHTML = `
      <div>📦 ${pair.produto}</div>
      <div>🏢 ${pair.cliente}</div>
    `;

    grid.appendChild(card);

  });

}

function goSetup(){

  showScreen("setup-screen");

}

function showScreen(id){

  document.querySelectorAll(".screen")
    .forEach(screen=>{

      screen.classList.remove("active");

    });

  document.getElementById(id)
    .classList.add("active");

}

function shuffle(arr){

  for(let i = arr.length - 1; i > 0; i--){

    const j =
      Math.floor(Math.random() * (i + 1));

    [arr[i],arr[j]] =
    [arr[j],arr[i]];

  }

  return arr;

}

renderTags("produto");
renderTags("cliente");