import { QuestionDetails } from "@/domain/forum/enterprise/entities/value-objects/question-details";
import { AttachmentPresenter } from "./attachment-presenter";

export class QuestionDetailsPresenter {
  static toHTTP(questionDetails: QuestionDetails) {
    return {
      questionDetailsId: questionDetails.questionId.toString(),
      authorId: questionDetails.authorId,
      author: questionDetails.author,
      title: questionDetails.title,
      slug: questionDetails.slug,
      content: questionDetails.content,
      bestAnswerId: questionDetails.bestAnswerId?.toString(),
      attachments: questionDetails.attachments.map(AttachmentPresenter.toHTTP),
      createdAt: questionDetails.createdAt,
      updateAt: questionDetails.updatedAt,
    };
  }
}
