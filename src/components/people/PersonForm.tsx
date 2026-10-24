"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  LoaderCircle,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  formatCpf,
  formatPhone,
  getReportingDates,
  validatePerson,
} from "@/lib/people";
import { PeopleService, ServiceError } from "@/services/people.service";
import type {
  Gender,
  Person,
  PersonErrors,
  PersonInput,
} from "@/types/person.types";

function Field({
  name,
  label,
  required = false,
  error,
  children,
}: {
  name: keyof PersonInput;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="field-group">
      <Label htmlFor={`person-${name}`}>
        {label}
        {required && " *"}
      </Label>
      {children}
      {error && (
        <span className="field-error" id={`person-${name}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

export function PersonForm({
  person,
  genders,
}: {
  person?: Person;
  genders: Gender[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<PersonInput>({
    name: person?.name ?? "",
    cpf: person?.cpf ?? "",
    birthDate: person?.birthDate ?? "",
    email: person?.email ?? "",
    phone: person?.phone ?? "",
    status: person?.status ?? "active",
    genderId: person?.genderId ?? null,
    disability: person?.disability ?? null,
    disabilityDescription: person?.disabilityDescription ?? "",
    shirtSize: person?.shirtSize ?? "",
  });
  const [errors, setErrors] = useState<PersonErrors>({});
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function updateField<K extends keyof PersonInput>(
    field: K,
    value: PersonInput[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage("");
  }

  function accessibility(field: keyof PersonInput) {
    return {
      id: `person-${field}`,
      "aria-invalid": Boolean(errors[field]),
      "aria-describedby": errors[field] ? `person-${field}-error` : undefined,
    };
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    const normalized = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
    };
    const validation = validatePerson(normalized);
    setErrors(validation);
    setMessage("");

    if (Object.keys(validation).length) {
      document.getElementById(`person-${Object.keys(validation)[0]}`)?.focus();
      return;
    }

    setIsSaving(true);

    try {
      await PeopleService.save(normalized, person?.id);
      router.push(
        `/dashboard/pessoas?success=${person ? "updated" : "created"}`,
      );
      router.refresh();
    } catch (failure) {
      if (failure instanceof ServiceError) {
        if (failure.status === 401) router.replace("/login");
        setErrors(failure.fields ?? {});
        setMessage(failure.message);
      } else {
        setMessage(
          "Não foi possível conectar ao servidor. Seus dados continuam no formulário.",
        );
      }
      setIsSaving(false);
    }
  }

  return (
    <>
      <Link className="back-link" href="/dashboard/pessoas">
        <ArrowLeft size={17} />
        Voltar para pessoas
      </Link>
      <PageHeader
        title={person ? "Editar pessoa" : "Nova pessoa"}
        description="Preencha os dados abaixo. Campos com * são obrigatórios."
      />
      <form
        className="person-form"
        onSubmit={submit}
        noValidate
        aria-busy={isSaving}
      >
        <fieldset disabled={isSaving}>
          <section className="form-section" aria-labelledby="personal-heading">
            <div className="form-section-heading">
              <span aria-hidden="true">1</span>
              <div>
                <h2 id="personal-heading">Dados pessoais</h2>
                <p>Informações básicas de identificação.</p>
              </div>
            </div>
            <Field
              name="name"
              label="Nome completo"
              required
              error={errors.name}
            >
              <Input
                {...accessibility("name")}
                name="name"
                autoComplete="name"
                placeholder="Nome completo da pessoa"
                maxLength={150}
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                required
              />
            </Field>
            <div className="form-grid">
              <Field name="cpf" label="CPF" required error={errors.cpf}>
                <Input
                  {...accessibility("cpf")}
                  name="cpf"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  value={values.cpf}
                  onChange={(event) =>
                    updateField("cpf", formatCpf(event.target.value))
                  }
                  required
                />
              </Field>
              <Field
                name="birthDate"
                label="Data de nascimento"
                error={errors.birthDate}
              >
                <Input
                  {...accessibility("birthDate")}
                  name="birthDate"
                  type="date"
                  autoComplete="bday"
                  min="1900-01-01"
                  max={getReportingDates().today}
                  value={values.birthDate}
                  onChange={(event) =>
                    updateField("birthDate", event.target.value)
                  }
                />
              </Field>
            </div>
            <div className="form-grid">
              <Field name="genderId" label="Gênero" required error={errors.genderId}>
                <div className="select-wrap">
                  <select
                    {...accessibility("genderId")}
                    name="genderId"
                    className="select-field"
                    value={values.genderId ?? ""}
                    onChange={(event) =>
                      updateField(
                        "genderId",
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                    required
                  >
                    <option value="">Selecione</option>
                    {genders.map((gender) => (
                      <option key={gender.id} value={gender.id}>
                        {gender.descricao}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </div>
              </Field>
              <Field name="shirtSize" label="Tamanho da camisa" required error={errors.shirtSize}>
                <Input
                  {...accessibility("shirtSize")}
                  name="shirtSize"
                  placeholder="Ex.: P, M, G, GG"
                  maxLength={10}
                  value={values.shirtSize}
                  onChange={(event) =>
                    updateField("shirtSize", event.target.value)
                  }
                  required
                />
              </Field>
            </div>
            <Field
              name="disability"
              label="Possui deficiência?"
              required
              error={errors.disability}
            >
              <div className="select-wrap">
                <select
                  {...accessibility("disability")}
                  name="disability"
                  className="select-field"
                  value={values.disability === null ? "" : values.disability ? "yes" : "no"}
                  onChange={(event) => {
                    const value = event.target.value;
                    updateField("disability", value === "" ? null : value === "yes");
                    if (value !== "yes") {
                      updateField("disabilityDescription", "");
                    }
                  }}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="no">Não</option>
                  <option value="yes">Sim</option>
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </div>
            </Field>
            {values.disability === true && (
              <Field
                name="disabilityDescription"
                label="Descrição da deficiência"
                required
                error={errors.disabilityDescription}
              >
                <Input
                  {...accessibility("disabilityDescription")}
                  name="disabilityDescription"
                  maxLength={255}
                  value={values.disabilityDescription}
                  onChange={(event) =>
                    updateField("disabilityDescription", event.target.value)
                  }
                  required
                />
              </Field>
            )}
          </section>
          <section className="form-section" aria-labelledby="contact-heading">
            <div className="form-section-heading">
              <span aria-hidden="true">2</span>
              <div>
                <h2 id="contact-heading">Contato</h2>
                <p>Dados para comunicação.</p>
              </div>
            </div>
            <div className="form-grid">
              <Field name="email" label="E-mail" required error={errors.email}>
                <Input
                  {...accessibility("email")}
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  placeholder="nome@exemplo.com"
                  maxLength={254}
                  value={values.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  required
                />
              </Field>
              <Field name="phone" label="Telefone" error={errors.phone}>
                <Input
                  {...accessibility("phone")}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  value={values.phone}
                  onChange={(event) =>
                    updateField("phone", formatPhone(event.target.value))
                  }
                />
              </Field>
            </div>
            <div className="form-grid form-status-row">
              <Field name="status" label="Status" error={errors.status}>
                <div className="select-wrap">
                  <select
                    {...accessibility("status")}
                    name="status"
                    className="select-field"
                    value={values.status}
                    onChange={(event) => {
                      const status = event.target.value;
                      if (status === "active" || status === "inactive") {
                        updateField("status", status);
                      }
                    }}
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </div>
              </Field>
            </div>
          </section>
        </fieldset>
        {message && (
          <div
            className="form-feedback form-feedback--error form-save-error"
            role="alert"
          >
            <AlertCircle size={17} />
            <span>{message}</span>
          </div>
        )}
        <footer className="form-actions">
          <Button
            variant="outline"
            type="button"
            disabled={isSaving}
            onClick={() => router.push("/dashboard/pessoas")}
          >
            Cancelar
          </Button>
          <Button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? (
              <LoaderCircle size={17} className="spin" />
            ) : (
              <Save size={17} />
            )}
            {isSaving
              ? "Salvando..."
              : person
                ? "Salvar alterações"
                : "Salvar pessoa"}
          </Button>
        </footer>
      </form>
    </>
  );
}
