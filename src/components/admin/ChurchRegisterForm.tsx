"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { CircleCheck, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  type ChurchRegistrationErrors,
  type ChurchRegistrationField,
  type ChurchRegistrationInput,
  KOREAN_REGIONS,
  validateChurchRegistration,
} from "@/lib/church-registration";

/** 접수 화면에 다시 보여 줄 입력 요약 */
interface Receipt {
  churchName: string;
  region: string;
  applicant: string;
  proofName: string;
}

/**
 * 교회 등록·대표자 인증 신청 폼. 1단계는 입력만 검사하고 저장하지 않는다.
 * <form action>으로 내면 React가 처리 뒤 입력을 비워, 검사에 걸렸을 때 쓴 내용이 지워진다.
 * 그래서 onSubmit에서 FormData를 읽는다. 검사를 통과하면 폼 자리에 접수 화면을 보여 준다.
 */
export function ChurchRegisterForm({
  titleId,
  applicantName,
  applicantTitle,
}: {
  /** 폼 이름으로 쓸 제목(h2)의 id */
  titleId: string;
  /** 미리 채울 대표자 이름과 직분 (현재 사용자) */
  applicantName: string;
  applicantTitle: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const receiptTitleRef = useRef<HTMLHeadingElement>(null);
  const [errors, setErrors] = useState<ChurchRegistrationErrors>({});
  // 낼 때마다 늘려, 같은 개수의 오류여도 요약을 다시 알리고 첫 오류 칸으로 포커스를 옮긴다
  const [attempt, setAttempt] = useState(0);
  // Radix 체크박스는 FormData에 값이 실리지 않을 수 있어 상태로 둔다
  const [agreed, setAgreed] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  // "새로 작성"을 누를 때마다 늘려, 다시 그린 폼의 첫 칸으로 포커스를 옮긴다
  const [restart, setRestart] = useState(0);
  const errorCount = Object.keys(errors).length;

  useEffect(() => {
    if (attempt === 0) return;
    // 칸이 화면 순서대로 놓여 있어 처음 찾은 오류 칸이 첫 오류 칸이다
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [attempt]);

  useEffect(() => {
    if (receipt) receiptTitleRef.current?.focus();
  }, [receipt]);

  useEffect(() => {
    if (restart > 0) formRef.current?.querySelector<HTMLElement>("#churchName")?.focus();
  }, [restart]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: ChurchRegistrationField) => String(data.get(name) ?? "");
    const proof = data.get("proof");
    const input: ChurchRegistrationInput = {
      churchName: text("churchName"),
      pastorName: text("pastorName"),
      region: text("region"),
      address: text("address"),
      memberCount: text("memberCount"),
      slogan: text("slogan"),
      applicantName: text("applicantName"),
      applicantTitle: text("applicantTitle"),
      phone: text("phone"),
      // 파일을 고르지 않으면 이름이 빈 File이 온다
      proof: proof instanceof File && proof.name ? { name: proof.name, size: proof.size } : null,
      agreed,
    };

    const nextErrors = validateChurchRegistration(input);
    setErrors(nextErrors);
    // 검사를 통과하면 proof는 늘 있지만, 아래에서 쓰려고 타입을 함께 좁힌다
    if (Object.keys(nextErrors).length > 0 || !input.proof) {
      setAttempt((count) => count + 1);
      return;
    }
    // 1단계는 저장하지 않는다. 2단계에서는 여기서 Server Action으로 보내고 서버에서 같은 검사를 한 번 더 한다
    setReceipt({
      churchName: input.churchName.trim(),
      region: input.region,
      applicant: `${input.applicantName.trim()} ${input.applicantTitle.trim()}`,
      proofName: input.proof.name,
    });
  }

  function startOver() {
    setReceipt(null);
    setErrors({});
    setAgreed(false);
    setAttempt(0);
    setRestart((count) => count + 1);
  }

  if (receipt) {
    return (
      <section
        aria-labelledby="receipt-title"
        className="flex flex-col items-start gap-4 rounded-xl border bg-card p-5 shadow-xs sm:p-6"
      >
        <CircleCheck aria-hidden="true" className="size-10 text-tag-green" />
        <h3 id="receipt-title" ref={receiptTitleRef} tabIndex={-1} className="text-lg font-bold text-foreground outline-hidden">
          신청이 접수되었습니다
        </h3>
        <p className="text-foreground/80">
          데모 화면이라 저장되지 않습니다. 2단계에서는 관리자가 증빙 서류를 확인한 뒤 승인하고, 결과를 알림으로
          알려 드립니다.
        </p>
        <dl className="grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-lg bg-muted/60 px-4 py-3 text-sm">
          <dt className="text-muted-foreground">교회 이름</dt>
          <dd>{receipt.churchName}</dd>
          <dt className="text-muted-foreground">지역</dt>
          <dd>{receipt.region}</dd>
          <dt className="text-muted-foreground">대표자</dt>
          <dd>{receipt.applicant}</dd>
          <dt className="text-muted-foreground">증빙 서류</dt>
          <dd className="wrap-anywhere">{receipt.proofName}</dd>
        </dl>
        <Button type="button" variant="outline" onClick={startOver}>
          <RotateCcw data-icon="inline-start" aria-hidden="true" />
          새로 작성
        </Button>
      </section>
    );
  }

  /** 입력 칸에 붙일 오류 표시와 설명 연결 */
  const invalidProps = (name: ChurchRegistrationField, hasDescription = false) => {
    const describedBy = [hasDescription && `${name}-description`, errors[name] && `${name}-error`].filter(Boolean);
    return {
      id: name,
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": describedBy.length > 0 ? describedBy.join(" ") : undefined,
    };
  };

  const errorMessage = (name: ChurchRegistrationField) =>
    // 칸마다 alert이면 오류가 한꺼번에 읽히므로, 알림은 위의 요약 한 곳에서만 하고 칸 메시지는 설명으로 읽힌다
    errors[name] && (
      <FieldError id={`${name}-error`} role={undefined}>
        {errors[name]}
      </FieldError>
    );

  return (
    <form
      ref={formRef}
      aria-labelledby={titleId}
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-xl border bg-card p-5 shadow-xs sm:p-6"
    >
      {errorCount > 0 && (
        <p
          key={attempt}
          role="alert"
          className="rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          입력을 확인해 주세요 ({errorCount}개)
        </p>
      )}

      <FieldSet>
        <FieldLegend>교회 정보</FieldLegend>
        <FieldGroup className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.churchName}>
            <FieldLabel htmlFor="churchName">교회 이름</FieldLabel>
            <Input name="churchName" autoComplete="organization" required {...invalidProps("churchName")} />
            {errorMessage("churchName")}
          </Field>
          <Field data-invalid={!!errors.pastorName}>
            <FieldLabel htmlFor="pastorName">담임목사</FieldLabel>
            <Input name="pastorName" required {...invalidProps("pastorName")} />
            {errorMessage("pastorName")}
          </Field>
          <Field data-invalid={!!errors.region}>
            <FieldLabel htmlFor="region">지역</FieldLabel>
            <NativeSelect name="region" defaultValue="" required className="w-full" {...invalidProps("region")}>
              <NativeSelectOption value="">시·도를 골라 주세요</NativeSelectOption>
              {KOREAN_REGIONS.map((region) => (
                <NativeSelectOption key={region} value={region}>
                  {region}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {errorMessage("region")}
          </Field>
          <Field data-invalid={!!errors.memberCount}>
            <FieldLabel htmlFor="memberCount">
              교인 수 <Optional />
            </FieldLabel>
            <Input name="memberCount" inputMode="numeric" {...invalidProps("memberCount")} />
            {errorMessage("memberCount")}
          </Field>
          <Field data-invalid={!!errors.address} className="sm:col-span-2">
            <FieldLabel htmlFor="address">주소</FieldLabel>
            <Input name="address" autoComplete="street-address" required {...invalidProps("address", true)} />
            <FieldDescription id="address-description">
              동까지만 적어도 됩니다. 2단계에서는 우편번호 검색으로 찾습니다.
            </FieldDescription>
            {errorMessage("address")}
          </Field>
          <Field data-invalid={!!errors.slogan} className="sm:col-span-2">
            <FieldLabel htmlFor="slogan">
              한 줄 소개 <Optional />
            </FieldLabel>
            <Textarea name="slogan" rows={2} {...invalidProps("slogan", true)} />
            <FieldDescription id="slogan-description">교회 카드에 보이는 소개입니다. 60자 이하로 적어 주세요.</FieldDescription>
            {errorMessage("slogan")}
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>대표자 정보</FieldLegend>
        <FieldGroup className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.applicantName}>
            <FieldLabel htmlFor="applicantName">대표자 이름</FieldLabel>
            <Input
              name="applicantName"
              defaultValue={applicantName}
              autoComplete="name"
              required
              {...invalidProps("applicantName")}
            />
            {errorMessage("applicantName")}
          </Field>
          <Field data-invalid={!!errors.applicantTitle}>
            <FieldLabel htmlFor="applicantTitle">직분</FieldLabel>
            <Input name="applicantTitle" defaultValue={applicantTitle} required {...invalidProps("applicantTitle")} />
            {errorMessage("applicantTitle")}
          </Field>
          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">연락처</FieldLabel>
            <Input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="010-1234-5678"
              required
              {...invalidProps("phone", true)}
            />
            <FieldDescription id="phone-description">관리자가 확인 전화를 드릴 휴대전화 번호입니다.</FieldDescription>
            {errorMessage("phone")}
          </Field>
          <Field data-invalid={!!errors.proof}>
            <FieldLabel htmlFor="proof">증빙 서류</FieldLabel>
            <Input
              name="proof"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              required
              {...invalidProps("proof", true)}
            />
            <FieldDescription id="proof-description">
              교회 직인이 찍힌 대표자 확인서 등. PDF·JPG·PNG, 10MB 이하
            </FieldDescription>
            {errorMessage("proof")}
          </Field>
        </FieldGroup>
      </FieldSet>

      <Field orientation="horizontal" data-invalid={!!errors.agreed}>
        <Checkbox
          checked={agreed}
          onCheckedChange={(checked) => setAgreed(checked === true)}
          required
          {...invalidProps("agreed")}
        />
        <FieldContent>
          <FieldLabel htmlFor="agreed" className="font-normal">
            입력한 내용이 사실이며, 관리자 확인에 쓰이는 데 동의합니다.
          </FieldLabel>
          {errorMessage("agreed")}
        </FieldContent>
      </Field>

      <div className="flex flex-col items-start gap-2 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">데모 화면이라 신청 내용은 저장되지 않습니다.</p>
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          <Send data-icon="inline-start" aria-hidden="true" />
          신청하기
        </Button>
      </div>
    </form>
  );
}

function Optional() {
  return <span className="font-normal text-muted-foreground">(선택)</span>;
}
