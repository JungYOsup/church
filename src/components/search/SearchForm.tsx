import Form from "next/form";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_QUERY_LENGTH } from "@/lib/search";

/**
 * 검색창. next/form의 GET 폼이라 제출하면 /search?q=…로 클라이언트 이동한다.
 * 검색어가 없을 때(헤더 검색 버튼으로 들어왔을 때)만 검색창에 바로 포커스를 준다.
 * 결과 화면에서 포커스를 주면 모바일에서 키보드가 결과를 가리기 때문이다
 */
export function SearchForm({ query }: { query: string | null }) {
  return (
    <Form action="/search" role="search" className="flex max-w-2xl gap-2">
      <label htmlFor="search-query" className="sr-only">
        검색어
      </label>
      {/* 비제어 입력칸이지만, 검색어가 다른 주소로 가면 App Router가 페이지를 새로 그려 defaultValue가 다시 들어간다 */}
      <Input
        id="search-query"
        type="search"
        name="q"
        defaultValue={query ?? ""}
        maxLength={MAX_QUERY_LENGTH}
        placeholder="교회, 지역, 행사·공지·글 제목"
        autoFocus={query === null}
        autoComplete="off"
        className="h-10 bg-card"
      />
      <Button type="submit" size="lg" className="h-10">
        <Search data-icon="inline-start" aria-hidden="true" />
        검색
      </Button>
    </Form>
  );
}
