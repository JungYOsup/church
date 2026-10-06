import { describe, expect, it } from "vitest";
import {
  type ChurchRegistrationInput,
  validateChurchRegistration,
} from "./church-registration";

const MB = 1024 * 1024;

const VALID: ChurchRegistrationInput = {
  churchName: "소망교회",
  pastorName: "박하늘",
  region: "경기",
  address: "경기도 성남시 분당구 정자동",
  memberCount: "",
  slogan: "",
  applicantName: "김은혜",
  applicantTitle: "집사",
  phone: "010-1234-5678",
  proof: { name: "대표자확인서.pdf", size: 2 * MB },
  agreed: true,
};

/** 올바른 입력에서 일부만 바꿨을 때 오류가 난 칸 이름 (이름순) */
function errorFields(override: Partial<ChurchRegistrationInput>) {
  return Object.keys(validateChurchRegistration({ ...VALID, ...override })).sort();
}

describe("validateChurchRegistration", () => {
  it("올바른 입력이면 오류가 없고, 선택 칸(교인 수, 소개)은 비어도 된다", () => {
    expect(validateChurchRegistration(VALID)).toEqual({});
    expect(errorFields({ memberCount: "530", slogan: "다음 세대를 세우는 교회" })).toEqual([]);
  });

  it("모두 비면 필수 칸 9개에 오류가 난다", () => {
    const errors = validateChurchRegistration({
      churchName: "",
      pastorName: "",
      region: "",
      address: "",
      memberCount: "",
      slogan: "",
      applicantName: "",
      applicantTitle: "",
      phone: "",
      proof: null,
      agreed: false,
    });
    expect(Object.keys(errors).sort()).toEqual(
      [
        "address",
        "agreed",
        "applicantName",
        "applicantTitle",
        "churchName",
        "pastorName",
        "phone",
        "proof",
        "region",
      ].sort(),
    );
    for (const message of Object.values(errors)) expect(message).toMatch(/\S/);
  });

  it("공백만 있는 칸은 빈 칸으로 본다", () => {
    expect(errorFields({ churchName: "   ", pastorName: " ", address: "\t", applicantName: "  ", applicantTitle: " " })).toEqual(
      ["address", "applicantName", "applicantTitle", "churchName", "pastorName"],
    );
  });

  it("교회 이름은 30자까지, 한 줄 소개는 60자까지 받는다", () => {
    expect(errorFields({ churchName: "가".repeat(30), slogan: "나".repeat(60) })).toEqual([]);
    expect(errorFields({ churchName: "가".repeat(31) })).toEqual(["churchName"]);
    expect(errorFields({ slogan: "나".repeat(61) })).toEqual(["slogan"]);
  });

  it("목록에 없는 지역은 막는다", () => {
    expect(errorFields({ region: "서울" })).toEqual([]);
    expect(errorFields({ region: "서울특별시" })).toEqual(["region"]);
  });

  it("교인 수는 1 이상의 정수만 받는다", () => {
    for (const memberCount of ["0", "-3", "2.5", "abc"]) {
      expect(errorFields({ memberCount }), memberCount).toEqual(["memberCount"]);
    }
    expect(errorFields({ memberCount: "530" })).toEqual([]);
  });

  it("연락처는 휴대전화 번호 꼴만 받는다", () => {
    for (const phone of ["010-1234-5678", "01012345678", "011-123-4567"]) {
      expect(errorFields({ phone }), phone).toEqual([]);
    }
    for (const phone of ["02-123-4567", "010-12-5678"]) {
      expect(errorFields({ phone }), phone).toEqual(["phone"]);
    }
  });

  it("증빙 서류는 PDF·JPG·PNG만 받고 확장자의 대소문자는 가리지 않는다", () => {
    for (const name of ["확인서.pdf", "확인서.JPG", "확인서.jpeg", "확인서.png"]) {
      expect(errorFields({ proof: { name, size: MB } }), name).toEqual([]);
    }
    expect(errorFields({ proof: { name: "확인서.exe", size: MB } })).toEqual(["proof"]);
  });

  it("증빙 서류는 정확히 10MB까지 받는다", () => {
    expect(errorFields({ proof: { name: "확인서.pdf", size: 10 * MB } })).toEqual([]);
    expect(errorFields({ proof: { name: "확인서.pdf", size: 10 * MB + 1 } })).toEqual(["proof"]);
  });

  it("사실 확인에 동의하지 않으면 막는다", () => {
    expect(errorFields({ agreed: false })).toEqual(["agreed"]);
  });

  it("입력 객체를 바꾸지 않는다", () => {
    const input = { ...VALID, churchName: "  소망교회  ", proof: { ...VALID.proof! } };
    const before = structuredClone(input);
    validateChurchRegistration(input);
    expect(input).toEqual(before);
  });
});
