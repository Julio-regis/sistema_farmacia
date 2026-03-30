<<<<<<< HEAD
const API_URL = "http://localhost:8080/medicamentos";
const LIMITE_ESTOQUE_BAIXO = 5;
const LIMITE_PROXIMO_VENCIMENTO = 30;

let carrinho = [];
let medicamentosCache = [];

/* =========================
   FUNÇÕES AUXILIARES
========================= */

function formatarPreco(valor) {
  return Number(valor || 0).toFixed(2).replace(".", ",");
}

function formatarData(data) {
  if (!data) return "Não informada";

  const partes = data.split("-");
  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function diasParaVencer(validade) {
  if (!validade) return null;

  const partes = validade.split("-");
  if (partes.length !== 3) return null;

  const ano = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const dia = parseInt(partes[2], 10);

  const hoje = new Date();
  const dataValidade = new Date(ano, mes, dia);

  hoje.setHours(0, 0, 0, 0);
  dataValidade.setHours(0, 0, 0, 0);

  const diferenca = dataValidade.getTime() - hoje.getTime();
  return Math.floor(diferenca / (1000 * 60 * 60 * 24));
}

function mostrarErroListas(mensagem) {
  const html = `<div class="empty-state">${mensagem}</div>`;

  const lista = document.getElementById("lista");
  const listaVencimento = document.getElementById("listaVencimento");
  const listaVencidos = document.getElementById("listaVencidos");

  if (lista) lista.innerHTML = html;
  if (listaVencimento) listaVencimento.innerHTML = html;
  if (listaVencidos) listaVencidos.innerHTML = html;
}

function limparCamposCadastro() {
  document.getElementById("nome").value = "";
  document.getElementById("preco").value = "";
  document.getElementById("quantidade").value = "";
  document.getElementById("validade").value = "";
}

/* =========================
   RESUMO DO TOPO
========================= */

function atualizarResumo(data) {
  const qtdMedicamentos = document.getElementById("qtdMedicamentos");
  const estoqueBaixo = document.getElementById("estoqueBaixo");
  const proximosVencer = document.getElementById("proximosVencer");
  const vencidos = document.getElementById("vencidos");

  if (qtdMedicamentos) {
    qtdMedicamentos.innerText = data.length;
  }

  if (estoqueBaixo) {
    const totalEstoqueBaixo = data.filter(
      medicamento => Number(medicamento.quantidade) <= LIMITE_ESTOQUE_BAIXO
    ).length;
    estoqueBaixo.innerText = totalEstoqueBaixo;
  }

  if (proximosVencer) {
    const totalProximos = data.filter(medicamento => {
      const dias = diasParaVencer(medicamento.validade);
      return dias !== null && dias >= 0 && dias <= LIMITE_PROXIMO_VENCIMENTO;
    }).length;
    proximosVencer.innerText = totalProximos;
  }

  if (vencidos) {
    const totalVencidos = data.filter(medicamento => {
      const dias = diasParaVencer(medicamento.validade);
      return dias !== null && dias < 0;
    }).length;
    vencidos.innerText = totalVencidos;
  }
}

/* =========================
   STATUS DE VALIDADE
========================= */

function criarStatusValidade(medicamento) {
  if (!medicamento.validade) {
    return `<p><strong>Validade:</strong> Não informada</p>`;
  }

  const dias = diasParaVencer(medicamento.validade);

  if (dias === null) {
    return `<p><strong>Validade:</strong> ${medicamento.validade}</p>`;
  }

  if (dias < 0) {
    return `
      <p><strong>Validade:</strong> ${formatarData(medicamento.validade)}</p>
      <div class="vencido">Vencido há ${Math.abs(dias)} dia(s)</div>
    `;
  }

  if (dias <= LIMITE_PROXIMO_VENCIMENTO) {
    return `
      <p><strong>Validade:</strong> ${formatarData(medicamento.validade)}</p>
      <div class="proximo-vencer">Vence em ${dias} dia(s)</div>
    `;
  }

  return `
    <p><strong>Validade:</strong> ${formatarData(medicamento.validade)}</p>
    <div class="validade-ok">Validade em dia</div>
  `;
}

/* =========================
   CARDS
========================= */

function criarCard(medicamento) {
  const estoqueBaixo =
    Number(medicamento.quantidade) <= LIMITE_ESTOQUE_BAIXO
      ? `<div class="tag-estoque-baixo">Estoque baixo</div>`
      : "";

  const dias = diasParaVencer(medicamento.validade);
  const botaoDesabilitado = dias !== null && dias < 0;
  const textoBotao = botaoDesabilitado ? "Medicamento vencido" : "Vender";

  return `
    <div class="card-medicamento">
      <h3>${medicamento.nome}</h3>
      <p><strong>ID:</strong> ${medicamento.id}</p>
      <p><strong>Preço:</strong> R$ ${formatarPreco(medicamento.preco)}</p>
      <p><strong>Quantidade em estoque:</strong> ${medicamento.quantidade}</p>
      ${criarStatusValidade(medicamento)}
      ${estoqueBaixo}
      <button
        class="btn btn-primary"
        onclick="adicionarNaVenda(${medicamento.id})"
        ${botaoDesabilitado ? "disabled" : ""}
      >
        ${textoBotao}
      </button>
    </div>
  `;
}

function criarCardVenda(item) {
  const subtotal = Number(item.preco) * Number(item.quantidadeVenda);

  return `
    <div class="card-medicamento">
      <h3>${item.nome}</h3>
      <p><strong>Preço unitário:</strong> R$ ${formatarPreco(item.preco)}</p>
      <p><strong>Em estoque:</strong> ${item.quantidade}</p>
      <p><strong>Subtotal:</strong> R$ ${formatarPreco(subtotal)}</p>

      <div style="display:flex; gap:10px; align-items:center; margin-top:12px; flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="diminuirQuantidadeVenda(${item.id})">-</button>
        <span><strong>Quantidade:</strong> ${item.quantidadeVenda}</span>
        <button class="btn btn-primary" onclick="aumentarQuantidadeVenda(${item.id})">+</button>
      </div>

      <button class="btn btn-secondary" style="margin-top:12px;" onclick="removerDaVenda(${item.id})">
        Remover
      </button>
    </div>
  `;
}

/* =========================
   RENDERIZAÇÃO
========================= */

function renderizarLista(idElemento, data) {
  const elemento = document.getElementById(idElemento);
  if (!elemento) return;

  elemento.innerHTML = "";

  if (!data || data.length === 0) {
    elemento.innerHTML = `<div class="empty-state">Nenhum medicamento encontrado.</div>`;
    return;
  }

  data.forEach(medicamento => {
    elemento.innerHTML += criarCard(medicamento);
  });
}

/* =========================
   LISTAS FILTRADAS
========================= */

function listarProximos(data) {
  const proximos = data
    .filter(medicamento => {
      const dias = diasParaVencer(medicamento.validade);
      return dias !== null && dias >= 0 && dias <= LIMITE_PROXIMO_VENCIMENTO;
    })
    .sort((a, b) => diasParaVencer(a.validade) - diasParaVencer(b.validade));

  const lista = document.getElementById("listaVencimento");
  if (!lista) return;

  if (proximos.length === 0) {
    lista.innerHTML = `<div class="empty-state">Nenhum medicamento próximo de vencer.</div>`;
    return;
  }

  renderizarLista("listaVencimento", proximos);
}

function listarVencidos(data) {
  const vencidos = data
    .filter(medicamento => {
      const dias = diasParaVencer(medicamento.validade);
      return dias !== null && dias < 0;
    })
    .sort((a, b) => diasParaVencer(a.validade) - diasParaVencer(b.validade));

  const lista = document.getElementById("listaVencidos");
  if (!lista) return;

  if (vencidos.length === 0) {
    lista.innerHTML = `<div class="empty-state">Nenhum medicamento vencido.</div>`;
    return;
  }

  renderizarLista("listaVencidos", vencidos);
}

function atualizarTela(data) {
  atualizarResumo(data);
  renderizarLista("lista", data);
  listarProximos(data);
  listarVencidos(data);
}

/* =========================
   LISTAR GERAL
========================= */

function listar() {
  fetch(API_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao buscar medicamentos");
      }
      return response.json();
    })
    .then(data => {
      medicamentosCache = data;
      atualizarTela(data);
    })
    .catch(error => {
      console.error("Erro ao listar medicamentos:", error);
      mostrarErroListas("Erro ao carregar medicamentos.");
    });
}

