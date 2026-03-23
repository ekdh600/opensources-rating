export interface MarketDepsSnapshot {
  slug: string;
  name: string;
  packageCount: number;
  packagesFound: number;
  systems: string[];
  resolvedPackageKeys: string[];
  defaultVersions: string[];
  totalVersionCount: number;
  licensesCount: number;
  advisoriesCount: number;
  linksCount: number;
  latestPublishedAt: string | null;
}

export const MARKET_DEPS_SNAPSHOTS: Record<string, MarketDepsSnapshot> = {
  'kubernetes': {
    slug: 'kubernetes',
    name: 'Kubernetes',
    packageCount: 1,
    packagesFound: 1,
    systems: ['GO'],
    resolvedPackageKeys: ['GO:k8s.io/kubernetes'],
    defaultVersions: ['v1.35.3'],
    totalVersionCount: 22058,
    licensesCount: 3,
    advisoriesCount: 2,
    linksCount: 1,
    latestPublishedAt: '2026-03-18T18:30:07Z'
  },
  'prometheus': {
    slug: 'prometheus',
    name: 'Prometheus',
    packageCount: 1,
    packagesFound: 1,
    systems: ['GO'],
    resolvedPackageKeys: ['GO:github.com/prometheus/prometheus'],
    defaultVersions: ['v0.310.0'],
    totalVersionCount: 13061,
    licensesCount: 1,
    advisoriesCount: 0,
    linksCount: 1,
    latestPublishedAt: '2026-02-25T18:54:13Z'
  },
  'grafana': {
    slug: 'grafana',
    name: 'Grafana',
    packageCount: 1,
    packagesFound: 1,
    systems: ['GO'],
    resolvedPackageKeys: ['GO:github.com/grafana/grafana'],
    defaultVersions: ['v6.1.6+incompatible'],
    totalVersionCount: 15522,
    licensesCount: 1,
    advisoriesCount: 60,
    linksCount: 1,
    latestPublishedAt: '2019-04-29T13:29:28Z'
  },
  'argo-cd': {
    slug: 'argo-cd',
    name: 'Argo CD',
    packageCount: 1,
    packagesFound: 1,
    systems: ['GO'],
    resolvedPackageKeys: ['GO:github.com/argoproj/argo-cd/v2'],
    defaultVersions: ['v2.14.21'],
    totalVersionCount: 3334,
    licensesCount: 1,
    advisoriesCount: 0,
    linksCount: 1,
    latestPublishedAt: '2025-11-04T14:56:45Z'
  },
  'terraform': {
    slug: 'terraform',
    name: 'Terraform',
    packageCount: 1,
    packagesFound: 1,
    systems: ['GO'],
    resolvedPackageKeys: ['GO:github.com/hashicorp/terraform'],
    defaultVersions: ['v1.14.7'],
    totalVersionCount: 6743,
    licensesCount: 2,
    advisoriesCount: 0,
    linksCount: 1,
    latestPublishedAt: '2026-03-11T13:19:07Z'
  },
  'helm': {
    slug: 'helm',
    name: 'Helm',
    packageCount: 1,
    packagesFound: 1,
    systems: ['GO'],
    resolvedPackageKeys: ['GO:helm.sh/helm/v3'],
    defaultVersions: ['v3.20.1'],
    totalVersionCount: 2252,
    licensesCount: 1,
    advisoriesCount: 0,
    linksCount: 1,
    latestPublishedAt: '2026-03-11T23:22:18Z'
  },
  'airflow': {
    slug: 'airflow',
    name: 'Apache Airflow',
    packageCount: 1,
    packagesFound: 1,
    systems: ['PYPI'],
    resolvedPackageKeys: ['PYPI:apache-airflow'],
    defaultVersions: ['3.1.8'],
    totalVersionCount: 279,
    licensesCount: 1,
    advisoriesCount: 0,
    linksCount: 4,
    latestPublishedAt: '2026-03-11T19:27:55Z'
  },
  'dbt-core': {
    slug: 'dbt-core',
    name: 'dbt Core',
    packageCount: 1,
    packagesFound: 1,
    systems: ['PYPI'],
    resolvedPackageKeys: ['PYPI:dbt-core'],
    defaultVersions: ['1.11.7'],
    totalVersionCount: 323,
    licensesCount: 1,
    advisoriesCount: 0,
    linksCount: 3,
    latestPublishedAt: '2026-03-04T16:16:24Z'
  },
  'ollama': {
    slug: 'ollama',
    name: 'Ollama',
    packageCount: 1,
    packagesFound: 1,
    systems: ['GO'],
    resolvedPackageKeys: ['GO:github.com/ollama/ollama'],
    defaultVersions: ['v0.18.2'],
    totalVersionCount: 818,
    licensesCount: 2,
    advisoriesCount: 9,
    linksCount: 1,
    latestPublishedAt: '2026-03-18T20:20:10Z'
  },
  'vllm': {
    slug: 'vllm',
    name: 'vLLM',
    packageCount: 1,
    packagesFound: 1,
    systems: ['PYPI'],
    resolvedPackageKeys: ['PYPI:vllm'],
    defaultVersions: ['0.18.0'],
    totalVersionCount: 79,
    licensesCount: 1,
    advisoriesCount: 0,
    linksCount: 3,
    latestPublishedAt: '2026-03-20T22:16:00Z'
  },
  'mlflow': {
    slug: 'mlflow',
    name: 'MLflow',
    packageCount: 1,
    packagesFound: 1,
    systems: ['PYPI'],
    resolvedPackageKeys: ['PYPI:mlflow'],
    defaultVersions: ['3.10.1'],
    totalVersionCount: 173,
    licensesCount: 1,
    advisoriesCount: 0,
    linksCount: 4,
    latestPublishedAt: '2026-03-05T11:15:19Z'
  },
  'langfuse': {
    slug: 'langfuse',
    name: 'Langfuse',
    packageCount: 2,
    packagesFound: 2,
    systems: ['PYPI', 'NPM'],
    resolvedPackageKeys: ['PYPI:langfuse', 'NPM:langfuse'],
    defaultVersions: ['4.0.1', '3.38.6'],
    totalVersionCount: 744,
    licensesCount: 2,
    advisoriesCount: 0,
    linksCount: 3,
    latestPublishedAt: '2026-03-19T14:03:32Z'
  },
};

