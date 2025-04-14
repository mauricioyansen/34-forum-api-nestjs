import { AppModule } from "@/infra/app.module";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { StudentFactory } from "test/factories/make-student";
import { DatabaseModule } from "@/infra/database/database.module";

describe("Upload Attachment (E2E)", () => {
  let app: INestApplication;
  let jwt: JwtService;
  let studentFactory: StudentFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    studentFactory = moduleRef.get(StudentFactory);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[POST]/attachments", async () => {
    const user = await studentFactory.makePrismaStudent();

    const accessToken = jwt.sign({ sub: user.id.toString() });

    const res = await request(app.getHttpServer())
      .post("/attachments")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("file", "./test/e2e/sample-upload.jpg");

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ attachmentId: expect.any(String) });
  });
});
