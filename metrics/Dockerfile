FROM prom/prometheus:latest

COPY prometheus.yml /etc/prometheus/prometheus.yml

USER root
ENTRYPOINT ["/bin/prometheus"]
CMD ["--config.file=/etc/prometheus/prometheus.yml", "--storage.tsdb.path=/prometheus"]