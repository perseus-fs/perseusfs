# PerseusFS

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

A lightweight, simplified, self-hosted file store. Create and configure buckets, manage users, and control access—all from a single-file executable. Ships with a minimalistic web interface and a public API, making it easy to integrate or use out of the box. Perfect for small projects. Powered by [Bun](https://github.com/oven-sh/bun).

### [Download here](https://github.com/diogomartino/perseusfs/releases/latest)

## Demo

[Coming soon...](#)

## Download


### Linux x64

```bash
   curl -sSL https://github.com/diogomartino/perseusfs/releases/latest/download/linux-x64.zip -o perseusfs.zip
   unzip perseusfs.zip
   rm perseusfs.zip
   chmod +x perseusfs
   ./perseusfs
```

### Docker

```bash
    docker run -d \
      --name perseusfs \
      -p 3000:3000 \
      -v /app/data:/data \
      diogomartino/perseusfs:latest
```

After starting PerseusFS, the terminal will display the default admin credentials. You can change these later through the web interface. The inteface will be available at `http://localhost:3000/_` by default. If you specify a domain using the `--domain` flag, the interface will be available at `http://<your-domain>/_`.

## Configuration

| Arg                  | Environment Variable | Description                                                        | Default     |
| -------------------- | -------------------- | ------------------------------------------------------------------ | ----------- |
| `--port`             | `PORT`               | Port to run the server on.                                         | 3000        |
| `--disableInterface` | `DISABLE_INTERFACE`  | Disable the web interface.                                         | false       |
| `--domain`           | `DOMAIN`             | Domain that the interface will be served on.                       | _undefined_ |
| `--hostname`         | `HOSTNAME`           | Hostname that the server will listen on                            | _undefined_ |
| `--regenCredentials` | `REGEN_CREDENTIALS`  | Regenerate default admin credentials.                              | false       |
| `--showMigrations`   | `SHOW_MIGRATIONS`    | Show migrations information. When enabled, the server won't start. | false       |
| `--version`          | _N/A_                | Prints PerseusFS and Bun versions.                                 | false       |
| `--debug`            | `DEBUG`              | Shows debug information upon startup.                              | false       |
| `--help`             | `HELP`               | Show help information.                                             | N/A         |

## SSL

Currently, PerseusFS does not support SSL natively. However, you can use a reverse proxy like Nginx or Traefik to handle SSL termination. Here's a basic example using Nginx:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
