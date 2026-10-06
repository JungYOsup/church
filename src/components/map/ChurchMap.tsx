"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { MapFallback } from "@/components/map/MapFallback";
import { loadKakaoMaps, type KakaoCustomOverlay, type KakaoMap, type KakaoMaps } from "@/components/map/kakao";
import { filterWithinBounds, type MapBounds } from "@/lib/geo";
import type { Church } from "@/lib/types";
import { cn } from "@/lib/utils";

// 빌드 때 번들에 박힌다(NEXT_PUBLIC_). 없으면 SDK를 부르지 않고 대체 화면을 보여 준다
const APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

// 지도를 처음 만들 때의 중심(서울시청)과 확대 수준. 만든 뒤 곧바로 교회가 모두 보이게 맞춘다
const INITIAL_CENTER = { lat: 37.5665, lng: 126.978 };
const INITIAL_LEVEL = 8;
// 이 수준보다 멀리 보면 이름표가 서로 겹치므로 핀만 보인다(숫자가 클수록 멀다)
const LABEL_MAX_LEVEL = 8;
// 교회에 맞출 때 가장자리 핀이 잘리지 않게 두는 여백(px). 위쪽은 핀 높이만큼 더 준다
const FIT_PADDING = { top: 56, side: 32 };
// 교회 한 곳만 받으면(교회 상세) 점 하나에 범위를 맞추면 너무 가까워지므로, 동네가 보이는 이 수준으로 둔다
const SINGLE_CHURCH_LEVEL = 4;

interface Kakao {
  maps: KakaoMaps;
  map: KakaoMap;
}

interface ChurchMapProps {
  churches: Church[];
  /** 고른 교회. 핀을 키우고 사진과 이름표를 보여 주며, 지도를 그 교회로 옮긴다 */
  selectedId?: string | null;
  /** 핀을 누르면 그 교회의 id를 알린다(고르기·풀기는 부르는 쪽이 정한다) */
  onSelect?: (churchId: string) => void;
  /** 지도가 멈출 때마다(맞춘 직후 포함) 보이는 범위를 알린다. 지도를 쓸 수 없으면 부르지 않는다 */
  onBoundsChange?: (bounds: MapBounds) => void;
  /** 지도 왼쪽 아래에 "현재 지도 범위 내 교회 N개"를 보여 준다(홈 칸). 지도 페이지는 목록 머리에 적으므로 끈다 */
  showCount?: boolean;
  /** 지도 칸의 크기(높이)를 정한다 */
  className?: string;
}

/**
 * 교회마다 핀을 꽂은 카카오맵. 처음과 받은 교회가 바뀔 때(지역 필터) 교회가 모두 보이게 맞춘다.
 * 교회가 한 곳이면(교회 상세) 그 교회를 가운데 두고 동네가 보이는 수준으로 둔다.
 * 키가 없거나 SDK를 불러오지 못하면 같은 자리에 대체 화면을 보여 준다.
 * onSelect가 없으면(홈 칸) 핀은 고를 수 없는 그림이다.
 */
