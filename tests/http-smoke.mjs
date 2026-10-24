import assert from "node:assert/strict";

const origin = process.env.APP_URL || "http://127.0.0.1:3000";
const fixtureUrl = process.env.FIXTURE_URL || "http://127.0.0.1:4010";
const fixture = await fetch(`${fixtureUrl}/__fixture`).then((response) =>
  response.json(),
);
assert.equal(
  fixture.fixture,
  "cadastroweb-local-only",
  "The isolated fixture API must be running",
);
let cookie = "";

function call(path, options = {}) {
  return fetch(`${origin}${path}`, {
    redirect: "manual",
    ...options,
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      Cookie: cookie,
      ...options.headers,
    },
  });
}

assert.equal((await call("/api/people")).status, 401);
assert.equal((await call("/dashboard")).headers.get("location"), "/login");

const loginPage = await call("/login").then((response) => response.text());
const loginForm = loginPage.match(/<form\b[^>]*>/)?.[0];
assert.ok(loginForm, "The login page must render a form");
assert.match(loginForm, /method="post"/i);
assert.match(loginForm, /action="\/api\/auth\/login"/);

function submitLoginForm(email, senha, headers = {}) {
  return call("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...headers,
    },
    body: new URLSearchParams({ email, senha }),
  });
}

const invalidForm = await submitLoginForm(
  "marina@cadastroweb.test",
  "incorrect",
);
assert.equal(invalidForm.status, 303);
assert.equal(invalidForm.headers.get("location"), "/login?error=credentials");
const invalidFormPage = await call(invalidForm.headers.get("location")).then(
  (response) => response.text(),
);
assert.match(invalidFormPage, /role="alert"/);
assert.match(invalidFormPage, /E-mail ou senha inválidos\./);

const crossSiteForm = await submitLoginForm(
  "marina@cadastroweb.test",
  "fixture-password",
  { Origin: "https://other.invalid" },
);
assert.equal(crossSiteForm.status, 303);
assert.equal(crossSiteForm.headers.get("location"), "/login?error=server");
assert.equal(crossSiteForm.headers.get("set-cookie"), null);

const formLogin = await submitLoginForm(
  "marina@cadastroweb.test",
  "fixture-password",
);
assert.equal(formLogin.status, 303);
assert.equal(formLogin.headers.get("location"), "/dashboard");
assert.match(formLogin.headers.get("set-cookie"), /HttpOnly/i);
cookie = formLogin.headers.get("set-cookie").split(";")[0];
const formDashboard = await call("/dashboard");
assert.equal(formDashboard.status, 200);
assert.equal(formDashboard.headers.get("location"), null);
const formDashboardHtml = await formDashboard.text();
assert.match(formDashboardHtml, /Visão geral/);
assert.doesNotMatch(formDashboardHtml, /NEXT_REDIRECT/);
assert.equal((await call("/login")).headers.get("location"), "/dashboard");
assert.equal((await call("/api/auth/logout", { method: "POST" })).status, 200);
cookie = "";

assert.equal(
  (
    await call("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "marina@cadastroweb.test",
        senha: "incorrect",
      }),
    })
  ).status,
  401,
);

const login = await call("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({
    email: "marina@cadastroweb.test",
    senha: "fixture-password",
  }),
});
assert.equal(login.status, 200);
const setCookie = login.headers.get("set-cookie");
assert.match(setCookie, /HttpOnly/i);
assert.match(setCookie, /SameSite=lax/i);
cookie = setCookie.split(";")[0];

const dashboard = await call("/dashboard");
assert.equal(dashboard.status, 200);
assert.equal(dashboard.headers.get("location"), null);
assert.doesNotMatch(await dashboard.text(), /NEXT_REDIRECT/);

