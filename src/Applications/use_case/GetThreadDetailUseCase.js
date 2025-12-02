const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');
const CommentDetail = require('../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const mappedComments = await Promise.all(
      comments.map(async (comment) => {
        const replies = await this._replyRepository.getRepliesByCommentId(comment.id);

        const mappedReplies = replies.map((reply) => new ReplyDetail({
          id: reply.id,
          content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
          date: reply.date instanceof Date ? reply.date.toISOString() : reply.date,
          username: reply.username,
        }));

        return new CommentDetail({
          id: comment.id,
          username: comment.username,
          date: comment.date instanceof Date ? comment.date.toISOString() : comment.date,
          content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
          replies: mappedReplies,
        });
      }),
    );

    return new ThreadDetail({
      ...thread,
      comments: mappedComments,
    });
  }
}

module.exports = GetThreadDetailUseCase;
