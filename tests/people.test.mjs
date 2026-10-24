import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPeopleQuery,
  buildPersonPayload,
  formatCpf,
  formatPhone,
  getInitials,
  getReportingDates,
  isPersonInput,
  toPerson,
  validatePerson,
} from "../src/lib/people.ts";

test("formats CPF and phone numbers without losing digits", () => {
  assert.equal(formatCpf("52998224725"), "529.982.247-25");
  assert.equal(formatCpf("529.982.247-25"), "529.982.247-25");
  assert.equal(formatPhone("11998764321"), "(11) 99876-4321");
  assert.equal(formatPhone("1134567890"), "(11) 3456-7890");
  assert.equal(formatPhone(""), "");
});

test("builds initials from the first and last names", () => {
  assert.equal(getInitials("  Ana de Souza  "), "AS");
  assert.equal(getInitials("Marina"), "MA");
  assert.equal(getInitials(""), "?");
});

const validPerson = {
  name: "Ana Souza",
  cpf: "529.982.247-25",
  email: "ana@example.com",
  phone: "11998764321",
  birthDate: "1990-01-15",
  status: "active",
  genderId: 1,
  disability: false,
  disabilityDescription: "",
  shirtSize: "P",
};

test("accepts a valid person with optional contact fields omitted", () => {
  assert.deepEqual(validatePerson(validPerson), {});
  assert.deepEqual(
    validatePerson({ ...validPerson, phone: "", birthDate: "" }),
    {},
  );
});

test("rejects missing identity, invalid CPF, email and future birth dates", () => {
  const errors = validatePerson({
    ...validPerson,
    name: " ",
    cpf: "111.111.111-11",
    email: "invalid",
    phone: "12",
    birthDate: "2999-01-01",
    status: "unknown",
  });

  for (const field of [
    "name",
    "cpf",
    "email",
    "phone",
    "birthDate",
    "status",
  ]) {
    assert.ok(errors[field], `Expected validation error for ${field}`);
  }
});

test("maps the actual database fields and preserves null optional values", () => {
  assert.deepEqual(
    toPerson({
      id: 12,
      nome_completo: "Ana Souza",
      cpf: "52998224725",
      data_nascimento: null,
      telefone: null,
      email: "ana@example.com",
      id_situacao_cadastro: 2,
      criado_em: "2026-09-12T03:00:00.000Z",
    }),
    {
      id: 12,
      name: "Ana Souza",
      cpf: "529.982.247-25",
      birthDate: "",
      phone: "",
      email: "ana@example.com",
      status: "inactive",
      createdAt: "2026-09-12T03:00:00.000Z",
      genderId: null,
      disability: null,
      disabilityDescription: "",
      shirtSize: "",
    },
  );
});

test("combines a name/email search with status and real pagination", () => {
  const query = buildPeopleQuery({
    search: " Ana ",
    status: "active",
    page: 3,
  });

  assert.equal(query.limit, 5);
  assert.equal(query.offset, 10);
  assert.deepEqual(query.where, {
    logic: "AND",
    conditions: [
      {
        logic: "OR",
        conditions: [
          { column: "nome_completo", operator: "LIKE", value: "%Ana%" },
          { column: "email", operator: "LIKE", value: "%Ana%" },
        ],
      },
      { column: "id_situacao_cadastro", operator: "=", value: 1 },
    ],
  });
  assert.equal(buildPeopleQuery({ page: -2 }).offset, 0);
  assert.equal(buildPeopleQuery({ page: Number.NaN }).offset, 0);
  assert.equal(buildPeopleQuery({}).where, undefined);
});

test("only writes allowed columns with unmasked identifiers", () => {
  assert.deepEqual(
    buildPersonPayload({
      ...validPerson,
      name: " Ana Souza ",
      phone: "(11) 99876-4321",
    }),
    {
      nome_completo: "Ana Souza",
      cpf: "52998224725",
      data_nascimento: "1990-01-15",
      email: "ana@example.com",
      telefone: "11998764321",
      id_situacao_cadastro: 1,
      id_genero: 1,
      deficiencia: 0,
      deficiencia_descricao: "",
      tamanho_camisa: "P",
    },
  );
  assert.equal(
    buildPersonPayload({
      ...validPerson,
      birthDate: "",
      phone: "",
      status: "inactive",
    }).telefone,
    null,
  );
  assert.equal(
    buildPersonPayload({
      ...validPerson,
      birthDate: "",
      phone: "",
      status: "inactive",
    }).data_nascimento,
    null,
  );
  assert.equal(
    buildPersonPayload({ ...validPerson, status: "inactive" })
      .id_situacao_cadastro,
    2,
  );
});

