"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlog = exports.createBlog = exports.signInInput = exports.signUpInput = void 0;
const zod_1 = require("zod");
exports.signUpInput = zod_1.z.object({
    email: zod_1.z.string(),
    password: zod_1.z.string().min(4),
    name: zod_1.z.string().optional(),
});
exports.signInInput = zod_1.z.object({
    password: zod_1.z.string().min(4),
    name: zod_1.z.string().optional(),
});
// Blogs ---------
exports.createBlog = zod_1.z.object({
    title: zod_1.z.string(),
    content: zod_1.z.string(),
});
exports.updateBlog = zod_1.z.object({
    blogId: zod_1.z.string().uuid(),
    title: zod_1.z.string(),
    content: zod_1.z.string(),
});
