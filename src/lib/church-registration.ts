/** 교회를 등록할 수 있는 시·도. 교회 목데이터의 region과 같은 짧은 이름이다 */
export const KOREAN_REGIONS = [
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
] as const;

export const CHURCH_NAME_MAX_LENGTH = 30;
export const SLOGAN_MAX_LENGTH = 60;
export const PROOF_MAX_BYTES = 10 * 1024 * 1024;
export const PROOF_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"] as const;

/** 교회 등록·대표자 인증 신청 폼에 들어온 값. 글 칸은 입력한 그대로의 문자열이다 */
export interface ChurchRegistrationInput {
  churchName: string;
  pastorName: string;
  region: string;
  address: string;
  /** 선택. 비어 있으면 적지 않은 것이다 */
  memberCount: string;
  /** 선택. 카드에 보여 줄 한 줄 소개 */
  slogan: string;
  applicantName: string;
  /** 대표자의 직분 (예: 집사, 장로) */
  applicantTitle: string;
  phone: string;
  /** 증빙 서류. 1단계에서는 이름과 크기만 보고 올리지 않는다 */
  proof: { name: string; size: number } | null;
  agreed: boolean;
}

export type ChurchRegistrationField = keyof ChurchRegistrationInput;
export type ChurchRegistrationErrors = Partial<Record<ChurchRegistrationField, string>>;

const PHONE = /^01[016789]-?\d{3,4}-?\d{4}$/;
const POSITIVE_INTEGER = /^[1-9]\d*$/;

/** 글자 수. 한글 한 글자도 1자로 센다 */
const length = (value: string) => [...value].length;

/**
 * 신청 폼의 값을 검사해 칸마다 오류 메시지를 돌려준다. 오류가 없으면 빈 객체다.
 * 글 칸은 앞뒤 공백을 빼고 본다. 2단계에서는 서버에서도 같은 함수로 다시 검사한다.
 */
export function validateChurchRegistration(input: ChurchRegistrationInput): ChurchRegistrationErrors {
  const errors: ChurchRegistrationErrors = {};
  const churchName = input.churchName.trim();
  const region = input.region.trim();
  const memberCount = input.memberCount.trim();
  const phone = input.phone.trim();

  if (!churchName) errors.churchName = "교회 이름을 입력해 주세요.";
  else if (length(churchName) > CHURCH_NAME_MAX_LENGTH)
    errors.churchName = `교회 이름은 ${CHURCH_NAME_MAX_LENGTH}자 이하로 입력해 주세요.`;

  if (!input.pastorName.trim()) errors.pastorName = "담임목사 이름을 입력해 주세요.";

  if (!region) errors.region = "지역을 골라 주세요.";
  else if (!KOREAN_REGIONS.some((option) => option === region)) errors.region = "목록에 있는 지역을 골라 주세요.";

  if (!input.address.trim()) errors.address = "주소를 입력해 주세요.";

  if (memberCount && !POSITIVE_INTEGER.test(memberCount))
    errors.memberCount = "교인 수는 1 이상의 정수로 입력해 주세요.";

  if (length(input.slogan.trim()) > SLOGAN_MAX_LENGTH)
    errors.slogan = `한 줄 소개는 ${SLOGAN_MAX_LENGTH}자 이하로 입력해 주세요.`;

  if (!input.applicantName.trim()) errors.applicantName = "대표자 이름을 입력해 주세요.";
  if (!input.applicantTitle.trim()) errors.applicantTitle = "직분을 입력해 주세요.";

  if (!phone) errors.phone = "연락처를 입력해 주세요.";
  else if (!PHONE.test(phone)) errors.phone = "휴대전화 번호를 010-1234-5678 꼴로 입력해 주세요.";

  if (!input.proof) errors.proof = "증빙 서류를 첨부해 주세요.";
  else if (!hasProofExtension(input.proof.name)) errors.proof = "PDF, JPG, PNG 파일만 첨부할 수 있습니다.";
  else if (input.proof.size > PROOF_MAX_BYTES) errors.proof = "10MB 이하 파일만 첨부할 수 있습니다.";

  if (!input.agreed) errors.agreed = "입력한 내용이 사실임을 확인해 주세요.";

  return errors;
}

function hasProofExtension(name: string): boolean {
  const extension = name.slice(name.lastIndexOf(".") + 1).toLowerCase();
  return name.includes(".") && PROOF_EXTENSIONS.some((option) => option === extension);
}
