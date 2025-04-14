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
import { AnswerAttachmentFactory } from "test/factories/make-answer-attachment";
import { AttachmentFactory } from "test/factories/make-attachments";

describe("Edit answer (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let studentFactory: StudentFactory;
  let answerFactory: AnswerFactory;
  let answerAttachmentFactory: AnswerAttachmentFactory;
  let questionFactory: QuestionFactory;
  let attachmentFactory: AttachmentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        AnswerFactory,
        QuestionFactory,
        AttachmentFactory,
        AnswerAttachmentFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    studentFactory = moduleRef.get(StudentFactory);
    answerFactory = moduleRef.get(AnswerFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    attachmentFactory = moduleRef.get(AttachmentFactory);
    answerAttachmentFactory = moduleRef.get(AnswerAttachmentFactory);
    prisma = moduleRef.get(PrismaService);

    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[PUT]/answers/:id", async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const answer = await answerFactory.makePrismaAnswer({
      questionId: question.id,
      authorId: user.id,
    });

    const attachment1 = await attachmentFactory.makePrismaAttachment();
    const attachment2 = await attachmentFactory.makePrismaAttachment();

    await answerAttachmentFactory.makePrismaAnswerAttachment({
      attachmentId: attachment1.id,
      answerId: answer.id,
    });

    await answerAttachmentFactory.makePrismaAnswerAttachment({
      attachmentId: attachment2.id,
      answerId: answer.id,
    });

    const attachment3 = await attachmentFactory.makePrismaAttachment();

    const answerId = answer.id.toString();

    const res = await request(app.getHttpServer())
      .put(`/answers/${answerId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        content: "New answer",
        attachments: [attachment1.id.toString(), attachment3.id.toString()],
      });

    expect(res.statusCode).toBe(204);

    const answerOnDb = await prisma.answer.findFirst({
      where: { content: "New answer" },
    });

    expect(answerOnDb).toBeTruthy();

    const attachmentsOnDb = await prisma.attachment.findMany({
      where: { answerId: answerOnDb?.id },
    });

    expect(attachmentsOnDb).toHaveLength(2);
    expect(attachmentsOnDb).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: attachment1.id.toString() }),
        expect.objectContaining({ id: attachment3.id.toString() }),
      ])
    );
  });
});
