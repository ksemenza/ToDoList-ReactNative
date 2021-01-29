import React, { Component } from 'react';

// React-native components
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  FlatList,
  AsyncStorage,
  Button,
  TextInput,
  Keyboard,
  Platform,
} from 'react-native';

//Test for specific OS to provide Logic or UI
const isAndroid = Platform.OS == 'android';
const viewPadding = 10;

export default class TodoList extends Component {

  // initial state
  state = {
    tasks: [],
    text: '',
  };

  changeTextHandler = (text) => {
    this.setState({text: text});
  };

  addTask = () => {
    let notEmpty = this.state.text.trim().length > 0;

    if (notEmpty) {
      this.setState(
        (prevState) => {
          let {tasks, text} = prevState;
          return {
            tasks: tasks.concat({key: tasks.length, text: text}),
            text: '',
          };
        },

        // Saved to localStorage after state change 
        // Must use this.state to save new date otherwise it was save old data instead
        () => Tasks.save(this.state.tasks),
      );
    }
  };

  deleteTask = (i) => {
    this.setState(
      (prevState) => {
        let tasks = prevState.tasks.slice();

        tasks.splice(i, 1);

        return {tasks: tasks};
      },
      () => Tasks.save(this.state.tasks),
    );
  };

  componentDidMount() {

    // Changes padding so when keyboard is expanded the input is still in view
    Keyboard.addListener(
      isAndroid ? 'keyboardDidShow' : 'keyboardWillShow',
      (e) => this.setState({viewMargin: e.endCoordinates.height + viewPadding}),
    );

    // Changes padding of input when keyboard is hidden
    Keyboard.addListener(
      isAndroid ? 'keyboardDidHide' : 'keyboardWillHide',
      () => this.setState({viewMargin: viewPadding}),
    );
    
    // Mounted Component it loads all tasks from LocalStorage API
    Tasks.all((tasks) => this.setState({tasks: tasks || []}));
  }

  render() {
    return (
      // Container View
      // this.state overrides style.container order matters unlike CSS
      <View style={[styles.container, {paddingBottom: this.state.viewMargin}]}>
       
       {/** Task List */}
        <FlatList
          style={styles.list}       
        
          {/** Array of tasks */}
          data={this.state.tasks}
          
          {/** Specify how to render each item */}
          renderItem={({item, index}) => (
            <View>
              <View style={styles.listItemCont}>
                <Text style={styles.listItem}>{item.text}</Text>
                {/** assign handler events */}
                <Button title="X" onPress={() => this.deleteTask(index)} />
              </View>
              <View style={styles.hr} />
            </View>
          )}
        />

        {/** Input to add a task */}
        <TextInput
          style={styles.textInput}
          onChangeText={this.changeTextHandler}
          onSubmitEditing={this.addTask}
          value={this.state.text}
          placeholder="Add Tasks"
          returnKeyType="done"
          returnKeyLabel="done"
        />
      </View>
    );
  }
}

{/** 
  'convert' is similar to LocalStorage 
  It is serialized data to a string with a separator 
  Then deserialized to retrieve 
*/}

let Tasks = {
  convertToArrayOfObject(tasks, callback) {
    return callback(
      tasks ? tasks.split('||').map((task, i) => ({key: i, text: task})) : [],
    );
  },
  convertToStringWithSeparators(tasks) {
    return tasks.map((task) => task.text).join('||');
  },

  /**
    Data is saved locally wit AsyncStorage
    It uses tools on different platforms to save data
  */
  
  all(callback) {
    return AsyncStorage.getItem('TASKS', (err, tasks) =>
      this.convertToArrayOfObject(tasks, callback),
    );
  },
  save(tasks) {
    AsyncStorage.setItem('TASKS', this.convertToStringWithSeparators(tasks));
  },
};

// Styling is written as an object and assigned to a component one by one 
// No cascade or global styling like css

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: viewPadding,
    paddingTop: 20,
  },
  list: {
    width: '100%',
  },
  listItem: {
    paddingTop: 2,
    paddingBottom: 2,
    fontSize: 18,
  },
  hr: {
    height: 1,
    backgroundColor: 'gray',
  },
  listItemCont: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInput: {
    height: 40,
    paddingRight: 10,
    paddingLeft: 10,
    borderColor: 'gray',
    borderWidth: isAndroid ? 0 : 1,
    width: '100%',
  },
});

AppRegistry.registerComponent('TodoList', () => TodoList);
