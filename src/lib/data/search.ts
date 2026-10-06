import { getChurches } from "@/lib/data/churches";
import { getUpcomingEvents } from "@/lib/data/events";
import { getRecentNotices } from "@/lib/data/notices";
import { getRecentPosts } from "@/lib/data/posts";
import { matchesQuery, toSearchTerms } from "@/lib/search";
import type { SearchResults } from "@/lib/types";

/**
 * 교회·다가오는 행사·공지·커뮤니티 글에서 검색어의 낱말이 모두 들어 있는 것을 찾는다. 빈 검색어는 결과가 없다.
 * 행사·공지·글은 교회 이름으로도 찾으므로, 교회 이름을 넣으면 그 교회의 행사·공지·글도 나온다.
 * 목데이터 단계에서는 전부 받아 거르고, Supabase 단계에서는 DB 검색으로 바뀐다.
 */
export async function searchSite(query: string): Promise<SearchResults> {
  const terms = toSearchTerms(query);
  if (terms.length === 0) return { churches: [], events: [], notices: [], posts: [] };

  const [churches, events, notices, posts] = await Promise.all([
    getChurches(),
    getUpcomingEvents(),
    getRecentNotices(),
    getRecentPosts(),
  ]);

  return {
    churches: churches.filter((church) =>
      matchesQuery(
        [
          church.name,
          church.slogan,
          church.pastorName,
          `${church.region} ${church.district}`,
          church.address,
          ...church.tags,
        ],
        terms,
      ),
    ),
    events: events.filter((event) => matchesQuery([event.title, event.church.name, ...event.tags], terms)),
    notices: notices.filter((notice) =>
      matchesQuery([notice.title, notice.summary, notice.church.name, notice.category], terms),
    ),
    posts: posts.filter((post) => matchesQuery([post.title, post.excerpt, post.church.name, post.category], terms)),
  };
}
