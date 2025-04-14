import { AppModule } from "@/infra/app.module";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { StudentFactory } from "test/factories/make-student";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { AnswerFactory } from "test/factories/make-answer";
import { QuestionFactory } from "test/factories/make-question";

describe("Choose question best answer (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let studentFactory: StudentFactory;
  let answerFactory: AnswerFactory;
  let questionFactory: QuestionFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, AnswerFactory, QuestionFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    studentFactory = moduleRef.get(StudentFactory);
    answerFactory = moduleRef.get(AnswerFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    prisma = moduleRef.get(PrismaService);

    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[PATCH]/answers/:answerId/choose-as-best", async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const answer = await answerFactory.makePrismaAnswer({
      questionId: question.id,
      authorId: user.id,
    });

    const answerId = answer.id.toString();

    const res = await request(app.getHttpServer())
      .patch(`/answers/${answerId}/choose-as-best`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(res.statusCode).toBe(204);

    const questionOnDb = await prisma.question.findUnique({
      where: { id: question.id.toString() },
    });

    expect(questionOnDb?.bestAnswerId).toEqual(answerId);
  });
});
