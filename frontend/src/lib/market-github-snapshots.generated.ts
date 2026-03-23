export interface MarketGitHubRepoSnapshot {
  slug: string;
  name: string;
  owner: string;
  repo: string;
  fullName: string;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  subscribersCount: number;
  networkCount: number;
  archived: boolean;
  license: string | null;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
}

export const MARKET_GITHUB_REPO_SNAPSHOTS: Record<string, MarketGitHubRepoSnapshot> = {
  'kubernetes': {
    slug: 'kubernetes',
    name: 'Kubernetes',
    owner: 'kubernetes',
    repo: 'kubernetes',
    fullName: 'kubernetes/kubernetes',
    stargazersCount: 121326,
    forksCount: 42718,
    openIssuesCount: 2634,
    subscribersCount: 3185,
    networkCount: 42718,
    archived: false,
    license: 'Apache-2.0',
    createdAt: '2014-06-06T22:56:04Z',
    updatedAt: '2026-03-23T08:56:19Z',
    pushedAt: '2026-03-21T17:58:24Z'
  },
  'prometheus': {
    slug: 'prometheus',
    name: 'Prometheus',
    owner: 'prometheus',
    repo: 'prometheus',
    fullName: 'prometheus/prometheus',
    stargazersCount: 63293,
    forksCount: 10263,
    openIssuesCount: 753,
    subscribersCount: 1098,
    networkCount: 10263,
    archived: false,
    license: 'Apache-2.0',
    createdAt: '2012-11-24T11:14:12Z',
    updatedAt: '2026-03-23T07:13:45Z',
    pushedAt: '2026-03-23T08:51:07Z'
  },
  'grafana': {
    slug: 'grafana',
    name: 'Grafana',
    owner: 'grafana',
    repo: 'grafana',
    fullName: 'grafana/grafana',
    stargazersCount: 72805,
    forksCount: 13585,
    openIssuesCount: 3921,
    subscribersCount: 1248,
    networkCount: 13585,
    archived: false,
    license: 'AGPL-3.0',
    createdAt: '2013-12-11T15:59:56Z',
    updatedAt: '2026-03-23T08:55:39Z',
    pushedAt: '2026-03-23T09:00:19Z'
  },
  'envoy': {
    slug: 'envoy',
    name: 'Envoy',
    owner: 'envoyproxy',
    repo: 'envoy',
    fullName: 'envoyproxy/envoy',
    stargazersCount: 27764,
    forksCount: 5313,
    openIssuesCount: 1779,
    subscribersCount: 569,
    networkCount: 5313,
    archived: false,
    license: 'Apache-2.0',
    createdAt: '2016-08-08T15:07:24Z',
    updatedAt: '2026-03-23T08:18:46Z',
    pushedAt: '2026-03-23T06:04:31Z'
  },
  'cilium': {
    slug: 'cilium',
    name: 'Cilium',
    owner: 'cilium',
    repo: 'cilium',
    fullName: 'cilium/cilium',
    stargazersCount: 24004,
    forksCount: 3672,
    openIssuesCount: 1017,
    subscribersCount: 309,
    networkCount: 3672,
    archived: false,
    license: 'Apache-2.0',
    createdAt: '2015-12-16T12:33:31Z',
    updatedAt: '2026-03-23T08:40:18Z',
    pushedAt: '2026-03-23T08:51:57Z'
  },
  'docker': {
    slug: 'docker',
    name: 'Docker',
    owner: 'docker',
    repo: 'cli',
    fullName: 'docker/cli',
    stargazersCount: 5758,
    forksCount: 2110,
    openIssuesCount: 853,
    subscribersCount: 136,
    networkCount: 2110,
    archived: false,
    license: 'Apache-2.0',
    createdAt: '2017-04-12T05:27:42Z',
    updatedAt: '2026-03-22T13:31:46Z',
    pushedAt: '2026-03-19T14:44:15Z'
  },
  'argo-cd': {
    slug: 'argo-cd',
    name: 'Argo CD',
    owner: 'argoproj',
    repo: 'argo-cd',
    fullName: 'argoproj/argo-cd',
    stargazersCount: 22405,
    forksCount: 6961,
    openIssuesCount: 4122,
    subscribersCount: 176,
    networkCount: 6961,
    archived: false,
    license: 'Apache-2.0',
    createdAt: '2018-02-09T11:12:01Z',
    updatedAt: '2026-03-23T04:00:53Z',
    pushedAt: '2026-03-23T03:14:28Z'
  },
};

