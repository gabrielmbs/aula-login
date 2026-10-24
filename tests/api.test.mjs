import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import {
  ApiError,
  assertSameOrigin,
  dynamicRead,
  dynamicRequest,
} from "../src/lib/server/api.ts";

process.env.API_URL = "https://example.invalid/aula/db";
process.env.API_KEY = "test-workspace-key";

afterEach(() => mock.restoreAll());

test("reads with version 2 and server-side workspace authentication", async () => {
  mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://example.invalid/aula/db/read/pessoa");
    assert.equal(options.headers["x-api-key"], "test-workspace-key");
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), {
      version: 2,
      select: ["id"],
      limit: 5,
    });
    return Response.json({ result: [{ id: 12 }], total: 21 });
  });

  assert.deepEqual(await dynamicRead("pessoa", { select: ["id"], limit: 5 }), {
    result: [{ id: 12 }],
    total: 21,
  });
});

test("updates with PATCH and id", async () => {
  const calls = [];
  mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, method: options.method, body: JSON.parse(options.body) });
    return Response.json({ message: "OK", affectedRows: 1 });
  });

  await dynamicRequest("update", "pessoa", {
    id: 12,
    nome_completo: "Ana Souza",
  });
  assert.deepEqual(calls, [
    {
      url: "https://example.invalid/aula/db/update/pessoa",
      method: "PATCH",
      body: { id: 12, nome_completo: "Ana Souza" },
    },
  ]);
});

test("deletes with id and accepts a numeric result without affectedRows", async () => {
  const calls = [];
  mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, method: options.method, body: JSON.parse(options.body) });
    return Response.json({
      message: "REGISTRO EXCLUÍDO COM SUCESSO",
      result: 1,
    });
  });

  assert.deepEqual(await dynamicRequest("delete", "pessoa", { id: 2176 }), {
    message: "REGISTRO EXCLUÍDO COM SUCESSO",
    result: 1,
  });
  assert.deepEqual(calls, [
    {
      url: "https://example.invalid/aula/db/delete/pessoa",
      method: "DELETE",
      body: { id: 2176 },
    },
  ]);
});

test("preserves explicit null fields in a partial pessoa update", async () => {
  const calls = [];
  mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, method: options.method, body: JSON.parse(options.body) });
    return Response.json({ message: "OK", affectedRows: 1 });
  });

  await dynamicRequest("update", "pessoa", { id: 2176, tamanho_camisa: null });

  assert.deepEqual(calls, [
    {
      url: "https://example.invalid/aula/db/update/pessoa",
      method: "PATCH",
      body: { id: 2176, tamanho_camisa: null },
    },
  ]);
});

test("creates a pessoa with a flat column payload and accepts message/result without total or insertId", async () => {
  const payload = {
    cpf: "16899535009",
    id_genero: 1,
    nome_completo: "Pessoa de Teste",
    data_nascimento: "1995-02-10",
    telefone: "11999887766",
    email: "new@cadastroweb.test",
    id_situacao_cadastro: 1,
    deficiencia: 0,
    deficiencia_descricao: "",
    tamanho_camisa: "P",
  };
  const response = {
    message: "REGISTRO CRIADO COM SUCESSO",
    result: [{ id: 2176, ...payload }],
  };
  mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://example.invalid/aula/db/create/pessoa");
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), payload);
    return Response.json(response);
  });
  assert.deepEqual(await dynamicRequest("create", "pessoa", payload), response);
});

test("rejects malformed read responses instead of returning an empty success", async () => {
  mock.method(globalThis, "fetch", async () =>
    Response.json({ message: "OK" }),
  );
  await assert.rejects(
    dynamicRead("pessoa"),
    (error) => error instanceof ApiError && error.status === 502,
  );
});

test("does not expose upstream SQL or private error details", async () => {
  mock.method(console, "error", () => {});
  mock.method(globalThis, "fetch", async () =>
    Response.json(
      { message: "SQL SELECT senha FROM usuario" },
      { status: 500 },
    ),
  );

  await assert.rejects(dynamicRead("pessoa"), (error) => {
    assert.equal(error.status, 502);
    assert.doesNotMatch(error.message, /SQL|senha|usuario/);
    return true;
  });
});

test("logs upstream rejection metadata without personal data, SQL or credentials", async () => {
  const log = mock.method(console, "error", () => {});
  mock.method(globalThis, "fetch", async () =>
    Response.json(
      {
        code: "ER_NO_DEFAULT_FOR_FIELD",
        message: "SQL INSERT pessoa cpf=16899535009",
        sql: "private query",
      },
      { status: 500 },
    ),
  );
  await assert.rejects(
    dynamicRequest("create", "pessoa", {}),
    (error) => error.status === 502,
  );
  assert.equal(log.mock.calls.length, 1);
  assert.deepEqual(log.mock.calls[0].arguments[1], {
    operation: "create",
    table: "pessoa",
    status: 500,
    code: "ER_NO_DEFAULT_FOR_FIELD",
  });
  assert.doesNotMatch(
    JSON.stringify(log.mock.calls[0].arguments),
    /16899535009|SQL|private query|test-workspace-key/,
  );
});

test("reports a network failure as unavailability", async () => {
  mock.method(globalThis, "fetch", async () => {
    throw new TypeError("fetch failed");
  });
  await assert.rejects(
    dynamicRead("pessoa"),
    (error) => error instanceof ApiError && error.status === 503,
  );
});

test("accepts the browser host even when Next uses an internal localhost URL", () => {
  assert.doesNotThrow(() =>
    assertSameOrigin(
      new Request("http://localhost:3000/api/auth/login", {
        headers: { Host: "127.0.0.1:3000", Origin: "http://127.0.0.1:3000" },
      }),
    ),
  );
  assert.doesNotThrow(() =>
    assertSameOrigin(
      new Request("http://localhost:3000/api/people", {
        headers: {
          "x-forwarded-host": "cadastroweb.example",
          Origin: "https://cadastroweb.example",
        },
      }),
    ),
  );
});

test("rejects a cross-site or malformed request origin", () => {
  for (const origin of ["https://other.invalid", "null", "invalid-url"]) {
    assert.throws(
      () =>
        assertSameOrigin(
          new Request("http://localhost:3000/api/people", {
            headers: { Host: "127.0.0.1:3000", Origin: origin },
          }),
        ),
      (error) => error instanceof ApiError && error.status === 403,
    );
  }
});
