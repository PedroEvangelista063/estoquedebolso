const STORAGE_KEY = '@estoque_bolso_web_produtos';

// Referências aos elementos do DOM
const form = document.getElementById('add-form');
const nomeInput = document.getElementById('nome');
const precoInput = document.getElementById('preco');
const quantidadeInput = document.getElementById('quantidade');
const productList = document.getElementById('product-list');
const globalTotalElement = document.getElementById('global-total');

// Estado da Aplicação
let produtos = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Previne o reload da página
        adicionarProduto();
    });
});

// Funções de Armazenamento (Substituindo AsyncStorage pelo localStorage)
function carregarProdutos() {
    try {
        const jsonValue = localStorage.getItem(STORAGE_KEY);
        produtos = jsonValue ? JSON.parse(jsonValue) : [];
        renderizarLista();
    } catch (error) {
        console.error("Erro ao ler do localStorage", error);
        produtos = [];
    }
}

function salvarProdutos() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(produtos));
    } catch (error) {
        console.error("Erro ao salvar no localStorage", error);
    }
}

// Ações Principais
function adicionarProduto() {
    const nome = nomeInput.value.trim();
    const preco = precoInput.value;
    const quantidade = quantidadeInput.value;
    
    if (!nome) return;

    const novoProduto = {
        id: Date.now().toString(),
        nome: nome,
        preco: preco ? parseFloat(preco) : 0,
        quantidade: quantidade ? parseInt(quantidade) : 0
    };

    // Adiciona o novo produto no começo da lista
    produtos.unshift(novoProduto); 
    salvarProdutos();
    
    // Limpar e focar o formulário novamente
    form.reset();
    nomeInput.focus();
    
    renderizarLista();
}

// O objeto `window` é exposto para ser chamado via `onclick` no HTML gerado
window.atualizarQuantidade = function(id, operacao) {
    produtos = produtos.map(prod => {
        if (prod.id === id) {
            let novaQuantidade = prod.quantidade;
            
            if (operacao === 'venda' && novaQuantidade > 0) {
                novaQuantidade -= 1;
            } else if (operacao === 'reposicao') {
                novaQuantidade += 1;
            }
            
            return { ...prod, quantidade: novaQuantidade };
        }
        return prod;
    });
    
    salvarProdutos();
    renderizarLista();
}

window.excluirProduto = function(id) {
    if (confirm('Tem certeza que deseja excluir este produto do estoque?')) {
        produtos = produtos.filter(prod => prod.id !== id);
        salvarProdutos();
        renderizarLista();
    }
}

// Renderização na Tela (Manipulação de DOM)
function renderizarLista() {
    productList.innerHTML = '';
    
    let somaTotalGlobal = 0;

    if (produtos.length === 0) {
        productList.innerHTML = '<li style="text-align:center; color:#6b7280; padding:20px; font-weight:500;">Nenhum produto cadastrado no estoque.</li>';
        if (globalTotalElement) globalTotalElement.innerText = 'Total: R$ 0,00';
        return;
    }

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    produtos.forEach((prod, index) => {
        const totalProduto = prod.preco * prod.quantidade;
        somaTotalGlobal += totalProduto;

        const li = document.createElement('li');
        li.className = 'product-card';
        // Delay progressivo na animação baseado na posição (máximo de 0.5s)
        li.style.animationDelay = `${Math.min(index * 0.1, 0.5)}s`;
        
        const precoFormatado = formatter.format(prod.preco);
        const totalFormatado = formatter.format(totalProduto);
        
        li.innerHTML = `
            <div class="product-info">
                <div class="product-name" title="${prod.nome}">${prod.nome}</div>
                <div class="product-stock">Estoque: <strong>${prod.quantidade}</strong></div>
                <div class="product-price">Unid: ${precoFormatado} • <strong style="color:var(--primary-color)">Soma: ${totalFormatado}</strong></div>
            </div>
            <div class="product-actions">
                <button type="button" class="btn-action btn-delete" aria-label="Excluir produto" onclick="excluirProduto('${prod.id}')">🗑️</button>
                <button type="button" class="btn-action btn-minus" aria-label="Vender um item" onclick="atualizarQuantidade('${prod.id}', 'venda')">−</button>
                <button type="button" class="btn-action btn-plus" aria-label="Repor um item" onclick="atualizarQuantidade('${prod.id}', 'reposicao')">+</button>
            </div>
        `;
        
        productList.appendChild(li);
    });

    if (globalTotalElement) {
        globalTotalElement.innerText = `Total: ${formatter.format(somaTotalGlobal)}`;
    }
}
