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
     Reply.destroy({where: {}, truncate:true})
       .then(() =>
        Board.destroy({where: {}, truncate:true})).then(() =>
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



  // 게시글 등록
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


  // 게시글 등록&조회
  it('등록한 글을 등록할 때 조회된다', (done: Function) => {

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

  // 게시글 조회
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

  // 글 등록 x2
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

  // 글 수정
  it("글제목 이라는 글의 content 를 'updated_content'로 바꾼 뒤 정보를 가져온다..", (done: Function) => {

    // given
    let beforeBoard = {title: '글제목', content: '본문', writer: '글쓴이'};
    let afterBoard = {title: '글제목', content: 'updated_content', writer: '글쓴이'};

    // when
    saveBoard(beforeBoard, () => {
      Board.findOne<Board>({where:{title:'글제목'}}).then((savebeforeBoard: Board) => {
        let bno = savebeforeBoard.get('bno');
        Board.update(afterBoard,{where:{bno:bno}}).then(() =>{
          Board.findOne<Board>({where:{content:'updated_content'}}).then((board: Board) => {
            expect(board.get('content')).to.be.eql(afterBoard.content);
            done();
          });
        });
      });
    });
  });

  // 댓글 등록

  it("title 이 글제목인 글에 댓글을 추가하고 그정보를 가져온다.", (done: Function) =>{
    const board = new Board({title:'title',content:'본문',writer:'글쓴이'});
    const reply = new Reply({reply:'reply',writer:'글쓴이'});

    board.save().then((saveBoard:Board) =>{
      reply.save().then((saveReply:Reply) =>{
        saveBoard.$add('reply',saveReply);
        Board.findAll<Board>({include:[Reply]}).then((boards:Board[])=>{
          const board = boards[0];
          expect(board.replies.length).to.be.eql(1);
          done();
        });
      });
    });
  });

  // 댓글 등록 x2

  it("title 이 글제목인 글에 댓글을 추가하고 댓글을 하나 더 추가 하고 그정보를 가져온다.", (done: Function) =>{

    //given

    const board = new Board({title:'title',content:'본문',writer:'글쓴이'});
    const reply = new Reply({reply:'reply',writer:'글쓴이'});
    const reply2 = new Reply({reply:'reply',writer:'글쓴이'});

    //when then

    board.save().then((saveBoard:Board) =>{
      reply.save().then((saveReply:Reply) =>{
        saveBoard.$add('reply',saveReply);
        reply2.save().then((saveReply:Reply) => {
          saveBoard.$add('reply',saveReply);
          Board.findAll<Board>({include: [Reply]}).then((boards: Board[]) => {
            const board = boards[0];
            expect(board.replies.length).to.be.eql(2);
            done();
          });
        });
      });
    });
  });

  // 댓글이 있을 경우 게시글 삭제

  it("title 이 글제목인 글에 댓글을 추가하고 title 이 글제목인 게시글을 삭제한다. ", (done: Function) =>{
    const board = new Board({title:'title',content:'본문',writer:'글쓴이'});
    const reply = new Reply({reply:'reply',writer:'글쓴이'});

    board.save().then((saveBoard:Board) =>{
      reply.save().then((saveReply:Reply) =>{
        saveBoard.$add('reply',saveReply);
        Board.findAll<Board>({include:[Reply]}).then((boards:Board[])=>{
          const board = boards[0];
          expect(board.replies.length).to.be.eql(1);
          Board.destroy({where:{title:'title'},truncate:true}).then(() => {
            Board.findOne<Board>({where:{title: '글제목'}}).then((savedBoard: Board) => {
              expect(savedBoard).to.be.eql(null);
              done();
            });
          });
        });
      });
    });
  });

  // 댓글 수정

  it("title 이 글제목인 글에 댓글을 추가한후 댓글을 수정한다.", (done: Function) => {

    const board = new Board({title: 'title', content: '본문', writer: '글쓴이'});
    const reply = new Reply({reply: 'reply', writer: '리플쓴이'});
    const update_reply = {reply: 'update_reply', writer: '리플쓴이'};

    board.save().then((saveBoard: Board) => {
      reply.save().then((saveReply: Reply) => {
        saveBoard.$add('reply', saveReply);
        Reply.findOne<Reply>({where: {reply: 'reply', writer: '리플쓴이'}}).then((savedReply: Reply) => {
          var rno = savedReply.get('rno');
          Reply.update(update_reply, {where: {rno:rno}}).then(() => {
            Reply.findOne<Reply>({where: {reply: 'update_reply'}}).then((updatedReply: Reply) => {
              expect(updatedReply.reply).to.be.eql(update_reply.reply);
              done();
            });
          });
        });
      });
    });
  });

  // 댓글의 댓글

  it("title 이 글제목인 글에 댓글을 추가하고 그 댓글의 댓글을 추가하고 그정보를 가져온다.", (done: Function) =>{
    const board = new Board({title:'title',content:'본문',writer:'글쓴이'});
    const reply = new Reply({reply:'reply',writer:'글쓴이'});
    const rereply = new Reply({reply:'rereply',writer:'대댓글쓴이'});

    board.save().then((saveBoard:Board) =>{
      reply.save().then((saveReply:Reply) =>{
        saveBoard.$add('reply',saveReply);
        rereply.save().then((saveReRepy:Reply) =>{
          saveBoard.$add('reply',saveReRepy);
          saveReply.$add('reply',saveReRepy);
          Board.findAll<Board>({include:[Reply]}).then((boards:Board[])=>{
            const board = boards[0];
            expect(board.replies.length).to.be.eql(2);
            Reply.findAll<Reply>({include:[Reply]}).then((replys:Reply[]) => {
              const reply = replys[0];
              expect(reply.replies.length).to.be.eql(1);
              done();
            });
          });
        });
      });
    });
  });

  // 댓글의 댓글 삭제

  it("title 이 글제목인 글에 댓글을 추가하고 그 댓글의 댓글을 추가하고 댓글의 댓글을 삭제한다.", (done: Function) =>{
    const board = new Board({title:'title',content:'본문',writer:'글쓴이'});
    const reply = new Reply({reply:'reply',writer:'글쓴이'});
    const rereply = new Reply({reply:'rereply',writer:'대댓글쓴이'});
    const deleteReply = {reply:'삭제된 댓글입니다.',writer:''}

    board.save().then((saveBoard:Board) =>{
      reply.save().then((saveReply:Reply) =>{
        saveBoard.$add('reply',saveReply);
        rereply.save().then((saveReRepy:Reply) =>{
          saveBoard.$add('reply',saveReRepy);
          saveReply.$add('reply',saveReRepy);
          Board.findAll<Board>({include:[Reply]}).then((boards:Board[])=>{
            const board = boards[0];
            expect(board.replies.length).to.be.eql(2);
            Reply.findAll<Reply>({include:[Reply]}).then((replys:Reply[]) => {
              const reply = replys[0];
              expect(reply.replies.length).to.be.eql(1);
              Reply.findOne<Reply>({where:{reply:'rereply'}}).then((savedRereply:Reply) =>{
                const rno = savedRereply.get('rno');
                Reply.update(deleteReply,{where:{rno:rno}}).then(() =>{
                  Reply.findOne<Reply>({where:{rno:rno}}).then((updatedRereply:Reply) =>{
                    expect(updatedRereply.get('reply')).to.be.eql('삭제된 댓글입니다.');
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  // 댓글의 댓글이 있을 경우 댓글의 삭제

  it("title 이 글제목인 글에 댓글을 추가하고 그 댓글의 댓글을 추가하고 댓글을 삭제한다.", (done: Function) =>{
    const board = new Board({title:'title',content:'본문',writer:'글쓴이'});
    const reply = new Reply({reply:'reply',writer:'글쓴이'});
    const rereply = new Reply({reply:'rereply',writer:'대댓글쓴이'});
    const deleteReply = {reply:'삭제된 댓글입니다.',writer:''}

    board.save().then((saveBoard:Board) =>{
      reply.save().then((saveReply:Reply) =>{
        saveBoard.$add('reply',saveReply);
        rereply.save().then((saveReRepy:Reply) =>{
          saveBoard.$add('reply',saveReRepy);
          saveReply.$add('reply',saveReRepy);
          Board.findAll<Board>({include:[Reply]}).then((boards:Board[])=>{
            const board = boards[0];
            expect(board.replies.length).to.be.eql(2);
            Reply.findAll<Reply>({include:[Reply]}).then((replys:Reply[]) => {
              const reply = replys[0];
              expect(reply.replies.length).to.be.eql(1);
              Reply.findOne<Reply>({where:{reply:'reply'}}).then((savedRereply:Reply) =>{
                const rno = savedRereply.get('rno');
                Reply.update(deleteReply,{where:{rno:rno}}).then(() =>{
                  Reply.findOne<Reply>({where:{rno:rno}}).then((updatedRereply:Reply) =>{
                    expect(updatedRereply.get('reply')).to.be.eql('삭제된 댓글입니다.');
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  // 댓글의 댓글이 있을 경우 게시글 삭제

  it("title 이 글제목인 글에 댓글을 추가하고 그 댓글의 댓글을 추가하고 댓글을 삭제한다.", (done: Function) =>{
    const board = new Board({title:'title',content:'본문',writer:'글쓴이'});
    const reply = new Reply({reply:'reply',writer:'글쓴이'});
    const rereply = new Reply({reply:'rereply',writer:'대댓글쓴이'});

    board.save().then((saveBoard:Board) =>{
      reply.save().then((saveReply:Reply) =>{
        saveBoard.$add('reply',saveReply);
        rereply.save().then((saveReRepy:Reply) =>{
          saveBoard.$add('reply',saveReRepy);
          saveReply.$add('reply',saveReRepy);
          Board.findAll<Board>({include:[Reply]}).then((boards:Board[])=>{
            const board = boards[0];
            expect(board.replies.length).to.be.eql(2);
            Reply.findAll<Reply>({include:[Reply]}).then((replys:Reply[]) => {
              const reply = replys[0];
              expect(reply.replies.length).to.be.eql(1);
              Board.destroy({where:{title:'title'},truncate:true}).then(() => {
                Board.findOne<Board>({where:{title: '글제목'}}).then((savedBoard: Board) => {
                  expect(savedBoard).to.be.eql(null);
                  Reply.findAll<Reply>({include:[Reply]}).then((deletedreplys:Reply[]) => {
                    expect(deletedreplys.length).to.be.eql(0);
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
  });


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