-- Permite que a carga de demonstração seja repetida sem apagar eventos reais.
ALTER TABLE "SosEvent" ADD COLUMN "demo" BOOLEAN NOT NULL DEFAULT false;
