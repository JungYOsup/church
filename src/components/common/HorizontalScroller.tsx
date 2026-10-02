"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 가로로 넘기는 목록. children은 <li>로 넘기고, 폭과 snap 위치는 넘기는 쪽에서 정한다.
 * 이전·다음 버튼은 640px부터 보이고(모바일은 손가락으로 민다), 끝에 닿은 쪽 버튼은 끄고 숨긴다.
 */
export function HorizontalScroller({
  itemLabel,
  children,
}: {
  /** 버튼 이름에 붙일 항목 이름 (예: "행사" → "이전 행사", "다음 행사") */
  itemLabel: string;
  children: ReactNode;
}) {
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      // 소수점 픽셀 때문에 끝에 닿아도 1px쯤 모자랄 수 있어 여유를 둔다
      setEdges({
        atStart: list.scrollLeft <= 1,
        atEnd: list.scrollLeft + list.clientWidth >= list.scrollWidth - 1,
      });
    };
    // ResizeObserver는 observe하자마자 한 번 불려서 처음 상태도 여기서 정해진다
    const observer = new ResizeObserver(update);
    observer.observe(list);
    list.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      list.removeEventListener("scroll", update);
    };
  }, []);

  const previousRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  /** 마지막으로 누른 버튼. 그 버튼이 끝에 닿아 꺼질 때 포커스를 옮길지 판단한다 */
  const pressedRef = useRef<HTMLButtonElement | null>(null);

  // 누른 버튼이 끝에서 꺼지면 브라우저가 포커스를 body로 보내 키보드 사용자가 자리를 잃는다.
  // 클릭 순간에는 반대쪽 버튼도 꺼져 있을 수 있어서(1440px에서는 한 번에 끝에 닿음),
  // 버튼 상태가 다시 그려진 뒤 반대쪽 버튼으로 옮긴다.
  useEffect(() => {
    const pressed = pressedRef.current;
    const lostFocus = document.activeElement === pressed || document.activeElement === document.body;
    if (!pressed?.disabled || !lostFocus) return;
    (pressed === nextRef.current ? previousRef : nextRef).current?.focus();
    pressedRef.current = null;
  }, [edges]);

  const scrollByPage = (button: HTMLButtonElement, direction: 1 | -1) => {
    const list = listRef.current;
    pressedRef.current = button;
    list?.scrollBy({ left: direction * list.clientWidth, behavior: "smooth" });
  };

  const buttonClassName =
    "absolute top-[30%] z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-card text-foreground shadow-md ring-1 ring-foreground/10 outline-hidden transition-opacity hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-0 sm:flex";

  return (
    <div className="relative">
      {/* 카드 테두리(ring)와 그림자가 스크롤 영역에 잘리지 않게 안쪽 여백을 두고 바깥 여백으로 되돌린다 */}
      <ul
        id={listId}
        ref={listRef}
        role="list"
        className="-m-1 flex snap-x snap-mandatory scroll-px-1 gap-3 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
      <button
        type="button"
        aria-label={`이전 ${itemLabel}`}
        aria-controls={listId}
        ref={previousRef}
        disabled={edges.atStart}
        onClick={(event) => scrollByPage(event.currentTarget, -1)}
        className={`${buttonClassName} -left-3`}
      >
        <ChevronLeft aria-hidden="true" className="size-5" />
      </button>
      <button
        type="button"
        aria-label={`다음 ${itemLabel}`}
        aria-controls={listId}
        ref={nextRef}
        disabled={edges.atEnd}
        onClick={(event) => scrollByPage(event.currentTarget, 1)}
        className={`${buttonClassName} -right-3`}
      >
        <ChevronRight aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
}
