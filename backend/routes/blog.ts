import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "@prisma/client/edge";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createBlog, updateBlog } from "@mergedandshare/blog";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  const header = c.req.header("Authorization") || "";

  // format : Authorization : Bearer `${token}`
  const token = header.split(" ")[1];

  const response = await verify(token, c.env.JWT_SECRET);
  if (!response) {
    c.status(403);
    return c.json({ error: "Unauthorised" });
  }

  c.set("userId", response.id as string);
  await next();
});

blogRouter.get("/get-all-blogs", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const authorId = c.get("userId");
  console.log(authorId);

  try {
    const allBlogs = await prisma.blog.findFirst({
      where: {
        authorId: authorId,
      },
    });
    console.log(allBlogs);
    return c.json({ message: "Blog fetched successfully", blogs: allBlogs });
  } catch (error) {
    c.status(411);
    return c.json({ error: "error creationg post / blog" });
  }
});

// --------------------------------

blogRouter.get("/:id", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blogId = c.req.param("id");
  const authorId = c.get("userId");

  try {
    const singleBlog = await prisma.blog.findFirst({
      where: {
        id: blogId,
        authorId: authorId,
      },
    });
    return c.json({ message: "Blog fetched successfully", blog: singleBlog });
  } catch (error) {
    c.status(411);
    return c.json({ error: "error creationg post / blog" });
  }
});

// --------------------------------

blogRouter.post("/create-blog", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = c.get("userId");
  const body = await c.req.json();
  const { title, content } = body;
  const { success } = createBlog.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({ error: "Inputs aren't correct" });
  }

  try {
    await prisma.blog.create({
      data: {
        title: title,
        content: content,
        authorId: userId,
      },
    });
    return c.json({ message: "Blog created successfully" });
  } catch (error) {
    console.log(error);
    c.status(411);
    return c.json({ error: "error creationg post / blog" });
  }
});

// --------------------------------

blogRouter.put("/update-blog", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const authorId = c.get("userId");

  const body = await c.req.json();
  const { title, blogId, content } = body;
  const { success } = updateBlog.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({ error: "Inputs aren't correct" });
  }

  try {
    await prisma.blog.update({
      where: {
        id: blogId,
        authorId: authorId,
      },
      data: {
        title: title,
        content: content,
      },
    });

    return c.json({ message: "Blog updated successfully" });
  } catch (error) {
    console.log(error);
    c.status(411);
    return c.json({ error: "error creationg post / blog" });
  }
});

// --------------------------------