export function ChurchMap({
  churches,
  selectedId = null,
  onSelect,
  onBoundsChange,
  showCount = false,
  className,
}: ChurchMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [kakao, setKakao] = useState<Kakao | null>(null);
  const [failed, setFailed] = useState(!APP_KEY);
  const [level, setLevel] = useState(INITIAL_LEVEL);
  // 지도 범위 안의 교회 수. 지도가 처음 맞춰지기 전에는 null이다
  const [visibleCount, setVisibleCount] = useState<number | null>(null);

  // SDK를 불러와 지도를 만든다
  useEffect(() => {
    if (!APP_KEY) return;
    let cancelled = false;
    loadKakaoMaps(APP_KEY).then(
      (maps) => {
        const container = containerRef.current;
        if (cancelled || !container) return;
        try {
          const map = new maps.Map(container, {
            center: new maps.LatLng(INITIAL_CENTER.lat, INITIAL_CENTER.lng),
            level: INITIAL_LEVEL,
          });
          map.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT);
          setKakao({ maps, map });
        } catch {
          // SDK는 받았지만 지도를 만들지 못하면(일부만 받은 SDK 등) 불러오는 중에 머물지 않고 대체 화면을 보여 준다
          setFailed(true);
        }
      },
      () => {
        if (!cancelled) setFailed(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  // 지도가 멈출 때마다 확대 수준(이름표를 보일지)과 보이는 범위를 읽는다
  const handleIdle = useEffectEvent((map: KakaoMap) => {
    setLevel(map.getLevel());
    const southWest = map.getBounds().getSouthWest();
    const northEast = map.getBounds().getNorthEast();
    const bounds: MapBounds = {
      south: southWest.getLat(),
      west: southWest.getLng(),
      north: northEast.getLat(),
      east: northEast.getLng(),
    };
    setVisibleCount(filterWithinBounds(churches, bounds).length);
    onBoundsChange?.(bounds);
  });

  useEffect(() => {
    if (!kakao) return;
    const listener = () => handleIdle(kakao.map);
    kakao.maps.event.addListener(kakao.map, "idle", listener);
    return () => kakao.maps.event.removeListener(kakao.map, "idle", listener);
  }, [kakao]);

  // 교회가 모두 보이게 맞춘다. 실제 SDK는 처음 맞출 때 idle을 보내지 않아서, 맞춘 뒤 직접 일으킨다
  const fitToChurches = useEffectEvent(({ maps, map }: Kakao) => {
    if (churches.length === 0) return;
    if (churches.length === 1) {
      const [church] = churches;
      map.setLevel(SINGLE_CHURCH_LEVEL);
      map.setCenter(new maps.LatLng(church.lat, church.lng));
    } else {
      const bounds = new maps.LatLngBounds();
      for (const church of churches) bounds.extend(new maps.LatLng(church.lat, church.lng));
      map.setBounds(bounds, FIT_PADDING.top, FIT_PADDING.side, FIT_PADDING.side, FIT_PADDING.side);
    }
    maps.event.trigger(map, "idle");
  });

  // 배열이 아니라 교회 id로 맞출 때를 정한다. 같은 교회를 다시 받으면(페이지를 새로 받음) 사용자가 옮긴 지도를 그대로 둔다
  const churchKey = churches.map((church) => church.id).join(",");
  useEffect(() => {
    if (kakao) fitToChurches(kakao);
  }, [kakao, churchKey]);

  // 고르기가 바뀔 때만 그 교회로 옮긴다. 지역을 바꿀 때는 옮기지 않아야 새 지역에 맞춘 지도가 풀리지 않는다
  const panToChurch = useEffectEvent(({ maps, map }: Kakao, churchId: string) => {
    const church = churches.find((candidate) => candidate.id === churchId);
    if (church) map.panTo(new maps.LatLng(church.lat, church.lng));
  });

  useEffect(() => {
    if (kakao && selectedId !== null) panToChurch(kakao, selectedId);
  }, [kakao, selectedId]);

  // 창 크기가 아니라 배치 때문에 지도 칸 크기가 바뀌어도 다시 그린다. 크기만 바뀌면 중심과 수준이 그대로라
  // idle이 오지 않으므로, 달라진 범위로 목록과 개수를 다시 거르도록 직접 일으킨다
  useEffect(() => {
    const container = containerRef.current;
    if (!kakao || !container) return;
    const observer = new ResizeObserver(() => {
      kakao.map.relayout();
      kakao.maps.event.trigger(kakao.map, "idle");
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [kakao]);

  return (
    <div role="region" aria-label="지도" className={cn("relative overflow-hidden rounded-lg bg-muted", className)}>
      {failed ? (
        <MapFallback className="size-full" />
      ) : (
        <>
          {/* SDK가 이 칸에 position: relative를 직접 주므로 inset 대신 크기로 채운다.
              SDK가 안에서 쓰는 z-index가 바깥의 교회 수 알약을 덮지 않도록 쌓임을 이 칸 안에 가둔다 */}
          <div ref={containerRef} className="isolate size-full" />
          {!kakao && (
            <p className="absolute inset-0 flex animate-pulse items-center justify-center text-sm text-muted-foreground">
              지도를 불러오는 중…
            </p>
          )}
          {showCount && visibleCount !== null && (
            // 왼쪽 아래의 카카오 로고·축척 막대를 가리지 않도록 그 줄 위에 둔다
            <p
              role="status"
              className="absolute bottom-9 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-foreground shadow-md"
            >
              <MapPin aria-hidden="true" className="size-3.5 text-primary" />
              현재 지도 범위 내 교회 <span className="font-bold text-primary">{visibleCount}</span>개
            </p>
          )}
          {kakao &&
            churches.map((church) => (
              <ChurchMarker
                key={church.id}
                kakao={kakao}
                church={church}
                selected={church.id === selectedId}
                showLabel={level <= LABEL_MAX_LEVEL}
                onSelect={onSelect}
              />
            ))}
        </>
      )}
    </div>
  );
}

interface ChurchMarkerProps {
  kakao: Kakao;
  church: Church;
  selected: boolean;
  /** 지도가 충분히 가까울 때만 이름표를 보인다. 고른 교회는 늘 보인다 */
  showLabel: boolean;
  onSelect?: (churchId: string) => void;
}

/** 교회 하나의 핀. 오버레이 요소는 SDK가 핀 자리로 옮기고, React는 그 안에 핀을 그린다 */
function ChurchMarker({ kakao, church, selected, showLabel, onSelect }: ChurchMarkerProps) {
  // 지도가 준비된 뒤에만(브라우저에서만) 그려지므로 document를 써도 된다
  const [content] = useState(() => document.createElement("div"));
  const overlayRef = useRef<KakaoCustomOverlay | null>(null);

  useEffect(() => {
    const overlay = new kakao.maps.CustomOverlay({
      map: kakao.map,
      content,
      position: new kakao.maps.LatLng(church.lat, church.lng),
      // 핀 끝(아래 가운데)이 교회 자리에 놓인다
      xAnchor: 0.5,
      yAnchor: 1,
      clickable: true,
    });
    overlayRef.current = overlay;
    return () => {
      overlay.setMap(null);
      overlayRef.current = null;
    };
  }, [kakao, content, church.lat, church.lng]);

  // 고른 핀은 다른 핀과 이름표 위에 그린다. 오버레이를 다시 만들면 그 안의 버튼이 빠졌다 들어가 포커스를 잃으므로
  // 쌓임 순서만 바꾼다. 오버레이를 다시 만든 뒤에도 맞도록 같은 값에 따라 다시 돈다
  useEffect(() => {
    overlayRef.current?.setZIndex(selected ? 1 : 0);
  }, [selected, kakao, content, church.lat, church.lng]);

  const pin = (
    <>
      <PinIcon
        className={cn("h-10 w-8 origin-bottom text-primary drop-shadow-md transition-transform", selected && "scale-125")}
      />
      {/* 멀리 볼 때는 이름표를 숨기지만, 버튼 이름으로는 남긴다 */}
      <span
        className={
          selected
            ? "absolute top-1 left-full ml-2 rounded-full bg-white px-2.5 py-0.5 text-sm font-bold whitespace-nowrap text-foreground shadow-md"
            : showLabel
              ? "absolute top-1.5 left-full ml-1 rounded-full bg-white px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-foreground shadow-sm"
              : "sr-only"
        }
      >
        {church.name}
      </span>
    </>
  );

  return createPortal(
    <span className="relative block">
      {selected && (
        // 핀 위의 사진 카드는 그 교회 상세로 가는 링크다. 핀 버튼 안에는 링크를 둘 수 없어 나란히 둔다.
        // 목데이터 사진은 그 교회의 실제 모습이 아니라 장식으로 둔다
        <Link
          href={`/churches/${church.id}`}
          aria-label={`${church.name} 자세히 보기`}
          className="absolute bottom-full left-1/2 mb-3 block w-28 -translate-x-1/2 overflow-hidden rounded-lg border-2 border-white bg-white shadow-md outline-hidden focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="relative block aspect-4/3">
            <Image src={church.imageUrl} alt="" fill sizes="112px" className="object-cover" />
          </span>
        </Link>
      )}
      {onSelect ? (
        <button
          type="button"
          aria-pressed={selected}
          onClick={() => onSelect(church.id)}
          className="relative block rounded-md outline-hidden focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {pin}
        </button>
      ) : (
        // 고를 수 없는 핀은 누를 수 있어 보이지 않게 교회 이름이 붙은 그림으로 둔다
        <span role="img" aria-label={church.name} className="relative block">
          {pin}
        </span>
      )}
    </span>,
    content,
  );
}

/** 물방울 핀과 흰 십자가. 끝이 아래 가운데에 있다 */
function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 40" aria-hidden="true" className={className}>
      <path
        d="M16 1C8.27 1 2 7.1 2 14.63 2 24.5 16 39 16 39s14-14.5 14-24.37C30 7.1 23.73 1 16 1Z"
        fill="currentColor"
        stroke="white"
        strokeWidth="2"
      />
      <path d="M14.5 6.5h3v5h4.5v3h-4.5v8h-3v-8H10v-3h4.5z" fill="white" />
    </svg>
  );
}
