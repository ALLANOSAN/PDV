import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server({ name: "pdv-payment-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "configure_terminal",
    description: "Cadastra ou atualiza um terminal de pagamento",
    inputSchema: {
      type: "object",
      properties: {
        provider: { type: "string", enum: ["cielo", "mercado_pago", "sumup"] },
        terminalId: { type: "string" },
        apiSecret: { type: "string" }
      },
      required: ["provider", "terminalId"]
    }
  }]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "configure_terminal") {
    // Ação real: aqui o MCP vai interagir com o banco
    return { content: [{ type: "text", text: `Configurando terminal ${request.params.arguments.provider}...` }] };
  }
  throw new Error("Tool não encontrada");
});

const transport = new StdioServerTransport();
await server.connect(transport);
