// e2e에서 카카오맵 SDK(dapi.kakao.com) 대신 내려주는 가짜. e2e/fixtures.ts의 kakaoSdk: "fake"가 쓴다.
// src/components/map/kakao.ts에 타입으로 적힌 API만 흉내 낸다. 앱이 새 API를 쓰면 여기에도 더한다.
// 지도를 그리지 않고, 오버레이 내용을 지도 칸에 차례로 붙여 버튼을 누를 수 있게만 한다.
// 테스트는 window.__fakeKakao로 지도 이동을 일으키고(moveTo) 지도 상태(center, level)를 읽는다.
(() => {
  class LatLng {
    constructor(lat, lng) {
      this.lat = lat;
      this.lng = lng;
    }
    getLat() {
      return this.lat;
    }
    getLng() {
      return this.lng;
    }
  }

  class LatLngBounds {
    constructor(sw, ne) {
      this.sw = sw ?? null;
      this.ne = ne ?? null;
    }
    extend(latlng) {
      const lat = latlng.getLat();
      const lng = latlng.getLng();
      this.sw = new LatLng(Math.min(this.sw?.getLat() ?? lat, lat), Math.min(this.sw?.getLng() ?? lng, lng));
      this.ne = new LatLng(Math.max(this.ne?.getLat() ?? lat, lat), Math.max(this.ne?.getLng() ?? lng, lng));
    }
    getSouthWest() {
      return this.sw;
    }
    getNorthEast() {
      return this.ne;
    }
  }

  const idleHandlers = new Map();

  // 실제 SDK에서 교회 15곳에 맞췄을 때의 확대 수준. 가짜는 범위 크기와 상관없이 이 값으로 맞춘다
  const FITTED_LEVEL = 10;

  // 실제 SDK처럼 지도 이동이 끝난 뒤(다음 차례에) idle을 알린다
  function fireIdle(map) {
    setTimeout(() => {
      for (const handler of idleHandlers.get(map) ?? []) handler();
    }, 0);
  }

  class FakeMap {
    constructor(container, { center, level }) {
      this.level = level;
      this.center = center;
      // 처음 범위는 중심 둘레의 작은 사각형이다. 앱은 곧바로 setBounds로 교회에 맞춘다
      this.bounds = new LatLngBounds(
        new LatLng(center.getLat() - 0.01, center.getLng() - 0.01),
        new LatLng(center.getLat() + 0.01, center.getLng() + 0.01),
      );
      this.layer = document.createElement("div");
      this.layer.dataset.fakeKakaoLayer = "";
      this.layer.style.cssText = "display:flex;flex-wrap:wrap;align-content:flex-start;gap:8px;padding:8px;height:100%;overflow:auto";
      container.append(this.layer);
      window.__fakeKakao.maps.push(this);
    }
    getBounds() {
      return this.bounds;
    }
    // 실제 SDK는 지도를 만든 직후 setBounds로 맞췄을 때 idle을 보내지 않았다. 가짜도 보내지 않는다
    setBounds(bounds) {
      this.bounds = new LatLngBounds(bounds.getSouthWest(), bounds.getNorthEast());
      this.center = new LatLng(
        (bounds.getSouthWest().getLat() + bounds.getNorthEast().getLat()) / 2,
        (bounds.getSouthWest().getLng() + bounds.getNorthEast().getLng()) / 2,
      );
      this.level = FITTED_LEVEL;
    }
    // 범위의 크기는 그대로 두고 중심만 옮긴다
    panTo(latlng) {
      const halfLat = (this.bounds.getNorthEast().getLat() - this.bounds.getSouthWest().getLat()) / 2;
      const halfLng = (this.bounds.getNorthEast().getLng() - this.bounds.getSouthWest().getLng()) / 2;
      this.center = latlng;
      this.bounds = new LatLngBounds(
        new LatLng(latlng.getLat() - halfLat, latlng.getLng() - halfLng),
        new LatLng(latlng.getLat() + halfLat, latlng.getLng() + halfLng),
      );
      fireIdle(this);
    }
    getLevel() {
      return this.level;
    }
    relayout() {}
    addControl() {}
  }

  class CustomOverlay {
    constructor({ content, map, position, zIndex }) {
      this.content = content;
      this.position = position;
      this.setZIndex(zIndex ?? 0);
      this.setMap(map ?? null);
    }
    setMap(map) {
      if (map) map.layer.append(this.content);
      else this.content.remove();
    }
    setZIndex(zIndex) {
      this.zIndex = zIndex;
      this.content.style.zIndex = String(zIndex);
    }
  }

  window.kakao = {
    maps: {
      load(callback) {
        setTimeout(callback, 0);
      },
      Map: FakeMap,
      LatLng,
      LatLngBounds,
      CustomOverlay,
      ZoomControl: class {},
      ControlPosition: { RIGHT: 6 },
      event: {
        addListener(target, type, handler) {
          if (type !== "idle") return;
          if (!idleHandlers.has(target)) idleHandlers.set(target, new Set());
          idleHandlers.get(target).add(handler);
        },
        removeListener(target, type, handler) {
          idleHandlers.get(target)?.delete(handler);
        },
        trigger(target, type) {
          if (type !== "idle") return;
          for (const handler of idleHandlers.get(target) ?? []) handler();
        },
      },
    },
  };

  window.__fakeKakao = {
    maps: [],
    /**
     * 사용자가 지도를 옮기거나 확대한 것처럼 범위(와 확대 수준)를 바꾸고 idle을 일으킨다.
     * 페이지의 첫 번째 지도가 기본이다
     */
    moveTo({ south, west, north, east, level }, index = 0) {
      const map = this.maps[index];
      map.bounds = new LatLngBounds(new LatLng(south, west), new LatLng(north, east));
      map.center = new LatLng((south + north) / 2, (west + east) / 2);
      if (level !== undefined) map.level = level;
      fireIdle(map);
    },
    center(index = 0) {
      const { center } = this.maps[index];
      return { lat: center.getLat(), lng: center.getLng() };
    },
  };
})();
