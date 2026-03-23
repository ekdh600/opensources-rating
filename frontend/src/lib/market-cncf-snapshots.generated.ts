export interface MarketCncfSnapshot {
  slug: string;
  name: string;
  repoUrl: string;
  foundation: 'cncf' | 'linux-foundation' | 'apache' | 'independent';
  cncfMaturity: 'sandbox' | 'incubating' | 'graduated' | null;
  listedInLandscape: boolean;
}

export const MARKET_CNCF_SNAPSHOTS: Record<string, MarketCncfSnapshot> = {
  'kubernetes': {
    slug: 'kubernetes',
    name: 'Kubernetes',
    repoUrl: 'https://github.com/kubernetes/kubernetes',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: true
  },
  'prometheus': {
    slug: 'prometheus',
    name: 'Prometheus',
    repoUrl: 'https://github.com/prometheus/prometheus',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: true
  },
  'grafana': {
    slug: 'grafana',
    name: 'Grafana',
    repoUrl: 'https://github.com/grafana/grafana',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'envoy': {
    slug: 'envoy',
    name: 'Envoy',
    repoUrl: 'https://github.com/envoyproxy/envoy',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: true
  },
  'cilium': {
    slug: 'cilium',
    name: 'Cilium',
    repoUrl: 'https://github.com/cilium/cilium',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: true
  },
  'docker': {
    slug: 'docker',
    name: 'Docker',
    repoUrl: 'https://github.com/docker/cli',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: false
  },
  'argo-cd': {
    slug: 'argo-cd',
    name: 'Argo CD',
    repoUrl: 'https://github.com/argoproj/argo-cd',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: true
  },
  'terraform': {
    slug: 'terraform',
    name: 'Terraform',
    repoUrl: 'https://github.com/hashicorp/terraform',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'containerd': {
    slug: 'containerd',
    name: 'containerd',
    repoUrl: 'https://github.com/containerd/containerd',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: true
  },
  'etcd': {
    slug: 'etcd',
    name: 'etcd',
    repoUrl: 'https://github.com/etcd-io/etcd',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: true
  },
  'opentelemetry': {
    slug: 'opentelemetry',
    name: 'OpenTelemetry',
    repoUrl: 'https://github.com/open-telemetry/opentelemetry-collector',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: false
  },
  'istio': {
    slug: 'istio',
    name: 'Istio',
    repoUrl: 'https://github.com/istio/istio',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: true
  },
  'helm': {
    slug: 'helm',
    name: 'Helm',
    repoUrl: 'https://github.com/helm/helm',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: true
  },
  'backstage': {
    slug: 'backstage',
    name: 'Backstage',
    repoUrl: 'https://github.com/backstage/backstage',
    foundation: 'cncf',
    cncfMaturity: 'incubating',
    listedInLandscape: true
  },
  'flux': {
    slug: 'flux',
    name: 'Flux',
    repoUrl: 'https://github.com/fluxcd/flux2',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: true
  },
  'nginx': {
    slug: 'nginx',
    name: 'NGINX',
    repoUrl: 'https://github.com/nginx/nginx',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'kafka': {
    slug: 'kafka',
    name: 'Kafka',
    repoUrl: 'https://github.com/apache/kafka',
    foundation: 'apache',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'clickhouse': {
    slug: 'clickhouse',
    name: 'ClickHouse',
    repoUrl: 'https://github.com/clickhouse/clickhouse',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'postgresql': {
    slug: 'postgresql',
    name: 'PostgreSQL',
    repoUrl: 'https://github.com/postgres/postgres',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'supabase': {
    slug: 'supabase',
    name: 'Supabase',
    repoUrl: 'https://github.com/supabase/supabase',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'loki': {
    slug: 'loki',
    name: 'Loki',
    repoUrl: 'https://github.com/grafana/loki',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: true
  },
  'jaeger': {
    slug: 'jaeger',
    name: 'Jaeger',
    repoUrl: 'https://github.com/jaegertracing/jaeger',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: true
  },
  'milvus': {
    slug: 'milvus',
    name: 'Milvus',
    repoUrl: 'https://github.com/milvus-io/milvus',
    foundation: 'linux-foundation',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'trivy': {
    slug: 'trivy',
    name: 'Trivy',
    repoUrl: 'https://github.com/aquasecurity/trivy',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'falco': {
    slug: 'falco',
    name: 'Falco',
    repoUrl: 'https://github.com/falcosecurity/falco',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: true
  },
  'kyverno': {
    slug: 'kyverno',
    name: 'Kyverno',
    repoUrl: 'https://github.com/kyverno/kyverno',
    foundation: 'cncf',
    cncfMaturity: 'incubating',
    listedInLandscape: true
  },
  'opentofu': {
    slug: 'opentofu',
    name: 'OpenTofu',
    repoUrl: 'https://github.com/opentofu/opentofu',
    foundation: 'linux-foundation',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'karpenter': {
    slug: 'karpenter',
    name: 'Karpenter',
    repoUrl: 'https://github.com/kubernetes-sigs/karpenter',
    foundation: 'cncf',
    cncfMaturity: 'sandbox',
    listedInLandscape: true
  },
  'crossplane': {
    slug: 'crossplane',
    name: 'Crossplane',
    repoUrl: 'https://github.com/crossplane/crossplane',
    foundation: 'cncf',
    cncfMaturity: 'incubating',
    listedInLandscape: true
  },
  'cert-manager': {
    slug: 'cert-manager',
    name: 'cert-manager',
    repoUrl: 'https://github.com/cert-manager/cert-manager',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: true
  },
  'harbor': {
    slug: 'harbor',
    name: 'Harbor',
    repoUrl: 'https://github.com/goharbor/harbor',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: true
  },
  'linkerd': {
    slug: 'linkerd',
    name: 'Linkerd',
    repoUrl: 'https://github.com/linkerd/linkerd2',
    foundation: 'cncf',
    cncfMaturity: 'graduated',
    listedInLandscape: true
  },
  'keycloak': {
    slug: 'keycloak',
    name: 'Keycloak',
    repoUrl: 'https://github.com/keycloak/keycloak',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'minio': {
    slug: 'minio',
    name: 'MinIO',
    repoUrl: 'https://github.com/minio/minio',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'redis': {
    slug: 'redis',
    name: 'Redis',
    repoUrl: 'https://github.com/redis/redis',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'rabbitmq': {
    slug: 'rabbitmq',
    name: 'RabbitMQ',
    repoUrl: 'https://github.com/rabbitmq/rabbitmq-server',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'temporal': {
    slug: 'temporal',
    name: 'Temporal',
    repoUrl: 'https://github.com/temporalio/temporal',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: false
  },
  'airflow': {
    slug: 'airflow',
    name: 'Apache Airflow',
    repoUrl: 'https://github.com/apache/airflow',
    foundation: 'apache',
    cncfMaturity: null,
    listedInLandscape: false
  },
  'vector': {
    slug: 'vector',
    name: 'Vector',
    repoUrl: 'https://github.com/vectordotdev/vector',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'victoriametrics': {
    slug: 'victoriametrics',
    name: 'VictoriaMetrics',
    repoUrl: 'https://github.com/victoriametrics/victoriametrics',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'airbyte': {
    slug: 'airbyte',
    name: 'Airbyte',
    repoUrl: 'https://github.com/airbytehq/airbyte',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: false
  },
  'dbt-core': {
    slug: 'dbt-core',
    name: 'dbt Core',
    repoUrl: 'https://github.com/dbt-labs/dbt-core',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: false
  },
  'ollama': {
    slug: 'ollama',
    name: 'Ollama',
    repoUrl: 'https://github.com/ollama/ollama',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: false
  },
  'vllm': {
    slug: 'vllm',
    name: 'vLLM',
    repoUrl: 'https://github.com/vllm-project/vllm',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'kserve': {
    slug: 'kserve',
    name: 'KServe',
    repoUrl: 'https://github.com/kserve/kserve',
    foundation: 'cncf',
    cncfMaturity: 'sandbox',
    listedInLandscape: true
  },
  'mlflow': {
    slug: 'mlflow',
    name: 'MLflow',
    repoUrl: 'https://github.com/mlflow/mlflow',
    foundation: 'linux-foundation',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'kubeflow': {
    slug: 'kubeflow',
    name: 'Kubeflow',
    repoUrl: 'https://github.com/kubeflow/kubeflow',
    foundation: 'cncf',
    cncfMaturity: 'sandbox',
    listedInLandscape: true
  },
  'langfuse': {
    slug: 'langfuse',
    name: 'Langfuse',
    repoUrl: 'https://github.com/langfuse/langfuse',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: true
  },
  'open-webui': {
    slug: 'open-webui',
    name: 'Open WebUI',
    repoUrl: 'https://github.com/open-webui/open-webui',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: false
  },
  'dagger': {
    slug: 'dagger',
    name: 'Dagger',
    repoUrl: 'https://github.com/dagger/dagger',
    foundation: 'independent',
    cncfMaturity: null,
    listedInLandscape: false
  },
};

