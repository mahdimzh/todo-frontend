import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Typography,
  Button,
  Icon,
  Paper,
  Box,
  TextField,
  Checkbox,
} from "@material-ui/core";
import { ITodo, ITodos } from "./types";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import MomentUtils from "@date-io/moment";
import {
  DateTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import moment from "moment";
import { IconButton } from "@material-ui/core";
import InfiniteScroll from 'react-infinite-scroller'
import CircularProgress from '@material-ui/core/CircularProgress';


const reorder = (list: any, startIndex: any, endIndex: any) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};


const useStyles = makeStyles({
  addTodoContainer: { padding: 10 },
  addTodoButton: { marginLeft: 5 },
  todosContainer: { marginTop: 10, padding: 10 },
  todoContainer: {
    borderTop: "1px solid #bfbfbf",
    marginTop: 5,
    "&:first-child": {
      margin: 0,
      borderTop: "none",
    },
    "&:hover": {
      "& $deleteTodo": {
        visibility: "visible",
      },
    },
  },
  todoTextCompleted: {
    textDecoration: "line-through",
  },
  overDue: {
    color: "red",
  },
  deleteTodo: {
    visibility: "hidden",
  },
});

const grid = 8;
const getItemStyle = (isDragging: any, draggableStyle: any) => ({
  userSelect: "none",
  margin: `0 0 ${grid}px 0`,
  background: isDragging ? "grey" : "white",
  ...draggableStyle
});

const getListStyle = (isDraggingOver: any) => ({
  background: isDraggingOver ? "lightblue" : "white",
});

