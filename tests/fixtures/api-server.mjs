import { createServer } from "node:http";

const names = [
  "Ana Souza",
  "Bruno Lima",
  "Carla Mendes",
  "Diego Alves",
  "Elisa Rocha",
  "Fernanda Costa",
  "Gabriel Santos",
];
const cpfs = [
  "52998224725",
  "11144477735",
  "12345678909",
  "98765432100",
  "74185296380",
  "36925814758",
  "85274196322",
];
let people = names.map((name, index) => ({
  id: 900001 + index,
  nome_completo: name,
  cpf: cpfs[index],
  email: `${name.toLowerCase().replace(" ", ".")}@cadastroweb.test`,
  telefone: "11998764321",
  data_nascimento: "1990-01-15T00:00:00.000Z",
  id_situacao_cadastro: index === 2 ? 2 : 1,
  id_genero: index % 2 + 1,
  deficiencia: 0,
  deficiencia_descricao: "",
  tamanho_camisa: "M",
  criado_em: new Date(Date.now() - index * 86400000).toISOString(),
}));
let nextId = 900008;

function matches(record, condition) {
  if (condition.conditions) {
    return condition.logic === "OR"
      ? condition.conditions.some((child) => matches(record, child))
      : condition.conditions.every((child) => matches(record, child));
  }

  const value = record[condition.column];
  switch (condition.operator.toLowerCase()) {
    case "=":
      return String(value) === String(condition.value);
    case "!=":
      return value !== condition.value;
    case ">=":
      return value >= condition.value;
    case "is not null":
      return value !== null && value !== undefined;
    case "like":
      return String(value ?? "")
        .toLowerCase()
        .includes(
          String(condition.value)
            .slice(1, -1)
            .replace(/\\([%_\\])/g, "$1")
            .toLowerCase(),
        );
    default:
      throw new Error(`Unsupported fixture operator: ${condition.operator}`);
  }
}

const server = createServer(async (request, response) => {
  function send(code, data) {
    response.writeHead(code, { "Content-Type": "application/json" });
    response.end(JSON.stringify(data));
  }

  if (request.url === "/__fixture")
    return send(200, { fixture: "cadastroweb-local-only" });
  if (request.headers["x-api-key"] !== "test-workspace-key")
    return send(401, { message: "Invalid test key" });

  try {
    let raw = "";
    for await (const chunk of request) raw += chunk;
    const body = JSON.parse(raw || "{}");
    const [, , , operation, table] = request.url.split("/");

    if (operation === "read") {
      if (request.method !== "POST" || body.version !== 2)
        return send(400, { message: "Invalid read contract" });
      let rows =
        table === "vw_usuario"
          ? [
              {
                nome_completo: "Marina Silva",
                email: "marina@cadastroweb.test",
                senha: "fixture-password",
                nivel_acesso: "ADMINISTRADOR",
                id_situacao_cadastro: 1,
              },
            ]
          : table === "genero"
            ? [
                { id: 1, descricao: "MASCULINO" },
                { id: 2, descricao: "FEMININO" },
              ]
            : [...people];
      if (body.where)
        rows = rows.filter((record) => matches(record, body.where));
      const total = rows.length;

      rows.sort((first, second) => {
        for (const order of body.order_by ?? []) {
          const comparison =
            typeof first[order.column] === "number"
              ? first[order.column] - second[order.column]
              : String(first[order.column]).localeCompare(
                  String(second[order.column]),
                );
          if (comparison)
            return order.direction === "DESC" ? -comparison : comparison;
        }
        return 0;
      });

      rows = rows.slice(
        body.offset ?? 0,
        (body.offset ?? 0) + (body.limit ?? rows.length),
      );
      if (body.select?.length)
        rows = rows.map((record) =>
          Object.fromEntries(
            body.select.map((column) => [column, record[column]]),
          ),
        );
      return send(200, { result: rows, total });
    }

    if (table !== "pessoa")
      return send(404, { message: "Unknown fixture table" });

    if (operation === "create" && request.method === "POST") {
      const columns = [
        "cpf", "id_genero", "nome_completo", "data_nascimento",
        "telefone", "email", "id_situacao_cadastro", "deficiencia",
        "deficiencia_descricao", "tamanho_camisa",
      ];
      if (
        Object.keys(body).length !== columns.length ||
        columns.some((column) => !Object.hasOwn(body, column)) ||
        ![1, 2].includes(body.id_genero) ||
        ![0, 1].includes(body.deficiencia) ||
        typeof body.deficiencia_descricao !== "string" ||
        !body.tamanho_camisa
      ) {
        return send(400, { message: "Invalid pessoa creation columns" });
      }
      const id = nextId++;
      const person = {
        ...body, id, criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      };
      people.push(person);
      return send(200, {
        message: "REGISTRO CRIADO COM SUCESSO",
        result: [person],
      });
    }

    if (
      operation === "update" &&
      request.method === "PATCH" &&
      Number.isSafeInteger(body.id) &&
      !Object.hasOwn(body, "pk")
    ) {
      const index = people.findIndex((person) => person.id === body.id);
      if (index < 0) return send(404, { message: "Not found" });
      const { id, ...fields } = body;
      people[index] = { ...people[index], ...fields, id };
      return send(200, { message: "OK", affectedRows: 1 });
    }

    if (
      operation === "delete" &&
      request.method === "DELETE" &&
      Number.isSafeInteger(body.id) &&
      Object.keys(body).length === 1
    ) {
      const previousTotal = people.length;
      people = people.filter((person) => person.id !== body.id);
      return send(200, {
        message: "REGISTRO EXCLUÍDO COM SUCESSO",
        result: previousTotal - people.length,
      });
    }

    send(400, { message: "Invalid fixture write contract" });
  } catch {
    send(500, { message: "Invalid fixture request" });
  }
});

server.listen(Number(process.env.FIXTURE_API_PORT || 4010), "127.0.0.1", () => {
  console.log("Isolated test API ready at http://127.0.0.1:4010");
});
