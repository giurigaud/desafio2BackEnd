const Koa = require("koa");
const bodyparser = require("koa-bodyparser");

const server = new Koa();

server.use(bodyparser());


const produto = {
    id: 1,
    nome: "Nome do produto",
    qtdade: 1, //atualizar toda vez q atualizar //se a qtdade for 0, n pode add
    valor: 300, //valor em centavos
    deletado: false
}

const produtos = [];
produtos.push(produto)


const pedido = {
    id: 1,
    produtos: [],
    status: "incompleto", //incompleto, processando, pago, enviado, entregue ou cancelado
    idCliente: "ola",
    deletado: false,
}

const valorPedido = () => {
    let valorProdutos = 0;

    for (let i = 0; i < pedido.produtos.length; i++) {
        valorProdutos += pedido.produtos[i].valor * pedido.produtos[i].qtdade;
    }
    return valorProdutos;
}

pedido.valorTotal = valorPedido();

const pedidos = [];
pedidos.push(pedido);

const formatarSucesso = (ctx, dados, status = 200) => {
    ctx.response.status = status;
    ctx.response.body = {
        status: "Sucesso!",
        dados: dados,
    };
};
const formatarErro = (ctx, mensagem, status = 404) => {
    ctx.response.status = status;
    ctx.response.body = {
        status: "erro",
        dados: {
            mensagem: mensagem,
        }
    };
};

//PRODUTOS
const obterProdutos = () => {
    return produtos.filter((produto) => produto.deletado === false && produto.qtdade >= 1)
};

const adicionarProduto = (ctx) => {
    const body = ctx.request.body;

    if (!body.nome || !body.qtdade || !body.valor) {
        formatarErro(ctx, 'Pedido mal formatado', 400);
        return;
    }

    const produto = {
        id: produtos.length + 1,
        nome: body.nome,
        qtdade: body.qtdade, //atualizar toda vez q atualizar //se a qtdade for 0, n pode add
        valor: body.valor, //valor em centavos
        deletado: false
    };

    produtos.push(produto);

    return produto;
};

const atualizarProduto = (ctx, path) => {
    const id = path[2];
    const body = ctx.request.body;

    if (!body.nome && !body.qtdade && !body.valor) {
        formatarErro(ctx, "Pedido mal formatado", 400);
        return;
    }

    if (id) {
        const produtoAtual = produtos[id - 1];
        if (produtoAtual) {
            const produtoAtualizado = {
                id: Number(id),
                nome: body.nome ? body.nome : produtoAtual.nome,
                qtdade: body.qtdade ? body.qtdade : produtoAtual.qtdade,
                valor: body.valor ? body.valor : produtoAtual.valor,
                deletado: produtoAtual.deletado,
            };

            produtos[id - 1] = produtoAtualizado;

            return produtoAtualizado;
        }
    } else {
        formatarErro(ctx, "Autor não encontrado", 404);
    }
};

const deletarProduto = (ctx, path) => {
    const id = path[2];
    const body = ctx.request.body;

    if (id) {
        const produtoAtual = produtos[id - 1];
        if (produtoAtual) {
            if (body.estado === true) {
                formatarErro(ctx, "Ação proibida", 403);
                return;
            }
            const produtoAtualizado = {
                id: produtoAtual.length + 1,
                nome: produtoAtual.nome,
                qtdade: produtoAtual.qtdade, //atualizar toda vez q atualizar //se a qtdade for 0, n pode add
                valor: produtoAtual.valor, //valor em centavos
                deletado: true,
            };

            produtos[id - 1] = produtoAtualizado;

            return produtoAtualizado;
        }
    } else {
        formatarErro(ctx, "Usuário não encontrado", 404);
    }
};

//PEDIDOS
const obterPedidos = () => {
    return pedidos.filter((pedido) => pedido.deletado === false)
};

const obterPedidosEntregues = () => {
    let entregue = pedidos.filter((pedido) => pedido.deletado === false && pedido.status === "entregue")
    if (entregue.length !== 0) {
        return entregue;
    } else {
        return 'Sem pedidos com esse status'
    }
};

const obterPedidosPagos = () => {
    let pagos = pedidos.filter((pedido) => pedido.deletado === false && pedido.status === "pagos")
    if (pagos.length !== 0) {
        return pagos;
    } else {
        return 'Sem pedidos com esse status'
    }

};
const obterPedidosProcessando = () => {
    let processando = pedidos.filter((pedido) => pedido.deletado === false && pedido.status === "processando")
    if (processando.length !== 0) {
        return processando;
    } else {
        return 'Sem pedidos com esse status'
    }
};

const obterPedidosCancelados = (ctx) => {
    let cancelados = pedidos.filter((pedido) => pedido.deletado === false && pedido.status === "cancelados")
    if (cancelados.length !== 0) {
        return cancelados;
    } else {
        return 'Sem pedidos com esse status'
    }
};

const adicionarPedido = (ctx) => {
    const body = ctx.request.body;

    if (!body.produtos || !body.idCliente || !body.valorTotal) {
        return formatarErro(ctx, "Pedido mal formatado", 400);
    }

    //talvez tenha coisa aqui

    const pedido = {
        id: pedidos.length + 1,
        produtos: body.produtos,
        status: body.status ? body.status : "incompleto", //incompleto, processando, pago, enviado, entregue ou cancelado
        idCliente: body.idCliente,
        deletado: false,
        valorTotal: body.valorTotal,
    }

    pedidos.push(pedido);

    return pedido;
};

