import db from "../db/index.js";

async function routes(fastify, options) {
  fastify.get("/emails", async (request, reply) => {
    const { search } = request.query;

    let query = db("emails").select("*").orderBy("id", "desc");

    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      query = query.where(function () {
        this.whereRaw('LOWER("to") LIKE ?', [searchLower])
          .orWhereRaw('LOWER("cc") LIKE ?', [searchLower])
          .orWhereRaw('LOWER("bcc") LIKE ?', [searchLower])
          .orWhereRaw('LOWER("subject") LIKE ?', [searchLower])
          .orWhereRaw('LOWER("body") LIKE ?', [searchLower]);
      });
    }

    const emails = await query;
    return emails;
  });

  fastify.get("/emails/:id", async (request, reply) => {
    const { id } = request.params;
    const email = await db("emails").where({ id }).first();
    if (!email) {
      return reply.status(404).send({ error: "Email not found" });
    }
    return email;
  });

  fastify.post("/emails", async (request, reply) => {
    const { to, cc, bcc, subject, body } = request.body;

    if (!to || !subject) {
      return reply
        .status(400)
        .send({ error: 'Fields "to" and "subject" are required' });
    }

    const [newEmail] = await db("emails")
      .insert({ to, cc, bcc, subject, body })
      .returning("*");

    return newEmail;
  });
}

export default routes;