function Todos() {
  const classes = useStyles();
  const [todos, setTodos] = useState<ITodos>([]);
  const [count, setCount] = useState<number>(0);
  const [newTodoText, setNewTodoText] = useState<string>("");
  const [textValid, setTextValid] = useState<boolean>(true);


  const onDragEnd = (result: any) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const newTodos: any = reorder(
      todos,
      result.source.index,
      result.destination.index
    );
    setTodos(newTodos);

    fetch(`http://localhost:3001/reorder`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        sourceId: todos[result.source.index].id,
        destinationId: todos[result.destination.index].id
      }),
    }).then(() => { });
  }


  const addTodo = (text: string): void => {
    if (text) {
      setTextValid(true)
      fetch("http://localhost:3001/", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ text }),
      })
        .then((response) => response.json())
        .then((todo) => setTodos([...todos, todo]));
      setNewTodoText("");
    } else {
      setTextValid(false)
      alert("Text should not be empty")
    }
  }

  const toggleTodoCompleted = (id: string): void => {
    fetch(`http://localhost:3001/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        completed: !(todos.find((todo: ITodo) => todo.id === id) as ITodo).completed,
        action: 'COMPLETE_TASK'
      }),
    }).then(() => {
      const newTodos = [...todos];
      const modifiedTodoIndex = newTodos.findIndex((todo) => todo.id === id);
      newTodos[modifiedTodoIndex] = {
        ...newTodos[modifiedTodoIndex],
        completed: !newTodos[modifiedTodoIndex].completed,
      };
      setTodos(newTodos);
    });
  }

  const handleDueDateChanged = (id: string, date: Date): void => {
    fetch(`http://localhost:3001/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        dueDate: date,
        action: 'SET_DUE_TO_DATE'
      }),
    }).then(() => {
      const newTodos = [...todos];
      const modifiedTodoIndex = newTodos.findIndex((todo) => todo.id === id);
      newTodos[modifiedTodoIndex] = {
        ...newTodos[modifiedTodoIndex],
        dueDate: date as Date,
      };
      setTodos(newTodos);

    });
  }

  const deleteTodo = (id: string): void => {
    fetch(`http://localhost:3001/${id}`, {
      method: "DELETE",
    }).then(() => setTodos(todos.filter((todo: ITodo) => todo.id !== id)));
  }

  const loadData = (pageNumber: number = 1, nPerPage: number = 20) => {
    fetch(`http://localhost:3001?pageNumber=${(pageNumber)}&nPerPage=${nPerPage}`)
      .then((response) => response.json())
      .then((res) => {
        setCount(res.count)
        setTodos([...todos, ...res.data]);
      });
  }

  useEffect(() => {
    loadData()
  }, []);

  /*  const setDueDate = (id: string): void => {
  
    }
  */

  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom>
        Todos
      </Typography>
      <Paper className={classes.addTodoContainer}>
        <Box display="flex" flexDirection="row">
          <Box flexGrow={1}>
            <TextField
              fullWidth
              error={!textValid}
              helperText={!textValid ? "Text feild could not be empty" : ""}
              value={newTodoText}
              onKeyPress={(event: any) => {
                if (event.key === "Enter") {
                  addTodo(newTodoText);
                }
              }}
              onChange={(event: any) => setNewTodoText(event.target.value)}
            />
          </Box>
          <Button
            className={classes.addTodoButton}
            startIcon={<Icon>add</Icon>}
            onClick={() => addTodo(newTodoText)}
          >
            Add
          </Button>
        </Box>
      </Paper>
      {todos.length > 0 && (
        <InfiniteScroll
          pageStart={1}
          loadMore={(pageNumber) => loadData(pageNumber)}
          hasMore={(count === 0) || (count !== 0 && count !== todos.length)}
          loader={<div style={{textAlign: 'center'}}><CircularProgress /></div>}
        >
          <Paper className={classes.todosContainer}>
            <Box display="flex" flexDirection="column" alignItems="stretch">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}
                    >
                      {todos.map(({ id, text, completed, dueDate }: ITodo, index: number) => (
                        <Draggable key={id} draggableId={id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                              className={classes.todoContainer}
                            >
                              <Box
                                key={id}
                                display="flex"
                                flexDirection="row"
                                alignItems="center"
                              >
                                <Checkbox
                                  checked={completed}
                                  onChange={() => toggleTodoCompleted(id)}
                                ></Checkbox>
                                <Box flexGrow={1}>
                                  <Typography
                                    className={completed ? classes.todoTextCompleted : ""}
                                    variant="body1"
                                  >
                                    {text}
                                  </Typography>
                                  {dueDate &&
                                    <Typography
                                      variant="body2"
                                      className={moment(dueDate).isBefore(moment()) ? classes.overDue : ""}
                                    >
                                      Due Date is: {moment(dueDate).format("YYYY-MM-DD HH:mm")} {moment(dueDate).isBefore(moment()) && <span>[Overdue!!]</span>}
                                    </Typography>
                                  }
                                </Box>
                                <MuiPickersUtilsProvider utils={MomentUtils} locale="en">
                                  <DateTimePicker
                                    className={classes.deleteTodo}
                                    disabled={completed}
                                    showTodayButton={true}
                                    disablePast={true}
                                    disableFuture={false}
                                    todayLabel="Today"
                                    clearable={true}
                                    variant="dialog"
                                    okLabel="Ok"
                                    cancelLabel="Cancel"
                                    clearLabel="Clear"
                                    labelFunc={(date: any) => date.format("YYYY-MM-DD HH:mm")}
                                    value={(dueDate !== undefined && dueDate !== null) ? dueDate : moment()}
                                    onChange={(date: any) => handleDueDateChanged(id, date)}
                                    InputProps={{
                                      endAdornment: (
                                        <IconButton
                                          aria-label="Select locale"
                                          disabled={completed}
                                        >
                                          <Icon>schedule</Icon>
                                        </IconButton>
                                      ),
                                    }}
                                  />
                                </MuiPickersUtilsProvider>
                                <Button
                                  className={classes.deleteTodo}
                                  startIcon={<Icon>delete</Icon>}
                                  onClick={() => deleteTodo(id)}
                                >
                                  Delete
                                </Button>
                              </Box>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Box>
          </Paper>
        </InfiniteScroll>


      )}
    </Container>
  );
}

export default Todos;