test("requires explicit gender, disability and shirt size choices", () => {
  const errors = validatePerson({
    ...validPerson,
    genderId: null,
    disability: null,
    shirtSize: " ",
  });
  assert.ok(errors.genderId);
  assert.ok(errors.disability);
  assert.ok(errors.shirtSize);
  for (const genderId of [0, -1, 1.5, Number.NaN]) {
    assert.ok(validatePerson({ ...validPerson, genderId }).genderId);
  }
});

test("requires a disability description only when disability is selected", () => {
  assert.ok(
    validatePerson({ ...validPerson, disability: true, disabilityDescription: " " })
      .disabilityDescription,
  );
  assert.deepEqual(
    validatePerson({
      ...validPerson,
      disability: true,
      disabilityDescription: "Descrição informada",
    }),
    {},
  );
  const payload = buildPersonPayload({
    ...validPerson,
    disability: true,
    disabilityDescription: " Descrição informada ",
    shirtSize: " m ",
  });
  assert.equal(payload.deficiencia, 1);
  assert.equal(payload.deficiencia_descricao, "Descrição informada");
  assert.equal(payload.tamanho_camisa, "M");
  assert.equal(
    buildPersonPayload({ ...validPerson, disabilityDescription: "old" })
      .deficiencia_descricao,
    "",
  );
});

test("maps all creation fields back into the edit form", () => {
  const person = toPerson({
    id: 2176,
    nome_completo: "Pessoa de Teste",
    id_genero: 2,
    deficiencia: 1,
    deficiencia_descricao: "Descrição informada",
    tamanho_camisa: "GG",
  });
  assert.equal(person.genderId, 2);
  assert.equal(person.disability, true);
  assert.equal(person.disabilityDescription, "Descrição informada");
  assert.equal(person.shirtSize, "GG");
  assert.equal(toPerson({ id: 1, deficiencia: 0 }).disability, false);
});

test("ignores a hidden stale description when disability is not selected", () => {
  const input = {
    ...validPerson,
    disability: false,
    disabilityDescription: "x".repeat(256),
  };
  assert.deepEqual(validatePerson(input), {});
  assert.equal(buildPersonPayload(input).deficiencia_descricao, "");
  assert.ok(
    validatePerson({ ...input, disability: true }).disabilityDescription,
  );
  assert.ok(
    validatePerson({ ...validPerson, shirtSize: "x".repeat(11) }).shirtSize,
  );
});

test("rejects untyped new person fields at the request boundary", () => {
  assert.equal(isPersonInput(validPerson), true);
  for (const fields of [
    { genderId: "1" },
    { disability: "false" },
    { disabilityDescription: 123 },
    { shirtSize: [] },
    { genderId: undefined },
  ]) {
    assert.equal(isPersonInput({ ...validPerson, ...fields }), false);
  }
});

test("rejects invalid email domain characters, labels and local parts", () => {
  for (const email of [
    "ana@exam/ple.com",
    "ana@-example.com",
    "ana@example-.com",
    "ana@exam_ple.com",
    "ana..souza@example.com",
    ".ana@example.com",
  ]) {
    assert.ok(validatePerson({ ...validPerson, email }).email, email);
  }
  assert.deepEqual(
    validatePerson({
      ...validPerson,
      email: "ana.souza+cadastro@example.com.br",
    }),
    {},
  );
});

test("dashboard periods follow the date displayed in Sao Paulo at month boundaries", () => {
  assert.deepEqual(getReportingDates(new Date("2026-11-01T01:00:00Z")), {
    today: "2026-10-31",
    monthStart: "2026-10-01",
    recentStart: "2026-10-25",
  });
  assert.deepEqual(getReportingDates(new Date("2026-11-01T04:00:00Z")), {
    today: "2026-11-01",
    monthStart: "2026-11-01",
    recentStart: "2026-10-26",
  });
});
