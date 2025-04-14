import { AppModule } from "@/infra/app.module";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { Test } from "@nestjs/testing";
import { PrismaService } from "@/infra/database/prisma/prisma.service";

describe("Create account (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();
  });

  test("[POST]/accounts", async () => {
    const res = await request(app.getHttpServer()).post("/accounts").send({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(201);

    const userOnDb = await prisma.user.findUnique({
      where: { email: "johndoe@example.com" },
    });

    expect(userOnDb).toBeTruthy();
  });
});
