// 카카오맵 JavaScript SDK 가운데 이 앱이 쓰는 부분만의 타입과, SDK를 한 번만 불러오는 로더.
// 문서: https://apis.map.kakao.com/web/documentation/
// e2e의 가짜 SDK(e2e/kakao-fake.js)는 여기 적힌 API만 흉내 낸다. 새 API를 쓰면 가짜에도 더한다.

export interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

export interface KakaoLatLngBounds {
  extend(latlng: KakaoLatLng): void;
  getSouthWest(): KakaoLatLng;
  getNorthEast(): KakaoLatLng;
}

export interface KakaoMap {
  getBounds(): KakaoLatLngBounds;
  /** 영역이 전부 보이게 중심과 확대 수준을 맞춘다. padding은 px */
  setBounds(
    bounds: KakaoLatLngBounds,
    paddingTop?: number,
    paddingRight?: number,
    paddingBottom?: number,
    paddingLeft?: number,
  ): void;
  panTo(latlng: KakaoLatLng): void;
  /** 확대 수준. 숫자가 작을수록 가깝다 */
  getLevel(): number;
  /** 지도 칸의 크기가 바뀐 뒤 다시 그린다. 창 크기 변화는 SDK가 알아서 부른다 */
  relayout(): void;
  addControl(control: KakaoZoomControl, position: number): void;
}

export interface KakaoCustomOverlay {
  setMap(map: KakaoMap | null): void;
  /** 숫자가 클수록 위에 그린다 */
  setZIndex(zIndex: number): void;
}

export type KakaoZoomControl = object;

export interface KakaoMaps {
  /** autoload=false로 불러온 SDK의 나머지를 받은 뒤 callback을 부른다 */
  load(callback: () => void): void;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  LatLngBounds: new () => KakaoLatLngBounds;
  CustomOverlay: new (options: {
    position: KakaoLatLng;
    content: HTMLElement;
    map?: KakaoMap;
    /** content에서 position에 놓일 점. 0~1, 기본 0.5 */
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
    /** true면 content를 눌러도 지도 이벤트(끌기 등)가 일어나지 않는다 */
    clickable?: boolean;
  }) => KakaoCustomOverlay;
  ZoomControl: new () => KakaoZoomControl;
  ControlPosition: { RIGHT: number };
  event: {
    addListener(target: KakaoMap, type: "idle", handler: () => void): void;
    removeListener(target: KakaoMap, type: "idle", handler: () => void): void;
    /** 등록한 핸들러를 직접 부른다 */
    trigger(target: KakaoMap, type: "idle"): void;
  };
}

declare global {
  interface Window {
    kakao?: { maps?: KakaoMaps };
  }
}

const SDK_URL = "https://dapi.kakao.com/v2/maps/sdk.js";
// 이 시간 안에 SDK가 준비되지 않으면 대체 화면을 보여 준다
const LOAD_TIMEOUT_MS = 10_000;

let loading: Promise<KakaoMaps> | null = null;

/**
 * SDK를 불러와 kakao.maps를 돌려준다. 페이지를 옮겨 다녀도 한 번만 불러온다.
 * 스크립트를 받지 못하거나, 받았는데 kakao.maps가 없거나(도메인 미등록 등), 시간 안에 준비되지 않으면 실패한다.
 * 실패하면 다음 호출에서 다시 시도한다.
 */
export function loadKakaoMaps(appKey: string): Promise<KakaoMaps> {
  loading ??= new Promise<KakaoMaps>((resolve, reject) => {
    const script = document.createElement("script");
    const fail = (reason: string) => {
      window.clearTimeout(timer);
      script.remove();
      reject(new Error(reason));
    };
    const timer = window.setTimeout(() => fail("카카오맵 SDK가 시간 안에 준비되지 않았습니다"), LOAD_TIMEOUT_MS);

    script.src = `${SDK_URL}?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    script.async = true;
    script.onerror = () => fail("카카오맵 SDK를 받지 못했습니다");
    script.onload = () => {
      const maps = window.kakao?.maps;
      if (!maps) {
        fail("카카오맵 SDK에 kakao.maps가 없습니다");
        return;
      }
      maps.load(() => {
        window.clearTimeout(timer);
        resolve(maps);
      });
    };
    document.head.append(script);
  }).catch((error: unknown) => {
    loading = null;
    throw error;
  });
  return loading;
}
