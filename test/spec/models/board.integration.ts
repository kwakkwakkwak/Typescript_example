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
     Reply.destroy({where: {}, truncate: true})
       .then(() =>
        Board.destroy({where: {}, truncate: true})).then(() =>
      cb());
  };

  beforeEach((done: Function) => {
    cleanUpBoard(() => done());
    //cleanUpReply(() => done());
  });

  const saveBoard = (given, cb) => {
    const board = new Board(given);
    board.save()
      .then((saveBoard: Board) => {
        cb(saveBoard);
      });
  };
  const saveReply = (given, cb) => {
    const reply = new Reply(given);
    reply.save()
      .then((saveReply: Reply) => {
        cb(saveReply);
      });
  };



  it('글을 등록 한 후에 등록한 값이 리턴된다.', (done: Function) => {
    //given
    let givenBoard = {title: 'test', content: 'test', writer: 'test'};

    //when
    saveBoard(givenBoard, (saveBoard: Board) => {
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
    saveBoard(givenBoard, (saveboard: Board) => {
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
    saveBoard(givenBoard, (saveBoard: Board) => {
      Board.findOne<Board>({where: {title: '글제목'}})
        .then((board: Board) => {
          expect(board.title).to.be.eql(givenBoard.title);
          done();
        });
    });
  });

  it('글제목, 글제목2 라는 글 중에 글제목2라는 글을 검색하는 경우 글제목2의 정보가 리턴된다', (done: Function) => {

    // given
    let board1 = {title: '글제목', content: '본문', writer: '글쓴이'};
    let board2 = {title: '글제목2', content: '본문2', writer: '글쓴이2'};

    // when
    saveBoard(board1, () => {
      saveBoard(board2, () => {
        Board.findOne<Board>({where: {title: '글제목2'}}).then((board: Board) => {
          expect(board.get('title')).to.be.eql(board2.title);
          done();
        });
      });
    });
  });

  it("글제목 이라는 글의 content 를 'updated_content'로 바꾼 뒤 정보가 리턴된다.", (done: Function) => {

    // given
    let beforeBoard = {title: '글제목', content: '본문', writer: '글쓴이'};
    let afterBoard = {title: '글제목', content: 'updated_content', writer: '글쓴이'};

    // when
    saveBoard(beforeBoard, () => {
      Board.update(afterBoard,{where:{title:'글제목'}}).then(() =>{
        Board.findOne<Board>({where:{title: '글제목'}}).then((board: Board) => {
          expect(board.get('content')).to.be.eql(afterBoard.content);
          done();
        });
      });
    });
  });

  // it("title 이 글제목인 글에 댓글을 추가한다.", (done: Function) =>{
  //   const board = new Board({title:'title',content:'본문',writer:'글쓴이'});
  //   const reply = new Reply({reply:'reply',writer:'글쓴이'});
  //
  //   board.save().then((saveBoard:Board) =>{
  //     reply.save().then((saveReply:Reply) =>{
  //       saveBoard.$add('reply',saveReply);
  //       Board.findAll<Board>({include:[Reply]}).then((boards:Board[])=>{
  //         const board = boards[0];
  //         expect(board.replies.length).to.be.eql(1);
  //         done();
  //       });
  //     });
  //   });
  // });
  //
  //
  // it("title 이 글제목인 글에 댓글을 추가하고 댓글을 하나 더 추가 한다.", (done: Function) =>{
  //   const board = new Board({title:'title',content:'본문',writer:'글쓴이'});
  //   const reply = new Reply({reply:'reply',writer:'글쓴이'});
  //   const reply2 = new Reply({reply:'reply',writer:'글쓴이'});
  //
  //   board.save().then((saveBoard:Board) =>{
  //     reply.save().then((saveReply:Reply) =>{
  //       saveBoard.$add('reply',saveReply);
  //       reply2.save().then((saveReply:Reply) => {
  //         saveBoard.$add('reply',saveReply);
  //         Board.findAll<Board>({include: [Reply]}).then((boards: Board[]) => {
  //           const board = boards[0];
  //           expect(board.replies.length).to.be.eql(2);
  //           done();
  //         });
  //       });
  //     });
  //   });
  // });
  //
  // it("title 이 글제목인 글에 댓글을 추가한다.", (done: Function) =>{
  //   const board = new Board({title:'title',content:'본문',writer:'글쓴이'});
  //   const reply = new Reply({reply:'reply',writer:'글쓴이'});
  //   const reply2 = new Reply({reply:'reply',writer:'글쓴이',depth:2});
  //
  //   board.save().then((saveBoard:Board) =>{
  //     reply.save().then((saveReply:Reply) =>{
  //       saveBoard.$add('reply',saveReply);
  //       reply2.save().then((saveReply:Reply) => {
  //         saveBoard.$add('reply',saveReply);
  //         Board.findAll<Board>({include: [Reply]}).then((boards: Board[]) => {
  //           const board = boards[0];
  //           expect(board.replies.length).to.be.eql(2);
  //           done();
  //         });
  //       });
  //     });
  //   });
  // });

});