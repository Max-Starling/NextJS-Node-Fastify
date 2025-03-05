// ESM
import Fastify from "fastify";
import cors from "@fastify/cors";
import routes from "./src/routes/index.js";

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
});

fastify.register(routes);

fastify.listen({ port: 3001, host: "0.0.0.0" }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server running on ${address}`);
});