/* =========================
   CADASTRAR
========================= */

function cadastrar() {
  const nome = document.getElementById("nome").value.trim();
  const preco = document.getElementById("preco").value;
  const quantidade = document.getElementById("quantidade").value;
  const validade = document.getElementById("validade").value;

  if (!nome || !preco || !quantidade || !validade) {
    alert("Preencha todos os campos.");
    return;
  }

  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nome: nome,
      preco: parseFloat(preco),
      quantidade: parseInt(quantidade, 10),
      validade: validade
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao cadastrar medicamento");
      }
      return response.json().catch(() => ({}));
    })
    .then(() => {
      alert("Medicamento cadastrado com sucesso!");
      limparCamposCadastro();
      listar();
    })
    .catch(error => {
      console.error("Erro ao cadastrar:", error);
      alert("Erro ao cadastrar medicamento.");
    });
}

/* =========================
   BUSCAR
========================= */

function buscar() {
  const campoBusca = document.getElementById("campoBusca");
  if (!campoBusca) return;

  const termo = campoBusca.value.toLowerCase().trim();

  if (!termo) {
    atualizarTela(medicamentosCache);
    return;
  }

  const filtrados = medicamentosCache.filter(medicamento =>
    medicamento.nome.toLowerCase().includes(termo)
  );

  atualizarTela(filtrados);
}

