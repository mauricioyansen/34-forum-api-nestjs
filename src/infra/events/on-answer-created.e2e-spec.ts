import { AppModule } from "@/infra/app.module";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { StudentFactory } from "test/factories/make-student";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { QuestionFactory } from "test/factories/make-question";
import { AttachmentFactory } from "test/factories/make-attachments";
import { waitFor } from "test/utils/wait-for-it";
import { DomainEvents } from "@/core/events/domain-events";

describe("On answer created (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let studentFactory: StudentFactory;
  let questionFactory: QuestionFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, AttachmentFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    studentFactory = moduleRef.get(StudentFactory);
    questionFactory = moduleRef.get(QuestionFactory);
    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);

    DomainEvents.shouldRun = true;

    await app.init();
  });

  it("should send a notification when answer is created", async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    });

    const questionId = question.id.toString();

    await request(app.getHttpServer())
      .post(`/questions/${questionId}/answers`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        content: "New answer",
        attachments: [],
      });

    await waitFor(async () => {
      const notificationOnDb = await prisma.notification.findFirst({
        where: { recipientId: user.id.toString() },
      });

      expect(notificationOnDb).not.toBeNull();
    });
  });
});
