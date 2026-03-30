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