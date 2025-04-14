import { AppModule } from "@/infra/app.module";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { StudentFactory } from "test/factories/make-student";
import { DatabaseModule } from "@/infra/database/database.module";
import { NotificationFactory } from "test/factories/make-notification";
import { PrismaService } from "@/infra/database/prisma/prisma.service";

describe("Read notification (E2E)", () => {
  let app: INestApplication;
  let jwt: JwtService;
  let prisma: PrismaService;
  let studentFactory: StudentFactory;
  let notificationFactory: NotificationFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, NotificationFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    studentFactory = moduleRef.get(StudentFactory);
    notificationFactory = moduleRef.get(NotificationFactory);

    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[PATCH] /notifications/:notificationId/read", async () => {
    const user = await studentFactory.makePrismaStudent({ name: "John Doe" });

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const notification = await notificationFactory.makePrismaNotification({
      recipientId: user.id,
    });

    const notificationId = notification.id.toString();

    const res = await request(app.getHttpServer())
      .patch(`/notifications/${notificationId}/read`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(res.statusCode).toBe(204);

    const notificationOnDb = await prisma.notification.findFirst({
      where: { recipientId: user.id.toString() },
    });

    expect(notificationOnDb?.readAt).not.toBeNull();
  });
});
