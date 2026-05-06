#!/bin/bash

# Script de Inicialização PDV Local Pro - Supabase Local
# Certifique-se de que o Docker está rodando!

echo "🚀 Iniciando setup do ambiente local..."

# 1. Verificar se a Supabase CLI está instalada
if ! command -v supabase &> /dev/null
then
    echo "⚠️ Supabase CLI não encontrada. Instalando via npm..."
    npm install -g supabase
fi

# 2. Inicializar o Supabase (se necessário)
if [ ! -d "supabase" ]; then
    echo "📦 Inicializando projeto Supabase..."
    supabase init
else
    echo "✅ Pasta supabase já existe."
fi

# 3. Iniciar containers Docker
echo "🐳 Subindo containers do Supabase (PostgreSQL, Auth, API)..."
supabase start

echo ""
echo "🎉 Ambiente Supabase Local pronto!"
echo "--------------------------------------------------"
echo "API URL: http://localhost:54321"
echo "DB URL: postgresql://postgres:postgres@localhost:54322/postgres"
echo "Inbucket (Emails): http://localhost:54324"
echo "--------------------------------------------------"
echo "Próximo passo: npm run dev"
