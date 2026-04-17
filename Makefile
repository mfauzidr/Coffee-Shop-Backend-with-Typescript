# --- Konfigurasi ---
ENV ?= development
KNEX = npx knex
KNEXFILE = src/shared/config/knexfile.ts
MIGRATIONS_DIR = src/database/migrations
SEEDERS_DIR = src/database/seeders

# buat migration baru: make migrate-new name=create_users_table
migrate-new:
	@powershell -Command "if (-not '$(name)') { Write-Host '❌ Harus pakai argumen name=<nama_migration>'; exit 1 } else { npx knex migrate:make $(name) --knexfile $(KNEXFILE) --env $(ENV) }"


# jalankan semua migration
migrate-up:
	npx cross-env NODE_ENV=$(ENV) $(KNEX) migrate:latest --knexfile $(KNEXFILE) --env $(ENV)

# rollback migration terakhir
migrate-down:
	npx cross-env NODE_ENV=$(ENV) $(KNEX) migrate:rollback --knexfile $(KNEXFILE) --env $(ENV)

# lihat status migration
migrate-status:
	npx cross-env NODE_ENV=$(ENV) $(KNEX) migrate:status --knexfile $(KNEXFILE) --env $(ENV)

# jalankan semua seeder
seed:
	npx cross-env NODE_ENV=$(ENV) $(KNEX) seed:run --knexfile $(KNEXFILE) --env $(ENV)

# reset DB: rollback semua → migrate lagi → seed
db-reset:
	npx cross-env NODE_ENV=$(ENV) $(KNEX) migrate:rollback --all --knexfile $(KNEXFILE) --env $(ENV)
	npx cross-env NODE_ENV=$(ENV) $(KNEX) migrate:latest --knexfile $(KNEXFILE) --env $(ENV)
	npx cross-env NODE_ENV=$(ENV) $(KNEX) seed:run --knexfile $(KNEXFILE) --env $(ENV)
