import { serve } from "std/http/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { provider, amount, terminalId } = await req.json();

  const apiKey = Deno.env.get(`${provider.toUpperCase()}_API_KEY`);
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Chave não configurada" }), {
      status: 500,
    });
  }
  let url = "";
  let headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  };
  let payload = {};
  switch (provider) {
    case "mercado_pago":
      url = "https://api.mercadopago.com/v1/payments";
      payload = {
        transaction_amount: amount,
        payment_method_id: "point",
        device_id: terminalId,
      };
      break;
    case "sumup":
      url = "https://api.sumup.com/v0.1/checkouts";
      headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      };
      payload = {
        checkout_amount: amount,
        checkout_currency: "BRL",
        checkout_reference: terminalId,
      };
      break;
    case "cielo":
      url = "https://api.cieloecommerce.cielo.com.br/1/sales/";
      headers = { "MerchantId": apiKey, "Content-Type": "application/json" };
      payload = {
        OrderNumber: terminalId,
        SoftDescriptor: "PDV_PRO",
        Cart: {
          Items: [{ Name: "Venda PDV", Quantity: 1, Price: amount * 100 }],
        },
      };
      break;
    default:
      return new Response(JSON.stringify({ error: "Provedor inválido" }), {
        status: 400,
      });
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