function limparBusca() {
  const campoBusca = document.getElementById("campoBusca");
  if (!campoBusca) return;

  campoBusca.value = "";
  atualizarTela(medicamentosCache);
}

/* =========================
   VENDAS
========================= */

function atualizarVenda() {
  const itensVenda = document.getElementById("itensVenda");
  const totalVenda = document.getElementById("totalVenda");

  if (!itensVenda || !totalVenda) return;

  itensVenda.innerHTML = "";

  if (carrinho.length === 0) {
    itensVenda.innerHTML = `<div class="empty-state">Nenhum item adicionado à venda.</div>`;
    totalVenda.innerText = "R$ 0,00";
    return;
  }

  let total = 0;

  carrinho.forEach(item => {
    total += Number(item.preco) * Number(item.quantidadeVenda);
    itensVenda.innerHTML += criarCardVenda(item);
  });

  totalVenda.innerText = `R$ ${formatarPreco(total)}`;
}

function adicionarNaVenda(id) {
  const medicamento = medicamentosCache.find(item => Number(item.id) === Number(id));

  if (!medicamento) {
    alert("Medicamento não encontrado.");
    return;
  }

  const dias = diasParaVencer(medicamento.validade);
  if (dias !== null && dias < 0) {
    alert("Não é permitido vender medicamento vencido.");
    return;
  }

  if (Number(medicamento.quantidade) <= 0) {
    alert("Esse medicamento está sem estoque.");
    return;
  }

  const itemExistente = carrinho.find(item => Number(item.id) === Number(medicamento.id));

  if (itemExistente) {
    if (itemExistente.quantidadeVenda < Number(medicamento.quantidade)) {
      itemExistente.quantidadeVenda += 1;
    } else {
      alert("Você atingiu o limite disponível em estoque.");
    }
  } else {
    carrinho.push({
      ...medicamento,
      quantidadeVenda: 1
    });
  }

  atualizarVenda();
}

