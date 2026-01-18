import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  // Exemplo de função serverless
  if (req.method === "GET") {
    return new Response(JSON.stringify({ message: "Hello from Netlify Functions!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};
