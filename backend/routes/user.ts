import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { signInInput, signUpInput } from "@mergedandshare/blog";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const { success } = signUpInput.safeParse(body);

  const { email, name, password } = body;

  if (!success) {
    c.status(411);
    return c.json({ error: "Inputs aren't correct" });
  }

  const user = await prisma.user.create({
    data: {
      email: email,
      name: name,
      password: password,
    },
  });
  // sign(payload , secret , algo)
  // const jwt = await sign({}, c.env.JWT_SECRET, "HS256");

  const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);

  return c.json({ jwt });
});

userRouter.post("/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const { success } = signInInput.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({ error: "Inputs aren't correct" });
  }
  const { email, name, password } = body;

  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
      password: password,
      name: name,
    },
  });

  if (!existingUser) {
    c.status(403);
    return c.json({ error: "user not found" });
  }

  const jwt = await sign({ id: existingUser.id }, c.env.JWT_SECRET);
  return c.json({ jwt });
});
