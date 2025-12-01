const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, threadId, useCasePayload) {
    const newComment = new NewComment(useCasePayload);
    await this._threadRepository.checkThreadAvailability(threadId);
    return this._commentRepository.addComment(threadId, userId, newComment);
  }
}

module.exports = AddCommentUseCase;
