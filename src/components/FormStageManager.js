import React from "react";
import Modal from "react-modal";
import Question from "./Question";
import request from "superagent";
import '../style/form-stage-manager.scss';

// const ENDPOINT = "https://api.justicedemocrats.com/nominate/";
// const ENDPOINT = "http://localhost:8080/nominate/";
const ENDPOINT = "http://192.168.1.162:8080/nominate/";
const REDIRECT_DELAY = 500;

const customStyles = {
  content: {
    top: "130px",
    left: "50%",
    right: "auto",
    bottom: "auto",
    margin: "0 50px",
    transform: "translateX(-50%)",
    borderRadius: 0,
    border: 'none',
    borderTop: "2px solid",
    boxShadow: '0 2px 2px rgba(0,0,0,0.1)',
    padding: 0
  }
};

export default class FormStageManager extends React.Component {
  state = {
    stage: 0,
    data: {},
    error: undefined,
    success: false,
    mode: undefined
  };

  prevStage = () =>
    this.setState({
      stage: this.state.stage - 1
    });

  nextStage = () =>
    this.setState({
      stage: this.state.stage + 1
    });

  setMode = mode => () => this.setState({ mode });
  setData = attribute => ev => {
    const value = ev.target.value;
    this.setState(prevState => {
      const data = Object.assign({}, prevState.data, { [attribute]: value });
      return Object.assign(prevState, { data });
    });
  };

  submit = () => {
    console.log(this.state.data);
    request
      .post(ENDPOINT + this.state.mode)
      .send(this.state.data)
      .end((error, res) => {
        if (error) this.setState({ error });
        this.setState({ success: true });

        setTimeout(() => {
          window.location.href = this.props.redirect;
        }, REDIRECT_DELAY);
      });
  };

  render() {
    const { stage, error, success, mode } = this.state;

    if (mode === undefined) {
      return this.renderPreStage();
    }

    const stages = this.props.stages.filter(
      s => s.display == mode || s.display == "both"
    );
    const { title, questions } = stages[stage];

    const rows = batchByWidth(questions);

    return (
      <Modal isOpen={true} style={customStyles}>
        {success ? (
          <div>
            <h1> Your Submission Has Been Received </h1>
            <p> You will receive an email shortly with further instructions </p>
          </div>
        ) : error ? (
          <div>
            <h1> Hm, there seems to have been an error. </h1>
            <p>
              Our developers have already been alerted, and will be working on
              it as soon as possible to process your nomination
            </p>
          </div>
        ) : (
          <div className='modal-content'>
            <div className='modal-counter'>
              {stages.map((item,index) => (
                <div className={`counter-item ${index <= stage ? 'counter-done': ''}`}></div>
              ))} 
            </div> 
            <div className='modal-activity'>
              <h1> {title} </h1>
              <form>
                {rows.map(r => (
                  <div className="row">
                    {r.map(q => (
                      <Question
                        question={q}
                        setData={this.setData(q.name)}
                        value={this.state.data[q.name]}
                        key={q.name}
                      />
                    ))}
                  </div>
                ))}
              </form>
            </div>
            <div className='modal-action button-row'>
              {stage !== 0 && <button onClick={this.prevStage}> Back </button>}
              {stage < stages.length - 1 && (
                <button onClick={this.nextStage}> Next </button>
              )}
              {stage === stages.length - 1 && (
                <button onClick={this.submit} className='submit'> Submit </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    );
  }

  renderPreStage() {
    const buttonStyle = {
    };

    return (
      <Modal isOpen={true} style={customStyles}>
        <div className={'modal-content'}>
          <div className='modal-activity'>
            <h1>Nominate a Candidate</h1>
            <p>We're accepting nominations for specific candidates, but we're also
              accepting nominations for districts, even if you don't have a
              candidate in mind.
            </p>
          </div>
          <div className='modal-action' >
            <button style={buttonStyle} onClick={this.setMode("district")}>
              I don't have a candidate yet
            </button>
            <button style={buttonStyle} onClick={this.setMode("candidate")}>
              I have a candidate
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}

function batchByWidth(questions) {
  const rows = [];
  let currentRow = [];

  questions.forEach(q => {
    if (q.width === "full" || !q.width) {
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      currentRow = [];
      rows.push([q]);
    }

    if (q.width === "half") {
      currentRow.push(q);
      if (currentRow.length === 2) {
        rows.push(currentRow);
        currentRow = [];
      }
    }

    if (q.width === "quarter") {
      currentRow.push(q);
      if (currentRow.length === 4) {
        rows.push(currentRow);
        currentRow = [];
      }
    }
  });

  return rows;
}
