import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {reactions} from './reactions';

class App extends Component {
  constructor(props) {
    super(props);

    let firstRxn = 0;
    let firstMissing = 'reactant';

    this.state = {
      reaction: firstRxn,
      missing: firstMissing,
      feedback: '',
      reactant: firstMissing === 'reactant' ? 'Reactant' : reactions[firstRxn].reactant,
      reagents: firstMissing === 'reagents' ? 'Reagents' : reactions[firstRxn].reagents,
      product: firstMissing === 'product' ? 'Product' : reactions[firstRxn].product
    }

    this.check = this.check.bind(this);
  }

  render() {
    let i = 0;
    let rxn = reactions[this.state.reaction];

    return (
      <div className="App">
        <input type="text" value={this.state.reactant} onChange={(e) => this.updateReactant(e)} />
        <input type="text" value={this.state.reagents} onChange={(e) => this.updateReagents(e)}/>
        <input type="text" value={this.state.product} onChange={(e) => this.updateProducts(e)}/>
        <input type="submit" onClick={this.check}></input>
        <p>{this.state.feedback}</p>
      </div>
    );
  }

  updateReactant(e) {
    this.setState({reactant: e.target.value})
  }

  updateReagents(e) {
    this.setState({reagents: e.target.value})
  }

  updateProducts(e) {
    this.setState({product: e.target.value})
  }

  check() {
    let correct = this.state[this.state.missing] === reactions[this.state.reaction][this.state.missing];
    if (correct) {
      this.setState({feedback: 'Correct!'});
      this.generateQuestion();
    }
    else {
      this.setState({feedback: 'Try again.'});
    }
  }

  generateQuestion() {
    let newRxn = this.state.reaction + 1;
    let newMsg = 'product';
    this.setState({
      reaction: newRxn,
      missing: newMsg,
      reactant: newMsg === 'reactant' ? 'Reactant' : reactions[newRxn].reactant,
      reagents: newMsg === 'reagents' ? 'Reagents' : reactions[newRxn].reagents,
      product: newMsg === 'product' ? 'Product' : reactions[newRxn].product
    })
  }
}

export default App;