function aumentarQuantidadeVenda(id) {
  const item = carrinho.find(produto => Number(produto.id) === Number(id));
  if (!item) return;

  if (Number(item.quantidadeVenda) >= Number(item.quantidade)) {
    alert("Você atingiu o limite disponível em estoque.");
    return;
  }

  item.quantidadeVenda += 1;
  atualizarVenda();
}

function diminuirQuantidadeVenda(id) {
  const item = carrinho.find(produto => Number(produto.id) === Number(id));
  if (!item) return;

  item.quantidadeVenda -= 1;

  if (item.quantidadeVenda <= 0) {
    carrinho = carrinho.filter(produto => Number(produto.id) !== Number(id));
  }

  atualizarVenda();
}

function removerDaVenda(id) {
  carrinho = carrinho.filter(item => Number(item.id) !== Number(id));
  atualizarVenda();
}

function limparVenda() {
  carrinho = [];
  atualizarVenda();
}

async function finalizarVenda() {
  if (carrinho.length === 0) {
    alert("Nenhum item na venda.");
    return;
  }

  try {
    for (const item of carrinho) {
      const dias = diasParaVencer(item.validade);
      if (dias !== null && dias < 0) {
        throw new Error(`O medicamento ${item.nome} está vencido.`);
      }

      const response = await fetch(`${API_URL}/${item.id}/baixar-estoque`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          quantidade: item.quantidadeVenda
        })
      });

      if (!response.ok) {
        const erroTexto = await response.text();
        throw new Error(erroTexto || `Erro ao baixar estoque do item ${item.nome}`);
      }
    }

    const total = carrinho.reduce((soma, item) => {
      return soma + (Number(item.preco) * Number(item.quantidadeVenda));
    }, 0);

    alert(`Venda finalizada com sucesso!\nTotal: R$ ${formatarPreco(total)}`);

    limparVenda();
    listar();
  } catch (error) {
    console.error("Erro ao finalizar venda:", error);
    alert(error.message || "Erro ao finalizar venda. Verifique o estoque e tente novamente.");
  }
}

/* =========================
   EVENTOS
========================= */

const campoBusca = document.getElementById("campoBusca");
if (campoBusca) {
  campoBusca.addEventListener("input", buscar);
}

/* =========================
   INICIAR SISTEMA
========================= */

listar();
atualizarVenda();
=======
const API_URL = "http://localhost:8080/medicamentos";
const VENDAS_URL = "http://localhost:8080/vendas";

function listar() {
  fetch(API_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao listar medicamentos");
      }
      return response.json();
    })
    .then(data => {
      const lista = document.getElementById("lista");
      lista.innerHTML = "";

      data.forEach(m => {
        const item = document.createElement("li");
        item.innerHTML = `
          ID: ${m.id} | Nome: ${m.nome} | Preço: R$ ${m.preco} | Quantidade: ${m.quantidade}
          <button class="btn-vermelho" onclick="deletar(${m.id})">Excluir</button>
        `;
        lista.appendChild(item);
      });
    })
    .catch(error => {
      console.error("Erro ao listar:", error);
      alert("Erro ao listar medicamentos");
    });
}

function cadastrar() {
  const nome = document.getElementById("nome").value;
  const preco = document.getElementById("preco").value;
  const quantidade = document.getElementById("quantidade").value;

  if (!nome || !preco || !quantidade) {
    alert("Preencha todos os campos do cadastro");
    return;
  }

  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nome: nome,
      preco: parseFloat(preco),
      quantidade: parseInt(quantidade)
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao cadastrar");
      }
      return response.json();
    })
    .then(() => {
      alert("Medicamento cadastrado com sucesso");
      document.getElementById("nome").value = "";
      document.getElementById("preco").value = "";
      document.getElementById("quantidade").value = "";
      listar();
    })
    .catch(error => {
      console.error("Erro ao cadastrar:", error);
      alert("Erro ao cadastrar medicamento");
    });
}