const atualizarPedido = (ctx) => {
    const id = ctx.request.url.split("/")[2];
    const body = ctx.request.body;

    if (!body.produtos && !body.status && !body.idCliente && !body.valorTotal) {
        formatarErro(ctx, "Pedio mal formatado", 400);
        return;
    }

    if (id) {
        const pedidoAtual = pedidos[id - 1];
        if (pedidoAtual) {
            const pedidoAtualizado = {
                id: Number(id),
                produtos: body.produtos ? body.produtos : pedidoAtual.produtos,
                status: body.status ? body.status : pedidoAtual.status, //incompleto, processando, pago, enviado, entregue ou cancelado
                idCliente: body.idCliente ? body.idCliente : pedidoAtual.idCliente,
                deletado: pedidoAtual.deletado,
                valorTotal: body.valorPedido ? body.valorPedido : pedidoAtual.valorPedido,
            };

            pedidos[id - 1] = pedidoAtualizado;

            return pedidoAtualizado;
        }
    } else {
        formatarErro(ctx, "Pedido não localizado", 404)
    }
};

const deletarPedido = (ctx, path) => {
    const id = path[2];
    const body = ctx.request.body;

    if (typeof body.status !== "boolean") {
        formatarErro(ctx, "Pedido mal formatado", 400)
        return;
    }


    if (id) {
        const pedidoAtual = pedidos[id - 1];
        if (pedidoAtual) {
            const pedidoAtualizado = {
                id: pedidoAtual.id,
                produtos: pedidoAtual.produtos,
                status: pedidoAtual.status,
                idCliente: pedidoAtual.idCliente,
                deletado: body.deletado,
                valorTotal: pedidoAtual.valorPedido
            };

            pedidos[id - 1] = pedidoAtualizado;

            return pedidoAtualizado
        }
    } else {
        formatarErro(ctx, "Post não encontrado", 404)
    }
};

//ROTAS
const rotasProduto = (ctx, path) => {

    switch (ctx.request.method) {
        case "GET":
            const id = path[2];
            if (id) {
                const produtoAtual = produtos[id - 1];
                if (produtoAtual) {
                    formatarSucesso(ctx, produtoAtual)
                } else {
                    formatarErro(ctx, 'Produto não localizado', 404)
                }
            } else {
                const produtos = obterProdutos();
                formatarSucesso(ctx, produtos)
            }
            break;
        case "POST":
            const produto = adicionarProduto(ctx);

            if (produto) {
                formatarSucesso(ctx, produto, 201); //201 status de criação de pedido
            }
            break;
        case "PUT":
            const produtoAtualizado = atualizarProduto(ctx, path);

            if (produtoAtualizado) {
                formatarSucesso(ctx, produtoAtualizado, 200)
            }
            break;
        case "DELETE":
            const produtoDeletado = deletarProduto(ctx, path);
            if (produtoDeletado) {
                formatarSucesso(ctx, produtoDeletado, 200);
            }
            break;
        default:
            formatarErro(ctx, "Método não permmitido", 405);
            break;
    }

}

const rotasOrders = (ctx, path) => {
    switch (ctx.request.method) {
        case "GET":
            const id = path[2];
            console.log("entrou no GET")

            if (id) {
                console.log("entrou no ID")
                const pedidoAtual = pedidos[id - 1];
                if (pedidoAtual) {
                    formatarSucesso(ctx, pedidoAtual);
                } else {
                    formatarErro(ctx, "Pedido não localizado", 404)
                }

            } else if (ctx.request.query.status) {
                console.log("entrou na query")
                switch (ctx.request.query.status) {
                    case "entregue":
                        const pedidosEntregues = obterPedidosEntregues();
                        formatarSucesso(ctx, pedidosEntregues)
                        break;
                    case "pagos":
                        const pedidosPagos = obterPedidosPagos();
                        formatarSucesso(ctx, pedidosPagos)
                        console.log("entrou em pagos!")
                        break;
                    case "processando":
                        console.log("processando")
                        const pedidosProcessando = obterPedidosProcessando(ctx, path);
                        formatarSucesso(ctx, pedidosProcessando);
                        break;
                    case "cancelados":
                        const pedidosCancelados = obterPedidosCancelados();
                        formatarSucesso(ctx, pedidosCancelados)
                        break;
                    default:
                        formatarErro(ctx, "Status de pedido inválido", 401)
                        break;
                }
            } else {
                console.log("entrou em todos os pedidos")

                const pedidos = obterPedidos();
                formatarSucesso(ctx, pedidos);
            }
            break;
        case "POST":
            const pedido = adicionarPedido(ctx);
            if (pedido) {
                formatarSucesso(ctx, pedido, 201)
            }
            break;
        case "PUT":
            const pedidoAtualizado = atualizarPedido(ctx);
            if (pedidoAtualizado) {
                formatarSucesso(ctx, pedidoAtualizado, 200);
            }
            break;
        case "DELETE":
            const pedidoDeletado = deletarPedido(ctx, path);
            if (pedidoDeletado) {
                formatarSucesso(ctx, pedidoDeletado, 200);
            }
            break;
        default:
            formatarErro(ctx, "Método não permitido", 405)
            break;
    }
}

server.use((ctx) => {
    const path = ctx.request.url.split("/");
    console.log(pedidos)
    if (path[1] === 'products') {
        rotasProduto(ctx, path)
    } else if (ctx.request.path === '/orders' || path[1] === 'orders') {
        rotasOrders(ctx, path)
    } else {
        formatarErro(ctx, 'Conteúdo não encontrado', 404)
    }
});

server.listen(8081, () => console.log("Servidor rodando..."));

