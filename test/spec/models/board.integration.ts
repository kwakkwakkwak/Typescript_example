import {expect} from "chai";
import {sequelize} from "../../../src/models/index";
import Board from "../../../src/models/domain/board";
import Reply from "../../../src/models/domain/reply";

describe("[Integration] 게시판 모델을 테스트 한다", () => {
  before((done: Function) => {
    sequelize.sync().then(() => {
      done();
    }).catch((error: Error) => {
      done(error);
    });
  });

  const cleanUpBoard = (cb) => {
    Board.destroy({where: {}, truncate: true}).then(() => cb());
  };

  beforeEach((done: Function) => {
    cleanUpBoard(() => done());
    //cleanUpReply(() => done());
  });

  const save = (given, cb) => {
    const board = new Board(given);
    board.save()
      .then((saveBoard: Board) => {
        cb(saveBoard);
      });
  };

  it('글을 등록 한 후에 등록한 값이 리턴된다.', (done: Function) => {
    //given
    let givenBoard = {title: 'test', content: 'test', writer: 'test'};

    //when
    save(givenBoard, (saveBoard: Board) => {
      //then
      expect(saveBoard.title).to.be.eql(givenBoard.title);
      expect(saveBoard.content).to.be.eql(givenBoard.content);
      expect(saveBoard.writer).to.be.eql(givenBoard.writer);
      done();
    });
  });

  it('등록한 글을 조회할 때 조회된다', (done: Function) => {

    // given
    let givenBoard = {title: 'test', content: 'test', writer: 'test'};

    // when & then
    save(givenBoard, (saveboard: Board) => {
      Board.findAll<Board>().then((boards: Board[]) => {
        expect(boards.length).to.be.eql(1);
        done();
      });
    });
  });
  it('글제목 라는 글을 검색하는 경우 글제목의 정보가 리턴된다', (done: Function) => {

    // given
    let givenBoard = {title: '글제목', content: '본문', writer: '글쓴이'};

    // when
    save(givenBoard, (saveBoard: Board) => {
      Board.findOne<Board>({where: {title: '글제목'}})
        .then((board: Board) => {
          expect(board.title).to.be.eql(givenBoard.title);
          done();
        });
    });
  });

  it('글제목, 글제목2 라는 글 중에 글제목2라는 글을 검색하는 경우 글제목2의 정보가 리턴된다', (done: Function) => {

    // given
    let title1 = {title: '글제목', content: '본문', writer: '글쓴이'};
    let title2 = {title: '글제목2', content: '본문2', writer: '글쓴이2'};

    // when
    save(title1, () => {
      save(title2, () => {
        Board.findOne<Board>({where: {title: '글제목2'}}).then((board: Board) => {
          expect(board.get('title')).to.be.eql(title2.title);
          done();
        });
      });

    });
  });

  it('글제목 이라는 글에 댓글을 추가하고, 댓글정보가 리턴된다.', (done: Function) => {
    //given
    const reply = new Reply({reply: '댓글', writer: '댓글쓴이'});
    const title = new Board({title: '글제목', content: '본문', writer: '글쓴이'});

    //when
    reply.save()
      .then((saveReply: Reply) => {
        title.save().then((saveBoard: Board) => {
          saveReply.$add('bno', saveBoard);
          Reply.findAll<Reply>({include: [Board]}).then((replies: Reply[]) => {
            const reply = replies[0];
            //console.log(reply.get('bno'));
            expect(reply.bno.length).to.be.eql(1);
            done();
          });
        });
      });
  });
  //
  // it('글제목 이라는 글에 댓글을 추가하고, 그 댓글에 댓글을 추가하고 그정보가 리턴된다.', (done: Function) => {
  //   //given
  //   const reply = new Reply({reply: '댓글', writer: '댓글쓴이'});
  //   const reply_reply = new Reply({reply:"대댓글",writer:"대댓글쓴이"});
  //   const title = new Board({title: '글제목', content: '본문', writer: '글쓴이'});
  //
  //   //when
  //   reply_reply.save().then((saveReReply: Reply) =>{
  //     reply.save().then((saveReply: Reply) => {
  //       title.save().then((saveBoard: Board) => {
  //         saveReply.$add('bno', saveBoard);
  //         saveReReply.$add('bno',saveReply);
  //         Reply.findAll<Reply>({include: [Board]}).then((replies: Reply[]) => {
  //           const reply = replies[0];
  //           //console.log(reply.get('bno'));
  //           expect(reply.bno.length).to.be.eql(1);
  //           done();
  //         });
  //       });
  //     });
  //   });
  // });
});