const initial = await call("/api/people").then((response) => response.json());
assert.equal(initial.total, 7);
assert.equal(initial.people.length, 5);
assert.ok(
  initial.people.every(
    (person) =>
      person.id >= 900001 && person.email.endsWith("@cadastroweb.test"),
  ),
  "Refuse writes unless the application uses the isolated fixture API",
);
assert.equal(
  (await call("/api/people?page=2").then((response) => response.json())).people
    .length,
  2,
);
assert.equal(
  (
    await call("/api/people?search=Ana&status=active").then((response) =>
      response.json(),
    )
  ).total,
  1,
);
assert.equal((await call("/api/people?status=invalid")).status, 400);
assert.equal((await call("/api/people?page=-1")).status, 400);
assert.equal(
  (
    await call("/api/people", {
      headers: { Cookie: "cadastroweb_session=forged" },
    })
  ).status,
  401,
);

const input = {
  name: "Pessoa de Teste",
  cpf: "168.995.350-09",
  birthDate: "1995-02-10",
  email: "new@cadastroweb.test",
  phone: "11999887766",
  status: "active",
  genderId: 1,
  disability: false,
  disabilityDescription: "",
  shirtSize: "P",
};
const invalid = await call("/api/people", {
  method: "POST",
  body: JSON.stringify({ ...input, cpf: "11111111111" }),
});
assert.equal(invalid.status, 422);
assert.ok((await invalid.json()).fields.cpf);
for (const [field, value] of [
  ["genderId", null],
  ["genderId", 999999],
  ["disability", null],
  ["shirtSize", ""],
]) {
  const response = await call("/api/people", {
    method: "POST",
    body: JSON.stringify({ ...input, [field]: value }),
  });
  assert.equal(response.status, 422);
  assert.ok((await response.json()).fields[field]);
}
const newPersonPage = await call("/dashboard/pessoas/nova");
assert.equal(newPersonPage.status, 200);
const newPersonHtml = await newPersonPage.text();
for (const name of ["genderId", "disability", "shirtSize"]) {
  assert.match(newPersonHtml, new RegExp(`name="${name}"`));
}
assert.match(newPersonHtml, /MASCULINO/);
assert.match(newPersonHtml, /FEMININO/);
assert.equal(
  (
    await call("/api/people", {
      method: "POST",
      headers: { Origin: "https://other.invalid" },
      body: JSON.stringify(input),
    })
  ).status,
  403,
);

const created = await call("/api/people", {
  method: "POST",
  body: JSON.stringify(input),
});
assert.equal(created.status, 201);
const duplicate = await call("/api/people", {
  method: "POST",
  body: JSON.stringify(input),
});
assert.equal(duplicate.status, 409);

const result = await call("/api/people?search=Pessoa%20de%20Teste").then(
  (response) => response.json(),
);
const id = result.people[0].id;
assert.ok(id >= 900008);
assert.equal(result.people[0].genderId, 1);
assert.equal(result.people[0].disability, false);
assert.equal(result.people[0].shirtSize, "P");
assert.equal(
  (
    await call(`/api/people/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...input,
        name: "Pessoa Atualizada",
        status: "inactive",
        genderId: 2,
        disability: true,
        disabilityDescription: "Descrição de teste",
        shirtSize: "GG",
      }),
    })
  ).status,
  200,
);
const updated = await call(`/api/people/${id}`).then((response) =>
  response.json(),
);
assert.equal(updated.name, "Pessoa Atualizada");
assert.equal(updated.status, "inactive");
assert.equal(updated.genderId, 2);
assert.equal(updated.disability, true);
assert.equal(updated.disabilityDescription, "Descrição de teste");
assert.equal(updated.shirtSize, "GG");
const editPage = await call(`/dashboard/pessoas/${id}/editar`);
assert.equal(editPage.status, 200);
const editHtml = await editPage.text();
assert.match(editHtml, /name="disabilityDescription"/);
assert.match(editHtml, /Descrição de teste/);
assert.equal(
  (await call(`/api/people/${id}`, { method: "DELETE" })).status,
  200,
);
assert.equal((await call(`/api/people/${id}`)).status, 404);
assert.equal(
  (await call("/api/people").then((response) => response.json())).total,
  7,
);

const logout = await call("/api/auth/logout", { method: "POST" });
assert.equal(logout.status, 200);
assert.match(logout.headers.get("set-cookie"), /cadastroweb_session=;/);
console.log(
  "HTTP smoke passed: authentication, cookie, route protection, filters, pagination, validation, origin checks and full isolated CRUD.",
);
