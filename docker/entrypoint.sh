deploy() {
  # Wait for the spacetime HTTP port to start accepting connections.
  # Uses bash's built-in /dev/tcp probe so we don't depend on curl, on the
  # `spacetime` CLI knowing about a `local` server alias, or on any specific
  # response payload.
  until (echo > /dev/tcp/127.0.0.1/3000) 2>/dev/null
  do
    echo "Waiting for server to start..."
    sleep 1
  done
  echo "Server is up; publishing modules."

  read -ra module_names <<<"$MODULES"
  echo "Publishing ${#module_names[@]} modules"
  for module in "${module_names[@]}"
  do
    echo "$module"
    spacetime publish --bin-path /app/pogly.wasm --server http://localhost:3000 --anonymous --yes "$module"
  done
}

# Kill all parallel processes below
trap "kill 0" SIGINT

caddy run --config /etc/caddy/Caddyfile --adapter caddyfile \
& spacetime start --listen-addr 0.0.0.0:3000 --data-dir /stdb \
& deploy \
&& wait