function vender() {
  const id = document.getElementById("idVenda").value;
  const quantidade = document.getElementById("quantidadeVenda").value;

  if (!id || !quantidade) {
    alert("Preencha os dados da venda");
    return;
  }

  fetch(`${API_URL}/${id}/vender/${quantidade}`, {
    method: "POST"
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao realizar venda");
      }
      return response.text();
    })
    .then(msg => {
      alert(msg);
      document.getElementById("idVenda").value = "";
      document.getElementById("quantidadeVenda").value = "";
      document.getElementById("buscarId").value = "";
      document.getElementById("resultadoBusca").innerHTML = "";
      listar();
      listarVendas();
    })
    .catch(error => {
      console.error("Erro na venda:", error);
      alert("Erro ao realizar venda");
    });
}

function deletar(id) {
  const confirmar = confirm("Tem certeza que deseja excluir este medicamento?");

  if (!confirmar) {
    return;
  }

  fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao deletar");
      }
      alert("Medicamento excluído com sucesso");
      listar();
    })
    .catch(error => {
      console.error("Erro ao deletar:", error);
      alert("Erro ao deletar medicamento");
    });
}

function atualizar() {
  const id = document.getElementById("idAtualizar").value;
  const nome = document.getElementById("nomeAtualizar").value;
  const preco = document.getElementById("precoAtualizar").value;
  const quantidade = document.getElementById("quantidadeAtualizar").value;

  if (!id || !nome || !preco || !quantidade) {
    alert("Preencha todos os campos da atualização");
    return;
  }

  fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nome: nome,
      preco: parseFloat(preco),
      quantidade: parseInt(quantidade)
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao atualizar");
      }
      return response.json();
    })
    .then(() => {
      alert("Medicamento atualizado com sucesso");
      document.getElementById("idAtualizar").value = "";
      document.getElementById("nomeAtualizar").value = "";
      document.getElementById("precoAtualizar").value = "";
      document.getElementById("quantidadeAtualizar").value = "";
      listar();
    })
    .catch(error => {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao atualizar medicamento");
    });
}

function buscarPorId() {
  const id = document.getElementById("buscarId").value;
  const resultadoBusca = document.getElementById("resultadoBusca");

  if (!id) {
    alert("Digite um ID");
    return;
  }

  fetch(`${API_URL}/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Medicamento não encontrado");
      }
      return response.json();
    })
    .then(m => {
      resultadoBusca.innerHTML = `
        <div class="medicamento-encontrado">
          <h3>${m.nome}</h3>
          <p><strong>ID:</strong> ${m.id}</p>
          <p><strong>Preço:</strong> R$ ${m.preco}</p>
          <p><strong>Quantidade em estoque:</strong> ${m.quantidade}</p>
          <button class="btn-amarelo" onclick="selecionarParaVenda(${m.id})">Selecionar para vender</button>
        </div>
      `;
    })
    .catch(error => {
      console.error("Erro na busca:", error);
      resultadoBusca.innerHTML = `
        <div class="medicamento-encontrado">
          <p>Medicamento não encontrado.</p>
        </div>
      `;
    });
}

function selecionarParaVenda(id) {
  document.getElementById("idVenda").value = id;
  document.getElementById("quantidadeVenda").focus();
}

function listarVendas() {
  fetch(VENDAS_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao listar vendas");
      }
      return response.json();
    })
    .then(data => {
      const listaVendas = document.getElementById("listaVendas");
      listaVendas.innerHTML = "";

      data.forEach(v => {
        const item = document.createElement("li");
        item.innerHTML = `
          ID: ${v.id} | Medicamento: ${v.nomeMedicamento} | Quantidade: ${v.quantidadeVendida}
          | Preço unitário: R$ ${v.precoUnitario} | Total: R$ ${v.valorTotal} | Data: ${v.dataVenda}
        `;
        listaVendas.appendChild(item);
      });
    })
    .catch(error => {
      console.error("Erro ao listar vendas:", error);
      alert("Erro ao listar vendas");
    });
}

window.onload = function () {
  listar();
  listarVendas();
};
