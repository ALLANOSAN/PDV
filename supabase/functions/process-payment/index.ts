import { serve } from "std/http/server";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Como o fluxo é manual, esta função servirá apenas como um endpoint de log ou auditoria futura se necessário.
  // Toda a lógica de integração automática foi removida conforme sua solicitação.
  
  return new Response(JSON.stringify({ status: "ok", message: "Fluxo de pagamento manual ativo." }), { 
    headers: { ...corsHeaders, "Content-Type": "application/json" } 
  });
});
