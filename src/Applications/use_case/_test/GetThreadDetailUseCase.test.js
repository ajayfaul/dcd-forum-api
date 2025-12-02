const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const mockThread = {
      id: 'thread-123',
      title: 'A Thread',
      body: 'A Body',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'A comment',
        is_delete: false,
      },
      {
        id: 'comment-456',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'Deleted comment',
        is_delete: true,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-123',
        content: 'A reply',
        date: '2021-08-08T07:59:48.766Z',
        username: 'dicoding',
        is_delete: false,
      },
      {
        id: 'reply-456',
        content: 'Deleted reply',
        date: '2021-08-08T08:07:01.522Z',
        username: 'johndoe',
        is_delete: true,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(threadDetail).toStrictEqual(new ThreadDetail({
      id: 'thread-123',
      title: 'A Thread',
      body: 'A Body',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        new CommentDetail({
          id: 'comment-123',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'A comment',
          replies: [
            new ReplyDetail({
              id: 'reply-123',
              content: 'A reply',
              date: '2021-08-08T07:59:48.766Z',
              username: 'dicoding',
            }),
            new ReplyDetail({
              id: 'reply-456',
              content: '**balasan telah dihapus**',
              date: '2021-08-08T08:07:01.522Z',
              username: 'johndoe',
            }),
          ],
        }),
        new CommentDetail({
          id: 'comment-456',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
          replies: [
            new ReplyDetail({
              id: 'reply-123',
              content: 'A reply',
              date: '2021-08-08T07:59:48.766Z',
              username: 'dicoding',
            }),
            new ReplyDetail({
              id: 'reply-456',
              content: '**balasan telah dihapus**',
              date: '2021-08-08T08:07:01.522Z',
              username: 'johndoe',
            }),
          ],
        }),
      ],
    }));

    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledTimes(2);
  });

  it('should handle Date objects in reply dates correctly', async () => {
    // Arrange
    const mockThread = {
      id: 'thread-123',
      title: 'A Thread',
      body: 'A Body',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'A comment',
        is_delete: false,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-123',
        content: 'A reply',
        date: new Date('2021-08-08T07:59:48.766Z'), // Date object instead of string
        username: 'dicoding',
        is_delete: false,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(threadDetail.comments[0].replies[0].date).toBe('2021-08-08T07:59:48.766Z');
  });
});
