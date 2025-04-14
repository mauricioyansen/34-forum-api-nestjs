import { AppModule } from "@/infra/app.module";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { StudentFactory } from "test/factories/make-student";
import { DatabaseModule } from "@/infra/database/database.module";
import { QuestionFactory } from "test/factories/make-question";
import { Slug } from "@/domain/forum/enterprise/entities/value-objects/slug";
import { AttachmentFactory } from "test/factories/make-attachments";
import { QuestionAttachmentFactory } from "test/factories/make-question-attachment";

describe("Get question by slug (E2E)", () => {
  let app: INestApplication;
  let jwt: JwtService;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;
  let attachmentFactory: AttachmentFactory;
  let questionAttachmentFactory: QuestionAttachmentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AttachmentFactory,
        QuestionAttachmentFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    attachmentFactory = moduleRef.get(AttachmentFactory);
    questionAttachmentFactory = moduleRef.get(QuestionAttachmentFactory);

    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[GET]/questions/:slug", async () => {
    const user = await studentFactory.makePrismaStudent({ name: "John Doe" });

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
      slug: Slug.create("question-01"),
      title: "Question 01",
    });

    const attachment = await attachmentFactory.makePrismaAttachment({
      title: "Some attachment",
    });

    await questionAttachmentFactory.makePrismaQuestionAttachment({
      attachmentId: attachment.id,
      questionId: question.id,
    });

    const res = await request(app.getHttpServer())
      .get(`/questions/question-01`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      question: expect.objectContaining({
        title: "Question 01",
        author: "John Doe",
        attachments: [expect.objectContaining({ title: "Some attachment" })],
      }),
    });
  });
});
