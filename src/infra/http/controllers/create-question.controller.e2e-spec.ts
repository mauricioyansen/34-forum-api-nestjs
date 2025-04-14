import { AppModule } from "@/infra/app.module";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { StudentFactory } from "test/factories/make-student";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { AttachmentFactory } from "test/factories/make-attachments";

describe("Create question (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let studentFactory: StudentFactory;
  let attachmentFactory: AttachmentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, AttachmentFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    studentFactory = moduleRef.get(StudentFactory);
    prisma = moduleRef.get(PrismaService);
    attachmentFactory = moduleRef.get(AttachmentFactory);

    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[POST]/questions", async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const attachment1 = await attachmentFactory.makePrismaAttachment();
    const attachment2 = await attachmentFactory.makePrismaAttachment();

    const res = await request(app.getHttpServer())
      .post("/questions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "New question",
        content: "New question content",
        attachments: [attachment1.id.toString(), attachment2.id.toString()],
      });

    expect(res.statusCode).toBe(201);

    const questionOnDb = await prisma.question.findFirst({
      where: { title: "New question" },
    });

    expect(questionOnDb).toBeTruthy();

    const attachmentsOnDb = await prisma.attachment.findMany({
      where: { questionId: questionOnDb?.id },
    });

    expect(attachmentsOnDb).toHaveLength(2);
  });
});
