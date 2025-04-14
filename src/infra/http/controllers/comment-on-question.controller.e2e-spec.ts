import { AppModule } from "@/infra/app.module";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { StudentFactory } from "test/factories/make-student";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { QuestionFactory } from "test/factories/make-question";

describe("Comment on question (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    prisma = moduleRef.get(PrismaService);

    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[POST]/questions/:questionId/comments", async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const questionId = question.id.toString();

    const res = await request(app.getHttpServer())
      .post(`/questions/${questionId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "New comment" });

    expect(res.statusCode).toBe(201);

    const commentOnDb = await prisma.comment.findFirst({
      where: { content: "New comment" },
    });

    expect(commentOnDb).toBeTruthy();
  });
});
