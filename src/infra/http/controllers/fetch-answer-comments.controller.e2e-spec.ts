import { AppModule } from "@/infra/app.module";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { StudentFactory } from "test/factories/make-student";
import { QuestionFactory } from "test/factories/make-question";
import { DatabaseModule } from "@/infra/database/database.module";
import { AnswerFactory } from "test/factories/make-answer";
import { AnswerCommentFactory } from "test/factories/make-answer-comment";

describe("Fetch answer comments (E2E)", () => {
  let app: INestApplication;

  let jwt: JwtService;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let answerFactory: AnswerFactory;
  let answerCommentFactory: AnswerCommentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AnswerFactory,
        AnswerCommentFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    answerFactory = moduleRef.get(AnswerFactory);
    answerCommentFactory = moduleRef.get(AnswerCommentFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[GET]/answers/:answerId/comments", async () => {
    const user = await studentFactory.makePrismaStudent({
      name: "John Doe",
    });

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const answer = await answerFactory.makePrismaAnswer({
      questionId: question.id,
      authorId: user.id,
    });

    await Promise.all([
      answerCommentFactory.makePrismaAnswerComment({
        authorId: user.id,
        answerId: answer.id,
        content: "Comment 01",
      }),
      answerCommentFactory.makePrismaAnswerComment({
        authorId: user.id,
        answerId: answer.id,
        content: "Comment 02",
      }),
    ]);

    const answerId = answer.id.toString();

    const res = await request(app.getHttpServer())
      .get(`/answers/${answerId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      comments: expect.arrayContaining([
        expect.objectContaining({
          content: "Comment 01",
          authorName: "John Doe",
        }),
        expect.objectContaining({
          content: "Comment 02",
          authorName: "John Doe",
        }),
      ]),
    });
  });
});
