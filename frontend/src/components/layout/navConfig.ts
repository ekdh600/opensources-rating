/**
 * 카테고리 페이지(`/categories`)에서 쓰는 공통 목록.
 * 헤더에는「카테고리」탭만 두고, 세부 항목은 이 데이터로 하위 페이지에 표시합니다.
 */
export const CATEGORY_ITEMS = [
  { slug: "kubernetes", nameKo: "쿠버네티스", nameEn: "Kubernetes", icon: "☸️" },
  { slug: "observability", nameKo: "관측성", nameEn: "Observability", icon: "📊" },
  { slug: "networking-cni", nameKo: "네트워킹", nameEn: "Networking", icon: "🌐" },
  { slug: "service-mesh", nameKo: "서비스 메시", nameEn: "Service Mesh", icon: "🕸️" },
  { slug: "cicd", nameKo: "CI/CD", nameEn: "CI/CD", icon: "🔄" },
  { slug: "gitops", nameKo: "GitOps", nameEn: "GitOps", icon: "🔀" },
  { slug: "database", nameKo: "데이터베이스", nameEn: "Database", icon: "💾" },
  { slug: "ai-ml", nameKo: "AI/ML", nameEn: "AI/ML", icon: "🤖" },
] as const;

export type CategoryItem = (typeof CATEGORY_ITEMS)[number];
